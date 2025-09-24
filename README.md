# ECS Game Engine

A minimal, extensible Entity Component System (ECS) game engine built with Three.js and Bun. Features a clean monochromatic aesthetic with organic mob movement patterns.

## 🎮 Features

- **Pure ECS Architecture**: Clean separation of entities, components, and systems
- **External Entity Definitions**: JSON-based entity configuration for easy modding
- **Organic AI Movement**: Smooth hovering and wandering behaviors with spring physics
- **Monochromatic Aesthetic**: Professional greyscale theme with neumorphic UI elements
- **Live Development**: Hot reload with Bun for rapid iteration
- **Extensible Design**: Easy to add new components, systems, and entity types

## 🏗️ Architecture

```
src/
├── core/
│   ├── entity-manager.js    # Core ECS entity and component management
│   ├── game-engine.js       # Main game loop and system coordination
│   └── entity-loader.js     # JSON entity definition loader
├── components/
│   └── components.js        # Component definitions and factories
├── systems/
│   ├── render-system.js     # Three.js rendering and mesh management
│   ├── movement-system.js   # Physics and movement logic
│   └── ai-system.js         # AI behaviors and decision making
├── main.js                  # Application entry point
└── server.js                # Development server

data/
├── entities/
│   └── mob.json            # Basic mob entity definition
└── world.json              # World configuration with entity spawning
```

## 📦 Dependencies

- **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager
- **[Three.js](https://threejs.org/)**: 3D graphics library

## 🚀 Quick Start

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start development server**:
   ```bash
   bun run serve
   ```

4. **Open browser** to `http://localhost:3000`

## 🎯 Usage

### Basic Controls
- **SPACE**: Spawn random mob
- **R**: Restart game
- **P**: Pause/Resume
- **H**: Show help
- **Click**: Log click coordinates (for debugging)

### Creating New Entities

1. **Define entity in JSON** (`data/entities/my-entity.json`):
   ```json
   {
     "name": "Custom Entity",
     "components": {
       "transform": {
         "position": { "x": 0, "y": 1, "z": 0 }
       },
       "mesh": {
         "geometry": "sphere",
         "material": { "color": 8421504 }
       },
       "movement": {
         "speed": 2.0,
         "hoverHeight": 1.5
       },
       "ai": {
         "behavior": "wander",
         "wanderRadius": 5
       }
     }
   }
   ```

2. **Spawn programmatically**:
   ```javascript
   await gameEngine.spawnEntity('data/entities/my-entity.json');
   ```

### Adding New Components

1. **Define component type**:
   ```javascript
   // In components.js
   export const ComponentTypes = {
     MY_COMPONENT: 'my_component'
   };

   export function createMyComponent(data) {
     return {
       property1: data.property1 || 'default',
       property2: data.property2 || 0
     };
   }
   ```

2. **Create corresponding system**:
   ```javascript
   // systems/my-system.js
   export class MySystem {
     update(deltaTime) {
       const entities = this.entityManager.getEntitiesWithComponents(
         ComponentTypes.MY_COMPONENT
       );
       // Process entities...
     }
   }
   ```

## 🏃‍♂️ Development Scripts

- `bun run serve`: Start development server with hot reload
- `bun run dev`: Watch main.js for changes (alternative)

## 🎨 Visual Style

The engine uses a monochromatic greyscale palette with:
- **Dark theme**: `#1a1a1a` backgrounds
- **Neumorphic UI**: Subtle shadows and highlights
- **Organic lighting**: Ambient fog and emissive elements
- **Smooth animations**: Spring-based physics for natural movement

## 🔧 Configuration

### World Configuration (`data/world.json`)
```json
{
  "name": "My World",
  "config": {
    "ambient": {
      "fogColor": 657930,
      "fogNear": 50,
      "fogFar": 200
    }
  },
  "entities": [
    {
      "definition": "data/entities/mob.json",
      "count": 6,
      "spawnArea": { "x": 0, "z": 0, "radius": 15 }
    }
  ]
}
```

### Entity Variations
```javascript
const variations = {
  mesh: {
    material: {
      type: 'random',
      options: [0x444444, 0x666666, 0x888888]
    }
  }
};
```

## 🚀 Performance

- **Optimized rendering**: Efficient Three.js mesh management
- **Component-based updates**: Only process entities with required components
- **Memory management**: Proper cleanup of destroyed entities
- **60 FPS target**: Smooth animation with requestAnimationFrame

## 🛠️ Extending the Engine

### New System Example
```javascript
export class CombatSystem {
  constructor() {
    this.entityManager = null;
  }

  update(deltaTime) {
    const combatants = this.entityManager.getEntitiesWithComponents(
      ComponentTypes.HEALTH,
      ComponentTypes.COMBAT
    );
    // Implement combat logic...
  }
}
```

### Custom Component
```javascript
export function createCombatComponent(damage = 10, range = 2) {
  return {
    damage,
    range,
    lastAttack: 0,
    attackCooldown: 1000
  };
}
```

## 📝 Code Standards

- **File size limit**: <300 lines per file
- **Cyclomatic complexity**: <7 per function
- **Modern ES6+**: Use modules, arrow functions, async/await
- **Error handling**: Comprehensive try/catch blocks
- **Consistent naming**: camelCase for variables, PascalCase for classes

## 🐛 Debugging

- **Console logging**: Extensive debug output
- **FPS counter**: Real-time performance monitoring
- **Entity count**: Track entity lifecycle
- **Browser DevTools**: Full Three.js scene inspection

## 📋 TODO / Roadmap

- [ ] Collision detection system
- [ ] Audio system integration
- [ ] Particle effects
- [ ] State management for game saves
- [ ] Network multiplayer foundation
- [ ] Asset loading system
- [ ] Animation system
- [ ] UI system for HUD elements

## 🤝 Contributing

This is designed as a minimal foundation. Feel free to:
- Add new component types
- Implement additional systems
- Enhance the visual style
- Optimize performance
- Add new entity behaviors

## 📄 License

Open source - feel free to use and modify for your projects.

---

**Built with modern web technologies for maximum developer experience and minimal complexity.**
