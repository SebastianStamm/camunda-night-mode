import Entity from "./entities/index.js";

const scaleFactor = 1;
const height = 4;

function createLevel(canvas, scene) {
  const tiles = [];
  tiles[1] = {
    geometry: new THREE.CubeGeometry(scaleFactor, scaleFactor, height),
    material: new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
  };

  let meshs = [];
  const entities = [];

  const mesh = new THREE.Object3D();

  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const entityType = data[i + 1];
    const entityParam = data[i + 2];

    const pxIdx = i / 4;
    const x = pxIdx % canvas.width;
    const y = ~~(pxIdx / canvas.width);

    if (red !== 255) {
      // should add a wall to this position

      var tmesh = new THREE.Mesh(tiles[1].geometry, tiles[1].material);
      tmesh.position.x = x * scaleFactor;
      tmesh.position.y = -y * scaleFactor;
      tmesh.position.z = height / 2;

      tmesh.matrixAutoUpdate && tmesh.updateMatrix();

      if (!meshs[red]) {
        meshs[red] = new THREE.Geometry();
      }
      meshs[red].merge(tmesh.geometry, tmesh.matrix);
    }

    if (entityType !== 0 && entityType !== 255) {
      const entity = new Entity[entityType](entityParam);

      const container = new THREE.Object3D();
      container.position.x = x * scaleFactor;
      container.position.y = -y * scaleFactor;
      container.add(entity.mesh);
      scene.add(container);

      entities.push(entity);
    }
  }

  meshs = meshs.map(mesh => new THREE.Mesh(mesh, tiles[1].material));
  meshs.forEach(wallMesh => {
    mesh.add(wallMesh);
  });

  scene.add(mesh);

  // add floor
  const floorgeometry2 = new THREE.PlaneGeometry(
    canvas.width,
    canvas.height,
    1,
    1
  );
  const floormaterial2 = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('floorVertex').textContent,
    fragmentShader: document.getElementById('floorFragment').textContent
  });

  const floormesh2 = new THREE.Mesh(floorgeometry2, floormaterial2);
  floormesh2.position.set(
    canvas.width / 2 + 0.5,
    -canvas.height / 2 - 0.5,
    -0.01
  );
  scene.add(floormesh2);

  return { entities, meshs };
}

function moveColliding(position, move, canvas, state) {
  const newPosition = {
    x: position.x + move.x,
    y: position.y + move.y
  };

  const ctx = canvas.getContext("2d");

  const cx = ctx.getImageData(
    Math.round(newPosition.x),
    Math.round(-position.y),
    1,
    1
  ).data[0];
  if (cx === 255 || state.openDoors.includes(cx)) {
    position.x = newPosition.x;
  }

  const cy = ctx.getImageData(
    Math.round(position.x),
    Math.round(-newPosition.y),
    1,
    1
  ).data[0];
  if (cy === 255 || state.openDoors.includes(cy)) {
    position.y = newPosition.y;
  }
}

export default {
  init: function(canvas, startPosition) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(750, 750);

    const { entities, meshs: walls } = createLevel(canvas, scene);
    const state = {
      openDoors: []
    };

    camera.position.z = 1.7;
    camera.position.x = startPosition.x * scaleFactor;
    camera.position.y = -startPosition.y * scaleFactor;

    camera.rotation.x = Math.PI / 2;
    camera.rotation.z = -Math.PI / 2;
    camera.rotation.order = "ZXY";

    const movementVector = new THREE.Vector2(0, 0);

    function updateState(change) {
      if (change) {
        console.log("updating state", change);
        if (change.action === "openDoor") {
          state.openDoors.push(change.id);
          walls[change.id].parent.remove(walls[change.id]);
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);

      const move = movementVector
        .clone()
        .normalize()
        .multiplyScalar(0.4)
        .rotateAround(new THREE.Vector2(0, 0), camera.rotation.z);

      moveColliding(camera.position, move, canvas, state);

      entities.forEach(entity => {
        updateState(entity.update(camera.position, state));
      });

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