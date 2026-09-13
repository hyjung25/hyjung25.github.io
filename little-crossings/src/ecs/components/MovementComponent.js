import * as THREE from 'three';

export class MovementComponent {
    constructor(speed = 1.0) {
        this.speed = speed;
        this.direction = new THREE.Vector3();
        this.velocity = new THREE.Vector3(); // Added velocity
        this.isMoving = false;
        this.targetPosition = new THREE.Vector3();
    }
}
