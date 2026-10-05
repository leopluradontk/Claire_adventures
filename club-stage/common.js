import {StageAudio} from './audio.js';
import {StudioStore} from '../studios/model.js';
export const $=id=>document.getElementById(id);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function common(onPause=()=>{}){
 enableButtonTaps();
 const prefs=new StudioStore(),motion=matchMedia('(prefers-reduced-motion: reduce)');let settings=prefs.settings(),timer,returnFocus;
 const audio=new StageAudio(settings,notify);
 const modal=$('activityDialog'),toast=$('notice');
 function notify(s){toast.textContent=s;toast.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('visible'),4000);}
 function apply(){const gentle=settings.gentle||motion.matches;audio.apply({...settings,gentle});document.body.classList.toggle('gentle',gentle);document.body.classList.toggle('large-targets',settings.large);$('soundButton').textContent=settings.muted?'Sound off':'Sound on';$('soundButton').setAttribute('aria-pressed',String(settings.muted));if(settings.muted)globalThis.speechSynthesis?.cancel();}
 function open(title,html,setup=()=>{}){onPause();audio.pause();globalThis.speechSynthesis?.cancel();returnFocus=document.activeElement;modal.innerHTML='<header class="dialog-top"><h2>'+esc(title)+'</h2><button type="button" id="dialogX" class="quiet" aria-label="Close dialog">Close</button></header>'+html;if(!modal.open)modal.showModal();$('dialogX').onclick=close;setup(modal);modal.querySelector('button,input')?.focus({preventScroll:true});}
 function close(){modal.close();returnFocus?.focus?.({preventScroll:true});}
 function ask(title,text,yes='Yes, please'){return new Promise(resolve=>{
  open(title,'<p>'+esc(text)+'</p><div class="dialog-actions"><button id="askNo" class="quiet">Keep playing</button><button id="askYes" class="primary">'+esc(yes)+'</button></div>');
  let done=false;const end=v=>{if(done)return;done=true;modal.removeEventListener('cancel',cancel);close();resolve(v);};const cancel=e=>{e.preventDefault();end(false);};modal.addEventListener('cancel',cancel);$('dialogX').onclick=$('askNo').onclick=()=>end(false);$('askYes').onclick=()=>end(true);
 });}
 function say(text){
  if(settings.muted||!settings.effects){notify('Sound is off. Follow the pictures and words.');return;}
  const synth=globalThis.speechSynthesis,voice=synth?.getVoices?.().find(v=>v.localService&&/^en(?:-|_|$)/i.test(v.lang));
  if(!voice){notify('An on-device English voice is not available. The picture instructions still work.');return;}
  onPause();audio.pause();synth.cancel();try{const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.rate=.83;u.volume=settings.effects/100;synth.speak(u);}catch(_){notify('Spoken hints are unavailable. Follow the pictures.');}
 }
 function options(){
  settings=prefs.settings();open('Little comforts','<p>These settings are shared with Claire\'s other games.</p>'+['music','effects'].map(k=>'<label class="slider-label">'+(k==='music'?'Music':'Effects and spoken hints')+' <output id="'+k+'Value">'+settings[k]+'%</output><input id="'+k+'Range" type="range" min="0" max="100" value="'+settings[k]+'"></label>').join('')+'<label class="check"><input type="checkbox" id="muteCheck" '+(settings.muted?'checked':'')+'> Mute everything</label><label class="check"><input type="checkbox" id="gentleCheck" '+(settings.gentle||motion.matches?'checked':'')+' '+(motion.matches?'disabled':'')+'> Gentle effects</label><label class="check"><input type="checkbox" id="bigCheck" '+(settings.large?'checked':'')+'> Bigger buttons</label><p class="small">No flashing lights. Spoken instructions use installed local voices.</p><button class="primary" id="settingsDone">Back to play</button>',()=>{
   for(const k of ['music','effects'])$(k+'Range').oninput=()=>{settings[k]=+$(k+'Range').value;$(k+'Value').textContent=settings[k]+'%';prefs.saveSettings(settings);apply();};
   for(const [id,k] of [['muteCheck','muted'],['gentleCheck','gentle'],['bigCheck','large']])$(id).onchange=()=>{settings[k]=$(id).checked;prefs.saveSettings(settings);apply();};$('settingsDone').onclick=close;
  });
 }
 $('settingsButton').onclick=options;$('soundButton').onclick=()=>{settings=prefs.settings();settings.muted=!settings.muted;prefs.saveSettings(settings);apply();};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-read]');if(b)say(b.dataset.read);});
 const stop=()=>{onPause();audio.pause();globalThis.speechSynthesis?.cancel();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);window.addEventListener('blur',stop);
 window.addEventListener('storage',()=>{settings=prefs.settings();apply();});motion.addEventListener?.('change',apply);
 const offline=()=>{$('offlineStatus').textContent='Version 1.3.0 | Saved for offline play';};document.addEventListener('storybook:offline-ready',offline);if(document.documentElement.dataset.offlineReady==='true')offline();
 document.addEventListener('storybook:update-ready',()=>notify('Update ready for your next visit. Your creations stay saved.'));
 async function leave(url,guard=false){if(guard&&!await ask('Leave this activity?','Your saved creations will wait here. Finish placing or saving any preview first.','Leave'))return;stop();location.href=url;}
 apply();return {audio,notify,open,close,ask,say,leave,stop,get settings(){return {...settings,gentle:settings.gentle||motion.matches};}};
}

/* Some touch engines suppress a compatibility click after a captured drag.
   Activate ordinary buttons on a short primary touch; swallow only its duplicate native click. */
function enableButtonTaps(){
 let press=null,last=null;
 document.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||!e.isPrimary)return;
  const b=e.target.closest('button');if(!b||b.disabled||b.matches('[data-slot],[data-lane],[data-instrument]'))return;
  press={id:e.pointerId,b,x:e.clientX,y:e.clientY};
 });
 document.addEventListener('pointermove',e=>{if(press?.id===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12)press=null;});
 document.addEventListener('pointercancel',e=>{if(press?.id===e.pointerId)press=null;});
 document.addEventListener('pointerup',e=>{
  if(press?.id!==e.pointerId)return;const p=press;press=null;
  if(!p.b.isConnected||p.b.disabled)return;
  if(document.elementFromPoint(e.clientX,e.clientY)?.closest('button')!==p.b)return;
  e.preventDefault();last={b:p.b,x:e.clientX,y:e.clientY,until:Date.now()+650};p.b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:e.clientX,clientY:e.clientY,detail:1}));
 });
 document.addEventListener('click',e=>{if(e.isTrusted&&e.detail>0&&last&&Date.now()<last.until&&(e.target.closest('button')===last.b||Math.hypot(e.clientX-last.x,e.clientY-last.y)<12)){e.preventDefault();e.stopImmediatePropagation();}},true);
}
