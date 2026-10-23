import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {updateHandGrip} from '../src/hand-grip.js';
test('bouquet grip follows moving hands even underneath the planet without inheriting model scale',()=>{
 const root=new THREE.Group(),asset=new THREE.Group(),grip=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();
 root.add(asset,grip);asset.scale.setScalar(3);asset.add(left,right);left.position.set(-.1,.4,.1);right.position.set(.1,.4,.1);
 root.position.set(0,-12,0);root.rotation.z=Math.PI;
 updateHandGrip(root,grip,left,right);assert.ok(grip.position.distanceTo(new THREE.Vector3(0,1.2,.3))<1e-8);assert.equal(grip.scale.x,1);
 left.position.z=.2;right.position.z=.2;updateHandGrip(root,grip,left,right);assert.ok(Math.abs(grip.position.z-.6)<1e-8);
});

test('holding pose projects the palms forward rather than dropping the bouquet into the waist',()=>{
 const root=new THREE.Group(),asset=new THREE.Group(),grip=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();
 root.add(asset,grip);asset.scale.setScalar(3);asset.add(left,right);
 left.position.set(.1,.4,0);right.position.set(-.1,.4,0);
 left.rotation.y=-Math.PI/3;right.rotation.y=Math.PI/3;
 updateHandGrip(root,grip,left,right);
 assert.ok(Math.abs(grip.position.y-1.2)<1e-8);
 assert.ok(grip.position.z>.3);
 assert.ok(Math.abs(grip.position.x)<1e-8);
});
