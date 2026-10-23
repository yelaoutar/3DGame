import * as THREE from 'three';

// Keep the prop at the midpoint of the palms, with character-local scale/orientation.
export function updateHandGrip(root, grip, leftArm, rightArm) {
  root.updateWorldMatrix(true, true);
  // Kenney arm geometry extends along local X, not down local Y.
  const left = leftArm.localToWorld(new THREE.Vector3(.12, 0, 0));
  const right = rightArm.localToWorld(new THREE.Vector3(-.12, 0, 0));
  grip.position.copy(root.worldToLocal(left.add(right).multiplyScalar(.5)));
}
