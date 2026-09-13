import * as THREE from 'three';

export class CameraController {
    constructor() {
        this.camera = null;
        this.focus = new THREE.Vector3(0, 0, 3);
        this.offset = new THREE.Vector3(8, 12, -12);
    }
    initialize() {
        this.camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 120);
        this.onResize();
        this.reset(new THREE.Vector3());
        return this.camera;
    }
    reset(position) {
        this.focus.set(position.x * 0.25, 0, position.z + 3);
        this.placeCamera();
    }
    placeCamera() {
        this.camera.position.copy(this.focus).add(this.offset);
        this.camera.lookAt(this.focus);
    }
    update(position, deltaTime = 16.67) {
        const blend = 1 - Math.exp(-deltaTime / 130);
        this.focus.x += (position.x * 0.25 - this.focus.x) * blend;
        this.focus.z += (position.z + 3 - this.focus.z) * blend;
        this.placeCamera();
    }
    onResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const height = Math.max(8, 8 / aspect);
        Object.assign(this.camera, { left: -height * aspect, right: height * aspect, top: height, bottom: -height });
        this.camera.updateProjectionMatrix();
    }
    getCamera() { return this.camera; }
}
