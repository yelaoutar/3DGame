import * as THREE from 'three';
export const RADIUS=12;
export class SphericalBody {
 constructor(radius=RADIUS){this.radius=radius;this.position=new THREE.Vector3(0,radius,0);this.velocity=new THREE.Vector3();this.up=new THREE.Vector3(0,1,0);this.grounded=true;}
 step(dt,wish,jump=false){
  const up=this.position.clone().normalize();
  const radial=this.velocity.dot(up); const tangent=this.velocity.clone().addScaledVector(up,-radial);
  const target=wish.clone().multiplyScalar(4.3); tangent.lerp(target,1-Math.exp(- (wish.lengthSq()?9:12)*dt));
  this.velocity.copy(tangent).addScaledVector(up,radial);
  if(jump&&this.grounded){this.velocity.addScaledVector(up,7);this.grounded=false;}
  this.velocity.addScaledVector(up,-18*dt);this.position.addScaledVector(this.velocity,dt);
  const distance=this.position.length();this.up.copy(this.position).normalize();
  this.grounded=distance<=this.radius+0.002&&this.velocity.dot(this.up)<=0;
  if(distance<this.radius){this.position.copy(this.up).multiplyScalar(this.radius);this.velocity.addScaledVector(this.up,-this.velocity.dot(this.up));this.grounded=true;}
 }
}
