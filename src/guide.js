import * as THREE from 'three';

// Great-circle guidance stays useful even when a goal is on the far side.
export function goalBearing(position, target, camera) {
  const up = position.clone().normalize();
  const normal = target.clone().normalize();
  const distance = up.angleTo(normal) * position.length();
  const direction = normal.clone().projectOnPlane(up);
  const forward = camera.getWorldDirection(new THREE.Vector3()).projectOnPlane(up).normalize();
  if (direction.lengthSq() < 1e-8) direction.copy(forward);
  direction.normalize();
  const right = new THREE.Vector3().crossVectors(forward, up).normalize();
  return {angle: Math.atan2(direction.dot(right), direction.dot(forward)), distance};
}
export class Guide {
  constructor() {
    this.hearts = [...document.querySelectorAll('.hud-heart')];
    this.hud = document.querySelector('#heart-hud');
    this.panel = document.querySelector('#guide');
    this.arrow = document.querySelector('#guide-arrow');
    this.text = document.querySelector('#guide-text');
    this.detail = document.querySelector('#guide-detail');
    this.lastCount = -1;
  }
  update(player, camera, progression, collectibles) {
    const {count, stage} = progression;
    if (count !== this.lastCount) {
      this.hearts.forEach((heart, i) => {
        heart.classList.toggle('collected', i < count);
      });
      this.hud.setAttribute('aria-label', `Hearts: ${count} of 5 collected`);
      this.lastCount = count;
    }
    let target, label;
    if (stage === 'explore' && count < 5) {
      const up = player.body.up;
      const remaining = collectibles.hearts.filter(h => !h.collected);
      remaining.sort((a,b) => up.angleTo(a.group.position.clone().normalize()) - up.angleTo(b.group.position.clone().normalize()));
      target = remaining[0]?.group.position;
      label = 'Follow your heart';
    } else if (stage === 'explore') {
      target = progression.portal.position;
      label = 'The portal is open!';
    } else if (stage === 'boy-departing' || stage === 'follow-portal') {
      target = progression.secondPortal.position;
      label = stage === 'boy-departing' ? 'Youssef is opening the way' : 'Follow Youssef through the portal';
    } else if (stage === 'garden' || stage === 'flower-world') {
      target = progression.boy.getWorldPosition(new THREE.Vector3());
      label = stage === 'flower-world' ? 'Youssef has something for you' : 'Someone is waiting for you';
    }
    this.panel.hidden = !target;
    if (!target) return;
    const bearing = goalBearing(player.body.position, target, camera);
    this.arrow.style.transform = `rotate(${bearing.angle}rad)`;
    this.panel.classList.toggle('portal-guide', count === 5);
    this.text.textContent = label;
    const turn = Math.abs(bearing.angle) > 2.4 ? 'Turn around' : bearing.angle > .4 ? 'Head right' : bearing.angle < -.4 ? 'Head left' : 'Straight ahead';
    this.detail.textContent = bearing.distance < 2 ? 'You’re almost there!' : `${turn} · ${Math.ceil(bearing.distance)} steps${bearing.distance > 19 ? ' · Around the planet' : ''}`;
  }
}
