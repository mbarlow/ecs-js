#!/bin/bash

# ECS Game Engine Setup Script
echo "🎮 Setting up ECS Game Engine..."

# Create directory structure
mkdir -p ecs-game-engine/{src/{core,components,systems},data/entities}
cd ecs-game-engine

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ecs-game-engine",
  "version": "1.0.0",
  "description": "Minimal ECS game engine with Three.js",
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/main.js",
    "serve": "bun --hot src/server.js"
  },
  "devDependencies": {
    "bun": "latest"
  },
  "dependencies": {
    "three": "^0.159.0"
  }
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECS Game Engine</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="game-container">
        <canvas id="game-canvas"></canvas>
        <div id="ui-overlay">
            <div id="debug-info">
                <span id="fps-counter">FPS: 0</span>
                <span id="entity-count">Entities: 0</span>
            </div>
        </div>
    </div>
    <script type="module" src="src/main.js"></script>
</body>
</html>
EOF

echo "📁 Created project structure and core files"
echo "📦 Run 'bun install' to install dependencies"
echo "🚀 Run 'bun run serve' to start development server"
echo "✅ Setup complete! Check the artifacts above for remaining files."
