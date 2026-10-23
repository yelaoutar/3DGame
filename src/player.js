import * as THREE from 'three';
import {createCharacter} from './character.js';
import {SphericalBody} from './gravity.js';
export class Player {
 constructor(scene){this.body=new SphericalBody();this.character=createCharacter();scene.add(this.character.root);this.keys=new Set();this.forward=new THREE.Vector3(0,0,-1);this.oldUp=new THREE.Vector3(0,1,0);this.time=0;this.jumpQueued=false;addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();this.keys.add(e.code);if(e.code==='Space'&&!e.repeat)this.jumpQueued=true;});addEventListener('keyup',e=>this.keys.delete(e.code));addEventListener('blur',()=>{this.keys.clear();this.jumpQueued=false;});}
 update(dt,camera,enabled){const up=this.body.up;const wish=new THREE.Vector3();if(enabled){const forward=camera.getWorldDirection(new THREE.Vector3()).projectOnPlane(up).normalize();const right=new THREE.Vector3().crossVectors(forward,up).normalize();const k=this.keys;wish.addScaledVector(forward,Number(k.has('KeyW')||k.has('ArrowUp'))-Number(k.has('KeyS')||k.has('ArrowDown')));wish.addScaledVector(right,Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft')));if(wish.lengthSq())wish.normalize();}
 this.body.step(dt,wish,enabled&&this.jumpQueued);this.jumpQueued=false;const transport=new THREE.Quaternion().setFromUnitVectors(this.oldUp,this.body.up);this.forward.applyQuaternion(transport);if(wish.lengthSq())this.forward.lerp(wish,1-Math.exp(-12*dt));this.forward.projectOnPlane(this.body.up).normalize();const right=new THREE.Vector3().crossVectors(this.body.up,this.forward).normalize();const orientation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,this.body.up,this.forward));this.character.root.quaternion.copy(orientation);this.character.root.position.copy(this.body.position);this.oldUp.copy(this.body.up);
 const speed=this.body.velocity.clone().projectOnPlane(this.body.up).length();this.time+=dt;this.character.update(dt,speed,this.body.grounded);
 }
 reset(){this.body=new SphericalBody();this.forward.set(0,0,-1);this.oldUp.set(0,1,0);this.keys.clear();}
}
