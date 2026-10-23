import * as THREE from 'three';
export class FollowCamera {
 constructor(camera,canvas){this.camera=camera;this.up=new THREE.Vector3(0,1,0);this.back=new THREE.Vector3(0,0,1);this.initialized=false;this.yaw=0;this.drag=false;canvas.addEventListener('pointerdown',e=>{this.drag=true;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>this.drag=false);canvas.addEventListener('pointermove',e=>{if(this.drag)this.yaw-=e.movementX*.005;});}
 update(dt,body,overview=false){const q=new THREE.Quaternion().setFromUnitVectors(this.up,body.up);this.back.applyQuaternion(q).projectOnPlane(body.up).normalize();if(this.yaw){this.back.applyAxisAngle(body.up,this.yaw);this.yaw=0;}this.up.copy(body.up);const target=body.position.clone().addScaledVector(this.up,.9);const desired=target.clone().addScaledVector(this.back,overview?25:8).addScaledVector(this.up,overview?12:4.5);
 if(!this.initialized){this.camera.position.copy(desired);this.initialized=true;}else this.camera.position.lerp(desired,1-Math.exp(-7*dt));
 // Keep the camera outside the planet even during rapid changes of direction.
 if(this.camera.position.length()<13.8)this.camera.position.setLength(13.8);
 const look=target.clone();if(overview)look.addScaledVector(new THREE.Vector3().crossVectors(this.back,this.up),5.8);
 const z=this.camera.position.clone().sub(look).normalize();const x=new THREE.Vector3().crossVectors(this.up,z).normalize();const y=new THREE.Vector3().crossVectors(z,x).normalize();const rotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));this.camera.quaternion.slerp(rotation,this.initialized?1-Math.exp(-10*dt):1);
 }
}

