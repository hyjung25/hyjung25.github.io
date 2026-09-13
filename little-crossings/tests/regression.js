import * as THREE from '../vendor/three/three.module.js';
import { WaterEffects } from '../src/rendering/WaterEffects.js';
import { ImpactEffects } from '../src/rendering/ImpactEffects.js';
import { CameraController } from '../src/rendering/CameraController.js';
import { WORLD } from '../src/game/config.js';
import { EntityManager } from '../src/ecs/EntityManager.js';
import { GameStateManager } from '../src/game/GameStateManager.js';
import { GameLoop } from '../src/game/GameLoop.js';
import { GeometryFactory } from '../src/rendering/GeometryFactory.js';
import { MaterialLibrary } from '../src/rendering/MaterialLibrary.js';
import { TileFactory } from '../src/world/TileFactory.js';
import { WorldManager } from '../src/world/WorldManager.js';
import { ProceduralGenerator } from '../src/systems/ProceduralGenerator.js';
import { PhysicsSystem } from '../src/systems/PhysicsSystem.js';
import { CollisionSystem } from '../src/systems/CollisionSystem.js';
import { HealthSystem } from '../src/systems/HealthSystem.js';
import { InputSystem } from '../src/systems/InputSystem.js';
import { HealthComponent } from '../src/ecs/components/HealthComponent.js';

