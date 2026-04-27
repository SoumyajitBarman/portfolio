/**
 * three-bg.js — Three.js particle field + rotating geometry background
 * Performance-optimised: pixel ratio cap, mobile particle reduction,
 * Intersection Observer pause when off-screen.
 */
(function () {
  'use strict';

  /* ── Safety check ── */
  if (typeof THREE === 'undefined') {
    console.warn('[three-bg] Three.js not loaded');
    return;
  }

  /* ── Canvas ── */
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  /* ── Renderer ── */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,            // off for perf
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ── Scene & Camera ── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  /* ── Particle System ── */
  const PARTICLE_COUNT = isMobile ? 1200 : 3000;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const colorOptions = [
    new THREE.Color('#7c3aed'),  // violet
    new THREE.Color('#06b6d4'),  // cyan
    new THREE.Color('#f43f5e'),  // rose
    new THREE.Color('#a855f7'),  // light violet
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 30 + Math.random() * 70;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const col = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 1.5 + 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  /* Custom shader for circular particles with soft glow */
  const particleMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position  = projectionMatrix * mvPosition;
        vAlpha = smoothstep(80.0, 30.0, -mvPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = (1.0 - d * 2.0) * vAlpha * 0.85;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  const particles = new THREE.Points(geo, particleMat);
  scene.add(particles);

  /* ── Abstract Geometry (floating torus-knot) ── */
  const knotGeo = new THREE.TorusKnotGeometry(8, 2.5, 200, 20);
  const knotMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.set(30, -10, -20);
  scene.add(knot);

  /* Second wireframe shape */
  const icoGeo = new THREE.IcosahedronGeometry(12, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-35, 15, -30);
  scene.add(ico);

  /* Ring / donut */
  const torusGeo = new THREE.TorusGeometry(14, 0.5, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(10, 25, -40);
  torus.rotation.x = Math.PI / 4;
  scene.add(torus);

  /* ── Mouse parallax ── */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Scroll parallax ── */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Animation ── */
  let animId = null;
  let running = true;
  let clock = { t: 0 };

  function animate(timestamp) {
    if (!running) return;
    animId = requestAnimationFrame(animate);

    const t = timestamp * 0.001;

    /* Smooth mouse */
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    /* Rotate particle system gently */
    particles.rotation.y = t * 0.03 + currentX * 0.2;
    particles.rotation.x = currentY * 0.1;

    /* Shapes */
    knot.rotation.x = t * 0.12;
    knot.rotation.y = t * 0.08;

    ico.rotation.x = t * 0.07;
    ico.rotation.z = t * 0.05;

    torus.rotation.y = t * 0.06;
    torus.rotation.z = t * 0.04;

    /* Camera scroll parallax */
    camera.position.y = -scrollY * 0.02;
    camera.position.x = currentX * 3;

    renderer.render(scene, camera);
  }

  /* ── Intersection Observer to pause when canvas off-screen ── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!running) { running = true; requestAnimationFrame(animate); }
        } else {
          running = false;
        }
      });
    },
    { threshold: 0 }
  );

  /* Always observe body so BG is almost always visible */
  observer.observe(document.body);

  requestAnimationFrame(animate);

})();
