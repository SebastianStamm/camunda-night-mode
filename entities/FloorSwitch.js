import * as shaders from "../shaders.js";

export default class FloorSwitch {
  constructor(id) {
    this.id = id;

    this.mesh = new THREE.Mesh(
      new THREE.CubeGeometry(3, 3, 2.8),
      new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"]]),
        vertexShader: shaders.commonVertex,
        fragmentShader: shaders.floorButtonFragment,
        fog: true,
        transparent: true
      })
    );

    this.activated = false;

    this.mesh.add(
      new THREE.Mesh(
        new THREE.CubeGeometry(3, 3, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x00aa00 })
      )
    );

    this.mesh.position.x = 1;
    this.mesh.position.y = 1;
  }

  update(position, state) {
    const ownPosition = this.mesh.parent.position;

    if (
      Math.abs(ownPosition.x - position.x) < 1 &&
      Math.abs(ownPosition.y - position.y) < 1 &&
      !this.activated
    ) {
      this.activated = true;
      // window.nightDone = true;

      return {
        action: "endGame"
      };
    }
  }
}
