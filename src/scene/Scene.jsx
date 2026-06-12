import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createPillar, PILLAR_HEIGHT } from './pillar.js'
import { createSky } from './sky.js'

const CAMERA_ORBIT_RADIUS = 7
const CAMERA_START_ANGLE = Math.PI / 6
const CAMERA_SCROLL_ORBIT_TURNS = 0.6
const CAMERA_HEIGHT_TOP = PILLAR_HEIGHT - 4
const CAMERA_HEIGHT_BOTTOM = 8
const LOOK_DOWN_ANGLE = THREE.MathUtils.degToRad(25)
const LOOK_AT_DROP = CAMERA_ORBIT_RADIUS * Math.tan(LOOK_DOWN_ANGLE)

// blood drip: slides from near the top of the shaft to the ground, scroll-driven
const DRIP_TOP_Y = PILLAR_HEIGHT - 2
const DRIP_BOTTOM_Y = -0.6
const DRIP_HIDE_PROGRESS = 0.97

const MIN_PARTICLE_SPEED = 0.003
const PARTICLE_SPEED_RANGE = 0.003

function Scene({ scrollProgress }) {
  const hostRef = useRef(null)
  const scrollRef = useRef(0)

  useEffect(() => {
    scrollRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.className = 'webgl-layer'
    host.appendChild(renderer.domElement)

    scene.add(createSky())

    const ambient = new THREE.AmbientLight(0xcfe0f0, 0.85)
    scene.add(ambient)

    // ~10am sun: higher elevation, warm-white
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.1)
    sun.position.set(9, 22, 7)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 50
    sun.shadow.camera.left = -10
    sun.shadow.camera.right = 10
    sun.shadow.camera.top = 10
    sun.shadow.camera.bottom = -10
    sun.shadow.bias = -0.0004
    scene.add(sun)

    // soft fill from the opposite side so the shadow side doesn't go too dark
    const fill = new THREE.DirectionalLight(0xcfe0f5, 0.7)
    fill.position.set(-9, 10, -6)
    scene.add(fill)

    const skyFill = new THREE.HemisphereLight(0xbcd9f2, 0x9a917f, 0.6)
    scene.add(skyFill)

    scene.add(createPillar())

    // blood drip: small wet-looking drop on the pillar surface, slides down with scroll
    const dripMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c0c10,
      roughness: 0.25,
      metalness: 0.1,
    })
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), dripMaterial)
    drip.scale.set(1, 1.6, 1)
    drip.position.set(0, DRIP_TOP_Y, 0.98)
    scene.add(drip)

    // dust motes in sunlight
    const particleCount = 160
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3
      particlePositions[i3] = (Math.random() - 0.5) * 10
      particlePositions[i3 + 1] = Math.random() * 8
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 10
      particleSpeeds[i] = MIN_PARTICLE_SPEED + Math.random() * PARTICLE_SPEED_RANGE
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xfff6e6,
        size: 0.025,
        transparent: true,
        opacity: 0.5,
      }),
    )
    scene.add(particles)

    let rafId = 0
    const render = () => {
      rafId = requestAnimationFrame(render)
      const progress = THREE.MathUtils.clamp(scrollRef.current, 0, 1)

      const cameraAngle = CAMERA_START_ANGLE + progress * Math.PI * 2 * CAMERA_SCROLL_ORBIT_TURNS
      const cameraHeight = THREE.MathUtils.lerp(CAMERA_HEIGHT_TOP, CAMERA_HEIGHT_BOTTOM, progress)

      camera.position.set(
        Math.cos(cameraAngle) * CAMERA_ORBIT_RADIUS,
        cameraHeight,
        Math.sin(cameraAngle) * CAMERA_ORBIT_RADIUS,
      )
      camera.lookAt(0, cameraHeight - LOOK_AT_DROP, 0)

      drip.position.y = THREE.MathUtils.lerp(DRIP_TOP_Y, DRIP_BOTTOM_Y, progress)
      drip.visible = progress < DRIP_HIDE_PROGRESS

      const attrs = particleGeometry.attributes.position
      for (let i = 0; i < particleCount; i += 1) {
        const y = attrs.getY(i) - particleSpeeds[i]
        attrs.setY(i, y <= 0 ? 8 : y)
      }
      attrs.needsUpdate = true

      renderer.render(scene, camera)
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
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
    }
  }, [])

  return <div className="scene-host" ref={hostRef} aria-hidden="true" />
}

export default Scene