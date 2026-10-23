import {updateHandGrip} from './hand-grip.js';
import * as THREE from 'three';
import { CHARACTER_HEIGHT, CHARACTER_MODELS } from './character-config.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// The controller owns the root orientation; animation stays inside its model group.
export function createCharacter(boy = false) {
  const root = new THREE.Group();
  const model = new THREE.Group();
  root.add(model);
  const grip = new THREE.Group();
  grip.name = 'bouquet-hand-grip';
  grip.position.set(0, .9, .24);
  root.add(grip);
  let mixer, holdingPose, leftArm, rightArm, holding = false, actions, current, desired = 'idle';
  const character = {
    root, model, grip,
    setHolding(value) { holding = value; },
    update(dt, speed = 0, grounded = true) {
      desired = !grounded ? 'jump' : speed > .3 ? 'walk' : 'idle';
      if (actions && current !== desired) {
        const next = actions[desired];
        if (next) {
          next.reset().fadeIn(.18).play();
          if (current) actions[current].fadeOut(.18);
          current = desired;
        }
      }
      if (mixer) mixer.update(dt);
      if (holding && holdingPose) {
        // Apply the two-handed pose after locomotion, to the arms only.
        for (const {arm,position,quaternion,scale} of holdingPose) {
          arm.position.copy(position);arm.quaternion.copy(quaternion);arm.scale.copy(scale);
        }
        updateHandGrip(root, grip, leftArm, rightArm);
      }
    },
  };
  const modelPath = CHARACTER_MODELS[boy ? 'boy' : 'girl'];
  const assetBase = import.meta.env?.BASE_URL ?? '/public/';
  character.ready = new GLTFLoader().loadAsync(`${assetBase}${modelPath}`).then(gltf => {
    const asset = gltf.scene;
    asset.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(asset);
    const scale = CHARACTER_HEIGHT / bounds.getSize(new THREE.Vector3()).y;
    asset.scale.setScalar(scale);
    asset.position.y = -bounds.min.y * scale;
    {
      const center = bounds.getCenter(new THREE.Vector3());
      asset.position.x = -center.x * scale;
      asset.position.z = -center.z * scale;
    }
    asset.traverse(node => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        // The head atlas stores hair in the brown swatch; skin uses a separate swatch.
        if (!boy && node.name === 'head-mesh') {
          node.material = node.material.clone();
          node.material.onBeforeCompile = shader => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              `#include <map_fragment>
              #ifdef USE_MAP
                if (vMapUv.x > 0.65 && vMapUv.x < 0.8 && vMapUv.y > 0.75) {
                  diffuseColor.rgb *= vec3(0.42, 0.30, 0.24);
                }
              #endif`
            );
          };
          node.material.customProgramCacheKey = () => 'girl-dark-brown-hair';
        }

      }
    });
    model.add(asset);
    mixer = new THREE.AnimationMixer(asset);
    actions = Object.fromEntries((gltf.animations ?? []).map(clip => [clip.name, mixer.clipAction(clip)]));
    leftArm = asset.getObjectByName('arm-left');
    rightArm = asset.getObjectByName('arm-right');
    const holdingClip = gltf.animations.find(clip => clip.name === 'holding-both');
    if (holdingClip && leftArm && rightArm) {
      const armsOnly = holdingClip.clone();
      armsOnly.tracks = armsOnly.tracks.filter(track => /arm-left|arm-right/.test(track.name));
      const poseMixer = new THREE.AnimationMixer(asset);
      poseMixer.clipAction(armsOnly).play();
      poseMixer.update(0);
      holdingPose = [leftArm,rightArm].map(arm => ({arm,position:arm.position.clone(),quaternion:arm.quaternion.clone(),scale:arm.scale.clone()}));
      poseMixer.stopAllAction();
      poseMixer.uncacheRoot(asset);
    }
    character.update(0);
    return character;
  }).catch(error => {
    console.error('Character model could not load:', error);
    const message = document.querySelector('#toast');
    message.textContent = 'Could not load a character. Please refresh the page.';
    message.classList.add('visible');
  });
  return character;
}
