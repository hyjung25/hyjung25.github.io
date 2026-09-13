import * as THREE from 'three';

export class SceneSetup {
    initialize(canvas) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xc8e5df);
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x7f9470, 2));
        const sun = new THREE.DirectionalLight(0xfff4dd, 2);
        sun.position.set(-8, 15, -5);
        this.scene.add(sun);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        this.renderer.localClippingEnabled = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        return { scene: this.scene, renderer: this.renderer };
    }
    getScene() { return this.scene; }
    getRenderer() { return this.renderer; }
}
