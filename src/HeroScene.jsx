import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

const TABLET_RADIUS = 3.5
const TABLET_DATA = [
  { key: 'about', y: 6, angleDeg: 45 },
  { key: 'work', y: 2, angleDeg: 135 },
  { key: 'services', y: -2, angleDeg: 225 },
  { key: 'hire', y: -6, angleDeg: 315 },
]

function featherShape(length, width, bend) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(length * 0.34, width * bend, length, 0)
  shape.quadraticCurveTo(length * 0.54, -width, 0, 0)
  return shape
}

function createLayeredWing({ color, emissive, emissiveIntensity, layers, side = THREE.DoubleSide }) {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    roughness: 0.72,
    metalness: 0.04,
    side,
  })

  for (let i = 0; i < layers; i += 1) {
    const length = 1.22 - i * 0.11
    const width = 0.34 - i * 0.026
    const geometry = new THREE.ShapeGeometry(featherShape(length, width, 0.56 + i * 0.08))
    const feather = new THREE.Mesh(geometry, material)
    feather.position.set(-0.03 * i, -0.05 * i, -0.013 * i)
    feather.rotation.set(-0.06 + i * 0.03, 0.26 + i * 0.04, -0.56 + i * 0.08)
    feather.castShadow = true
    group.add(feather)
  }

  return { group, material }
}

function createFallbackStatue() {
  const group = new THREE.Group()
  const stone = new THREE.MeshStandardMaterial({
    color: 0x3f444a,
    roughness: 0.9,
    metalness: 0.03,
  })

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 1.8, 28), stone)
  torso.position.set(0, 0.85, 0)
  torso.rotation.z = 0.26
  torso.castShadow = true

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 26, 26), stone)
  head.position.set(0.66, 1.8, 0.04)
  head.castShadow = true

  const leftShape = new THREE.ShapeGeometry(featherShape(1.25, 0.38, 0.62))
  const rightShape = new THREE.ShapeGeometry(featherShape(1.05, 0.33, 0.5))
  const fallbackWingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b2f34,
    roughness: 0.84,
    metalness: 0.04,
    side: THREE.DoubleSide,
  })

  const leftWing = new THREE.Mesh(leftShape, fallbackWingMaterial)
  leftWing.position.set(-0.5, 1.15, -0.12)
  leftWing.rotation.set(-0.24, 0.62, -0.7)
  leftWing.castShadow = true

  const rightWing = new THREE.Mesh(rightShape, fallbackWingMaterial)
  rightWing.position.set(0.44, 1.0, 0.14)
  rightWing.rotation.set(-0.15, -0.35, 2.64)
  rightWing.castShadow = true

  group.add(torso, head, leftWing, rightWing)
  return group
}

function tabletMarkup(key) {
  if (key === 'about') {
    return "<p class='tablet-about-copy'>I'm Nyx. I build interfaces, tools, and systems — with precision and without noise.</p>"
  }

  if (key === 'work') {
    return `
      <h2 class='tablet-heading'>Work</h2>
      <div class='work-grid'>
        <article class='work-item' data-interactive='true'>
          <p class='work-tag'>React · UI · Tool</p>
          <h3>Deep Work Timer</h3>
          <p>A 50/10 Pomodoro with circular progress ring and session logging.</p>
        </article>
        <article class='work-item' data-interactive='true'>
          <p class='work-tag'>React · Tool · Persistent</p>
          <h3>CS50P Tracker</h3>
          <p>Progress tracker and syntax reference for Harvard Python course.</p>
        </article>
        <article class='work-item' data-interactive='true'>
          <p class='work-tag'>React · UI · Animation</p>
          <h3>Glass &amp; Ink</h3>
          <p>Glassmorphic counter with state-reactive color transitions.</p>
        </article>
        <article class='work-item' data-interactive='true'>
          <p class='work-tag'>React · Portfolio</p>
          <h3>Contemplation</h3>
          <p>This site. The surface you are standing on.</p>
        </article>
      </div>
    `
  }

  if (key === 'services') {
    return `
      <h2 class='tablet-heading'>Services</h2>
      <ul class='services-list'>
        <li>
          <p class='service-title'><span>◈</span>Web Interfaces</p>
          <p>Landing pages, dashboards, tools. Functional and polished.</p>
        </li>
        <li>
          <p class='service-title'><span>◇</span>Interactive Tools</p>
          <p>Calculators, trackers, configurators — things that actually do something.</p>
        </li>
        <li>
          <p class='service-title'><span>○</span>UI Components</p>
          <p>Standalone React components, animation work, design systems.</p>
        </li>
      </ul>
    `
  }

  return `
    <div class='hire-inner'>
      <p class='hire-question'>Have something to build?</p>
      <p class='hire-copy'>Async. Clean. No noise.</p>
      <a href='https://github.com/NyxUltor' target='_blank' rel='noreferrer' data-interactive='true'>GitHub</a>
    </div>
  `
}

