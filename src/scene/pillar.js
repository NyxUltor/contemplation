import * as THREE from 'three'

const FLUTE_COUNT = 20
const FLUTE_DEPTH = 0.04

export const PILLAR_HEIGHT = 14
export const PILLAR_CENTER_Y = PILLAR_HEIGHT / 2

export function createPillar() {
  const group = new THREE.Group()

  const textureLoader = new THREE.TextureLoader()

  // NOTE: filenames assume ambientCG's default export naming for Concrete034 2K-JPG.
  // If textures don't appear, check the actual filenames in /public/textures/
  // and adjust the paths below to match.
  const colorMap = textureLoader.load('/textures/Concrete034_2K-JPG_Color.jpg')
  colorMap.colorSpace = THREE.SRGBColorSpace
  colorMap.wrapS = THREE.RepeatWrapping
  colorMap.wrapT = THREE.RepeatWrapping
  colorMap.repeat.set(3, 8)

  const normalMap = textureLoader.load('/textures/Concrete034_2K-JPG_NormalGL.jpg')
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping
  normalMap.repeat.set(3, 8)

  const roughnessMap = textureLoader.load('/textures/Concrete034_2K-JPG_Roughness.jpg')
  roughnessMap.wrapS = THREE.RepeatWrapping
  roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.repeat.set(3, 8)

  const stoneMaterial = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    roughnessMap,
    color: 0xe6e1d6,
    roughness: 1,
    metalness: 0.02,
  })

  const shaftGeometry = new THREE.CylinderGeometry(0.85, 0.95, PILLAR_HEIGHT, 96, 1)
  const position = shaftGeometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const z = position.getZ(i)
    const theta = Math.atan2(z, x)
    const radial = 1 + Math.sin(theta * FLUTE_COUNT) * FLUTE_DEPTH
    position.setX(i, x * radial)
    position.setZ(i, z * radial)
  }
  position.needsUpdate = true
  shaftGeometry.computeVertexNormals()

  const shaft = new THREE.Mesh(shaftGeometry, stoneMaterial)
  shaft.position.y = PILLAR_CENTER_Y
  shaft.castShadow = true
  shaft.receiveShadow = true
  group.add(shaft)

  const capital = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.95, 0.35, 64), stoneMaterial)
  capital.position.y = PILLAR_HEIGHT + 0.18
  capital.castShadow = true
  capital.receiveShadow = true
  group.add(capital)

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.5, 64), stoneMaterial)
  base.position.y = -0.25
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.MeshStandardMaterial({ color: 0x5e7a4a, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  ground.receiveShadow = true
  group.add(ground)

  return group
}