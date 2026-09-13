import * as THREE from 'three';
import { WORLD } from './game/config.js';
import { EntityManager } from './ecs/EntityManager.js';
import { GameLoop } from './game/GameLoop.js';
import { GameStateManager } from './game/GameStateManager.js';
import { SceneSetup } from './rendering/SceneSetup.js';
import { CameraController } from './rendering/CameraController.js';
import { GeometryFactory } from './rendering/GeometryFactory.js';
import { MaterialLibrary } from './rendering/MaterialLibrary.js';
import { TileFactory } from './world/TileFactory.js';
import { WorldManager } from './world/WorldManager.js';
import { InputSystem } from './systems/InputSystem.js';
import { PhysicsSystem } from './systems/PhysicsSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { HealthSystem } from './systems/HealthSystem.js';
import { ProceduralGenerator } from './systems/ProceduralGenerator.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { SoundSystem } from './systems/SoundSystem.js';
import { ImpactEffects } from './rendering/ImpactEffects.js';
import { WaterEffects } from './rendering/WaterEffects.js';
import { HealthUI } from './ui/HealthUI.js';
import { GameUI } from './ui/GameUI.js';
import { TransformComponent } from './ecs/components/TransformComponent.js';
import { RenderComponent } from './ecs/components/RenderComponent.js';
import { PhysicsComponent } from './ecs/components/PhysicsComponent.js';
import { HealthComponent } from './ecs/components/HealthComponent.js';

function init() {
    const entities = new EntityManager();
    const state = new GameStateManager();
    const { scene, renderer } = new SceneSetup().initialize(document.getElementById('game-canvas'));
    const camera = new CameraController();
    camera.initialize();
    const geometry = new GeometryFactory();
    const materials = new MaterialLibrary();
    const world = new WorldManager(scene);
    const generator = new ProceduralGenerator(world, new TileFactory(geometry, materials), entities, geometry, materials);
    const input = new InputSystem(entities, state, world);
    const physics = new PhysicsSystem(entities);
    const health = new HealthSystem(entities, state);
    const collision = new CollisionSystem(entities, state, health, world);
    const render = new RenderSystem(entities, scene, renderer, camera);
    const effects = new ImpactEffects(scene);
    render.effects = effects;
    const waterEffects = new WaterEffects(scene);
    render.waterEffects = waterEffects;
    render.gameState = state;
    state.on('onWaterFall', splash => waterEffects.trigger(splash.position));
    state.on('onImpact', impact => effects.trigger(impact.position, impact.velocity));
    const player = entities.createEntity();
    const transform = new TransformComponent(new THREE.Vector3(0, WORLD.playerY, 0));
    player.addComponent('transform', transform);
    const model = geometry.createModel('player', materials);
    model.position.copy(transform.position);
    player.addComponent('render', new RenderComponent(model));
    const body = new PhysicsComponent(new THREE.Box3(new THREE.Vector3(-0.22, -0.35, -0.22), new THREE.Vector3(0.22, 0.4, 0.22)));
    body.isKinematic = true;
    body.syncBounds(transform.position);
    player.addComponent('physics', body);
    player.addComponent('health', new HealthComponent(100));
    for (const system of [input, health, generator, render]) system.setPlayer(player);
    generator.initialize();
    input.initialize();
    new GameUI(state);
    new SoundSystem(state);
    const healthUI = new HealthUI(state);
    healthUI.setPlayer(player);
    healthUI.initialize();
    const loop = new GameLoop();
    state.on('onRestart', () => {
        effects.reset();
        waterEffects.reset();
        world.clear();
        for (const entity of entities.entities.values()) if (entity !== player) entities.removeEntity(entity);
        transform.position.set(0, WORLD.playerY, 0);
        transform.gridPosition.set(0, 0);
        transform.rotation.set(0, 0, 0);
        input.reset();
        body.syncBounds(transform.position);
        Object.assign(player.getComponent('health'), { current: 100, isSubmerged: false, waterFalls: 0, drainRate: 5 });
        model.position.copy(transform.position);
        camera.reset(transform.position);
        loop.accumulatedTime = 0;
        generator.initialize();
    });
    // Generate the destination row before collision queries it.
    loop.setSystems([input, generator, physics, collision, health]);
    loop.setGameState(state);
    loop.setRenderCallback(() => { render.update(); healthUI.render(); });
    window.addEventListener('resize', () => { render.onResize(); healthUI.resize(); });
    for (const button of document.querySelectorAll('[data-move]')) {
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            if (state.state === 'playing') input.queueMovement(button.dataset.move);
        });
    }
    loop.start();
    document.getElementById('loading').hidden = true;
}

try { init(); }
catch (error) {
    console.error(error);
    document.getElementById('loading').textContent = `Unable to start: ${error.message}. Check WebGL support and reload.`;
}