function HeroScene({ scrollProgress }) {
  const hostRef = useRef(null)
  const scrollRef = useRef(0)

  useEffect(() => {
    scrollRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x060507, 0.08)

    const cssScene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120)
    camera.position.set(8, 6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x09080a, 1)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.BasicShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.7
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.className = 'webgl-layer'
    host.appendChild(renderer.domElement)

    const cssRenderer = new CSS3DRenderer()
    cssRenderer.setSize(window.innerWidth, window.innerHeight)
    cssRenderer.domElement.className = 'css3d-layer'
    host.appendChild(cssRenderer.domElement)

    const ambient = new THREE.AmbientLight(0x080810, 0.66)
    scene.add(ambient)

    const overhead = new THREE.SpotLight(0xe7ebff, 18, 80, 0.24, 0.1, 2)
    overhead.position.set(0, 24, 0)
    overhead.castShadow = true
    overhead.shadow.mapSize.set(2048, 2048)
    overhead.shadow.bias = -0.00005
    overhead.target.position.set(0, 1, 0)
    scene.add(overhead, overhead.target)

    const coldFill = new THREE.PointLight(0x5d84b1, 1.8, 36, 2)
    coldFill.position.set(-7, -4, 5)
    scene.add(coldFill)

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d4146,
      roughness: 0.9,
      metalness: 0.02,
    })

    const columnGeometry = new THREE.CylinderGeometry(0.95, 1.08, 12, 120, 84)
    const position = columnGeometry.attributes.position

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const z = position.getZ(i)
      const theta = Math.atan2(z, x)
      const radial = 1 + Math.sin(theta * 18) * 0.045
      position.setX(i, x * radial)
      position.setZ(i, z * radial)
    }

    position.needsUpdate = true
    columnGeometry.computeVertexNormals()

    const column = new THREE.Mesh(columnGeometry, stoneMaterial)
    column.position.y = 1
    column.castShadow = true
    column.receiveShadow = true
    scene.add(column)

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.65, 1.5, 64), stoneMaterial)
    plinth.position.y = -5.9
    plinth.castShadow = true
    plinth.receiveShadow = true
    scene.add(plinth)

    const capital = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.16, 24, 96), stoneMaterial)
    capital.rotation.x = Math.PI / 2
    capital.position.y = 7.2
    capital.castShadow = true
    scene.add(capital)

    const statueAnchor = new THREE.Group()
    statueAnchor.position.set(0, 7.85, 0)
    scene.add(statueAnchor)

    const fallbackStatue = createFallbackStatue()
    statueAnchor.add(fallbackStatue)

    const { group: shoulderWing } = createLayeredWing({
      color: 0x111215,
      emissive: 0x050507,
      emissiveIntensity: 0.08,
      layers: 8,
    })
    shoulderWing.position.set(-0.62, 1.25, -0.3)
    shoulderWing.rotation.set(0.2, 0.25, -0.42)
    statueAnchor.add(shoulderWing)

    const woundMaterial = new THREE.MeshStandardMaterial({
      color: 0x321616,
      emissive: 0xcc2200,
      emissiveIntensity: 1.3,
      roughness: 0.6,
      metalness: 0,
    })
    const wound = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), woundMaterial)
    wound.position.set(0.5, 1.16, -0.05)
    statueAnchor.add(wound)

    const { group: detachedWing, material: detachedWingMaterial } = createLayeredWing({
      color: 0xd7dde7,
      emissive: 0xc5d7f5,
      emissiveIntensity: 0.4,
      layers: 6,
    })
    detachedWing.position.set(0.96, 0.26, 0.36)
    detachedWing.rotation.set(-0.46, -0.2, 0.6)
    statueAnchor.add(detachedWing)

    const wingLight = new THREE.PointLight(0x99ccee, 1.6, 10, 2)
    wingLight.position.set(1.15, 0.36, 0.62)
    statueAnchor.add(wingLight)

    let gltfModel = null
    const loader = new GLTFLoader()
    loader.load(
      '/models/fallen-angel.glb',
      (gltf) => {
        gltfModel = gltf.scene
        gltfModel.position.set(0, 0, 0)
        gltfModel.scale.set(1, 1, 1)
        gltfModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })
        fallbackStatue.visible = false
        statueAnchor.add(gltfModel)
      },
      undefined,
      () => {
        fallbackStatue.visible = true
      },
    )

    const particleCount = 280
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3
      particlePositions[i3] = (Math.random() - 0.5) * 20
      particlePositions[i3 + 1] = Math.random() * 18
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 20
      particleSpeeds[i] = 0.004 + Math.random() * 0.004
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x778899,
        size: 0.018,
        transparent: true,
        opacity: 0.68,
      }),
    )
    scene.add(particles)

    const tabletObjects = TABLET_DATA.map((tablet) => {
      const div = document.createElement('div')
      div.className = `tablet tablet-${tablet.key}`
      div.innerHTML = tabletMarkup(tablet.key)

      const object = new CSS3DObject(div)
      const angle = THREE.MathUtils.degToRad(tablet.angleDeg)
      object.position.set(
        Math.cos(angle) * TABLET_RADIUS,
        tablet.y,
        Math.sin(angle) * TABLET_RADIUS,
      )
      object.scale.set(0.01, 0.01, 0.01)
      cssScene.add(object)
      return object
    })

    let rafId = 0
    const clock = new THREE.Clock()

    const render = () => {
      rafId = requestAnimationFrame(render)
      const elapsed = clock.getElapsedTime()
      const progress = scrollRef.current

      const angle = elapsed * 0.12 + progress * Math.PI * 2.4
      const radius = 8
      const height = 8 - progress * 16
      camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius)
      camera.lookAt(0, 1, 0)

      const pulse = 1.4 + (Math.sin(elapsed * 1.1) * 0.5 + 0.5) * 1.1
      wingLight.intensity = pulse
      detachedWingMaterial.emissiveIntensity = 0.4 + Math.sin(elapsed * 1.1) * 0.16

      const attrs = particleGeometry.attributes.position
      for (let i = 0; i < particleCount; i += 1) {
        const y = attrs.getY(i) - particleSpeeds[i]
        attrs.setY(i, y <= 0 ? 18 : y)
      }
      attrs.needsUpdate = true

      for (const tablet of tabletObjects) {
        tablet.lookAt(camera.position)
      }

      renderer.render(scene, camera)
      cssRenderer.render(cssScene, camera)
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      cssRenderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', onResize)
    render()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      particleGeometry.dispose()
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement)
      }
      if (host.contains(cssRenderer.domElement)) {
        host.removeChild(cssRenderer.domElement)
      }
    }
  }, [])

  return <div className='scene-host' ref={hostRef} aria-hidden='true' />
}

export default HeroScene