export function runTests() {
    const results = [];
    const check = (value, message) => { if (!value) throw new Error(message); results.push(message); };
    const scene = new THREE.Scene();
    const em = new EntityManager();
    const geometry = new GeometryFactory();
    const materials = new MaterialLibrary();
    const world = new WorldManager(scene);
    const factory = new TileFactory(geometry, materials);
    const gen = new ProceduralGenerator(world, factory, em, geometry, materials);
    const state = new GameStateManager();
    const physics = new PhysicsSystem(em);
    const health = new HealthSystem(em, state);
    const collision = new CollisionSystem(em, state, health, world);
    const player = gen.createEntity('player', new THREE.Vector3(0, WORLD.playerY, 0), new THREE.Vector3(0.44, 0.75, 0.44));
    player.addComponent('health', new HealthComponent());
    player.getComponent('physics').isKinematic = true;
    gen.setPlayer(player); health.setPlayer(player);
    const p = player.getComponent('transform');
    gen.initialize();
    for (const x of [-7, 0, 7]) check(world.getTileAt(new THREE.Vector2(x, 0)).type === 'grass', `Safe starting row exists at column ${x}`);
    const bounds = new THREE.Box3().setFromObject(world.getTileAt(new THREE.Vector2(0, 3)).mesh);
    check(bounds.max.x - bounds.min.x === WORLD.width, 'Road geometry spans the complete world width');
    const logBounds = new THREE.Box3().setFromObject(geometry.createModel('log', materials));
    check(logBounds.max.x - logBounds.min.x > 3.5 && logBounds.max.y - logBounds.min.y < 0.5, 'Log geometry lies horizontally');
    check(!em.getEntitiesWithComponent('obstacle').some(e => e.getComponent('transform').position.z <= 2), 'Starting area has no traffic');
    for (let i = 0; i < 1000; i++) {
        const type = gen.selectTileType(); gen.currentZ++;
        gen.recentTiles.push(type);
        check(gen.recentTiles.includes('grass'), `Safe grass in generation window ${i}`);
        if (gen.recentTiles.length > 4) gen.recentTiles.shift();
    }
    // Isolate collision tests from randomly generated traffic.
    for (const e of em.getAllEntities()) if (e !== player) em.removeEntity(e);
    world.clear(); world.addTile(factory.createTile('road', new THREE.Vector2(0, 0)));
    let impacts = 0;
    state.on('onImpact', () => impacts++);
    state.startGame();
    const car = gen.spawnObstacle({ type: 'car', laneZ: 0, direction: 1, speed: 2 }, -2);
    physics.update(500);
    check(Math.abs(car.getComponent('physics').boundingBox.max.x + 0.175) < 0.001, 'Vehicle bounds follow movement');
    collision.update(16.67);
    check(state.state === 'gameover', 'Moving vehicle hits player at current world position');
    check(impacts === 1, 'Vehicle collision emits one impact event');
    em.removeEntity(car); state.restartGame();
    world.clear(); world.addTile(factory.createTile('river', new THREE.Vector2(0, 0)));
    const log = gen.createPlatform('log', new THREE.Vector3(0, 0.13, 0), 1);
    physics.update(100); collision.update(100);
    check(Math.abs(p.position.x - 0.1) < 0.001 && !player.getComponent('health').isSubmerged, 'River platform carries player using elapsed time');
    log.getComponent('transform').position.x = WORLD.platformEdge + 0.1;
    physics.update(0);
    check(log.getComponent('transform').position.x < 0, 'Platforms wrap around to maintain river coverage');
    em.removeEntity(log);
    let splashes = 0;
    state.on('onWaterFall', () => splashes++);
    const before = player.getComponent('health').current;
    collision.update(16.67); collision.update(16.67);
    check(player.getComponent('health').current === before && player.getComponent('health').drainRate === 10, 'Water entry doubles drain once without old instant damage');
    check(splashes === 1, 'Water splash fires once per water entry');
    const water = new WaterEffects(scene);
    const swimmer = geometry.createModel('player', materials);
    water.trigger(p.position);
    const dropStart = water.drops[0].mesh.position.clone();
    swimmer.position.set(0, WORLD.playerY, 0); water.update(100, swimmer, true);
    check(swimmer.position.y < WORLD.playerY && swimmer.position.y > WORLD.playerY - 0.48, 'Water entry gradually sinks character');
    check(water.drops[0].mesh.position.distanceTo(dropStart) > 0 && water.rings[0].material.opacity > 0, 'Splash droplets and ripples animate');
    const elapsed = water.elapsed, depth = water.depth;
    water.update(0, null, true);
    check(water.elapsed === elapsed && water.depth === depth, 'Pause freezes splash and sinking');
    for (let i=0;i<10;i++) water.update(100, null, true);
    check(water.group.parent === null, 'Finished splash removes scene objects');
    for (let i=0;i<10;i++) water.update(100, null, false);
    check(water.depth === 0, 'Reaching support restores normal character height');
    water.trigger(p.position); water.update(100, null, true); water.reset();
    check(water.depth === 0 && water.group.parent === null, 'Restart clears water motion and particles');
    const input = new InputSystem(em, state); input.setPlayer(player);
    p.position.set(0, WORLD.playerY, 0);p.gridPosition.set(0, 0);
    input.keyStates.set('w', true);
    for (let i=0;i<60;i++) input.update(1000/60);
    check(p.position.z >= 6 && p.position.z <= 8, 'Holding a movement key repeats predictably');
    const cameraController = new CameraController();
    const camera = cameraController.initialize();
    camera.updateMatrixWorld(true);
    for (const [key, sign] of [['arrowright', 1], ['d', 1], ['arrowleft', -1], ['a', -1]]) {
        input.reset(); p.position.set(0, WORLD.playerY, 0); p.gridPosition.set(0, 0);
        const startX = p.position.clone().project(camera).x;
        input.queueMovement(key); input.update(16.67);
        check((p.position.clone().project(camera).x - startX) * sign > 0, key + ' moves toward the correct screen direction');
    }
    const effects = new ImpactEffects(scene);
    const playerMesh = player.getComponent('render').mesh;
    effects.trigger(p.position, new THREE.Vector3(3, 0, 0));
    check(effects.group.parent === scene && effects.particles.length === 18, 'Impact burst appears with bounded particle count');
    const particleStart = effects.particles[0].mesh.position.clone();
    effects.update(100, camera, playerMesh);
    check(effects.particles[0].mesh.position.distanceTo(particleStart) > 0 && effects.materials[0].opacity < 1, 'Impact particles move and fade while game simulation is stopped');
    check(playerMesh.scale.y < 1, 'Impact squashes the character');
    for (let i = 0; i < 8; i++) effects.update(100, camera, playerMesh);
    check(effects.group.parent === null, 'Finished burst is removed from the scene');
    effects.trigger(p.position, new THREE.Vector3(-3, 0, 0)); effects.reset();
    check(!effects.hit && effects.group.parent === null, 'Restart cancels active impact');
    input.reset(); const after = p.position.z; input.update(500);
    check(p.position.z === after, 'Reset clears held and buffered movement');
    p.position.x = WORLD.playerLimit; input.executeMove([1, 0]);
    check(p.position.x === WORLD.playerLimit, 'Player cannot step beyond playable width');
    state.endGame();state.pauseGame();check(state.state === 'gameover', 'Pause cannot revive a finished game');
    let gameOvers=0;state.on('onGameOver',()=>gameOvers++);state.startGame();state.endGame();state.endGame();
    check(gameOvers === 1, 'Game over event fires once');
    state.restartGame(); check(state.score === 0 && state.maxForwardPosition === 0, 'Restart resets score');
    // Simulate a stationary player for ten minutes without health/collision.
    em.clear();world.clear();p.position.set(0,WORLD.playerY,0);p.gridPosition.set(0,0);em.entities.set(player.id,player);
    gen.initialize();let peak=0;
    for(let frame=0;frame<36000;frame++) { gen.update(1000/60);physics.update(1000/60);peak=Math.max(peak,em.entities.size); }
    check(peak < 300, `Ten-minute traffic simulation stays bounded: peak ${peak} entities`);
    for(let z=0;z<300;z++) { p.gridPosition.y=z;p.position.z=z;gen.update(16.67); }
    check(world.activeTiles.size <= WORLD.ahead+WORLD.behind+1, 'Terrain count remains bounded during forward travel');
    for (const e of em.entities.values()) { const mesh=e.getComponent('render')?.mesh;if(mesh)scene.add(mesh); }
    for(let n=0;n<5;n++) {
        world.clear();for(const e of em.getAllEntities())if(e!==player)em.removeEntity(e);
        p.position.set(0,WORLD.playerY,0);p.gridPosition.set(0,0);gen.initialize();
        for(const e of em.entities.values()) {const mesh=e.getComponent('render')?.mesh;if(mesh)scene.add(mesh);}
        check(scene.children.length === world.activeTiles.size+em.entities.size, 'Restart removes all old scene objects '+n);
    }
    const loop=new GameLoop();let updates=0;loop.running=true;loop.lastFrameTime=0;
    loop.setSystems([{update(){updates++;loop.running=false;}}]);loop.loop(60000);
    check(updates <= 6, 'Tab stall has bounded catch-up work');
    const treeWorld = new WorldManager(new THREE.Scene());
    const treeFactory = new TileFactory(geometry, materials);
    let previousPath = 0;
    for (let z = 0; z < 100; z++) {
        const row = treeFactory.createTile('grass', new THREE.Vector2(0, z));
        treeWorld.addTile(row);
        const path = row.metadata.pathColumn;
        check(Math.abs(path - previousPath) <= 1, 'Grass route stays connected at row ' + z);
        for (let x = path - 1; x <= path + 1; x++) check(!treeWorld.isTreeBlocked(x, z), 'Reserved route is clear ' + x + ',' + z);
        if (z > 0) check(row.metadata.blockedColumns.length >= 2 && row.metadata.blockedColumns.length <= 4, 'Playable grass has 2–4 trees at row ' + z);
        previousPath = path;
    }
    const blocker = treeWorld.activeTiles.get(1).metadata.blockedColumns[0];
    const treeInput = new InputSystem(em, state, treeWorld);
    treeInput.setPlayer(player);state.restartGame();p.position.set(blocker, WORLD.playerY, 0);p.gridPosition.set(blocker, 0);
    treeInput.executeMove([0, 1]);
    check(p.position.z === 0 && state.score === 0, 'Tree blocks forward movement and scoring');
    p.position.set(0, WORLD.playerY, 0);p.gridPosition.set(0, 0);treeInput.executeMove([0, 1]);
    check(p.position.z === 1 && state.score === 1, 'Open route remains walkable');
    check(treeWorld.isTreeBlocked(blocker + 0.45, 1), 'Fractional position from a log cannot slip through a tree');
    for (const e of em.getEntitiesWithComponent('collectible')) {
        const position = e.getComponent('transform').position;
        check(!world.isTreeBlocked(position.x, position.z), 'Health pack is reachable outside tree cells');
    }
    return results;
}
