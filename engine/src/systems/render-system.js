/**
 * Render System - Handles Three.js rendering and mesh management
 */

import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";
import { ComponentTypes } from "../components/components.js";

export class RenderSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.entityManager = null;
    this.meshes = new Map(); // entityId -> mesh

    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupLights();
    this.setupEnvironment();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x0a0a0a);
    this.renderer.physicallyCorrectLights = true;

    // Handle window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 15, 20);
    this.camera.lookAt(0, 0, 0);
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x202020, 0.3);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x666666, 0.3);
    rimLight.position.set(-30, 20, -30);
    this.scene.add(rimLight);
  }

  setupEnvironment() {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x2a2a2a,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Emissive cubes for ambient lighting
    const emissiveGeometry = new THREE.BoxGeometry(2, 8, 2);
    const emissiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x00cccc,
      emissive: 0x00ffff,
      emissiveIntensity: 2.0,
      metalness: 0.1,
      roughness: 0.4,
      transparent: true,
      opacity: 0.8,
    });

    // Place emissive pillars around the scene
    const positions = [
      { x: -20, z: -20 },
      { x: 20, z: -20 },
      { x: -20, z: 20 },
      { x: 20, z: 20 },
    ];

    positions.forEach((pos) => {
      const pillar = new THREE.Mesh(emissiveGeometry, emissiveMaterial);
      pillar.position.set(pos.x, 4, pos.z);
      this.scene.add(pillar);
      const glowLight = new THREE.PointLight(0x00ffff, 3.0, 8.0);
      glowLight.position.copy(pillar.position);
      this.scene.add(glowLight);
    });
  }

  onComponentAdded(entityId, componentType, componentData) {
    if (componentType === ComponentTypes.MESH) {
      this.createMesh(entityId, componentData);
    }
  }

  onComponentRemoved(entityId, componentType) {
    if (componentType === ComponentTypes.MESH) {
      this.removeMesh(entityId);
    }
  }

  onEntityDestroyed(entityId) {
    this.removeMesh(entityId);
  }

  createMesh(entityId, meshComponent) {
    let geometry, material;

    // Create geometry based on type
    switch (meshComponent.geometry) {
      case "box":
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.5, 16, 16);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Create material
    material = new THREE.MeshLambertMaterial({
      color: meshComponent.material.color || 0x808080,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = meshComponent.castShadow;
    mesh.receiveShadow = meshComponent.receiveShadow;

    this.meshes.set(entityId, mesh);
    this.scene.add(mesh);

    // Store mesh reference in component
    meshComponent.mesh = mesh;
  }

  removeMesh(entityId) {
    const mesh = this.meshes.get(entityId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.meshes.delete(entityId);
    }
  }

  update(deltaTime) {
    // Update mesh positions from transform components
    const entities = this.entityManager.getEntitiesWithComponents(
      ComponentTypes.TRANSFORM,
      ComponentTypes.MESH,
    );

    entities.forEach((entityId) => {
      const transform = this.entityManager.getComponent(
        entityId,
        ComponentTypes.TRANSFORM,
      );
      const mesh = this.meshes.get(entityId);

      if (mesh && transform) {
        mesh.position.set(
          transform.position.x,
          transform.position.y,
          transform.position.z,
        );
        mesh.rotation.set(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z,
        );
        mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}
