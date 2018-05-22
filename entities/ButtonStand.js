import * as shaders from "../shaders.js";

export default class ButtonStand {
  constructor(id) {
    this.id = id;

    this.mesh = new THREE.Mesh(
      new THREE.CubeGeometry(0.2, 0.2, 2.8),
      // new THREE.MeshBasicMaterial({ color: 0x00aa00 })
      new THREE.ShaderMaterial({
        uniforms: {
          uActive: { value: 0.0 }
        },
        vertexShader: shaders.commonVertex,
        fragmentShader: shaders.buttonStandFragment
      })
    );
  }

  update(position, state) {
    const ownPosition = this.mesh.parent.position;

    if (
      Math.abs(ownPosition.x - position.x) < 1 &&
      Math.abs(ownPosition.y - position.y) < 1 &&
      !state.openDoors.includes(this.id)
    ) {
      this.mesh.material.uniforms.uActive.value = 1;
      return {
        action: "openDoor",
        id: this.id
      };
    }
  }
}
