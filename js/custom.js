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



  function addShape(shape, color, x, y, z, rx, ry, rz, s, n) {
    // Add Line Shapes
    addLineShape(shape, color, x, y, z, rx, ry, rz, s, n);
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



    // equidistance sampled points
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


  // Object Shape
  var splinepts = [];

  let n = 12
  for (let i = 0; i <= n; i++) {
    splinepts.push(new THREE.Vector2(100 * cos(i / n * 2 * pi), 100 * sin(i / n * 2 * pi)));
  }

  var splineShape = new THREE.Shape();
  // splineShape.moveTo(0, 0);
  splineShape.splineThru(splinepts);


  addShape(splineShape, 0x515151, -50, 50, 0, 0, 0, 0, 1, 1);

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
