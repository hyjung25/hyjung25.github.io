import * as THREE from 'three';

export class PhysicsComponent {
    constructor(localBounds = null) {
        this.velocity = new THREE.Vector3();
        this.localBounds = localBounds;
        this.boundingBox = localBounds ? localBounds.clone() : null;
        this.isKinematic = false;
        this.mass = 1;
    }
    syncBounds(position) {
        if (this.boundingBox) this.boundingBox.copy(this.localBounds).translate(position);
    }
}
