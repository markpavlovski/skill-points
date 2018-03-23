var container, stats;
var camera, scene, renderer;
var group;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
let pi = Math.PI
let cos = Math.cos
let sin = Math.sin
let objects = []
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let splineShape = new THREE.Shape();
let splinepts = [];
let n = 7;
let r = []
for (let i=0; i<=n; i++) r.push(100)
console.log(r)


init();
animate();

function init() {

  // Set Up Container
  container = document.createElement('div');
  document.body.appendChild(container);


  // Set up info text
  var info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = 'Simple procedurally-generated shapes<br/>Drag to spin';
  container.appendChild(info);


  // Set up scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 150, 500);
  scene.add(camera);

  var light = new THREE.PointLight(0xffffff, 0.8);
  camera.add(light);


  // set up group
  group = new THREE.Group();
  group.position.y = 100
  scene.add(group);

  // Load Textures
  var loader = new THREE.TextureLoader();
  var texture = loader.load("textures/UV_Grid_Sm.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // it's necessary to apply these settings in order to correctly display the texture on a shape geometry
  texture.repeat.set(0.008, 0.008); // it's necessary to apply these settings in order to correctly display the texture on a shape geometry


  createShape(n)



  //  RENDERER SETTINGS
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  stats = new Stats();
  container.appendChild(stats.dom);


  // WINDOW EVENTS
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

//  CREATE CANVAS material
function createCanvasMaterial(color, size) {
  var matCanvas = document.createElement('canvas');
  matCanvas.width = matCanvas.height = size;
  var matContext = matCanvas.getContext('2d');
  // create exture object from canvas.
  var texture = new THREE.Texture(matCanvas);
  // Draw a circle
  var center = size / 2;
  matContext.beginPath();
  matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
  matContext.closePath();
  matContext.fillStyle = color;
  matContext.fill();
  // need to set needsUpdate
  texture.needsUpdate = true;
  // return a texture made from the canvas
  return texture;
}


function createShape(n, trigger) {
  // Object Shape
  while (splinepts[0]) splinepts.pop()
  while (objects[0]) objects.pop()
  while (group.children[0]){
    group.remove(group.children[0])
  }

  for (let i = 0; i <= n; i++) {
    console.log(r[i])
    let radius = 100
    if(i % n == trigger){
      console.log(r[i])
      r[i] = 1.1 * r[i]
      console.log(r[i])
    }

    splinepts.push(new THREE.Vector2(r[i] * cos(i / n * 2 * pi), r[i] * sin(i / n * 2 * pi)));
    if (i < n) {
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 5, 5), new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        visible: true
      }));
      sphere.position.x = radius * cos(i / n * 2 * pi)
      sphere.position.y = radius * sin(i / n * 2 * pi)
      sphere.position.z = 25
      sphere.name = `${i}`
      group.add(sphere);
      objects.push(sphere)
    }
  }
  splineShape.splineThru(splinepts);
  addLineShape(splineShape, 0x515151, 0, 0, 0, 0, 0, 0, 1, 1);
}


  function addLineShape(shape, color, x, y, z, rx, ry, rz, s, n) {

    // lines
    var spacedPoints = splinepts;
    var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(spacedPoints);

    // line from equidistance sampled points
    var line = new THREE.Line(geometrySpacedPoints, new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3
    }));
    line.position.set(x, y, z + 25);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    group.add(line);


    // particles
    var particles = new THREE.Points(geometrySpacedPoints, new THREE.PointsMaterial({
      // color: color,
      size: 15,
      map: createCanvasMaterial('#' + '515151', 256),
      transparent: true,
      depthWrite: false
    }));
    particles.position.set(x, y, z + 25);
    particles.rotation.set(rx, ry, rz);
    particles.scale.set(s, s, s);
    group.add(particles);

  }


// Interactions with spheres

window.addEventListener("mousedown", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(objects);

  for (var i = 0; i < intersects.length; i++) {
    console.log(intersects[0].object.name)
    createShape(n, intersects[0].object.name)
  }
})


// ANIMATE & RENDER


function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
  renderer.render(scene, camera);
}
