import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const BOUQUET_PATH = 'models/flower_bouquet.glb';
export function createBouquet() {
  const group = new THREE.Group();
  group.name = 'flower_bouquet';
  const base = import.meta.env?.BASE_URL ?? '/public/';
  group.userData.ready = new GLTFLoader().loadAsync(`${base}${BOUQUET_PATH}`).then(gltf => {
    const asset = gltf.scene;
    asset.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(asset);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = .8 / Math.max(size.x, size.y, size.z);
    // Use a wrapper so authored transforms and materials remain intact.
    const holder = new THREE.Group();
    holder.scale.setScalar(scale);
    asset.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z));
    holder.add(asset);
    holder.position.set(0, -.12, .28);
    asset.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
    group.add(holder);
    return group;
  }).catch(error => {
    console.error('Could not load flower_bouquet:', error);
    const toast = document.querySelector('#toast');
    if (toast) { toast.textContent = 'The bouquet could not load. Please refresh to try again.'; toast.classList.add('visible'); }
  });
  return group;
}
