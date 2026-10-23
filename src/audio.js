export class SoundEffects {
  constructor() {
    this.context = null;
    this.muted = false;
    const unlock = () => {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') this.context.resume();
    };
    addEventListener('pointerdown', unlock);
    addEventListener('keydown', event => {
      unlock();
      if (event.code === 'KeyM' && !event.repeat) {
        this.muted = !this.muted;
        document.querySelector('#audio-hint').textContent = this.muted ? 'M · Sound off' : 'M · Sound on';
      }
    });
  }
  play(name) {
    if (!this.context || this.muted || this.context.state !== 'running') return;
    const patterns = {
      jump: [[330, .00, .17, 660]],
      land: [[130, .00, .08, 75]],
      heart: [[523, 0, .25], [659, .09, .3], [784, .18, .45]],
      unlock: [[523, 0, .4], [659, .13, .4], [784, .26, .4], [1047, .4, .7]],
      portal: [[220, 0, .9, 880], [330, .15, .9, 1320]],
      dialogue: [[659, 0, .15], [784, .1, .3]],
      celebration: [[523, 0, .4], [659, .12, .4], [784, .24, .4], [1047, .4, 1]],
    };
    for (const [frequency, delay, duration, end] of patterns[name] ?? []) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const t = this.context.currentTime + delay;
      oscillator.type = name === 'jump' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, t);
      if (end) oscillator.frequency.exponentialRampToValueAtTime(end, t + duration);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(.055, t + .012);
      gain.gain.exponentialRampToValueAtTime(.001, t + duration);
      oscillator.connect(gain);gain.connect(this.context.destination);
      oscillator.start(t);oscillator.stop(t + duration + .02);
      oscillator.onended = () => { oscillator.disconnect();gain.disconnect(); };
    }
  }
}
