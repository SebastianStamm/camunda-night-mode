// import * as THREE from "./three.js";

export default {
  init: function(canvas) {
    console.log("should render 3d level", canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(750, 750);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.1;
      cube.rotation.y += 0.1;

      renderer.render(scene, camera);
    }
    animate();

    document.body.appendChild(renderer.domElement);
  }
};
