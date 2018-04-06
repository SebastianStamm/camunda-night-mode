import * as shaders from '../shaders.js';

export default class Door {
  constructor(id) {
    this.id = id;

    this.mesh = new THREE.Mesh(
      new THREE.CubeGeometry(1, 1, 4),
      new THREE.ShaderMaterial({
        vertexShader: shaders.commonVertex,
        fragmentShader: shaders.doorFragment
      })
    );

    this.open = id === 255;
    this.currentlyOpen = false;
    this.tween = null;

    this.mesh.position.z = 2;
  }

  update(position, state) {
    const ownPosition = this.mesh.parent.position;

    const dist = Math.sqrt(Math.abs(ownPosition.x - position.x) ** 2 + Math.abs(ownPosition.y - position.y) ** 2);

    if (
      dist < 15 && (state.openDoors.includes(this.id) || this.open)
    ) {
      if(!this.currentlyOpen) {
        this.currentlyOpen = true;
        if(this.tween) {
          this.tween.stop();
        }
        this.tween = new TWEEN.Tween(this.mesh.position)
          .to({ z: -2 }, 500)
          .easing(TWEEN.Easing.Bounce.Out)
          .start();
      }
    } else {
      if(this.currentlyOpen) {
        this.currentlyOpen = false;
        if(this.tween) {
          this.tween.stop();
        }
        this.tween = new TWEEN.Tween(this.mesh.position)
          .to({ z: 2 }, 500)
          .easing(TWEEN.Easing.Bounce.Out)
          .start();
      }
    }
  }
}
