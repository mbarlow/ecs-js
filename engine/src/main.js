/**
 * Main Entry Point
 * Initializes the game engine and starts the application
 */

import { GameEngine } from "./core/game-engine.js";

class Application {
  constructor() {
    this.gameEngine = null;
    this.init();
  }

  async init() {
    try {
      console.log("Initializing ECS Game Engine...");

      // Get canvas element
      const canvas = document.getElementById("game-canvas");
      if (!canvas) {
        throw new Error("Game canvas not found");
      }

      // Create game engine
      this.gameEngine = new GameEngine(canvas);

      // Load the world
      await this.gameEngine.loadWorld();

      // Start the game loop
      this.gameEngine.start();

      // Setup event listeners
      this.setupEventListeners();

      console.log("Game engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game engine:", error);
      this.showError(error.message);
    }
  }

  setupEventListeners() {
    // Handle window visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Optionally pause the game when tab is not visible
        // this.gameEngine.stop();
      } else {
        // Resume if paused
        // if (!this.gameEngine.isRunning) {
        //     this.gameEngine.start();
        // }
      }
    });

    // Keyboard controls for testing
    document.addEventListener("keydown", (event) => {
      this.handleKeyDown(event);
    });

    // Mouse controls for interaction
    document.addEventListener("click", (event) => {
      this.handleClick(event);
    });
  }

  handleKeyDown(event) {
    switch (event.code) {
      case "Space":
        event.preventDefault();
        this.spawnRandomMob();
        break;

      case "KeyR":
        event.preventDefault();
        this.restartGame();
        break;

      case "KeyP":
        event.preventDefault();
        this.togglePause();
        break;

      case "KeyH":
        event.preventDefault();
        this.showHelp();
        break;
    }
  }

  handleClick(event) {
    // Get click position and convert to world coordinates
    // This could be used for entity interaction or spawning
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

    // For now, just log the click
    console.log(
      `Click at screen coordinates: ${x.toFixed(2)}, ${y.toFixed(2)}`,
    );
  }

  async spawnRandomMob() {
    try {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;

      const overrides = {
        transform: {
          position: { x, y: 1, z },
        },
        mesh: {
          material: {
            color: Math.random() * 0xffffff,
          },
        },
      };

      await this.gameEngine.spawnEntity("data/entities/mob.json", overrides);
      console.log("Spawned new mob");
    } catch (error) {
      console.error("Failed to spawn mob:", error);
    }
  }

  async restartGame() {
    try {
      console.log("Restarting game...");

      // Stop current game
      this.gameEngine.stop();

      // Clear all entities
      const entities = this.gameEngine.getEntityManager().getAllEntities();
      entities.forEach((entityId) => {
        this.gameEngine.destroyEntity(entityId);
      });

      // Reload world
      await this.gameEngine.loadWorld();

      // Restart
      this.gameEngine.start();

      console.log("Game restarted");
    } catch (error) {
      console.error("Failed to restart game:", error);
    }
  }

  togglePause() {
    if (this.gameEngine.isRunning) {
      this.gameEngine.stop();
      console.log("Game paused");
    } else {
      this.gameEngine.start();
      console.log("Game resumed");
    }
  }

  showHelp() {
    const helpText = `
ECS Game Engine Controls:
- SPACE: Spawn random mob
- R: Restart game
- P: Pause/Resume
- H: Show this help
- Click: Log click coordinates
        `;
    console.log(helpText);
    alert(helpText);
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
        `;
    errorDiv.textContent = `Error: ${message}`;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  }
}

// Initialize application when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new Application());
} else {
  new Application();
}
