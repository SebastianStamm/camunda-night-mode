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

    this.mesh.onClick = evt => {
      console.log("clicked mesh", evt);
      if (evt.distance < 5 && evt.point.z > 1.2) {
        this.mesh.material.uniforms.uActive.value = 1;
        window.updateState({
          action: "openDoor",
          id
        });
      }
    };
  }
}
