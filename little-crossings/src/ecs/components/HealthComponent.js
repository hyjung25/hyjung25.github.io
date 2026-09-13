export class HealthComponent {
    constructor(maximum = 100) {
        this.current = maximum;
        this.maximum = maximum;
        this.waterFalls = 0;
        this.drainRate = 5; // Base drain per second
        this.isSubmerged = false;
        this.isInvulnerable = false;
    }
}
