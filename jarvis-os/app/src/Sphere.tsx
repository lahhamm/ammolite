import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useApp } from './store';
import { onPulse } from './sphereBus';
import type { SphereMode } from './types';

const COUNT_HI = 14000;
const COUNT_LO = 8000; // narrow hosts (< 700px) get fewer particles

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uSpeed;
uniform float uScale;
uniform float uImpulse;
attribute float seed;
varying float vSeed;
varying float vGlow;

void main() {
  vSeed = seed;
  vec3 dir = normalize(position);
  float t = uTime * uSpeed;
  float n =
      sin(dot(dir, vec3(3.1, 1.7, 2.3)) * 2.0 + t + seed * 6.2831) * 0.5
    + sin(dot(dir, vec3(1.3, 4.1, 0.7)) * 3.0 - t * 1.3 + seed * 3.14) * 0.3
    + sin(dot(dir, vec3(2.2, 0.4, 3.7)) * 5.0 + t * 0.7) * 0.2;
  float ripple = uImpulse * 0.09 * sin(seed * 12.0 + uTime * 18.0);
  vec3 p = dir * uScale * (1.0 + n * uAmp + ripple);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = 2.2 * (0.7 + 0.6 * seed);
  gl_PointSize = size * (7.5 / -mv.z);
  vGlow = 0.5 + 0.5 * n;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBrightness;
varying float vSeed;
varying float vGlow;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.02, d);
  vec3 color = mix(uColorA, uColorB, vSeed * 0.7 + vGlow * 0.3);
  gl_FragColor = vec4(color * uBrightness, alpha * 0.55);
}
`;

interface ModeTarget {
  colorA: THREE.Color;
  colorB: THREE.Color;
  amp: number;
  speed: number;
  brightness: number;
  scale: number;
}

const MODES: Record<SphereMode, ModeTarget> = {
  idle: {
    colorA: new THREE.Color('#1d4ed8'),
    colorB: new THREE.Color('#38bdf8'),
    amp: 0.14, speed: 0.25, brightness: 1.05, scale: 1.0,
  },
  listening: {
    colorA: new THREE.Color('#0891b2'),
    colorB: new THREE.Color('#a5f3fc'),
    amp: 0.05, speed: 0.55, brightness: 1.35, scale: 0.94,
  },
  thinking: {
    colorA: new THREE.Color('#6d28d9'),
    colorB: new THREE.Color('#c4b5fd'),
    amp: 0.34, speed: 1.15, brightness: 1.1, scale: 1.05,
  },
  speaking: {
    colorA: new THREE.Color('#0ea5e9'),
    colorB: new THREE.Color('#e0f2fe'),
    amp: 0.18, speed: 0.6, brightness: 1.25, scale: 1.0,
  },
  alert: {
    colorA: new THREE.Color('#b45309'),
    colorB: new THREE.Color('#fde68a'),
    amp: 0.2, speed: 0.4, brightness: 1.1, scale: 1.0,
  },
};

function computeMode(s: {
  listening: boolean;
  speaking: boolean;
  jarvisState: string;
  escalations: unknown[];
}): SphereMode {
  if (s.listening) return 'listening';
  if (s.speaking) return 'speaking';
  if (s.jarvisState === 'thinking') return 'thinking';
  if (s.escalations.length > 0) return 'alert';
  return 'idle';
}

export function Sphere() {
  const hostRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<SphereMode>('idle');
  const impulseRef = useRef(0);

  const mode = useApp((s) => computeMode(s));
  modeRef.current = mode;

  useEffect(() => onPulse(() => {
    impulseRef.current = Math.min(impulseRef.current + 0.55, 1.2);
  }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.z = 4.1;

    const group = new THREE.Group();
    scene.add(group);

    // particles on a fibonacci sphere; fewer on narrow hosts to save the GPU
    const COUNT = host.clientWidth < 700 ? COUNT_LO : COUNT_HI;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      seeds[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: MODES.idle.amp },
      uSpeed: { value: MODES.idle.speed },
      uScale: { value: MODES.idle.scale },
      uBrightness: { value: MODES.idle.brightness },
      uImpulse: { value: 0 },
      uColorA: { value: MODES.idle.colorA.clone() },
      uColorB: { value: MODES.idle.colorB.clone() },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);

    // HUD rings
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x3a7fb8,
      transparent: true,
      opacity: 0.13,
    });
    const makeRing = (radius: number, tiltX: number, tiltZ: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMaterial);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      return ring;
    };
    const ring1 = makeRing(1.32, 1.38, 0.08);
    const ring2 = makeRing(1.48, 1.52, -0.06);
    group.add(ring1, ring2);

    // parallax
    let targetRX = 0;
    let targetRY = 0;
    const onMouse = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRY = ((e.clientX - cx) / rect.width) * 0.35;
      targetRX = ((e.clientY - cy) / rect.height) * 0.25;
    };
    window.addEventListener('mousemove', onMouse);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // keep the whole sphere (plus rings) inside narrow viewports
      group.scale.setScalar(Math.min(1, camera.aspect * 1.05));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const clock = new THREE.Clock();
    let breath = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // Skip all GPU/animation work while the tab is hidden.
      if (document.hidden) {
        clock.getDelta(); // drain so dt doesn't spike on resume
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      breath += dt;

      const target = MODES[modeRef.current];
      const k = 1 - Math.pow(0.002, dt); // framerate-independent lerp
      uniforms.uAmp.value += (target.amp - uniforms.uAmp.value) * k;
      uniforms.uSpeed.value += (target.speed - uniforms.uSpeed.value) * k;
      uniforms.uScale.value += (target.scale - uniforms.uScale.value) * k;

      let brightness = target.brightness;
      if (modeRef.current === 'alert') brightness += Math.sin(breath * 2.2) * 0.18;
      uniforms.uBrightness.value += (brightness - uniforms.uBrightness.value) * k;

      (uniforms.uColorA.value as THREE.Color).lerp(target.colorA, k);
      (uniforms.uColorB.value as THREE.Color).lerp(target.colorB, k);

      impulseRef.current *= Math.pow(0.02, dt); // fast decay
      uniforms.uImpulse.value = impulseRef.current;

      group.rotation.y += dt * 0.12;
      points.rotation.x += (targetRX - points.rotation.x) * 0.04;
      points.rotation.z += (targetRY * 0.5 - points.rotation.z) * 0.04;
      ring1.rotation.y += dt * 0.05;
      ring2.rotation.y -= dt * 0.04;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouse);
      geometry.dispose();
      material.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="sphere-host" />;
}
