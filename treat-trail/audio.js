/* Original, softly synthesized music. Audio begins only after a play/continue tap.
   Level.music selects a track; additional levels can have independent melodies. */
export const TRACKS = Object.freeze({
  meadow: {bpm: 102, wave: 'sine', root: 60,
    melody: [12,0,16,19,21,19,16,0,14,17,21,0,19,17,14,0,
      12,16,19,24,23,19,16,0,14,0,17,19,16,14,12,0,
      21,0,19,16,17,21,24,0,23,19,17,14,16,19,24,0,
      21,19,16,12,14,17,19,0,16,0,14,11,12,0,0,0],
    chords: [[0,4,7],[-3,0,4],[-5,0,4],[-7,-3,0],[-5,-1,2],[-3,0,4],[-5,-1,2],[-7,-3,0]]}
});
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
export class TrailAudio {
  constructor(settings, report = () => {}) {
    this.settings = settings; this.report = report; this.ctx = null;
    this.voices = new Set(); this.timer = null; this.song = null; this.step = 0; this.next = 0;
  }
  unlock() {
    try {
      if (!this.ctx) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw new Error('Web Audio unavailable');
        this.ctx = new Context();
        this.master = this.ctx.createGain(); this.music = this.ctx.createGain(); this.effects = this.ctx.createGain();
        this.music.connect(this.master); this.effects.connect(this.master); this.master.connect(this.ctx.destination);
        this.apply(this.settings);
      }
      const ready = this.ctx.state === 'running' ? Promise.resolve() : this.ctx.resume();
      ready.then(() => { if (this.song && !this.timer) this.schedule(); }).catch(() => this.report('Tap Sound or Play to enable audio.'));
      return ready;
    } catch (_) { this.report('Sound is unavailable here. You can still play quietly.'); return Promise.resolve(); }
  }
  apply(s) {
    this.settings = {...s};
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : .7, t, .025);
    this.music.gain.setTargetAtTime(s.music / 100, t, .025);
    this.effects.gain.setTargetAtTime(s.effects / 100, t, .025);
  }
  tone(midi, when, duration, volume = .16, bus = 'music', wave = 'sine', endMidi = null) {
    if (!this.ctx || this.ctx.state !== 'running' || this.voices.size >= 48) return;
    const c = this.ctx, start = Math.max(c.currentTime, when);
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = wave; osc.frequency.setValueAtTime(hz(midi), start);
    if (endMidi !== null) osc.frequency.exponentialRampToValueAtTime(hz(endMidi), start + duration * .8);
    gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain); gain.connect(this[bus]);
    const v = {source: osc, gain}; this.voices.add(v);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); this.voices.delete(v); };
    osc.start(start); osc.stop(start + duration + .015);
  }
  start(id = 'meadow') {
    this.stopVoices(); this.song = TRACKS[id] || TRACKS.meadow; this.step = 0;
    if (this.ctx?.state === 'running') this.schedule();
    // unlock() resumes from the play click, never from this timer.
  }
  schedule() {
    if (!this.ctx || !this.song || this.ctx.state !== 'running' || this.timer) return;
    this.next = this.ctx.currentTime + .045;
    const pump = () => {
      if (!this.song || this.ctx.state !== 'running') return;
      const track = this.song, length = 60 / track.bpm / 2;
      if (this.next < this.ctx.currentTime - .1) this.next = this.ctx.currentTime + .04;
      while (this.next < this.ctx.currentTime + .15) {
        const i = this.step % track.melody.length, n = track.melody[i];
        const chord = track.chords[Math.floor(i / 8) % track.chords.length];
        if (n) {
          this.tone(track.root + n, this.next, .31, .19, 'music', track.wave);
          this.tone(track.root + n + 12, this.next, .12, .025, 'music');
        }
        if (i % 4 === 0) this.tone(track.root + chord[0] - 12, this.next, .43, .20, 'music', 'triangle');
        if (i % 8 === 0) chord.forEach((note, k) => this.tone(track.root + note, this.next + .025 * k, .8, .045));
        this.step++; this.next += length;
      }
    };
    pump(); this.timer = setInterval(pump, 25);
  }
  fx(type, count = 0) {
    if (!this.ctx || this.ctx.state !== 'running' || this.settings.muted || !this.settings.effects) return;
    const t = this.ctx.currentTime;
    const note = (n, delay = 0, dur = .16, vol = .18, end = null) => this.tone(n, t + delay, dur, vol, 'effects', 'sine', end);
    if (type === 'jump') note(67, 0, .15, .16, 79);
    if (type === 'treat') { const n = [76,79,81,84,88][count % 5]; note(n,0,.14); note(n+7,.06,.2,.11); }
    if (type === 'checkpoint') [72,76,79,84].forEach((n,i) => note(n,i*.08,.24,.16));
    if (type === 'rescue') { note(66,0,.28,.14,48); note(72,.17,.17,.07); }
    if (type === 'pop') {
      if (this.settings.gentle) { note(88,0,.23,.055); return; }
      const c=this.ctx, buffer=c.createBuffer(1,Math.ceil(c.sampleRate*.09),c.sampleRate), data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length)**2;
      const source=c.createBufferSource(), filter=c.createBiquadFilter(), gain=c.createGain();
      source.buffer=buffer; filter.type='lowpass';filter.frequency.value=1800;gain.gain.value=.15;
      source.connect(filter);filter.connect(gain);gain.connect(this.effects);
      const v={source,gain};this.voices.add(v);
      source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(v);};source.start();
    }
  }
  victory(perfect) {
    this.song = null; this.stopVoices();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + .03;
    [72,76,79,84,81,84,88,91,88,84].forEach((n,i) => this.tone(n,t+i*.18,.33,.22));
    [60,64,67,72].forEach((n,i) => this.tone(n,t+1.95+i*.045,1,.09));
    if (perfect) [84,88,91,96].forEach((n,i) => this.tone(n,t+2.7+i*.12,.44,.15));
  }
  stopVoices() {
    clearInterval(this.timer);this.timer=null;
    for(const v of [...this.voices]) {try{v.source.stop();}catch(_){}try{v.source.disconnect();v.gain.disconnect();}catch(_){}this.voices.delete(v);}
  }
  pause() {
    this.song = null; this.stopVoices();
    if (this.ctx?.state === 'running') this.ctx.suspend().catch(() => {});
  }
}
