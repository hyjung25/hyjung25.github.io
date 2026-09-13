export class HealthSystem {
    constructor(entityManager, gameState) {
        this.entityManager = entityManager;
        this.gameState = gameState;
        this.baseHealthDrain = 5;
        this.player = null;
    }
    setPlayer(player) { this.player = player; }
    update(deltaTime) {
        const health = this.player?.getComponent('health');
        if (!health) return;
        health.drainRate = this.baseHealthDrain * 2 ** (health.waterFalls || 0);
        health.current = Math.max(0, Math.min(health.maximum, health.current - health.drainRate * deltaTime / 1000));
        if (health.current <= 0) this.gameState.endGame();
    }
    applyWaterFallDamage() {
        const health = this.player?.getComponent('health');
        if (!health) return;
        // Each new entry doubles the ongoing drain, including after leaving water.
        health.waterFalls = (health.waterFalls || 0) + 1;
        health.drainRate = this.baseHealthDrain * 2 ** health.waterFalls;
    }
    collectHealthPack(amount) {
        const health = this.player?.getComponent('health');
        if (health) health.current = Math.min(health.current + amount, health.maximum);
    }
    setSubmerged(isSubmerged) {
        const health = this.player?.getComponent('health');
        if (health) health.isSubmerged = isSubmerged;
    }
}
