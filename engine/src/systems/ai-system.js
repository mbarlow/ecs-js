/**
 * AI System - Handles AI behaviors and decision making
 */

import { ComponentTypes } from "../components/components.js";

export class AISystem {
  constructor() {
    this.entityManager = null;
    this.movementSystem = null;
  }

  setMovementSystem(movementSystem) {
    this.movementSystem = movementSystem;
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ComponentTypes.TRANSFORM,
      ComponentTypes.AI,
      ComponentTypes.MOVEMENT,
    );

    entities.forEach((entityId) => {
      this.updateEntityAI(entityId, deltaTime);
    });
  }

  updateEntityAI(entityId, deltaTime) {
    const ai = this.entityManager.getComponent(entityId, ComponentTypes.AI);
    const transform = this.entityManager.getComponent(
      entityId,
      ComponentTypes.TRANSFORM,
    );

    if (!ai || !transform) return;

    switch (ai.behavior) {
      case "wander":
        this.handleWanderBehavior(entityId, ai, transform, deltaTime);
        break;
      case "seek":
        this.handleSeekBehavior(entityId, ai, transform, deltaTime);
        break;
      case "idle":
        this.handleIdleBehavior(entityId, ai, transform, deltaTime);
        break;
    }
  }

  handleWanderBehavior(entityId, ai, transform, deltaTime) {
    const currentTime = Date.now();

    // Check if it's time to change direction
    if (currentTime - ai.lastDirectionChange > ai.directionChangeInterval) {
      this.chooseNewWanderTarget(ai, transform);
      ai.lastDirectionChange = currentTime;
      ai.state = "moving";
    }

    // Move towards target if we have one
    if (ai.targetPosition && ai.state === "moving") {
      const atDestination = this.movementSystem.moveTowards(
        entityId,
        ai.targetPosition,
        deltaTime,
      );

      if (atDestination) {
        ai.state = "idle";
        ai.targetPosition = null;
        // Add some idle time before next wander
        ai.directionChangeInterval = 1000 + Math.random() * 3000;
        ai.lastDirectionChange = Date.now();
      }
    }
  }

  handleSeekBehavior(entityId, ai, transform, deltaTime) {
    if (ai.targetPosition) {
      const atDestination = this.movementSystem.moveTowards(
        entityId,
        ai.targetPosition,
        deltaTime,
      );

      if (atDestination) {
        ai.behavior = "wander"; // Switch to wander when target reached
        ai.targetPosition = null;
      }
    } else {
      // No target, switch to wander
      ai.behavior = "wander";
    }
  }

  handleIdleBehavior(entityId, ai, transform, deltaTime) {
    // Just wait for the timer
    const currentTime = Date.now();
    if (currentTime - ai.lastDirectionChange > ai.directionChangeInterval) {
      ai.behavior = "wander";
    }
  }

  chooseNewWanderTarget(ai, transform) {
    // Generate random target within wander radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * ai.wanderRadius;

    ai.targetPosition = {
      x: transform.position.x + Math.cos(angle) * distance,
      y: transform.position.y,
      z: transform.position.z + Math.sin(angle) * distance,
    };

    // Clamp to reasonable bounds
    const maxBounds = 25;
    ai.targetPosition.x = Math.max(
      -maxBounds,
      Math.min(maxBounds, ai.targetPosition.x),
    );
    ai.targetPosition.z = Math.max(
      -maxBounds,
      Math.min(maxBounds, ai.targetPosition.z),
    );
  }

  setTarget(entityId, targetPosition) {
    const ai = this.entityManager.getComponent(entityId, ComponentTypes.AI);
    if (ai) {
      ai.targetPosition = targetPosition;
      ai.behavior = "seek";
      ai.state = "moving";
    }
  }

  setBehavior(entityId, behavior) {
    const ai = this.entityManager.getComponent(entityId, ComponentTypes.AI);
    if (ai) {
      ai.behavior = behavior;
      ai.state = "idle";
      ai.lastDirectionChange = Date.now();
    }
  }

  // Get all entities within a certain range of a position
  getEntitiesInRange(position, range) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ComponentTypes.TRANSFORM,
    );
    const entitiesInRange = [];

    entities.forEach((entityId) => {
      const transform = this.entityManager.getComponent(
        entityId,
        ComponentTypes.TRANSFORM,
      );
      if (transform) {
        const dx = transform.position.x - position.x;
        const dz = transform.position.z - position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= range) {
          entitiesInRange.push({
            entityId,
            distance,
            position: transform.position,
          });
        }
      }
    });

    return entitiesInRange.sort((a, b) => a.distance - b.distance);
  }
}
