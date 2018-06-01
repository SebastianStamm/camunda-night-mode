import Entity from "./entities/index.js";

import * as shaders from "./shaders.js";

const scaleFactor = 1;
const height = 4;

function createLevel(canvas, scene) {
  const wallShaderUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["fog"],
    {
      uLight: { value: new THREE.Vector3(0.0, 0, 0) },
      uState: { value: window.locationsToUnlock },
      uAnimationProgress: { value: 0 },
      overrideAnimation: { value: 0 }
    }
  ]);

  window.wallShaderUniforms = wallShaderUniforms;

  const canvasSize =
    2 ** Math.ceil(Math.log2(Math.max(canvas.width, canvas.height)));

  window.nightFloorCanvasSize = canvasSize;

  const floorCanvas = document.createElement("canvas");
  floorCanvas.setAttribute("width", canvasSize);
  floorCanvas.setAttribute("height", canvasSize);

  const floorCtx = floorCanvas.getContext("2d");
  floorCtx.fillStyle = "rgba(20, 20, 20, 1)";
  floorCtx.fillRect(0, 0, canvasSize - 1, canvasSize - 1);

  window.nightFloorCtx = floorCtx;
  window.nightFloor = floorCanvas;

  document.body.appendChild(floorCanvas);

  const floorShaderUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["fog"],
    {
      uColors: { type: "t", value: new THREE.Texture(floorCanvas) },
      uState: { value: window.locationsToUnlock },
      uAnimationProgress: { value: 0 },
      uBlackBorder: { value: 0 }
    }
  ]);

  floorShaderUniforms.uColors.value.generateMipmaps = false;
  floorShaderUniforms.uColors.value.minFilter = THREE.NearestFilter;
  floorShaderUniforms.uColors.value.magFilter = THREE.NearestFilter;
  window.floorShaderUniforms = floorShaderUniforms;

  const tiles = [];
  tiles[1] = {
    geometry: new THREE.CubeGeometry(scaleFactor, scaleFactor, height),
    material: new THREE.ShaderMaterial({
      uniforms: wallShaderUniforms,
      vertexShader: shaders.commonVertex,
      fragmentShader: shaders.wallFragment,
      fog: true
    })
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

    if (red === 0) {
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
      let processedEntityParam = entityParam;
      if (entityType === 2) {
        // check which side of the door it is
        const hasLeft =
          ctx.getImageData(Math.round(x - 1), Math.round(y), 1, 1).data[1] ===
          2;

        const hasTop =
          ctx.getImageData(Math.round(x), Math.round(y - 1), 1, 1).data[1] ===
          2;

        processedEntityParam += (hasTop || hasLeft) * 4;

        floorCtx.fillStyle = `rgba(117, 111, 3,1)`;
        // floorCtx.fillRect(x, y - 1, 1, 1);
      }

      const entity = new Entity[entityType](processedEntityParam, red);

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
  const floormaterial = new THREE.ShaderMaterial({
    vertexShader: shaders.commonVertex,
    fragmentShader: shaders.floorFragment.replace(
      /%CANVAS_SIZE%/g,
      canvasSize + ".0"
    ),
    uniforms: { ...floorShaderUniforms, uIsRoof: { value: 0.0 } },
    fog: true,
    side: THREE.DoubleSide
  });

  const floormaterial2 = new THREE.ShaderMaterial({
    vertexShader: shaders.commonVertex,
    fragmentShader: shaders.floorFragment.replace(
      /%CANVAS_SIZE%/g,
      canvasSize + ".0"
    ),
    uniforms: { ...floorShaderUniforms, uIsRoof: { value: 1.0 } },
    fog: true,
    side: THREE.DoubleSide
  });

  const floormesh = new THREE.Mesh(floorgeometry2, floormaterial2);
  floormesh.position.set(canvas.width / 2 + 0.5, -canvas.height / 2 - 0.5, 4);

  const floormesh2 = new THREE.Mesh(floorgeometry2, floormaterial);
  floormesh2.position.set(
    canvas.width / 2 + 0.5,
    -canvas.height / 2 - 0.5,
    -0.01
  );
  scene.add(floormesh);
  scene.add(floormesh2);

  return {
    entities,
    meshs,
    wallShaderUniforms,
    floorShaderUniforms
  };
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
  if (cx === 255 || state.openDoors.includes(cx) || window.noCollide) {
    position.x = newPosition.x;
  }

  const cy = ctx.getImageData(
    Math.round(position.x),
    Math.round(-newPosition.y),
    1,
    1
  ).data[0];
  if (cy === 255 || state.openDoors.includes(cy) || window.noCollide) {
    position.y = newPosition.y;
  }
}

export default {
  init: function(canvas, startPosition) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.001, 100);

    window.nightCamera = camera;
    window.canDance = false;
    const gameDone = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    scene.fog = new THREE.Fog(0x000000, 1, 40);

    const {
      entities,
      meshs: walls,
      wallShaderUniforms,
      floorShaderUniforms
    } = createLevel(canvas, scene);
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

    let forceTermination = false;
    function updateState(change) {
      if (change) {
        console.log("updating state", change);
        if (
          change.action === "openDoor" &&
          state.openDoors.indexOf(change.id) === -1
        ) {
          state.openDoors.push(change.id);
          // showUnlockNotification(window.roomIdToElementMap[change.id]);
          updateGameProgression(
            --window.locationsToUnlock,
            window.roomIdToElementMap[change.id],
            state.openDoors
          );
        }
        if (change.action === "endGame") {
          new TWEEN.Tween(camera.position)
            .to({ z: 4 }, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .start();

          renderer.domElement.style.transition = "opacity 3s";

          window.setTimeout(() => {
            renderer.domElement.style.opacity = "0";
          }, 100);

          window.setTimeout(() => {
            forceTermination = true;
            document.body.removeChild(renderer.domElement);
            document.body.removeChild(document.getElementById("nightQuest"));
            document.body.removeChild(document.getElementById("nightCross"));
            document.body.removeChild(window.flashlight);
            document.body.removeChild(window.nightFloor);
            document.exitPointerLock();
            document.webkitExitFullscreen();
          }, 3100);
        }
        if (change.action === "activateDisco") {
          function getRndColor() {
            return "hsl(" + ~~(Math.random() * 360) + ",100%,50%)";
          }
          const updateFloorLights = () => {
            const ctx = window.nightFloorCtx;

            const gradient = ctx.createLinearGradient(
              0,
              ~~(Math.random() * window.nightFloorCanvasSize),
              window.nightFloorCanvasSize,
              ~~(Math.random() * window.nightFloorCanvasSize)
            );
            const stepSize = 4 / window.nightFloorCanvasSize;

            for (let i = 0; i <= 1; i += stepSize) {
              gradient.addColorStop(i, getRndColor());
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(
              0,
              0,
              window.nightFloorCanvasSize,
              window.nightFloorCanvasSize
            );

            new TWEEN.Tween(window.wallShaderUniforms.uLight.value)
              .to(
                { x: Math.random(), y: Math.random(), z: Math.random() },
                1000
              )
              .easing(TWEEN.Easing.Linear.None)
              .start();
          };
          window.discoFloorInterval = window.setInterval(
            updateFloorLights,
            1000
          );
          updateFloorLights();
          window.wallShaderUniforms.overrideAnimation.value = 1;
          window.floorShaderUniforms.uBlackBorder.value = 1;
        }
      }
    }

    window.updateState = updateState;

    function animate() {
      if (forceTermination) {
        return;
      }
      requestAnimationFrame(animate);

      TWEEN.update();

      const move = movementVector
        .clone()
        .normalize()
        .multiplyScalar(0.25)
        .rotateAround(new THREE.Vector2(0, 0), camera.rotation.z);

      moveColliding(camera.position, move, canvas, state);

      entities.forEach(entity => {
        if (entity.update) {
          updateState(entity.update(camera.position, state));
        }
      });

      floorShaderUniforms.uColors.value.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    let pointerLocked = false;

    renderer.domElement.addEventListener("click", e => {
      if (pointerLocked) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects[0]) {
          const obj = intersects[0].object;
          if (obj && obj.onClick) {
            obj.onClick(intersects[0], e);
          }
        }
      }
    });

    window.nightRequestPointerLock = () => {
      const elem = renderer.domElement;
      elem.requestPointerLock =
        elem.requestPointerLock ||
        elem.mozRequestPointerLock ||
        elem.webkitRequestPointerLock;
      elem.requestPointerLock();
    };

    renderer.domElement.addEventListener("click", function(evt) {
      window.nightRequestPointerLock();
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

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.zIndex = "99999";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.filter = "blur(200px)";
    renderer.domElement.style.opacity = "0";

    window.setTimeout(() => {
      renderer.domElement.style.transition = "filter 1s, opacity 1s";
    }, 100);

    window.setTimeout(() => {
      renderer.domElement.style.filter = "";
      renderer.domElement.style.opacity = "1";
    }, 200);

    document.body.appendChild(renderer.domElement);

    renderer.domElement.requestPointerLock();
    document.body.webkitRequestFullscreen();

    addCrosshair();
    addQuestIndicator();
    updateGameProgression(window.locationsToUnlock);
  }
};

function updateGameProgression(state, unlockedRoom, doors) {
  if (state === 6) {
    // initial state, ensure dark and flashlight
    const flashlight = document.createElement("div");
    flashlight.style.position = "fixed";
    flashlight.style.top = "0px";
    flashlight.style.left = "0px";
    flashlight.style.width = "100vw";
    flashlight.style.height = "100vh";
    flashlight.style.background = "radial-gradient(rgba(0,0,0,0.3), #000)";
    flashlight.style.pointerEvents = "none";
    flashlight.style.zIndex = "1000000";
    flashlight.style.opacity = "1";
    flashlight.style.transition = "opacity 1s";

    window.flashlight = flashlight;

    document.body.appendChild(flashlight);
    document.getElementById("currentTask").textContent =
      "Restore Emergency Lighting";
  } else if (state === 5) {
    // emergency lighting is restored
    window.wallShaderUniforms.uState.value = state;

    if (window.flashlight) {
      window.flashlight.style.opacity = "0";
    }

    // window.pulsatingRedStarted = Date.now();
    window.lightpulse = new TWEEN.Tween(window.wallShaderUniforms.uLight.value)
      .to({ x: 1 }, 600)
      .easing(TWEEN.Easing.Linear.None)
      .repeat(Infinity)
      .yoyo(true)
      .start();

    document.getElementById("currentTask").textContent =
      "Activate Process Utility";
  } else if (state === 4) {
    document.getElementById("currentTask").textContent = "Access Control Panel";
  } else if (state === 3) {
    document.getElementById("currentTask").textContent = "Turn the Light On!";
  } else if (state === 2) {
    // turn the light on fully
    document.getElementById("currentTask").textContent =
      "Restore Door Control System";

    window.wallShaderUniforms.uState.value = state;
    window.wallShaderUniforms.uAnimationProgress.value = 0;
    window.floorShaderUniforms.uState.value = state;
    window.floorShaderUniforms.uAnimationProgress.value = 0;

    new TWEEN.Tween(window.wallShaderUniforms.uAnimationProgress)
      .to({ value: 1 }, 5000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        const val = window.wallShaderUniforms.uAnimationProgress.value;
        window.floorShaderUniforms.uAnimationProgress.value = val;
        const twofive = 255 * val;

        const camera = window.nightCamera;
        const ctx = window.nightFloorCtx;

        const gradient = ctx.createRadialGradient(
          camera.position.x,
          -camera.position.y,
          0,
          camera.position.x,
          -camera.position.y,
          50
        );
        gradient.addColorStop(
          val < 0.5 ? 0 : (val - 0.5) * 2,
          "rgba(255, 255, 255, 1)"
        );
        gradient.addColorStop(val > 0.5 ? 1 : val * 2, "rgba(20, 20, 20, 1)");
        ctx.fillStyle = gradient;
        window.nightFloorCtx.fillRect(
          0,
          0,
          window.nightFloorCanvasSize - 1,
          window.nightFloorCanvasSize - 1
        );
      })
      .onComplete(() => {
        if (window.lightpulse) {
          window.lightpulse.stop();
        }

        window.nightFloorCtx.fillStyle = `rgba(255, 255, 255, 1)`;
        window.nightFloorCtx.fillRect(
          0,
          0,
          window.nightFloorCanvasSize - 1,
          window.nightFloorCanvasSize - 1
        );
      })
      .start();
  } else if (state === 1) {
    document.getElementById("currentTask").textContent =
      "Escape the Simulation!";
    for (let i = 1; i < 20; i++) {
      doors.push(i);
    }
  }

  narrate(state, unlockedRoom);
}

window.updateGameProgression = updateGameProgression;

function addCrosshair() {
  const cross = document.createElement("img");
  cross.setAttribute(
    "src",
    "/camunda/app/cockpit/scripts/nightmode/crosshair.png"
  );
  cross.style.position = "absolute";
  cross.style.top = "50%";
  cross.style.left = "50%";
  cross.style.marginLeft = "-4px";
  cross.style.marginTop = "-4px";
  cross.style.zIndex = "100000";
  cross.style.filter = "invert(1)";
  cross.style.transform = "scale(1.5)";
  cross.id = "nightCross";

  window.crossHair = cross;

  document.body.appendChild(cross);
}

function addQuestIndicator() {
  const cross = document.createElement("div");
  cross.style.position = "absolute";
  cross.style.bottom = "20px";
  cross.style.left = "20px";
  cross.style.zIndex = "1000001";
  cross.style.backgroundColor = "rgba(255,255,255, 0.7)";
  cross.style.padding = "5px";
  cross.style.transform = "scale(1.7)";
  cross.style.transformOrigin = "bottom left";
  cross.style.width = "14vw";
  cross.style.border = "2px solid black";

  cross.innerHTML =
    "<span style='float: left; font-size: 2em; margin-right: 20px;'>🏃</span><b>Current Task:</b><br/><span id='currentTask'></span>";

  cross.id = "nightQuest";

  document.body.appendChild(cross);
}

function showUnlockNotification(text) {
  // console.log("should show unlock notification for", businessObject);

  // const text =
  //   businessObject.$type.substr(5) +
  //   " " +
  //   businessObject.name +
  //   " is now unlocked";

  const cross = document.createElement("div");
  cross.style.position = "absolute";
  cross.style.top = "20px";
  cross.style.left = "-40vw";
  cross.style.zIndex = "1000001";
  cross.style.backgroundColor = "rgba(255,255,255, 0.7)";
  cross.style.padding = "5px";
  cross.style.transform = "scale(1.5)";
  cross.style.transformOrigin = "top left";
  cross.style.width = "22vw";
  cross.style.transition = "1s";
  cross.style.display = "table";
  cross.style.border = "2px solid black";

  cross.innerHTML =
    "<span style='float: left; font-size: 2em; margin-right: 20px;'>🏆</span><span style='display: table-cell; vertical-align: middle'>" +
    text +
    "</span></span>";

  document.body.appendChild(cross);

  window.setTimeout(() => {
    cross.style.left = "20px";
  }, 100);

  window.setTimeout(() => {
    cross.style.left = "-40vw";
  }, text.length * 80);
}

window.nightOpenModal = function(type, id) {
  if (type === "operationSelection") {
    if (!window.canDance) {
      const container = document.createElement("div");
      container.innerHTML = `<div style="width: 90vw; height: 90vh; position: absolute; top: 5vh; left: 5vw; border: 2px solid black; z-index: 1000002; background-color: #282828; color: #0f6; font-family: monospace;">
      <center>
        <span style="font-size: 5em">Process Operation Control</span>
        <div class="termination" style="width: 30vw; position: absolute; bottom: 2em; top: 9em; left: 10vw; border: 3px solid black; background-image: url(/camunda/app/cockpit/scripts/nightmode/termination/splash.jpg); background-size: 100% auto; background-repeat: no-repeat; background-color: black; cursor: pointer;"></div>
        <div class="nightlight" style="width: 30vw; position: absolute; bottom: 2em; top: 9em; right: 10vw; border: 3px solid black; cursor: pointer; background-color: #242;">
          <span style="font-size: 14em;">💡</span>
          <br/>
          <br/>
          <br/>
          <span style="font-size: 4em;">Restore Light</span>
        </div>
      </center>
    </div>
    `;
      document.body.appendChild(container);

      document.exitPointerLock();

      container.querySelector(".termination").addEventListener("click", () => {
        document.body.removeChild(container);
        playTermination();
      });

      container.querySelector(".nightlight").addEventListener("click", () => {
        document.body.removeChild(container);
        window.updateState({
          action: "openDoor",
          id
        });
        window.nightRequestPointerLock();
      });

      container.addEventListener("click", evt => {
        evt.stopPropagation();
      });
      document.body.addEventListener("click", () => {
        document.body.removeChild(container);
        window.nightRequestPointerLock();
      });
    } else {
      const container = document.createElement("div");
      container.innerHTML = `<div style="width: 90vw; height: 90vh; position: absolute; top: 5vh; left: 5vw; border: 2px solid black; z-index: 1000002; background-color: #282828; color: #0f6; font-family: monospace;">
      <center>
        <span style="font-size: 5em">Process Operation Control</span>
        <div class="termination" style="width: 30vw; position: absolute; bottom: 2em; top: 9em; left: 10vw; border: 3px solid black; background-image: url(/camunda/app/cockpit/scripts/nightmode/termination/splash.jpg); background-size: 100% auto; background-repeat: no-repeat; background-color: black; cursor: pointer;"></div>
        <div class="nightlight" style="width: 30vw; position: absolute; bottom: 2em; top: 9em; right: 10vw; border: 3px solid black; cursor: pointer; background-color: #242;">
          <span style="font-size: 14em;">🕺</span>
          <br/>
          <br/>
          <br/>
          <span style="font-size: 4em;">Disco Mode</span>
        </div>
      </center>
    </div>
    `;
      document.body.appendChild(container);

      document.exitPointerLock();

      container.querySelector(".termination").addEventListener("click", () => {
        document.body.removeChild(container);
        playTermination();
      });

      container.querySelector(".nightlight").addEventListener("click", () => {
        document.body.removeChild(container);
        window.updateState({
          action: "activateDisco"
        });
        window.nightRequestPointerLock();
      });

      container.addEventListener("click", evt => {
        evt.stopPropagation();
      });
      document.body.addEventListener("click", () => {
        document.body.removeChild(container);
        window.nightRequestPointerLock();
      });
    }
  }
};

function playTermination() {
  const frame = document.createElement("iframe");
  frame.setAttribute(
    "src",
    "/camunda/app/cockpit/scripts/nightmode/termination/index.html"
  );

  frame.style.position = "absolute";
  frame.style.zIndex = "1000002";
  frame.style.width = "90vw";
  frame.style.height = "90vh";
  frame.style.top = "5vh";
  frame.style.left = "5vw";

  document.body.appendChild(frame);

  document.body.addEventListener("click", () => {
    document.body.removeChild(frame);
    window.nightRequestPointerLock();
  });
}

function narrate(state, unlockedRoom) {
  if (!unlockedRoom) {
    return;
  }
  console.log(unlockedRoom);

  const synth = window.speechSynthesis;

  const bo = unlockedRoom.businessObject;
  const type = bo.$type.substr(5);
  const name = bo.name;

  switch (state) {
    case 4: {
      const str =
        "Process Utility Activated! Please Proceed to the Control Panel in " +
        type +
        " " +
        name;

      showUnlockNotification(str);
      const utterThis = new SpeechSynthesisUtterance(str);

      utterThis.voice = synth
        .getVoices()
        .find(({ name }) => name === "Google UK English Female");
      utterThis.pitch = 1;
      utterThis.rate = 1;
      synth.speak(utterThis);
      break;
    }
    case 3: {
      const str =
        "Light Restoration Procedure started. Turn on the Light in " +
        type +
        " " +
        name;
      showUnlockNotification(str);

      const utterThis = new SpeechSynthesisUtterance(str);

      utterThis.voice = synth
        .getVoices()
        .find(({ name }) => name === "Google UK English Female");
      utterThis.pitch = 1;
      utterThis.rate = 1;

      synth.speak(utterThis);
      break;
    }
    case 2: {
      window.canDance = true;
      const str =
        "Light restored. To leave the Emergency Energy Restoration Procedure, override the door control component in " +
        type +
        " " +
        name;

      showUnlockNotification(str);
      const utterThis = new SpeechSynthesisUtterance(str);

      utterThis.voice = synth
        .getVoices()
        .find(({ name }) => name === "Google UK English Female");
      utterThis.pitch = 1;
      utterThis.rate = 1;

      synth.speak(utterThis);
      break;
    }

    case 1: {
      const str = "Doors opened.";

      showUnlockNotification(str);
      const utterThis = new SpeechSynthesisUtterance(str);

      utterThis.voice = synth
        .getVoices()
        .find(({ name }) => name === "Google UK English Female");
      utterThis.pitch = 1;
      utterThis.rate = 1;

      synth.speak(utterThis);
      break;
    }
  }
}

window.narrate = narrate;
