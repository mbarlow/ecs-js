/**
 * Movement System - Handles entity movement and physics
 */

import { ComponentTypes } from "../components/components.js";

export class MovementSystem {
  constructor() {
    this.entityManager = null;
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ComponentTypes.TRANSFORM,
      ComponentTypes.MOVEMENT,
    );

    entities.forEach((entityId) => {
      this.updateEntityMovement(entityId, deltaTime);
    });
  }

  updateEntityMovement(entityId, deltaTime) {
    const transform = this.entityManager.getComponent(
      entityId,
      ComponentTypes.TRANSFORM,
    );
    const movement = this.entityManager.getComponent(
      entityId,
      ComponentTypes.MOVEMENT,
    );

    if (!transform || !movement) return;

    // Apply velocity to position
    const deltaSeconds = deltaTime / 1000;

    transform.position.x += movement.velocity.x * deltaSeconds;
    transform.position.z += movement.velocity.z * deltaSeconds;

    // Handle hovering behavior
    this.applyHoverBehavior(transform, movement, deltaSeconds);

    // Apply damping to velocity
    const damping = 0.95;
    movement.velocity.x *= damping;
    movement.velocity.z *= damping;

    // Add gentle bobbing motion for organic feel
    const time = Date.now() / 1000;
    const bobFrequency = 2.0;
    const bobAmplitude = 0.1;
    const bobOffset = Math.sin(time * bobFrequency + entityId) * bobAmplitude;

    transform.position.y = movement.groundY + movement.hoverHeight + bobOffset;

    // Add subtle rotation while moving
    const speed = Math.sqrt(
      movement.velocity.x * movement.velocity.x +
        movement.velocity.z * movement.velocity.z,
    );

    if (speed > 0.1) {
      const targetRotationY = Math.atan2(
        movement.velocity.x,
        movement.velocity.z,
      );
      transform.rotation.y = this.lerpAngle(
        transform.rotation.y,
        targetRotationY,
        deltaSeconds * 3,
      );
    }
  }

  applyHoverBehavior(transform, movement, deltaSeconds) {
    const targetY = movement.groundY + movement.hoverHeight;
    const difference = targetY - transform.position.y;

    // Simple spring-like behavior for smooth hovering
    const springStrength = 5.0;
    movement.velocity.y = difference * springStrength;
  }

  lerpAngle(current, target, factor) {
    let diff = target - current;

    // Handle angle wrapping
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    return current + diff * factor;
  }

  applyForce(entityId, force) {
    const movement = this.entityManager.getComponent(
      entityId,
      ComponentTypes.MOVEMENT,
    );
    if (movement) {
      movement.velocity.x += force.x;
      movement.velocity.y += force.y;
      movement.velocity.z += force.z;
    }
  }

  setVelocity(entityId, velocity) {
    const movement = this.entityManager.getComponent(
      entityId,
      ComponentTypes.MOVEMENT,
    );
    if (movement) {
      movement.velocity.x = velocity.x || 0;
      movement.velocity.y = velocity.y || 0;
      movement.velocity.z = velocity.z || 0;
    }
  }

  moveTowards(entityId, targetPosition, deltaTime) {
    const transform = this.entityManager.getComponent(
      entityId,
      ComponentTypes.TRANSFORM,
    );
    const movement = this.entityManager.getComponent(
      entityId,
      ComponentTypes.MOVEMENT,
    );

    if (!transform || !movement) return;

    const dx = targetPosition.x - transform.position.x;
    const dz = targetPosition.z - transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0.1) {
      const directionX = dx / distance;
      const directionZ = dz / distance;

      const force = {
        x: directionX * movement.speed,
        y: 0,
        z: directionZ * movement.speed,
      };

      this.applyForce(entityId, force);
      return false; // Not at destination
    }

    return true; // At destination
  }
}
