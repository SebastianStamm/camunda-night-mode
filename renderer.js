const scaleFactor = 1;
const height = 4;

function createLevel(canvas, scene) {
  const tiles = [];
  tiles[1] = {
    geometry: new THREE.CubeGeometry(scaleFactor, scaleFactor, height),
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
      tmesh.position.x = x * scaleFactor;
      tmesh.position.y = -y * scaleFactor;
      tmesh.position.z = height / 2;

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

    camera.position.z = 1.7;
    camera.position.x = 5;
    camera.position.y = -5;

    window.camera = camera;

    camera.rotation.x = Math.PI / 2;
    camera.rotation.order = "ZXY";

    const movementVector = new THREE.Vector2(0, 0);
    function animate() {
      requestAnimationFrame(animate);

      const move = movementVector
        .clone()
        .normalize()
        .multiplyScalar(0.2)
        .rotateAround(new THREE.Vector2(0, 0), camera.rotation.z);

      camera.position.x += move.x;
      camera.position.y += move.y;

      renderer.render(scene, camera);
    }
    animate();

    let pointerLocked = false;

    renderer.domElement.addEventListener("click", function(evt) {
      var elem = renderer.domElement;
      elem.requestPointerLock =
        elem.requestPointerLock ||
        elem.mozRequestPointerLock ||
        elem.webkitRequestPointerLock;
      elem.requestPointerLock();
    });

    var pointerLockChange = function(evt) {
      if (document.pointerLockElement === renderer.domElement) {
        pointerLocked = true;
      } else {
        pointerLocked = false;
        movementVector.x = 0;
        movementVector.y = 0;
      }
    };

    document.addEventListener("pointerlockchange", pointerLockChange, false);
    renderer.domElement.addEventListener("mousemove", e => {
      if (pointerLocked) {
        const movementX =
            e.movementX || e.mozMovementX || e.webkitMovementX || 0,
          movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        camera.rotation.z -= movementX / 300;
        camera.rotation.x -= movementY / 300;
        camera.rotation.x = Math.max(Math.min(camera.rotation.x, Math.PI), 0);
      }
    });

    document.addEventListener(
      "keydown",
      function({ key }) {
        if (pointerLocked) {
          switch (key) {
            case "w":
              movementVector.y = 1;
              break;
            case "a":
              movementVector.x = -1;
              break;
            case "s":
              movementVector.y = -1;
              break;
            case "d":
              movementVector.x = 1;
              break;
          }
        }
      },
      false
    );
    document.addEventListener(
      "keyup",
      function({ key }) {
        switch (key) {
          case "w":
          case "s":
            movementVector.y = 0;
            break;
          case "a":
          case "d":
            movementVector.x = 0;
            break;
        }
      },
      false
    );

    document.body.appendChild(renderer.domElement);
  }
};
