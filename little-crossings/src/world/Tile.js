export class Tile {
    constructor(id, type, position, mesh) {
        this.id = id;
        this.type = type; // 'grass', 'road', 'river', 'train_track'
        this.position = position;
        this.mesh = mesh;
        this.metadata = {};
    }
}
