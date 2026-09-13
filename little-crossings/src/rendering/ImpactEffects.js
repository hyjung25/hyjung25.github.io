import * as THREE from 'three';

// One reusable burst, rendered independently of the stopped game simulation.
export class ImpactEffects {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.duration = 700;
        this.elapsed = this.duration;
        this.hit = false;
        this.reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.materials = [0xfff4d9, 0xffbd59, 0xf07858].map(color =>
            new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false }));
        this.particles = Array.from({ length: 18 }, (_, i) => {
            const mesh = new THREE.Mesh(geometry, this.materials[i % 3]);
            this.group.add(mesh);
            return { mesh, velocity: new THREE.Vector3(), size: 0.08 + (i % 4) * 0.025 };
        });
        this.ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 32),
            new THREE.MeshBasicMaterial({ color: 0xffe4a2, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        this.ring.rotation.x = -Math.PI / 2;
        this.group.add(this.ring);
    }
    trigger(position, velocity) {
        this.reset();
        this.hit = true;
        this.elapsed = 0;
        this.group.position.copy(position);
        this.ring.position.y = -position.y + 0.025;
        this.ring.scale.setScalar(0.25);
        this.ring.material.opacity = 0.9;
        for (const material of this.materials) material.opacity = 1;
        this.particles.forEach((particle, i) => {
            const angle = i * Math.PI * 2 / this.particles.length;
            const speed = 1.3 + (i % 3) * 0.65;
            particle.mesh.position.set(0, 0.1, 0);
            particle.mesh.rotation.set(i, i * 0.7, 0);
            particle.mesh.scale.setScalar(particle.size);
            particle.velocity.set(Math.cos(angle) * speed + Math.sign(velocity.x) * 1.2,
                2 + (i % 4) * 0.55, Math.sin(angle) * speed);
        });
        this.scene.add(this.group);
    }
    update(deltaTime, camera, playerMesh) {
        if (!this.hit) return;
        if (playerMesh) playerMesh.scale.set(1.3, 0.3, 1.3);
        if (this.elapsed >= this.duration) return;
        const dt = Math.min(deltaTime, 100) / 1000;
        this.elapsed = Math.min(this.duration, this.elapsed + dt * 1000);
        const progress = this.elapsed / this.duration;
        for (const particle of this.particles) {
            particle.velocity.y -= 8 * dt;
            particle.mesh.position.addScaledVector(particle.velocity, dt);
            particle.mesh.rotation.x += dt * 5;
            particle.mesh.rotation.z += dt * 3;
            particle.mesh.scale.setScalar(particle.size * (1 - progress * 0.6));
        }
        for (const material of this.materials) material.opacity = 1 - progress;
        this.ring.scale.setScalar(0.25 + progress * 2.4);
        this.ring.material.opacity = Math.max(0, 1 - progress * 1.8);
        if (camera && !this.reducedMotion && this.elapsed < 300) {
            const strength = 0.13 * (1 - this.elapsed / 300);
            // CameraController restores its base position before every update.
            camera.position.x += Math.sin(this.elapsed * 0.13) * strength;
            camera.position.y += Math.cos(this.elapsed * 0.17) * strength * 0.6;
        }
        if (this.elapsed >= this.duration) this.scene.remove(this.group);
    }
    reset() {
        this.scene.remove(this.group);
        this.elapsed = this.duration;
        this.hit = false;
    }
}
