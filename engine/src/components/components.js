/**
 * Component definitions
 * Components are pure data containers
 */

export const ComponentTypes = {
  TRANSFORM: "transform",
  MESH: "mesh",
  MOVEMENT: "movement",
  AI: "ai",
  HEALTH: "health",
};

export function createTransformComponent(
  x = 0,
  y = 0,
  z = 0,
  rotation = { x: 0, y: 0, z: 0 },
) {
  return {
    position: { x, y, z },
    rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
    scale: { x: 1, y: 1, z: 1 },
  };
}

export function createMeshComponent(
  geometry,
  material,
  castShadow = true,
  receiveShadow = true,
) {
  return {
    geometry,
    material,
    castShadow,
    receiveShadow,
    mesh: null, // Will be populated by RenderSystem
  };
}

export function createMovementComponent(speed = 1.0, hoverHeight = 0.5) {
  return {
    velocity: { x: 0, y: 0, z: 0 },
    speed,
    hoverHeight,
    groundY: 0,
  };
}

export function createAIComponent(behavior = "wander", targetPosition = null) {
  return {
    behavior, // 'wander', 'seek', 'idle'
    targetPosition,
    lastDirectionChange: 0,
    directionChangeInterval: 2000, // ms
    wanderRadius: 10,
    seekRange: 15,
    state: "idle",
  };
}

export function createHealthComponent(maxHealth = 100, currentHealth = null) {
  return {
    maxHealth,
    currentHealth: currentHealth || maxHealth,
    isDead: false,
  };
}

// Component factory for creating components from JSON data
export function createComponentFromData(type, data) {
  switch (type) {
    case ComponentTypes.TRANSFORM:
      return createTransformComponent(
        data.position?.x,
        data.position?.y,
        data.position?.z,
        data.rotation,
      );

    case ComponentTypes.MESH:
      return createMeshComponent(
        data.geometry,
        data.material,
        data.castShadow,
        data.receiveShadow,
      );

    case ComponentTypes.MOVEMENT:
      return createMovementComponent(data.speed, data.hoverHeight);

    case ComponentTypes.AI:
      return createAIComponent(data.behavior, data.targetPosition);

    case ComponentTypes.HEALTH:
      return createHealthComponent(data.maxHealth, data.currentHealth);

    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
