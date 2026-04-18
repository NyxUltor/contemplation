import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
    scene.fog = new THREE.FogExp2(0x060306, 0.08)

    const camera = new THREE.PerspectiveCamera(
      45,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    )
    camera.position.set(5.4, 2.4, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x8f7f9f, 0.55)
    scene.add(ambient)

    const key = new THREE.SpotLight(0xf5d3ff, 6, 35, 0.36, 0.4)
    key.position.set(3.5, 8, 4)
    key.target.position.set(0, 1, 0)
    scene.add(key, key.target)

    const crimson = new THREE.PointLight(0x9e1431, 2.2, 8, 2)
    crimson.position.set(-1.5, 2.2, -0.5)
    scene.add(crimson)

    const rim = new THREE.DirectionalLight(0xb3c7ff, 0.8)
    rim.position.set(-6, 3, -4)
    scene.add(rim)

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x675f70,
      roughness: 0.82,
      metalness: 0.08,
    })

    const columnGeometry = new THREE.CylinderGeometry(1.1, 1.25, 5.8, 72, 64, true)
    const columnPosition = columnGeometry.attributes.position

    for (let i = 0; i < columnPosition.count; i += 1) {
      const x = columnPosition.getX(i)
      const z = columnPosition.getZ(i)
      const theta = Math.atan2(z, x)
      const pulse = 1 + 0.055 * Math.sin(theta * 12)
      columnPosition.setX(i, x * pulse)
      columnPosition.setZ(i, z * pulse)
    }

    columnPosition.needsUpdate = true
    columnGeometry.computeVertexNormals()

    const column = new THREE.Mesh(columnGeometry, stoneMaterial)
    column.position.y = 0.95
    scene.add(column)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.65, 0.72, 56),
      stoneMaterial,
    )
    base.position.y = -2.22
    scene.add(base)

    const capital = new THREE.Mesh(
      new THREE.TorusGeometry(1.44, 0.16, 22, 72),
      stoneMaterial,
    )
    capital.rotation.x = Math.PI / 2
    capital.position.y = 3.96
    scene.add(capital)

    const statueRoot = new THREE.Group()
    statueRoot.position.set(0.2, 1.4, 0.1)
    statueRoot.rotation.z = -0.26

    const figureMaterial = new THREE.MeshStandardMaterial({
      color: 0x76707f,
      roughness: 0.86,
      metalness: 0.03,
    })

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.25, 8, 16), figureMaterial)
    body.rotation.z = 0.22
    body.position.set(0.18, 0.12, 0)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 22, 22), figureMaterial)
    head.position.set(0.66, 1.02, 0)

    const wingMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d1f2a,
      emissive: 0x5e0f24,
      emissiveIntensity: 1.5,
      roughness: 0.55,
      metalness: 0.1,
      side: THREE.DoubleSide,
    })

    const wingGeometry = new THREE.PlaneGeometry(1.7, 0.84, 1, 6)
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
    leftWing.position.set(-0.26, 0.62, -0.24)
    leftWing.rotation.set(-0.22, 0.45, -0.66)

    const rightWing = leftWing.clone()
    rightWing.position.z = 0.24
    rightWing.rotation.set(-0.22, -0.42, -2.45)

    statueRoot.add(body, head, leftWing, rightWing)
    scene.add(statueRoot)

    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 180
    const particleBuffer = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3
      particleBuffer[i3] = (Math.random() - 0.5) * 10
      particleBuffer[i3 + 1] = Math.random() * 8 - 3
      particleBuffer[i3 + 2] = (Math.random() - 0.5) * 10
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particleBuffer, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x8f7ea5,
        size: 0.032,
        transparent: true,
        opacity: 0.5,
      }),
    )
    scene.add(particles)

    let gltfModel
    const loader = new GLTFLoader()
    loader.load(
      '/models/fallen-angel.glb',
      (gltf) => {
        gltfModel = gltf.scene
        gltfModel.position.copy(statueRoot.position)
        gltfModel.rotation.copy(statueRoot.rotation)
        gltfModel.scale.set(0.8, 0.8, 0.8)
        scene.add(gltfModel)
        statueRoot.visible = false
      },
      undefined,
      () => {
        statueRoot.visible = true
      },
    )

    const clock = new THREE.Clock()
    let rafId = 0
    let orbit = 0

    const renderFrame = () => {
      rafId = requestAnimationFrame(renderFrame)
      const elapsed = clock.getElapsedTime()
      const progress = scrollRef.current

      orbit += 0.0016
      const angle = orbit + progress * Math.PI * 2.2
      const radius = 5.6 - progress * 1.25

      camera.position.set(
        Math.cos(angle) * radius,
        2.4 - progress * 6.5 + Math.sin(elapsed * 0.4) * 0.18,
        Math.sin(angle) * radius,
      )
      camera.lookAt(0, 1.8 - progress * 1.4, 0)

      column.rotation.y += 0.0012
      particles.rotation.y += 0.00055
      leftWing.material.emissiveIntensity = 1.2 + Math.sin(elapsed * 1.6) * 0.35
      rightWing.material.emissiveIntensity = 1.2 + Math.sin(elapsed * 1.6 + 0.8) * 0.35

      if (gltfModel) {
        gltfModel.rotation.y += 0.0013
      } else {
        statueRoot.rotation.y += 0.0013
      }

      renderer.render(scene, camera)
    }

    const onResize = () => {
      if (!host) {
        return
      }
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    }

    window.addEventListener('resize', onResize)
    renderFrame()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="hero-scene" ref={hostRef} aria-hidden="true" />
}

export default HeroScene
