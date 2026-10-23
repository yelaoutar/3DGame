import { CHARACTER_HEIGHT } from './character-config.js';
import * as THREE from 'three';

export class Dialogue {
  constructor() {
    this.panel = document.querySelector('#dialogue');
    this.timer = 0;
    this.anchor = null;
    this.position = new THREE.Vector3();
    this.panel.querySelector('.eyebrow').textContent = 'A LITTLE SOMETHING TO TELL YOU';
  }
  toast(text) {
    const el = document.querySelector('#toast');
    el.textContent = text;
    el.classList.add('visible');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => el.classList.remove('visible'), 5500);
  }
  anchorTo(object) {
    this.anchor = object;
    this.panel.classList.add('speech-bubble');
    this.panel.setAttribute('aria-modal', 'false');
  }
  update(camera, playerPosition) {
    if (!this.anchor || this.panel.classList.contains('hidden')) return;
    this.anchor.updateWorldMatrix(true, false);
    this.position.set(0, CHARACTER_HEIGHT + .4, 0).applyMatrix4(this.anchor.matrixWorld);
    const head = this.position.clone();
    this.position.project(camera);
    // Hide when behind the camera or hidden by the spherical ground.
    const ray = head.clone().sub(camera.position);
    const t = THREE.MathUtils.clamp(-camera.position.dot(ray) / ray.lengthSq(), 0, 1);
    const blocked = camera.position.clone().addScaledVector(ray, t).length() < 11.95;
    this.panel.style.visibility = this.position.z > 1 || blocked ? 'hidden' : 'visible';
    const width = Math.min(330, innerWidth - 32);
    const x = (this.position.x * .5 + .5) * innerWidth;
    const left = THREE.MathUtils.clamp(x, width / 2 + 16, innerWidth - width / 2 - 16);
    const y = (-this.position.y * .5 + .5) * innerHeight;
    const height = this.panel.getBoundingClientRect().height;
    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${THREE.MathUtils.clamp(y - 18, height + 85, innerHeight - 85)}px`;
    this.panel.style.setProperty('--tail-x', `${THREE.MathUtils.clamp(x - left + width / 2, 24, width - 24)}px`);
  }
  show(title, text, choices, speaker = 'Youssef') {
    this.clearVoiceMessage();
    this.panel.querySelector('.eyebrow').textContent = speaker;
    document.querySelector('#dialogue-title').textContent = title;
    document.querySelector('#dialogue-text').textContent = text;
    const root = document.querySelector('#choices');
    root.replaceChildren();
    choices.forEach(([label, action]) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.className = 'primary';
      button.onclick = action;
      root.append(button);
    });
    this.panel.classList.remove('hidden');
    root.querySelector('button')?.focus({preventScroll:true});
  }
  clearVoiceMessage() {
    if (this.voiceAudio) { this.voiceAudio.pause();this.voiceAudio.removeAttribute('src');this.voiceAudio.load();this.voiceAudio=null; }
    this.panel.querySelector('.voice-message')?.remove();
  }
  addVoiceMessage(path) {
    this.clearVoiceMessage();
    const section=document.createElement('div');
    section.className='voice-message';
    const label=document.createElement('p');
    label.textContent='A message from me, just for you.';
    const audio=document.createElement('audio');
    audio.controls=true;audio.preload='metadata';
    audio.setAttribute('aria-label', "Listen to Youssef's message");
    audio.src=`${import.meta.env?.BASE_URL ?? '/public/'}${path}`;
    audio.addEventListener('error',()=>{label.textContent='The message could not load. Please try refreshing.';audio.hidden=true;});
    section.append(label,audio);
    document.querySelector('#choices').before(section);
    this.voiceAudio=audio;
  }
  hide() {
    this.clearVoiceMessage();
    this.panel.classList.add('hidden');
    this.panel.classList.remove('speech-bubble');
    this.panel.style.cssText = '';
    this.anchor = null;
  }
}
