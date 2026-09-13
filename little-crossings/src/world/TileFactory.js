import * as THREE from 'three';
import { Tile } from './Tile.js';
import { WORLD } from '../game/config.js';

export class TileFactory {
    constructor(geometryFactory, materialLibrary) {
        this.geometryFactory = geometryFactory;
        this.materialLibrary = materialLibrary;
        this.pathColumn = 0;
        this.previousRow = null;
        this.previousType = null;
    }
    createTile(type, position) {
        const group = new THREE.Group();
        const blockedColumns = [];
        if (type !== 'grass' || position.y <= 2) this.pathColumn = 0;
        else if (this.previousType !== 'grass' || this.previousRow !== position.y - 1) this.pathColumn = Math.floor(Math.random() * 9) - 4;
        else this.pathColumn = Math.max(-4, Math.min(4, this.pathColumn + Math.floor(Math.random() * 3) - 1));
        this.previousRow = position.y;
        this.previousType = type;
        group.position.set(0, 0, position.y);
        const material = type === 'river' ? 'water' : type === 'train_track' ? 'trainTrack' :
            type === 'grass' && Math.abs(position.y) % 2 ? 'grassAlt' : type;
        const ground = new THREE.Mesh(this.geometryFactory.getGeometry('tile'), this.materialLibrary.getMaterial(material));
        ground.position.y = -0.12;
        group.add(ground);
        const box = (mat, x, y, z, sx, sy, sz) => {
            const mesh = new THREE.Mesh(this.geometryFactory.getGeometry('box'), this.materialLibrary.getMaterial(mat));
            mesh.position.set(x, y, z);
            mesh.scale.set(sx, sy, sz);
            group.add(mesh);
        };
        if (type === 'road') {
            for (let x = -12; x <= 12; x += 2) box('cream', x, 0.012, -0.45, 0.65, 0.02, 0.04);
        } else if (type === 'train_track') {
            for (let x = -12; x <= 12; x++) box('log', x, 0.025, 0, 0.15, 0.05, 0.8);
            for (const z of [-0.27, 0.27]) box('rail', 0, 0.065, z, WORLD.width, 0.07, 0.065);
        } else if (type === 'grass') {
            // Randomize once when the row is created, never during rendering.
            // Separate planting areas keep trees out of the playable columns
            // and prevent crowns from overlapping adjacent rows or each other.
            for (const side of [-1, 1]) {
                for (let slot = 0; slot < 2; slot++) {
                    if (Math.random() < 0.55) continue;
                    const width = 0.65 + Math.random() * 0.4;
                    const depth = 0.6 + Math.random() * 0.25;
                    const height = 0.65 + Math.random() * 0.65;
                    const trunk = 0.35 + Math.random() * 0.25;
                    const x = side * (WORLD.playerLimit + 1.5 + slot * 1.9 + Math.random() * 0.9);
                    const z = (Math.random() - 0.5) * (1 - depth);
                    box('log', x, trunk / 2, z, 0.22, trunk, 0.22);
                    box('tree', x, trunk + height / 2 - 0.08, z, width, height, depth);
                }
            }
            // Leave a connected three-column corridor through consecutive grass
            // rows. The corridor can bend only one column per row.
            if (position.y >= 1) {
                const candidates = [];
                for (let x = -WORLD.playerLimit; x <= WORLD.playerLimit; x++) {
                    if (Math.abs(x - this.pathColumn) > 1) candidates.push(x);
                }
                const count = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const index = Math.floor(Math.random() * candidates.length);
                    const x = candidates.splice(index, 1)[0];
                    const height = 0.75 + Math.random() * 0.5;
                    box('log', x, 0.23, 0, 0.28, 0.46, 0.28);
                    box('tree', x, 0.38 + height / 2, 0, 0.78, height, 0.78);
                    blockedColumns.push(x);
                }
            }
        } else if (type === 'river') {
            for (let x = -11; x <= 11; x += 3) box('window', x, 0.012, 0.25, 0.55, 0.02, 0.035);
        }
        group.updateMatrixWorld(true);
        group.traverse(object => { object.matrixAutoUpdate = false; });
        const tile = new Tile(crypto.randomUUID(), type, position.clone(), group);
        tile.metadata.blockedColumns = blockedColumns;
        tile.metadata.pathColumn = this.pathColumn;
        return tile;
    }
}
