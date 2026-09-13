import { WORLD } from '../game/config.js';

export class RenderSystem {
    constructor(entityManager, scene, renderer, cameraController) {
        Object.assign(this, { entityManager, scene, renderer, cameraController });
        this.player = null;
        this.lastTime = null;
    }
    setPlayer(player) { this.player = player; }
    update() {
        const now = performance.now();
        const delta = this.lastTime === null ? 16.67 : Math.min(now - this.lastTime, 100);
        this.lastTime = now;
        for (const entity of this.entityManager.entities.values()) {
            const render = entity.getComponent('render');
            const transform = entity.getComponent('transform');
            if (!render?.mesh || !transform) continue;
            const mesh = render.mesh;
            if (entity === this.player) {
                const blend = 1 - Math.exp(-delta / 35);
                mesh.position.x += (transform.position.x - mesh.position.x) * blend;
                mesh.position.z += (transform.position.z - mesh.position.z) * blend;
                const progress = 1 - (transform.hopRemaining || 0) / WORLD.moveDelay;
                mesh.position.y = transform.position.y + Math.sin(progress * Math.PI) * 0.3;
            } else mesh.position.copy(transform.position);
            mesh.rotation.copy(transform.rotation);
            mesh.scale.copy(transform.scale);
            mesh.visible = render.visible;
            if (!mesh.parent) this.scene.add(mesh);
        }
        if (this.player) this.cameraController.update(this.player.getComponent('transform').position, delta);
        this.waterEffects?.update(this.gameState?.isPaused ? 0 : delta,
            this.player?.getComponent('render')?.mesh,
            this.player?.getComponent('health')?.isSubmerged);
        this.effects?.update(delta, this.cameraController.getCamera(), this.player?.getComponent('render')?.mesh);
        this.renderer.render(this.scene, this.cameraController.getCamera());
    }
    onResize() {
        this.cameraController.onResize();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
