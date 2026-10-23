import { Guide } from './guide.js';
import { SoundEffects } from './audio.js';
import * as THREE from 'three';
import {createScene} from './scene.js';
import {createPlanet,createGarden} from './planet.js';
import {Player} from './player.js';
import {FollowCamera} from './camera.js';
import {Collectibles} from './collectibles.js';
import {Dialogue} from './dialogue.js';
import {Progression} from './progression.js';
const canvas=document.querySelector('#game');const {scene,camera,renderer}=createScene(canvas);const planet=createPlanet(scene),garden=createGarden(scene),player=new Player(scene),follow=new FollowCamera(camera,canvas),dialogue=new Dialogue();let progression;const guide=new Guide(),audio=new SoundEffects();const collectibles=new Collectibles(scene,i=>{progression.collect(i);audio.play(progression.count===5?'unlock':'heart');});progression=new Progression(scene,planet,garden,player,dialogue,collectibles);const started=true;


let wasCelebrating=false;let previous=performance.now(),time=0;function frame(now){const dt=Math.min((now-previous)/1000,.05);previous=now;time+=dt;const enabled=started&&!progression.controlsLocked&&document.querySelector('#dialogue').classList.contains('hidden');for(let t=0;t<dt;){const step=Math.min(1/120,dt-t);const wasGrounded=player.body.grounded;player.update(step,camera,enabled);if(wasGrounded&&!player.body.grounded&&player.body.velocity.dot(player.body.up)>1)audio.play('jump');else if(!wasGrounded&&player.body.grounded)audio.play('land');t+=step;}follow.update(dt,player.body,!started);collectibles.update(dt,time,player.body.position,started&&progression.stage==='explore');const oldStage=progression.stage;progression.update(dt,time);if(oldStage!==progression.stage)audio.play(['garden','flower-world','boy-departing'].includes(progression.stage)?'portal':progression.stage==='dialogue'?'dialogue':'');if(progression.celebrating&&!wasCelebrating)audio.play('celebration');wasCelebrating=progression.celebrating;guide.update(player,camera,progression,collectibles);dialogue.update(camera,player.body.position);renderer.render(scene,camera);requestAnimationFrame(frame);}follow.update(1,player.body,false);requestAnimationFrame(frame);
