/**
 * Entity Component System - Entity Manager
 * Handles entity creation, destruction, and component management
 */

export class EntityManager {
  constructor() {
    this.entities = new Map();
    this.nextEntityId = 1;
    this.componentTypes = new Set();
    this.systems = [];
  }

  createEntity(id = null) {
    const entityId = id || this.nextEntityId++;
    this.entities.set(entityId, new Map());
    return entityId;
  }

  destroyEntity(entityId) {
    this.entities.delete(entityId);

    // Notify systems of entity destruction
    this.systems.forEach((system) => {
      if (system.onEntityDestroyed) {
        system.onEntityDestroyed(entityId);
      }
    });
  }

  addComponent(entityId, componentType, componentData) {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    this.componentTypes.add(componentType);
    this.entities.get(entityId).set(componentType, componentData);

    // Notify systems of component addition
    this.systems.forEach((system) => {
      if (system.onComponentAdded) {
        system.onComponentAdded(entityId, componentType, componentData);
      }
    });
  }

  removeComponent(entityId, componentType) {
    if (!this.entities.has(entityId)) {
      return;
    }

    const entity = this.entities.get(entityId);
    entity.delete(componentType);

    // Notify systems of component removal
    this.systems.forEach((system) => {
      if (system.onComponentRemoved) {
        system.onComponentRemoved(entityId, componentType);
      }
    });
  }

  getComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.get(componentType) : null;
  }

  hasComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.has(componentType) : false;
  }

  getEntitiesWithComponents(...componentTypes) {
    const result = [];

    for (const [entityId, components] of this.entities) {
      const hasAllComponents = componentTypes.every((type) =>
        components.has(type),
      );

      if (hasAllComponents) {
        result.push(entityId);
      }
    }

    return result;
  }

  getAllEntities() {
    return Array.from(this.entities.keys());
  }

  getEntityCount() {
    return this.entities.size;
  }

  addSystem(system) {
    this.systems.push(system);
    system.entityManager = this;
  }

  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index > -1) {
      this.systems.splice(index, 1);
    }
  }

  update(deltaTime) {
    this.systems.forEach((system) => {
      if (system.update) {
        system.update(deltaTime);
      }
    });
  }
}
