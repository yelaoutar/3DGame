import {createBouquet} from './bouquet.js';
import * as THREE from 'three';
import {surfaceGroup,createFlowerWorld} from './planet.js';
import {mesh,material} from './scene.js';
import {createCharacter} from './character.js';
import {MEETING} from './story.js';

function createPortal(parent, normal) {
  const group=surfaceGroup(parent,normal.clone().normalize());
  mesh(new THREE.TorusGeometry(1.1,.13,12,64),material('#cfb5ff',{emissive:'#ae7cff',emissiveIntensity:2}),group,[0,1.3,0]);
  const disk=mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({color:'#c8a9ff',transparent:true,opacity:.45,side:THREE.DoubleSide}),group,[0,1.3,0]);
  group.visible=false;
  return {group,disk};
}
export class Progression {
  constructor(scene,planet,garden,player,dialogue,collectibles,characterFactory=createCharacter,bouquetFactory=createBouquet) {
    Object.assign(this,{scene,planet,garden,player,dialogue,collectibles});
    this.count=0;this.stage='explore';this.celebrating=false;
    const first=createPortal(scene,new THREE.Vector3(0,1,.35));
    this.portal=first.group;this.disk=first.disk;
    const second=createPortal(garden,new THREE.Vector3(.27,1,-.22));
    this.secondPortal=second.group;this.secondDisk=second.disk;
    this.flowerWorld=createFlowerWorld(scene);
    this.boyCharacter=characterFactory(true);
    this.boy=surfaceGroup(garden,new THREE.Vector3(0,1,-.17).normalize());
    this.boy.add(this.boyCharacter.root);
    this.boyPosition=new THREE.Vector3();this.departureTime=0;this.giftTime=0;
    this.flowers=bouquetFactory();this.flowers.visible=false;
    this.boyCharacter.grip.add(this.flowers);this.flowers.position.set(0,0,0);
  }
  get controlsLocked(){return this.stage==='dialogue'||this.stage==='gift';}
  collect(i) {
    const messages=['Every adventure is better with you.','You make ordinary moments feel like magic.',"In every universe, I'd find my way to you.",'You are my favorite place to come home to.','This little universe has one more secret for you.'];
    this.count++;this.dialogue.toast(messages[i]);
    if(this.count===5)this.portal.visible=true;
  }
  spawnPlayer(normal) {
    this.player.reset();
    this.player.body.position.copy(normal).normalize().multiplyScalar(12);
    this.player.body.up.copy(this.player.body.position).normalize();
  }
  enterGarden() {
    this.stage='garden';this.planet.visible=false;this.portal.visible=false;
    this.collectibles.hearts.forEach(h=>h.group.visible=false);
    this.garden.visible=true;this.spawnPlayer(new THREE.Vector3(0,.92,.39));
    this.dialogue.toast('You found it. A little place just for us.');
  }
  say(speaker,title,text,choices) {
    this.dialogue.anchorTo(speaker==='You'?this.player.character.root:this.boy);
    this.dialogue.show(title,text,choices,speaker);
  }
  meeting(index=0) {
    this.stage='dialogue';const line=MEETING[index];
    this.say(line.speaker,line.title,line.text,[[line.next,()=>index+1<MEETING.length?this.meeting(index+1):this.openSecondPortal()]]);
  }
  openSecondPortal() {
    this.dialogue.hide();this.stage='boy-departing';this.departureTime=0;
    this.departureStart=this.boy.position.clone().normalize();
    this.secondPortal.visible=true;
    this.collectibles.burst(this.secondPortal.position.clone().multiplyScalar(1.1),'#cfb5ff',45);
    this.dialogue.toast('Youssef opened a portal. Follow him!');
  }
  enterFlowerWorld() {
    this.stage='flower-world';this.garden.visible=false;this.flowerWorld.visible=true;
    this.spawnPlayer(new THREE.Vector3(0,1,.4));
    this.flowerWorld.add(this.boy);this.boy.visible=true;
    this.boy.position.set(0,1,-.12).normalize().multiplyScalar(12);
    this.boy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),this.boy.position.clone().normalize());
    this.boyCharacter.root.rotation.y=0;
    this.flowers.visible=true;this.boyCharacter.setHolding(true);this.boyCharacter.update(0);
    this.dialogue.toast('A new little universe. And something just for you.');
  }
  startGift() {
    this.dialogue.hide();this.stage='gift';this.giftTime=0;
    this.player.character.setHolding(true);this.player.character.update(0);
    this.flowers.getWorldPosition(this.giftStart=new THREE.Vector3());
    this.scene.attach(this.flowers);
  }
  update(dt,time) {
    let walking=0;this.disk.rotation.z=time*.4;this.secondDisk.rotation.z=-time*.5;
    if(this.stage==='explore'&&this.count===5&&this.player.body.position.distanceTo(this.portal.position)<2)this.enterGarden();
    if(this.stage==='garden') {
      this.boy.getWorldPosition(this.boyPosition);
      if(this.player.body.position.distanceTo(this.boyPosition)<2.5)this.meeting();
    }
    if(this.stage==='boy-departing') {
      this.departureTime+=dt;
      const t=Math.min(this.departureTime/2.8,1);
      const end=this.secondPortal.position.clone().normalize();
      const rotation=new THREE.Quaternion().setFromUnitVectors(this.departureStart,end);
      const normal=this.departureStart.clone().applyQuaternion(new THREE.Quaternion().slerp(rotation,t));
      this.boy.position.copy(normal).multiplyScalar(12);
      this.boy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
      const direction=end.clone().projectOnPlane(normal);
      if(direction.lengthSq()>.00001){direction.normalize();direction.applyQuaternion(this.boy.quaternion.clone().invert());this.boyCharacter.root.rotation.y=Math.atan2(direction.x,direction.z);}
      walking=2;
      if(t===1){this.boy.visible=false;this.stage='follow-portal';this.collectibles.burst(this.secondPortal.position.clone().multiplyScalar(1.1),'#cfb5ff',35);}
    }
    if(this.stage==='follow-portal'&&this.player.body.position.distanceTo(this.secondPortal.position)<1.8)this.enterFlowerWorld();
    if(this.stage==='flower-world') {
      this.boy.getWorldPosition(this.boyPosition);
      if(this.player.body.position.distanceTo(this.boyPosition)<2.5){
        this.stage='dialogue';this.say('Youssef','These are for you.',"A little bouquet for the person who makes my universe bloom.",[['Take the flowers',()=>this.startGift()]]);
      }
    }
    if(this.stage==='gift') {
      this.giftTime+=dt;const t=Math.min(this.giftTime/1.4,1),smooth=t*t*(3-2*t);
      const end=this.player.character.grip.getWorldPosition(new THREE.Vector3());
      this.flowers.position.lerpVectors(this.giftStart,end,smooth).addScaledVector(this.player.body.up,Math.sin(t*Math.PI)*.4);
      if(t===1){this.player.character.grip.attach(this.flowers);this.flowers.position.set(0,0,0);this.flowers.quaternion.identity();this.flowers.scale.setScalar(1);this.boyCharacter.setHolding(false);this.beforeProposal();}
    }
    this.boyCharacter.update(dt,walking);
    if(this.celebrating&&Math.random()<dt*7){
      const p=this.player.body.position.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(5)).addScaledVector(this.player.body.up,4);
      this.collectibles.burst(p,['#ffd493','#ff9fcc','#c4b3ff'][Math.floor(Math.random()*3)],35,true);
    }
  }
  beforeProposal() {
    this.stage='dialogue';
    this.say('Youssef',"I know I have a lot of flaws...", "But for you, I will change. I want to work on myself and become a better person.", [['Continue',()=>this.propose()]]);
  }
  propose() {
    this.stage='dialogue';
    this.say('Youssef','Will you be my girlfriend?',"I'd love to share all the adventures ahead with you.",[
      ['Yes!',()=>{this.celebrating=true;this.stage='celebration';this.say('Youssef','My favorite universe is ours.',"Here's to our next chapter, together.",[['Stay a little longer',()=>this.dialogue.hide()]]);}],
      ["Let's talk about it",()=>{this.stage='ending';this.say('Youssef','Always, at your pace.',"No pressure, no expectations. You mean so much to me, and I'd love to hear how you feel.",[['Enjoy this little universe',()=>this.dialogue.hide()]]);}]
    ]);
  }
  reset() {
    this.boyCharacter.setHolding(false);this.player.character.setHolding(false);
    this.count=0;this.stage='explore';this.celebrating=false;this.planet.visible=true;this.garden.visible=false;this.flowerWorld.visible=false;
    this.portal.visible=false;this.secondPortal.visible=false;this.player.reset();this.collectibles.reset();this.dialogue.hide();
    this.garden.add(this.boy);this.boy.visible=true;this.boy.position.set(0,1,-.17).normalize().multiplyScalar(12);
    this.boy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),this.boy.position.clone().normalize());
    this.boyCharacter.root.rotation.y=0;this.boyCharacter.grip.add(this.flowers);this.flowers.position.set(0,0,0);this.flowers.quaternion.identity();this.flowers.scale.setScalar(1);this.flowers.visible=false;
  }
}
