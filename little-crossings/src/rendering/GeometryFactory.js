import * as THREE from 'three';
import { WORLD } from '../game/config.js';

export class GeometryFactory {
    constructor() {
        this.geometries = new Map([
            ['tile', new THREE.BoxGeometry(WORLD.width, 0.24, 1)],
            ['box', new THREE.BoxGeometry(1, 1, 1)],
            ['player', new THREE.BoxGeometry(0.55, 0.6, 0.6)],
            ['car', new THREE.BoxGeometry(1.65, 0.5, 0.75)],
            ['train', new THREE.BoxGeometry(6, 0.85, 0.8)],
            ['log', new THREE.CylinderGeometry(0.22, 0.22, 3.6, 8)],
            ['lilypad', new THREE.CylinderGeometry(0.65, 0.65, 0.12, 10)],
            ['healthPack', new THREE.BoxGeometry(0.4, 0.4, 0.4)]
        ]);
        // Bake orientation into shared geometry so transform sync cannot undo it.
        this.geometries.get('log').rotateZ(Math.PI / 2);
    }

    getGeometry(name) { return this.geometries.get(name); }

    createModel(type, materials) {
        const group = new THREE.Group();
        const part = (material, x, y, z, sx, sy, sz) => {
            const mesh = new THREE.Mesh(this.getGeometry('box'), materials.getMaterial(material));
            mesh.position.set(x, y, z);
            mesh.scale.set(sx, sy, sz);
            group.add(mesh);
        };
        const base = new THREE.Mesh(this.getGeometry(type), materials.getMaterial(type));
        group.add(base);
        if (type === 'player') {
            part('player', 0, 0.28, 0.06, 0.4, 0.3, 0.42);
            part('beak', 0, 0.22, 0.34, 0.24, 0.13, 0.2);
            part('red', 0, 0.49, 0.05, 0.1, 0.15, 0.26);
            for (const x of [-0.205, 0.205]) part('dark', x, 0.3, 0.17, 0.035, 0.075, 0.075);
            for (const x of [-0.17, 0.17]) part('beak', x, -0.34, 0.06, 0.12, 0.12, 0.28);
        } else if (type === 'car' || type === 'train') {
            const length = type === 'car' ? 0.85 : 4.7;
            part('window', -0.1, 0.37, 0, length, 0.32, 0.64);
            for (const x of (type === 'car' ? [-0.52, 0.52] : [-2.2, 0, 2.2])) {
                for (const z of [-0.39, 0.39]) part('dark', x, -0.18, z, 0.32, 0.3, 0.12);
            }
            const end = type === 'car' ? 0.83 : 3.01;
            for (const z of [-0.23, 0.23]) part('cream', end, 0, z, 0.04, 0.15, 0.15);
        } else if (type === 'healthPack') {
            part('cream', 0, 0.01, -0.205, 0.25, 0.08, 0.02);
            part('cream', 0, 0.01, -0.21, 0.08, 0.25, 0.02);
        }
        return group;
    }
}
