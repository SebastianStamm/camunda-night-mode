function createLevel(canvas, scene) {
  const tiles = [];
  tiles[1] = {
    geometry: new THREE.CubeGeometry(1, 1, 1),
    material: new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
  };

  const meshs = [];
  meshs.push(new THREE.Geometry());

  const mesh = new THREE.Object3D();

  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    if (red === 0) {
      // should add a wall to this position
      const pxIdx = i / 4;
      const x = pxIdx % canvas.width;
      const y = ~~(pxIdx / canvas.width);

      var tmesh = new THREE.Mesh(tiles[1].geometry, tiles[1].material);
      tmesh.position.x = x;
      tmesh.position.y = y;
      tmesh.position.z = 0.5;

      tmesh.matrixAutoUpdate && tmesh.updateMatrix();

      meshs[0].merge(tmesh.geometry, tmesh.matrix);
    }
  }

  mesh.add(new THREE.Mesh(meshs[0], tiles[1].material));

  scene.add(mesh);

  console.log(mesh);
}

export default {
  init: function(canvas) {
    console.log("should render 3d level", canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(750, 750);

    createLevel(canvas, scene);

    camera.position.z = 0.5;
    camera.position.x = 5;
    camera.position.y = 5;

    window.camera = camera;

    camera.rotation.x = Math.PI / 2;
    camera.rotation.order = "ZXY";

    function animate() {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    }
    animate();

    document.body.appendChild(renderer.domElement);
  }
};
