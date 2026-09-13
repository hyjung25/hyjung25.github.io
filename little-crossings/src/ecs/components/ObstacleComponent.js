export class ObstacleComponent {
    constructor(type, damage = 0, lane = 0) {
        this.type = type; // 'car', 'train', 'water'
        this.damage = damage; // 0 = instant death
        this.lane = lane;
    }
}
