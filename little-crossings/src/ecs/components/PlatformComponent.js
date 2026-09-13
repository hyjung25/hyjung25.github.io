import * as THREE from 'three';

export class PlatformComponent {
    constructor(type, speed, direction) {
        this.type = type; // 'log' or 'lilypad'
        this.speed = speed;
        this.direction = direction || new THREE.Vector3(1, 0, 0);
        this.capacity = 1;
    }
}
