import * as shaders from "../shaders.js";

export default class RoomName {
  constructor(roomId) {
    const data = window.roomLabelMap[roomId];
    console.log("should construct room name", data);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", 512);
    canvas.setAttribute("height", 128);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, 512, 128);

    const border = 10;
    ctx.fillStyle = "rgba(40, 40, 40, 1)";
    ctx.fillRect(border, border, 512 - 2 * border, 128 - 2 * border);

    ctx.fillStyle = "rgba(0, 255, 51, 1)";
    ctx.font = "30px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.name, 512 / 2, 128 / 2, 512 - 2 * border);

    const texture = new THREE.Texture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.PlaneGeometry(5, 1.5);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.order = "ZXY";
    this.mesh.position.z = 2.5;
    this.mesh.rotation.x = Math.PI / 2;

    if (data.orientation === "s") {
      this.mesh.rotation.z = Math.PI;
      this.mesh.position.y = -0.45;
    } else {
      this.mesh.position.y = 0.45;
    }

    this.mesh.material.map.needsUpdate = true;
  }

  update() {}
}
