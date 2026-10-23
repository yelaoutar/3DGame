import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Progression} from '../src/progression.js';
import {SphericalBody} from '../src/gravity.js';
import {MEETING} from '../src/story.js';

function fakeCharacter(){
 const root=new THREE.Group(),grip=new THREE.Group();root.add(grip);
 return {root,grip,holding:false,setHolding(value){this.holding=value;},update(){}};
}
function setup(){
 const scene=new THREE.Scene(),planet=new THREE.Group(),garden=new THREE.Group();scene.add(planet,garden);
 const player={body:new SphericalBody(),character:fakeCharacter(),reset(){this.body=new SphericalBody();}};scene.add(player.character.root);
 const dialogue={visible:false,addVoiceMessage(path){this.voiceMessage=path;},anchorTo(object){this.anchor=object;},show(title,text,choices,speaker){Object.assign(this,{title,text,choices,speaker,visible:true});},hide(){this.visible=false;},toast(){}};
 const collectibles={hearts:[],burst(){},reset(){}};
 const progression=new Progression(scene,planet,garden,player,dialogue,collectibles,fakeCharacter,()=>new THREE.Group());
 return {scene,player,dialogue,progression};
}
function advanceMeeting(p,d){p.meeting();for(const line of MEETING){assert.equal(d.title,line.title);assert.equal(d.speaker,line.speaker);d.choices[0][1]();}}

test('conversation alternates speakers and unlocks a portal; girl must follow after boy walks in',()=>{
 const {player,dialogue,progression:p}=setup();p.enterGarden();
 advanceMeeting(p,dialogue);
 assert.equal(p.stage,'boy-departing');assert.equal(dialogue.visible,false);assert.equal(p.secondPortal.visible,true);
 const before=p.boy.position.clone();p.update(.5,.5);assert.ok(p.boy.position.distanceTo(before)>.1);assert.equal(p.controlsLocked,false);
 p.update(3,3.5);assert.equal(p.stage,'follow-portal');assert.equal(p.boy.visible,false);assert.equal(p.flowerWorld.visible,false);
 player.body.position.copy(p.secondPortal.position);p.update(.01,4);
 assert.equal(p.stage,'flower-world');assert.equal(p.flowerWorld.visible,true);assert.equal(p.garden.visible,false);assert.equal(p.boy.visible,true);assert.equal(p.flowers.visible,true);
});

test('bouquet is handed to girl before proposal and both answers finish respectfully',()=>{
 for(const answer of [0,1]){
  const {scene,player,dialogue,progression:p}=setup();p.enterFlowerWorld();player.body.position.copy(p.boy.position);player.character.root.position.copy(player.body.position);scene.updateMatrixWorld(true);
  p.update(.01,0);assert.equal(dialogue.title,'These are for you.');dialogue.choices[0][1]();assert.equal(p.stage,'gift');assert.equal(p.controlsLocked,true);
  p.update(1.5,2);assert.equal(p.flowers.parent,player.character.grip);assert.equal(player.character.holding,true);assert.equal(p.boyCharacter.holding,false);assert.equal(dialogue.title,"I know I have a lot of flaws...");assert.match(dialogue.text,/for you, I will change/);dialogue.choices[0][1]();assert.equal(dialogue.title,'Will you be my girlfriend and my future wife?');
  dialogue.choices[answer][1]();assert.equal(p.stage,answer===0?'celebration':'ending');assert.equal(p.celebrating,answer===0);assert.equal(dialogue.voiceMessage,answer===0?'Recording.m4a':undefined);
  dialogue.choices[0][1]();assert.equal(dialogue.visible,false);assert.equal(p.controlsLocked,false);
  p.reset();assert.equal(p.stage,'explore');assert.equal(p.flowers.visible,false);assert.equal(p.boy.parent,p.garden);
 }
});
