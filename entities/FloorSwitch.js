export default class FloorSwitch {
  constructor(id) {
    this.id = id;

    this.mesh = new THREE.Mesh(
      new THREE.CubeGeometry(1, 1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x00aa00 })
    );
  }

  update(position, state) {
    const ownPosition = this.mesh.parent.position;

    if (
      Math.abs(ownPosition.x - position.x) < 1 &&
      Math.abs(ownPosition.y - position.y) < 1 &&
      !state.openDoors.includes(this.id)
    ) {
      return {
        action: "openDoor",
        id: this.id
      };
    }
  }
}
