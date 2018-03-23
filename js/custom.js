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
let rSmall = 4
let rDisk = 150
let rCircle = 70
// let rFactor = 1.008
for (let i = 0; i <= n; i++) r.push(rCircle)
for (let i = 0; i < n; i++) rSphere.push(25)
let z
let targetPoint
let tween = null
let increaseRate = 1.1
let delay = 100
let circleMesh
let transitionEnded = true


let position = {
  x: 1.00
}
let target = {
  x: increaseRate
}


//
// tween.onUpdate(function(){
//     // tweenSphere.position.x = position
//     // r[1] = position
//     createShape(n,"1")
// });



init();
animate();

function init() {


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
  var circleTexture = loader.load("textures/bullseye.jpg");


  // flat shape with texture
  // note: default UVs generated by ShapeBufferGeometry are simply the x- and y-coordinates of the vertices
  circleMesh = new THREE.Mesh(new THREE.CircleGeometry(rDisk, 100), new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: circleTexture,
    wireframe: false,
    opacity: 0.7,
    premultipliedAlpha: true,
    transparent: true
  }));
  circleMesh.position.z = 25

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


function createShape(n, trigger, rFactor) {
  let _r = r.map(item => item)
  let _rSphere = rSphere.map(item => item)
  if (trigger )transitionEnded = false

  // Object Shape
  console.log(trigger)
  while (splinepts[0]) splinepts.pop()
  while (objects[0]) objects.pop()
  while (group.children[0]) {
    group.remove(group.children[0])
  }
  group.add(circleMesh)

  for (let i = 0; i <= n; i++) {
    let radius = 100
    if (i % n == trigger) {
      _r[i] = Math.pow(rFactor, 1) * r[i]
      if (rFactor === increaseRate) r[i] = rFactor * r[i]
    }
    if (i % n == trigger & i < n) {
      _rSphere[i] = Math.pow(rFactor, 1) * rSphere[i]
      if (rFactor === increaseRate) {
        rSphere[i] = Math.pow(rFactor, 1.5) * rSphere[i]
        transitionEnded = true
      }
    }

    splinepts.push(new THREE.Vector2(_r[i] * cos(i / n * 2 * pi), _r[i] * sin(i / n * 2 * pi)));
    if (i < n) {
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(_rSphere[i], 5, 5), new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        visible: false
      }));
      sphere.position.x = _r[i] * cos(i / n * 2 * pi)
      sphere.position.y = _r[i] * sin(i / n * 2 * pi)
      sphere.position.z = 25
      sphere.name = `${i}`
      group.add(sphere);
      objects.push(sphere)
    }
    if (i < n) {
      var smallSphere = new THREE.Mesh(new THREE.SphereGeometry(rSmall, 30, 30), new THREE.MeshLambertMaterial({
        color: 0x515151,
        wireframe: false,
        visible: true
      }));
      smallSphere.position.x = _r[i] * cos(i / n * 2 * pi)
      smallSphere.position.y = _r[i] * sin(i / n * 2 * pi)
      smallSphere.position.z = 25
      smallSphere.name = `${i}`
      group.add(smallSphere);
      objects.push(smallSphere)
    }
  }
  console.log("rFactor:", rFactor)
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


}


// Interactions with spheres

window.addEventListener("mousedown", (event) => {

  z = event.target
  if (z.classList.contains("reset")) {
    for (let i = 0; i < r.length; i++) {
      r[i] = 100
    }
    pts = initialPts
    createShape(n, Infinity, 1)
    console.log("reset")
  }




  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(objects);
  if (pts > 0 & intersects.length > 0 & transitionEnded) {
    pts--
    info.innerHTML = `<br/>Click on a point to increase that stat. Click-drag to spin.<br/>Points Remaining: ${pts}. <a class="reset">RESET</a>`;
    for (var i = 0; i < intersects.length; i++) {

      TWEEN.removeAll();
      position.x = 1
      target.x = increaseRate
      tween = new TWEEN.Tween(position).to(target, delay);
      tween.start()
      tween.onUpdate(function() {
        rFactor = position.x
        targetPoint = intersects[0].object.name
        createShape(n, targetPoint, rFactor)
      });

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
  if (tween) {
    TWEEN.update()
  }
  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
  renderer.render(scene, camera);
}
