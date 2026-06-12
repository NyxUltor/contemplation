import * as THREE from 'three'

const FLUTE_COUNT = 20
const FLUTE_DEPTH = 0.04

export const PILLAR_HEIGHT = 6
export const PILLAR_CENTER_Y = 3

export function createPillar() {
  const group = new THREE.Group()

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xcdc7ba,
    roughness: 0.92,
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
    new THREE.MeshStandardMaterial({ color: 0xb9b0a0, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  ground.receiveShadow = true
  group.add(ground)

  return group
}