import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface Waveform3DProps {
  audioData?: Float32Array;
  bpm?: number;
  isPlaying?: boolean;
  color?: string;
  className?: string;
}

export function Waveform3D({ 
  audioData, 
  bpm = 120, 
  isPlaying = false,
  color = '#7B2FF7',
  className 
}: Waveform3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x7B2FF7, 1, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Create waveform bars
    const barCount = 64;
    const barWidth = 0.4;
    const gap = 0.2;
    const totalWidth = barCount * (barWidth + gap);
    const startX = -totalWidth / 2;

    const barGeometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
    
    for (let i = 0; i < barCount; i++) {
      const hue = (i / barCount) * 0.3 + 0.75; // Purple to cyan gradient
      const barMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        emissive: new THREE.Color().setHSL(hue, 0.8, 0.2),
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });

      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.x = startX + i * (barWidth + gap);
      bar.position.y = 0.5;
      scene.add(bar);
      barsRef.current.push(bar);
    }

    // Add ground reflection plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    setIsInitialized(true);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const bars = barsRef.current;

    let time = 0;
    const beatInterval = 60 / bpm; // seconds per beat

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Animate bars
      bars.forEach((bar, i) => {
        let targetHeight: number;

        if (audioData && audioData.length > 0) {
          // Use real audio data
          const dataIndex = Math.floor((i / bars.length) * audioData.length);
          targetHeight = Math.abs(audioData[dataIndex]) * 20 + 0.5;
        } else if (isPlaying) {
          // Simulate based on BPM
          const beatPhase = (time / beatInterval) * Math.PI * 2;
          const wave = Math.sin(beatPhase + i * 0.2) * 0.5 + 0.5;
          const noise = Math.sin(time * 3 + i * 0.5) * 0.2;
          targetHeight = (wave + noise) * 8 + 1;
        } else {
          // Idle animation
          targetHeight = Math.sin(time * 0.5 + i * 0.1) * 2 + 3;
        }

        // Smooth interpolation
        bar.scale.y += (targetHeight - bar.scale.y) * 0.15;
        bar.position.y = bar.scale.y / 2;

        // Pulse emissive on beat
        if (isPlaying) {
          const material = bar.material as THREE.MeshPhongMaterial;
          const beatPulse = Math.pow(Math.sin((time / beatInterval) * Math.PI), 4);
          material.emissiveIntensity = 0.2 + beatPulse * 0.3;
        }
      });

      // Rotate camera slightly
      if (isPlaying) {
        camera.position.x = Math.sin(time * 0.2) * 5;
        camera.lookAt(0, 5, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioData, bpm, isPlaying]);

  return (
    <div 
      ref={containerRef} 
      className={cn('w-full h-48 md:h-64 rounded-lg overflow-hidden', className)}
    />
  );
}
