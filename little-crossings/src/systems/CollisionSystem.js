import { WORLD } from '../game/config.js';

export class CollisionSystem {
    constructor(entityManager, gameState, healthSystem, worldManager) {
        Object.assign(this, { entityManager, gameState, healthSystem, worldManager });
    }
    update(deltaTime) {
        const player = this.healthSystem.player;
        if (!player) return;
        const transform = player.getComponent('transform');
        const physics = player.getComponent('physics');
        const health = player.getComponent('health');
        const tile = this.worldManager.getTileAt(transform.gridPosition);
        if (!tile || Math.abs(transform.position.x) > WORLD.playerLimit + 0.5) {
            this.gameState.endGame('You left the crossing.');
            return;
        }
        let support = null;
        for (const entity of this.entityManager.entities.values()) {
            if (!entity.hasComponent('platform')) continue;
            const box = entity.getComponent('physics').boundingBox;
            if (Math.abs(entity.getComponent('transform').position.z - transform.position.z) < 0.4 &&
                transform.position.x >= box.min.x - 0.1 && transform.position.x <= box.max.x + 0.1) {
                support = entity;
                break;
            }
        }
        if (tile.type === 'river' && support) {
            transform.position.x += support.getComponent('physics').velocity.x * deltaTime / 1000;
            transform.gridPosition.x = transform.position.x;
            health.isSubmerged = false;
        } else if (tile.type === 'river') {
            if (!health.isSubmerged) {
                this.healthSystem.applyWaterFallDamage();
                this.gameState.notifyCallbacks('onWaterFall', { position: transform.position.clone() });
            }
            health.isSubmerged = true;
        } else health.isSubmerged = false;
        physics.syncBounds(transform.position);
        for (const entity of this.entityManager.entities.values()) {
            if (entity.hasComponent('obstacle') && physics.boundingBox.intersectsBox(entity.getComponent('physics').boundingBox)) {
                this.gameState.notifyCallbacks('onImpact', {
                    position: transform.position.clone(),
                    velocity: entity.getComponent('physics').velocity.clone()
                });
                this.gameState.endGame('Watch the traffic!');
                return;
            }
            const collectible = entity.getComponent('collectible');
            if (collectible && transform.position.distanceToSquared(entity.getComponent('transform').position) < 0.4) {
                this.healthSystem.collectHealthPack(collectible.value);
                this.entityManager.removeEntity(entity);
            }
        }
    }
}
