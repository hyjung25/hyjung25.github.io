import * as THREE from 'three';
import { WORLD } from '../game/config.js';

export class MaterialLibrary {
    constructor() {
        this.materials = new Map();
        const colors = {
            player: 0xfff4d9, grass: 0x91c96e, grassAlt: 0x83bb62,
            road: 0x465365, water: 0x53b9ce, trainTrack: 0x9b998f,
            car: 0xf07658, train: 0x465d80, log: 0xb67d4b,
            lilypad: 0x6fae56, healthPack: 0xf16c92, cream: 0xffedbd,
            window: 0xb8e0e6, dark: 0x293849, beak: 0xf6b746,
            red: 0xec6558, rail: 0xc7d0ce, tree: 0x4f9863
        };
        const planes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), WORLD.width / 2),
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), WORLD.width / 2)
        ];
        const terrain = new Set(['grass', 'grassAlt', 'road', 'water', 'trainTrack']);
        for (const [name, color] of Object.entries(colors)) {
            this.materials.set(name, new THREE.MeshLambertMaterial({
                color, clippingPlanes: terrain.has(name) ? null : planes
            }));
        }
    }
    getMaterial(name) { return this.materials.get(name); }
}
