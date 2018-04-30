import * as shaders from "../shaders.js";

export default class Door {
  constructor(orientation, id) {
    this.id = id;
    this.orientation = orientation % 4;
    this.side = orientation <= 4;

    this.mesh = new THREE.Object3D();

    this.innerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1),
      new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      })
    );
    this.innerMesh.rotation.order = "ZXY";
    this.innerMesh.rotation.y = Math.PI / 2;
    switch (this.orientation) {
      case 1:
        this.mesh.position.y = -0.5;
        if (this.side) {
          this.innerMesh.position.x = 0.5;
          this.mesh.position.x = -0.5;
        } else {
          this.innerMesh.position.x = -0.5;
          this.mesh.position.x = 0.5;
        }
        break;
      case 2:
        this.mesh.position.x = -0.5;
        if (this.side) {
          this.innerMesh.position.y = -0.5;
          this.mesh.position.y = 0.5;
        } else {
          this.innerMesh.position.y = 0.5;
          this.mesh.position.y = -0.5;
        }
        break;
      case 3:
        this.mesh.position.y = 0.5;
        if (this.side) {
          this.innerMesh.position.x = 0.5;
          this.mesh.position.x = -0.5;
        } else {
          this.innerMesh.position.x = -0.5;
          this.mesh.position.x = 0.5;
        }
        break;
      case 0:
        this.mesh.position.x = 0.5;
        if (this.side) {
          this.innerMesh.position.y = -0.5;
          this.mesh.position.y = 0.5;
        } else {
          this.innerMesh.position.y = 0.5;
          this.mesh.position.y = -0.5;
        }
        break;
    }

    if (this.orientation === 1 || this.orientation === 3) {
      this.innerMesh.rotation.z = Math.PI / 2;
    }

    this.open = id === 255;
    this.currentlyOpen = false;
    this.tween = null;

    this.innerMesh.position.z = 1.25;

    this.mesh.add(this.innerMesh);
  }

  update(position, state) {
    const ownPosition = this.mesh.parent.position;

    const dist = Math.sqrt(
      Math.abs(ownPosition.x - position.x) ** 2 +
        Math.abs(ownPosition.y - position.y) ** 2
    );

    if (dist < 15 && (state.openDoors.includes(this.id) || this.open)) {
      if (!this.currentlyOpen) {
        this.currentlyOpen = true;
        if (this.tween) {
          this.tween.stop();
        }

        let target = Math.PI / 2 - 0.2;
        if (this.orientation === 3 || this.orientation === 0) {
          target *= -1;
        }
        if (!this.side) {
          target *= -1;
        }

        this.tween = new TWEEN.Tween(this.mesh.rotation)
          .to({ z: target }, 500)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
    } else {
      if (this.currentlyOpen) {
        this.currentlyOpen = false;
        if (this.tween) {
          this.tween.stop();
        }
        this.tween = new TWEEN.Tween(this.mesh.rotation)
          .to({ z: 0 }, 500)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
    }
  }
}
