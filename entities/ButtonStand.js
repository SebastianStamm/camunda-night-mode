import * as shaders from "../shaders.js";

export default class ButtonStand {
  constructor(id) {
    this.id = id;
    this.active = false;
    this.isSpecial = false;

    this.mesh = new THREE.Mesh(
      new THREE.CubeGeometry(0.2, 0.2, 2.8),
      new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib["fog"],
          {
            uActive: { value: 0.0 },
            uState: { value: 0.0 }
          }
        ]),
        vertexShader: shaders.commonVertex,
        fragmentShader: shaders.buttonStandFragment,
        fog: true
      })
    );
    this.mesh.onClick = (evt, mouseEvt) => {
      if (evt.distance < 5 && evt.point.z > 1.2 && !this.active) {
        if (window.locationsToUnlock === 4 || this.isSpecial) {
          this.isSpecial = true;
          window.nightOpenModal("operationSelection", id);
          mouseEvt.stopPropagation();
        } else {
          this.active = true;

          this.mesh.material.uniforms.uActive.value = 1;
          window.updateState({
            action: "openDoor",
            id
          });
        }
      }
    };
  }

  update() {
    this.mesh.material.uniforms.uState.value = window.locationsToUnlock;
  }
}
