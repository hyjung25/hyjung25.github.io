import * as THREE from 'three';

export class TransformComponent {
    constructor(position = new THREE.Vector3(), rotation = new THREE.Euler(), scale = new THREE.Vector3(1, 1, 1)) {
        this.position = position.clone ? position.clone() : new THREE.Vector3();
        this.rotation = rotation;
        this.scale = scale.clone ? scale.clone() : new THREE.Vector3(1, 1, 1);
        this.gridPosition = new THREE.Vector2(
            Math.round(this.position.x), 
            Math.round(this.position.z)
        );
    }
}
