import * as THREE from 'three';
import { WORLD } from '../game/config.js';
import { TransformComponent } from '../ecs/components/TransformComponent.js';
import { RenderComponent } from '../ecs/components/RenderComponent.js';
import { PhysicsComponent } from '../ecs/components/PhysicsComponent.js';
import { PlatformComponent } from '../ecs/components/PlatformComponent.js';
import { ObstacleComponent } from '../ecs/components/ObstacleComponent.js';
import { CollectibleComponent } from '../ecs/components/CollectibleComponent.js';

export class ProceduralGenerator {
    constructor(worldManager, tileFactory, entityManager, geometryFactory, materialLibrary) {
        Object.assign(this, { worldManager, tileFactory, entityManager, geometryFactory, materialLibrary });
        this.player = null;
        this.currentZ = 0;
        this.furthestZ = 0;
        this.recentTiles = [];
        this.activeSpawners = [];
    }
    setPlayer(player) { this.player = player; }
    initialize() {
        this.currentZ = -WORLD.behind;
        this.furthestZ = 0;
        this.recentTiles = [];
        this.activeSpawners = [];
        while (this.currentZ <= WORLD.ahead) this.generateNextTile();
    }
    update(deltaTime) {
        if (!this.player) return;
        this.furthestZ = Math.max(this.furthestZ, this.player.getComponent('transform').gridPosition.y);
        while (this.currentZ <= this.furthestZ + WORLD.ahead) this.generateNextTile();
        this.updateSpawners(deltaTime);
        this.cleanupEntities();
        this.worldManager.despawnTilesBehind(this.furthestZ - WORLD.behind);
    }
    selectTileType() {
        if (this.currentZ <= 2) return 'grass';
        if (this.recentTiles.length === 4 && !this.recentTiles.includes('grass')) return 'grass';
        // A forgiving introduction, then independent random lanes.
        if (this.currentZ === 3 || this.currentZ === 4) return 'road';
        if (this.currentZ === 5) return 'grass';
        const r = Math.random();
        return r < 0.36 ? 'grass' : r < 0.72 ? 'road' : r < 0.94 ? 'river' : 'train_track';
    }
    generateNextTile() {
        const type = this.selectTileType();
        const z = this.currentZ++;
        this.worldManager.addTile(this.tileFactory.createTile(type, new THREE.Vector2(0, z)));
        this.recentTiles.push(type);
        if (this.recentTiles.length > 4) this.recentTiles.shift();
        if (type === 'road' || type === 'train_track') {
            const direction = Math.random() < 0.5 ? -1 : 1;
            const train = type === 'train_track';
            const speed = train ? 9 : 2 + Math.random() * 1.8 + Math.min(z * 0.012, 1.5);
            const spawner = { type: train ? 'train' : 'car', laneZ: z, direction, speed,
                interval: train ? 6500 : 1800 + Math.random() * 1100, elapsedTime: 0 };
            this.activeSpawners.push(spawner);
            if (!train) {
                const spacing = speed * spawner.interval / 1000;
                for (let x = -WORLD.trafficEdge; x <= WORLD.trafficEdge; x += spacing) this.spawnObstacle(spawner, x);
            }
        } else if (type === 'river') {
            const speed = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.5);
            const offset = Math.random() * 2;
            for (let i = 0; i < 6; i++) {
                const x = -WORLD.platformEdge + i * WORLD.platformEdge * 2 / 6 + offset;
                this.createPlatform(i % 3 === 0 ? 'lilypad' : 'log', new THREE.Vector3(x, 0.13, z), speed);
            }
        } else if (z > 2 && Math.random() < 0.3) {
            const freeColumns = [];
            for (let x = -5; x <= 5; x++) {
                if (!this.worldManager.isTreeBlocked(x, z)) freeColumns.push(x);
            }
            const x = freeColumns[Math.floor(Math.random() * freeColumns.length)];
            this.createHealthPack(new THREE.Vector3(x, 0.35, z));
        }
    }
    createEntity(type, position, size) {
        const entity = this.entityManager.createEntity();
        entity.addComponent('transform', new TransformComponent(position));
        const mesh = this.geometryFactory.createModel(type, this.materialLibrary);
        mesh.position.copy(position);
        entity.addComponent('render', new RenderComponent(mesh));
        if (size) {
            const half = size.clone().multiplyScalar(0.5);
            const physics = new PhysicsComponent(new THREE.Box3(half.clone().negate(), half));
            physics.syncBounds(position);
            entity.addComponent('physics', physics);
        }
        return entity;
    }
    createPlatform(type, position, speed) {
        const size = type === 'log' ? new THREE.Vector3(3.6, 0.44, 0.65) : new THREE.Vector3(1.3, 0.12, 1);
        const entity = this.createEntity(type, position, size);
        entity.getComponent('physics').velocity.x = speed;
        entity.addComponent('platform', new PlatformComponent(type, Math.abs(speed)));
        return entity;
    }
    spawnObstacle(spawner, x = -spawner.direction * WORLD.trafficEdge) {
        const train = spawner.type === 'train';
        const entity = this.createEntity(spawner.type, new THREE.Vector3(x, train ? 0.48 : 0.35, spawner.laneZ),
            new THREE.Vector3(train ? 6 : 1.65, train ? 1.1 : 0.8, 0.75));
        entity.getComponent('physics').velocity.x = spawner.direction * spawner.speed;
        entity.getComponent('transform').rotation.y = spawner.direction < 0 ? Math.PI : 0;
        entity.addComponent('obstacle', new ObstacleComponent(spawner.type, 0, spawner.laneZ));
        return entity;
    }
    createHealthPack(position) {
        const entity = this.createEntity('healthPack', position);
        entity.addComponent('collectible', new CollectibleComponent('health_pack', 30));
        return entity;
    }
    updateSpawners(deltaTime) {
        this.activeSpawners = this.activeSpawners.filter(s => s.laneZ >= this.furthestZ - WORLD.behind);
        for (const spawner of this.activeSpawners) {
            spawner.elapsedTime += deltaTime;
            if (spawner.elapsedTime >= spawner.interval) {
                this.spawnObstacle(spawner);
                spawner.elapsedTime %= spawner.interval;
            }
        }
    }
    cleanupEntities() {
        for (const entity of this.entityManager.entities.values()) {
            if (entity === this.player) continue;
            const p = entity.getComponent('transform')?.position;
            if (p && (p.z < this.furthestZ - WORLD.behind ||
                (entity.hasComponent('obstacle') && Math.abs(p.x) > WORLD.trafficEdge + 4))) {
                this.entityManager.removeEntity(entity);
            }
        }
    }
}
