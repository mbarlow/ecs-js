/**
 * Game Engine - Main game loop and system coordination
 */

import { EntityManager } from "./entity-manager.js";
import { EntityLoader } from "./entity-loader.js";
import { RenderSystem } from "../systems/render-system.js";
import { MovementSystem } from "../systems/movement-system.js";
import { AISystem } from "../systems/ai-system.js";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.isRunning = false;
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;

    this.setupSystems();
    this.setupUI();
  }

  setupSystems() {
    // Core ECS
    this.entityManager = new EntityManager();
    this.entityLoader = new EntityLoader(this.entityManager);

    // Game systems
    this.renderSystem = new RenderSystem(this.canvas);
    this.movementSystem = new MovementSystem();
    this.aiSystem = new AISystem();

    // Wire up system dependencies
    this.aiSystem.setMovementSystem(this.movementSystem);

    // Register systems with entity manager
    this.entityManager.addSystem(this.renderSystem);
    this.entityManager.addSystem(this.movementSystem);
    this.entityManager.addSystem(this.aiSystem);
  }

  setupUI() {
    this.fpsCounter = document.getElementById("fps-counter");
    this.entityCounter = document.getElementById("entity-count");
  }

  async loadWorld(worldPath = "data/world.json") {
    try {
      console.log("Loading world...");
      const worldData = await this.entityLoader.loadWorld(worldPath);
      console.log(`Loaded world with ${worldData.entities.length} entities`);
      return worldData;
    } catch (error) {
      console.error("Failed to load world:", error);
      throw error;
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    console.log("Game engine started");
  }

  stop() {
    this.isRunning = false;
    console.log("Game engine stopped");
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update systems
    this.entityManager.update(deltaTime);

    // Update FPS counter
    this.updateFPS(deltaTime);

    // Schedule next frame
    requestAnimationFrame(() => this.gameLoop());
  }

  updateFPS(deltaTime) {
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;

    if (this.fpsUpdateTime >= 1000) {
      // Update every second
      this.fps = Math.round((this.frameCount * 1000) / this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = 0;

      // Update UI
      if (this.fpsCounter) {
        this.fpsCounter.textContent = `FPS: ${this.fps}`;
      }
      if (this.entityCounter) {
        this.entityCounter.textContent = `Entities: ${this.entityManager.getEntityCount()}`;
      }
    }
  }

  // Utility methods for external control
  spawnEntity(definitionPath, overrides = {}) {
    return this.entityLoader.spawnEntity(definitionPath, overrides);
  }

  destroyEntity(entityId) {
    this.entityManager.destroyEntity(entityId);
  }

  getEntityManager() {
    return this.entityManager;
  }

  getRenderSystem() {
    return this.renderSystem;
  }

  getMovementSystem() {
    return this.movementSystem;
  }

  getAISystem() {
    return this.aiSystem;
  }
}
