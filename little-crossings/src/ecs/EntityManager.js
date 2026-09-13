import { Entity } from './Entity.js';

/**
 * EntityManager - Central registry for all entities
 */
export class EntityManager {
    constructor() {
        this.entities = new Map();
    }

    createEntity(id) {
        const entity = new Entity(id);
        this.entities.set(entity.id, entity);
        return entity;
    }

    removeEntity(entity) {
        const mesh = entity.getComponent('render')?.mesh;
        if (mesh?.parent) mesh.parent.remove(mesh);
        // Geometry and materials belong to shared factories; keep them reusable.
        this.entities.delete(entity.id);
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    getAllEntities() {
        return Array.from(this.entities.values());
    }

    getEntitiesWithComponent(componentName) {
        return this.getAllEntities().filter(entity => entity.hasComponent(componentName));
    }

    clear() {
        for (const entity of this.entities.values()) this.removeEntity(entity);
    }
}
