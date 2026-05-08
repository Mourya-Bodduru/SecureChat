import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSphere = () => {
  const meshRef = useRef();
  
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#3b82f6"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.3}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-dark-bg pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <ParticleSphere />
        </Float>
        {/* Using a custom subtle particle system for light theme instead of Stars to avoid high contrast dots */}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
