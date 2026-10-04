import {StudioStore} from './model.js';
import {TrailAudio} from '../treat-trail/audio.js';
export const $=id=>document.getElementById(id);
export const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createUI(track='meadow'){
 enableButtonTaps();
 const store=new StudioStore(),motion=matchMedia('(prefers-reduced-motion: reduce)');let settings=store.settings(),active=false,notifyTimer,returnFocus=null;
 const audio=new TrailAudio(settings,text=>notify(text));
 const panel=document.createElement('dialog');panel.className='studio-dialog';panel.setAttribute('aria-label','Activity options');document.body.append(panel);
 const notice=document.createElement('div');notice.id='studioNotice';notice.className='studio-notice';notice.setAttribute('role','status');document.body.append(notice);
 function notify(text){notice.textContent=text;notice.classList.add('show');clearTimeout(notifyTimer);notifyTimer=setTimeout(()=>notice.classList.remove('show'),4500);}
 function saveStatus(){const el=$('studioSave');if(el)el.textContent=store.available?'Saved on this device':'Saving unavailable. Keep this tab open.';}
 function apply(){const gentle=settings.gentle||motion.matches;document.body.classList.toggle('gentle',gentle);document.body.classList.toggle('large-targets',settings.large);audio.apply({...settings,gentle});if(settings.muted)globalThis.speechSynthesis?.cancel();const b=$('soundToggle');if(b){b.textContent=settings.muted?'Sound off':'Sound on';b.setAttribute('aria-pressed',String(settings.muted));}}
 function stop(){active=false;audio.pause();globalThis.speechSynthesis?.cancel();}
 function touch(){if(document.hidden)return;if(!active){active=true;audio.unlock();audio.start(track);}}
 function fx(type='treat'){touch();audio.fx(type);}
 function say(text){
  settings=store.settings();apply();if(settings.muted||!settings.effects){notify('Sound is muted. The pictures and words are still here.');return;}
  const synth=globalThis.speechSynthesis,voice=synth?.getVoices?.()?.find(v=>v.localService&&/^en(?:[-_]|$)/i.test(v.lang));
  if(!voice){notify('No on-device English voice is available yet. Tap again after a moment, or follow the pictures.');return;}
  const was=active;audio.pause();synth.cancel();let utter;try{utter=new SpeechSynthesisUtterance(text);utter.voice=voice;}catch(_){notify('Spoken hints are unavailable here. Follow the pictures instead.');return;}utter.rate=.83;utter.pitch=1.08;utter.volume=settings.effects/100;
  utter.onend=utter.onerror=()=>{if(was&&active&&!document.hidden&&!panel.open&&!settings.muted){audio.unlock();audio.start(track);}};try{synth.speak(utter);}catch(_){notify('Spoken hints are unavailable here. Follow the pictures instead.');}
 }
 function open(html){returnFocus=document.activeElement;stop();panel.innerHTML=html;panel.showModal();panel.querySelector('button,input')?.focus();}
 function close(){panel.close();returnFocus?.focus?.({preventScroll:true});}
 async function ask(title,text,yes='Yes, please',no='Keep playing'){
  return new Promise(resolve=>{
   open('<h2>'+escapeHTML(title)+'</h2><p>'+escapeHTML(text)+'</p><div class="dialog-actions"><button class="soft" data-answer="no">'+escapeHTML(no)+'</button><button class="primary" data-answer="yes">'+escapeHTML(yes)+'</button></div>');
   const finish=answer=>{panel.removeEventListener('cancel',cancel);close();resolve(answer);};const cancel=e=>{e.preventDefault();finish(false);};panel.addEventListener('cancel',cancel);
   panel.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>finish(b.dataset.answer==='yes'));
  });
 }
 function options(){
  settings=store.settings();open('<h2>Little comforts</h2><p>Shared with Treat Trail. No sound in the storybook.</p><label class="setting">Music <output id="musicValue">'+settings.music+'%</output><input id="musicInput" type="range" min="0" max="100" value="'+settings.music+'"></label><label class="setting">Sounds &amp; spoken hints <output id="effectsValue">'+settings.effects+'%</output><input id="effectsInput" type="range" min="0" max="100" value="'+settings.effects+'"></label><label class="setting check"><input id="muteInput" type="checkbox" '+(settings.muted?'checked':'')+'> Mute everything</label><label class="setting check"><input id="gentleInput" type="checkbox" '+(settings.gentle||motion.matches?'checked':'')+' '+(motion.matches?'disabled':'')+'> Gentle effects</label><label class="setting check"><input id="largeInput" type="checkbox" '+(settings.large?'checked':'')+'> Bigger buttons</label><p class="note">Spoken hints use an English voice installed on this device, never an online voice.</p><button class="primary" id="doneSettings">Back to play</button>');
  for(const k of ['music','effects','mute','gentle','large'])$(k+'Input').oninput=()=>{const prop=k==='mute'?'muted':k;settings[prop]=['music','effects'].includes(k)?Number($(k+'Input').value):$(k+'Input').checked;if($(k+'Value'))$(k+'Value').textContent=settings[prop]+'%';store.saveSettings(settings);apply();saveStatus();};
  $('doneSettings').onclick=()=>close();
 }
 apply();motion.addEventListener?.('change',apply);globalThis.speechSynthesis?.getVoices();
 $('settingsOpen')?.addEventListener('click',options);
 $('soundToggle')?.addEventListener('click',()=>{settings=store.settings();settings.muted=!settings.muted;store.saveSettings(settings);apply();if(!settings.muted)touch();});
 document.addEventListener('studios:saved',e=>{if(!e.detail.ok)store.available=false;saveStatus();});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-read]');if(b)say(b.dataset.read||b.textContent);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 window.addEventListener('storage',()=>{settings=store.settings();apply();});
 const offline=()=>{if($('offlineStatus'))$('offlineStatus').textContent='Version 1.1.0 | Saved for offline play';};
 document.addEventListener('storybook:offline-ready',offline);if(document.documentElement.dataset.offlineReady==='true')offline();
 document.addEventListener('storybook:update-ready',()=>notify('An update is ready. Your work stays saved; reopen after playing.'));
 async function leave(url,unfinished=false){if(unfinished&&!await ask('Leave the activity?',store.available?'Your work is saved here. You can come back and continue.':'Saving is not available. Leaving may lose this creation.','Leave','Stay here'))return;stop();location.href=url;}
 return {store,audio,touch,fx,say,notify,ask,leave,stop,saveStatus,get settings(){return settings;}};
}
/* One-pointer drag with a full tap alternative; secondary touches never place extra objects. */
export function enableDrag(root,{tap,drop}){
 let drag=null,suppress=0;
 root.addEventListener('pointerdown',e=>{
  const source=e.target.closest('[data-drag]');if(!source||source.disabled||drag||e.button>0)return;e.preventDefault();
  drag={source,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,ghost:null};source.setPointerCapture?.(e.pointerId);
 });
 root.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;if(!drag.ghost){drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.innerHTML=drag.source.querySelector('svg')?.outerHTML||drag.source.textContent;document.body.append(drag.ghost);}
   drag.ghost.style.transform=`translate(${e.clientX-35}px,${e.clientY-35}px)`;e.preventDefault();}
 });
 function end(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;d.ghost?.remove();suppress=Date.now()+600;
  if(cancel)return;
  if(d.moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');if(target)drop(d.source,target,{x:e.clientX,y:e.clientY});}
  else tap(d.source);
 }
 root.addEventListener('pointerup',e=>end(e));root.addEventListener('pointercancel',e=>end(e,true));
 root.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)end(e,true);});
 root.addEventListener('click',e=>{const s=e.target.closest('[data-drag]');if(s){if(Date.now()<suppress){e.preventDefault();return;}tap(s);}});
 root.addEventListener('contextmenu',e=>{if(e.target.closest('[data-drag]'))e.preventDefault();});
}

/* Some touch engines suppress a compatibility click after a captured drag.
   Activate ordinary buttons on a short primary touch; swallow only its duplicate native click. */
function enableButtonTaps(){
 let press=null,last=null;
 document.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||!e.isPrimary)return;
  const b=e.target.closest('button');if(!b||b.disabled||b.matches('[data-drag],#mixBowl'))return;
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
