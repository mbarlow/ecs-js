/**
 * Entity Loader - Loads entities from JSON definitions
 */

import { createComponentFromData } from "../components/components.js";

export class EntityLoader {
  constructor(entityManager) {
    this.entityManager = entityManager;
  }

  async loadEntityDefinition(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(
          `Failed to load entity definition: ${response.statusText}`,
        );
      }

      const entityData = await response.json();
      return entityData;
    } catch (error) {
      console.error(`Error loading entity definition from ${filePath}:`, error);
      throw error;
    }
  }

  createEntityFromDefinition(entityDefinition, overrides = {}) {
    const entityId = this.entityManager.createEntity();

    // Apply base components from definition
    if (entityDefinition.components) {
      for (const [componentType, componentData] of Object.entries(
        entityDefinition.components,
      )) {
        // Apply any overrides
        const finalData = { ...componentData, ...overrides[componentType] };
        const component = createComponentFromData(componentType, finalData);
        this.entityManager.addComponent(entityId, componentType, component);
      }
    }

    return entityId;
  }

  async spawnEntity(definitionPath, overrides = {}) {
    const definition = await this.loadEntityDefinition(definitionPath);
    return this.createEntityFromDefinition(definition, overrides);
  }

  async spawnMultipleEntities(
    definitionPath,
    count,
    spawnArea = { x: 0, z: 0, radius: 10 },
  ) {
    const definition = await this.loadEntityDefinition(definitionPath);
    const entities = [];

    for (let i = 0; i < count; i++) {
      // Generate random position within spawn area
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnArea.radius;
      const x = spawnArea.x + Math.cos(angle) * distance;
      const z = spawnArea.z + Math.sin(angle) * distance;

      const overrides = {
        transform: {
          position: { x, y: 0, z },
        },
      };

      const entityId = this.createEntityFromDefinition(definition, overrides);
      entities.push(entityId);
    }

    return entities;
  }

  // Load a world configuration with multiple entity types
  async loadWorld(worldPath) {
    try {
      const response = await fetch(worldPath);
      const worldData = await response.json();

      const spawnedEntities = [];

      if (worldData.entities) {
        for (const entityGroup of worldData.entities) {
          const entities = await this.spawnMultipleEntities(
            entityGroup.definition,
            entityGroup.count || 1,
            entityGroup.spawnArea || { x: 0, z: 0, radius: 10 },
          );
          spawnedEntities.push(...entities);
        }
      }

      return {
        entities: spawnedEntities,
        config: worldData.config || {},
      };
    } catch (error) {
      console.error(`Error loading world from ${worldPath}:`, error);
      throw error;
    }
  }

  // Create entity with random variations
  createVariedEntity(baseDefinition, variations = {}) {
    const entityId = this.entityManager.createEntity();

    if (baseDefinition.components) {
      for (const [componentType, componentData] of Object.entries(
        baseDefinition.components,
      )) {
        let finalData = { ...componentData };

        // Apply variations if specified for this component
        if (variations[componentType]) {
          const variation = variations[componentType];
          finalData = this.applyVariations(finalData, variation);
        }

        const component = createComponentFromData(componentType, finalData);
        this.entityManager.addComponent(entityId, componentType, component);
      }
    }

    return entityId;
  }

  applyVariations(data, variations) {
    const result = { ...data };

    for (const [key, variation] of Object.entries(variations)) {
      if (variation.type === "random") {
        if (variation.range) {
          result[key] =
            variation.range.min +
            Math.random() * (variation.range.max - variation.range.min);
        } else if (variation.options) {
          result[key] =
            variation.options[
              Math.floor(Math.random() * variation.options.length)
            ];
        }
      }
    }

    return result;
  }
}
