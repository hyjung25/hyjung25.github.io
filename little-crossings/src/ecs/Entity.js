/**
 * Entity class - Core ECS entity with component management
 */
export class Entity {
    constructor(id) {
        this.id = id || crypto.randomUUID();
        this.components = new Map();
    }

    addComponent(name, component) {
        this.components.set(name, component);
        return this;
    }

    getComponent(name) {
        return this.components.get(name) || null;
    }

    removeComponent(name) {
        this.components.delete(name);
        return this;
    }

    hasComponent(name) {
        return this.components.has(name);
    }
}
