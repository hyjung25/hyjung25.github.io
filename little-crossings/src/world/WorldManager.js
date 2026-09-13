import { WORLD } from '../game/config.js';

export class WorldManager {
    constructor(scene) { this.scene = scene; this.activeTiles = new Map(); }
    addTile(tile) {
        const old = this.activeTiles.get(tile.position.y);
        if (old) this.removeTile(old);
        this.activeTiles.set(tile.position.y, tile);
        this.scene.add(tile.mesh);
    }
    removeTile(tile) {
        this.activeTiles.delete(tile.position.y);
        this.scene.remove(tile.mesh);
    }
    getTileAt(gridPosition) {
        if (Math.abs(gridPosition.x) > WORLD.width / 2) return null;
        return this.activeTiles.get(Math.round(gridPosition.y)) || null;
    }
    isTreeBlocked(x, z) {
        const tile = this.activeTiles.get(Math.round(z));
        return (tile?.metadata.blockedColumns || []).some(column => Math.abs(x - column) < 0.6);
    }
    despawnTilesBehind(zPosition) {
        for (const tile of this.activeTiles.values()) {
            if (tile.position.y < zPosition) this.removeTile(tile);
        }
    }
    getAllTiles() { return Array.from(this.activeTiles.values()); }
    clear() {
        for (const tile of this.activeTiles.values()) this.scene.remove(tile.mesh);
        this.activeTiles.clear();
    }
}
