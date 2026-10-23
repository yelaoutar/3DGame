import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {goalBearing} from '../src/guide.js';

test('guidance points along the surface and stays consistent underneath the planet',()=>{
  const position=new THREE.Vector3(0,12,0);
  const target=new THREE.Vector3(0,0,-12);
  const camera=new THREE.PerspectiveCamera();
  camera.position.set(0,18,8);camera.lookAt(position);
  const first=goalBearing(position,target,camera);
  assert.ok(Math.abs(first.angle)<1e-8);
  assert.ok(Math.abs(first.distance-6*Math.PI)<1e-8);
  const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI);
  position.applyQuaternion(rotation);target.applyQuaternion(rotation);
  camera.position.applyQuaternion(rotation);camera.quaternion.premultiply(rotation);
  const underside=goalBearing(position,target,camera);
  assert.ok(Math.abs(underside.angle-first.angle)<1e-8);
  assert.ok(Math.abs(underside.distance-first.distance)<1e-8);
});
