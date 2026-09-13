import * as THREE from 'three';

// Reuse one splash pool; swimming depth changes only the rendered character.
export class WaterEffects {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.duration = 900;
        this.elapsed = this.duration;
        this.depth = 0;
        this.submergedTime = 0;
        const geometry = new THREE.BoxGeometry(0.085, 0.13, 0.085);
        this.material = new THREE.MeshBasicMaterial({ color: 0xd8faff, transparent: true, depthWrite: false });
        this.drops = Array.from({ length: 16 }, () => {
            const mesh = new THREE.Mesh(geometry, this.material);
            this.group.add(mesh);
            return { mesh, velocity: new THREE.Vector3() };
        });
        const ringGeometry = new THREE.RingGeometry(0.86, 1, 40);
        this.rings = Array.from({ length: 2 }, () => {
            const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
                color: 0xe4ffff, transparent: true, depthWrite: false, side: THREE.DoubleSide
            }));
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.025;
            this.group.add(ring);
            return ring;
        });
    }
    trigger(position) {
        this.elapsed = 0;
        this.submergedTime = 0;
        this.group.position.set(position.x, 0, position.z);
        this.material.opacity = 1;
        this.drops.forEach((drop, i) => {
            const angle = i * Math.PI * 2 / this.drops.length;
            const speed = 0.9 + (i % 3) * 0.35;
            drop.mesh.position.set(Math.cos(angle) * 0.15, 0.05, Math.sin(angle) * 0.15);
            drop.mesh.visible = true;
            drop.mesh.rotation.set(0, angle, 0);
            drop.velocity.set(Math.cos(angle) * speed, 2 + (i % 4) * 0.4, Math.sin(angle) * speed);
        });
        for (const ring of this.rings) { ring.scale.setScalar(0.2); ring.material.opacity = 0; }
        this.scene.add(this.group);
    }
    update(deltaTime, playerMesh, submerged) {
        const dt = Math.min(Math.max(deltaTime, 0), 100) / 1000;
        if (submerged) this.submergedTime += dt;
        else this.submergedTime = 0;
        const targetDepth = submerged ? 0.48 : 0;
        this.depth += (targetDepth - this.depth) * (1 - Math.exp(-dt * 10));
        if (this.depth < 0.001 && !submerged) this.depth = 0;
        if (playerMesh) {
            const bob = submerged ? Math.sin(this.submergedTime * 9) * 0.025 : 0;
            playerMesh.position.y -= this.depth + bob;
            playerMesh.rotation.z += submerged ? Math.sin(this.submergedTime * 7) * 0.12 : 0;
        }
        if (this.elapsed >= this.duration) return;
        this.elapsed = Math.min(this.duration, this.elapsed + dt * 1000);
        const progress = this.elapsed / this.duration;
        for (const drop of this.drops) {
            drop.velocity.y -= 7 * dt;
            drop.mesh.position.addScaledVector(drop.velocity, dt);
            drop.mesh.visible = drop.mesh.position.y >= 0;
        }
        this.material.opacity = 1 - progress;
        this.rings.forEach((ring, i) => {
            const wave = Math.max(0, (progress - i * 0.18) / (1 - i * 0.18));
            ring.scale.setScalar(0.2 + wave * 1.5);
            ring.material.opacity = wave > 0 ? (1 - wave) * 0.75 : 0;
        });
        if (this.elapsed >= this.duration) this.scene.remove(this.group);
    }
    reset() {
        this.scene.remove(this.group);
        this.elapsed = this.duration;
        this.depth = 0;
        this.submergedTime = 0;
    }
}
