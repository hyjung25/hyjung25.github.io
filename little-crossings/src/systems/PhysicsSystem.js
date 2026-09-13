import { WORLD } from '../game/config.js';

export class PhysicsSystem {
    constructor(entityManager) { this.entityManager = entityManager; }
    update(deltaTime) {
        const dt = deltaTime / 1000;
        for (const entity of this.entityManager.entities.values()) {
            const physics = entity.getComponent('physics');
            const transform = entity.getComponent('transform');
            if (!physics || !transform) continue;
            if (!physics.isKinematic) transform.position.addScaledVector(physics.velocity, dt);
            if (entity.hasComponent('platform')) {
                if (transform.position.x > WORLD.platformEdge) transform.position.x -= WORLD.platformEdge * 2;
                if (transform.position.x < -WORLD.platformEdge) transform.position.x += WORLD.platformEdge * 2;
            }
            physics.syncBounds(transform.position);
        }
    }
}
