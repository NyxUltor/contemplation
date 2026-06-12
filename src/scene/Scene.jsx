import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createPillar, PILLAR_HEIGHT, PILLAR_CENTER_Y } from './pillar.js'
import { createSky } from './sky.js'

const CAMERA_ORBIT_RADIUS = 7
const CAMERA_START_ANGLE = Math.PI / 6
const CAMERA_AUTO_ORBIT_SPEED = 0.08
const CAMERA_SCROLL_ORBIT_TURNS = 0.6
const CAMERA_HEIGHT_TOP = PILLAR_CENTER_Y + 1.4
const CAMERA_HEIGHT_BOTTOM = PILLAR_CENTER_Y - 1.6
const LOOK_AT_Y = PILLAR_CENTER_Y

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

    const ambient = new THREE.AmbientLight(0xcfe0f0, 0.55)
    scene.add(ambient)

    // ~10am sun: moderate elevation, warm-white, from one side
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.4)
    sun.position.set(10, 14, 6)
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

    const skyFill = new THREE.HemisphereLight(0xbcd9f2, 0x9a917f, 0.4)
    scene.add(skyFill)

    scene.add(createPillar())

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
    const clock = new THREE.Clock()

    const render = () => {
      rafId = requestAnimationFrame(render)
      const elapsed = clock.getElapsedTime()
      const progress = THREE.MathUtils.clamp(scrollRef.current, 0, 1)

      const cameraAngle =
        CAMERA_START_ANGLE +
        elapsed * CAMERA_AUTO_ORBIT_SPEED +
        progress * Math.PI * 2 * CAMERA_SCROLL_ORBIT_TURNS
      const cameraHeight = THREE.MathUtils.lerp(CAMERA_HEIGHT_TOP, CAMERA_HEIGHT_BOTTOM, progress)

      camera.position.set(
        Math.cos(cameraAngle) * CAMERA_ORBIT_RADIUS,
        cameraHeight,
        Math.sin(cameraAngle) * CAMERA_ORBIT_RADIUS,
      )
      camera.lookAt(0, LOOK_AT_Y, 0)

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
