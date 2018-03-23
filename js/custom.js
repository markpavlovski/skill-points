var container, stats;
var camera, scene, renderer;
var group;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var info = document.createElement('div');
let pi = Math.PI
let cos = Math.cos
let sin = Math.sin
let objects = []
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let splineShape = new THREE.Shape();
let splinepts = [];
let n = 7
let initialPts = 20
let pts = initialPts
let r = []
let rSphere = []
let rFactor = 1.005
for (let i = 0; i <= n; i++) r.push(100)
for (let i = 0; i < n; i++) rSphere.push(25)
let z


var position =  0.1
var target = 0.5
var tween = new TWEEN.Tween(position).to(target, 1000);



tween.onUpdate(function(){
    // tweenSphere.position.x = position.x;
    // tweenSphere.position.y = position.y;
    // r[1] = position
    createShape(n,"1")
});



init();
animate();

function init() {

  tween.start();

  // Set Up Container
  container = document.createElement('div');
  document.body.appendChild(container);


  // Set up info text
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = `<br/>Click on a point to increase that stat. Click-drag to spin.<br/>Points Remaining: ${pts}. <a class="reset">RESET</a>`;
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
  group.position.y = 130
  scene.add(group);

  // Load Textures
  var loader = new THREE.TextureLoader();
  var texture = loader.load("textures/UV_Grid_Sm.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // it's necessary to apply these settings in order to correctly display the texture on a shape geometry
  texture.repeat.set(0.008, 0.008); // it's necessary to apply these settings in order to correctly display the texture on a shape geometry

  //
  // createShape(n)



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
  while (group.children[0]) {
    group.remove(group.children[0])
  }

  for (let i = 0; i <= n; i++) {
    let radius = 100
    if (i % n == trigger) {
      r[i] = Math.pow(rFactor,1) * r[i]
    }
    if (i % n == trigger & i < n) {
      rSphere[i] = Math.pow(rFactor,2) * rSphere[i]
    }

    splinepts.push(new THREE.Vector2(r[i] * cos(i / n * 2 * pi), r[i] * sin(i / n * 2 * pi)));
    if (i < n) {
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(rSphere[i], 5, 5), new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        visible: true
      }));
      sphere.position.x = r[i] * cos(i / n * 2 * pi)
      sphere.position.y = r[i] * sin(i / n * 2 * pi)
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

  z = event.target
  if (z.classList.contains("reset")) {
    for(let i=0; i<r.length; i++){
      r[i] = 100
    }
    pts = initialPts
    createShape(n,Infinity)
  }




  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(objects);
  if (pts > 0 & intersects.length > 0) {
    pts--
    info.innerHTML = `<br/>Click on a point to increase that stat. Click-drag to spin.<br/>Points Remaining: ${pts}. <a class="reset">RESET</a>`;
    for (var i = 0; i < intersects.length; i++) {
      createShape(n, intersects[0].object.name)
    }
  }
})


// ANIMATE & RENDER


function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  TWEEN.update();
  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
  renderer.render(scene, camera);
}
