const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
const OBJLoader = require('three-obj-loader')(THREE)

var startTime = Date.now();
var pointsMaterial = new THREE.PointsMaterial( { color: 0xffffff } );
pointsMaterial.size = 0.07;
var pointsMesh = new THREE.Points(new THREE.Geometry(), pointsMaterial);
var pointPositions = [];
var radius = 10;

function bias(b, t) {
    return Math.pow(t, Math.log(b) / Math.log(0.5));
}

function gain(g, t) {
    if (t < 0.5) return bias(1.0 - g, 2.0*t) / 2; 
    else return 1 - bias(1.0 - g, 2.0 - 2.0*t) / 2;
}

/////////////////////////////////////////////////////////////////////

var forward = new THREE.Vector3(0, 0, 1);
var position = new THREE.Vector3(0, 0, 0);
var stepSize = 0.1;
var turnSize = Math.PI/12;
var pathMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
var pathGeo = new THREE.Geometry();
var turnThroughput = 0;

/////////////////////////////////////////////////////////////////////

// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;
    var controls = framework.controls;

    // Set light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.color.setHSL(0.1, 1, 1);
    directionalLight.position.set(-1, 3, 1);
    directionalLight.position.multiplyScalar(10);
    scene.add(directionalLight);

    // Ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // soft white light
    scene.add( ambientLight );

    // set camera position and rotation point
    camera.position.set(0, 10, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.target.set(0, 0, 0);

    //gravity visualizer
    for (var t = 0.0; t <= 1.0; t += 0.05) {

        //var y = 0.5*radius*gain(0.8, t);
        //give a little extra room near center
        var y = 0.5*radius*gain(0.8, Math.max(0,(t-0.1)/0.9));

        for (var angle = 0.0; angle < 2.0*Math.PI; angle += Math.PI/18.0 ) {
            var x = Math.cos(angle) * (t*radius);
            var z = Math.sin(angle) * (t*radius); 
            pointPositions.push(new THREE.Vector3(x, y, z));
            //console.log("(" + x + ", " + y + ", " + z + ")");
        }

    }
    pointsMesh.geometry.vertices = pointPositions;
    pointsMesh.geometry.verticesNeedUpdate = true;
    scene.add(pointsMesh);

    //butterfly movement
    for (var i = 0; i < 1000; i++) {

        var turnProbability = -Math.tan(turnThroughput) + Math.PI/2.0;
        

        var turnDirection = (Math.random() > 0.5) ? 1.0 : -1.0; //-1 is counterclockwise, 0 is straight, 1 is clockwise
        forward.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), turnDirection * turnSize));
        position.add(new THREE.Vector3(forward.x, forward.y, forward.z).multiplyScalar(stepSize));

        pathGeo.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
    }
    var pathMesh = new THREE.Line(pathGeo, pathMaterial);
    scene.add(pathMesh);

}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);