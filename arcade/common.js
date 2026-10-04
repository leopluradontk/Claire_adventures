import {createUI,$,escapeHTML} from '../studios/ui.js';
export {$,escapeHTML};
export function shell(track,pause,store){
 const ui=createUI(track);$('settingsOpen').addEventListener('click',()=>pause(),true);
 const status=()=>{if($('offlineStatus'))$('offlineStatus').textContent='Version 1.2.0 | Saved for offline play';};
 document.addEventListener('storybook:offline-ready',status);if(document.documentElement.dataset.offlineReady==='true')status();
 const hidden=()=>{pause();ui.stop();};window.addEventListener('blur',hidden);window.addEventListener('pagehide',hidden);document.addEventListener('visibilitychange',()=>{if(document.hidden)hidden();});
 $('homeLink').addEventListener('click',async e=>{e.preventDefault();pause();await ui.leave('./',!store.available);});
 return ui;
}
export function saved(store){$('studioSave').textContent=store.available?'Saved on this device':'Saving unavailable - keep this page open.';}
export function popParty(ui){
 ui.audio.victory(false);const root=$('party');root.replaceChildren();
 if(!document.body.classList.contains('gentle'))for(let i=0;i<18;i++){
  const e=document.createElement('span');e.textContent=i%3?'\u2665':'\u2605';e.style.cssText=`left:${5+i*5}%;--turn:${(i%2?1:-1)*80}deg;--delay:${i%5*.12}s;--hue:${i*21}deg`;root.append(e);
 }
 setTimeout(()=>root.replaceChildren(),3200);
}
export function timeText(ms){const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
export function showLayer(title,text,buttons,art=''){
 $('layerTitle').textContent=title;$('layerText').textContent=text;$('layerArt').innerHTML=art;$('layerButtons').replaceChildren();
 for(const [name,fn,secondary] of buttons){const b=document.createElement('button');b.textContent=name;b.className=secondary?'soft':'primary';b.onclick=fn;$('layerButtons').append(b);}
 $('gameLayer').hidden=false;$('layerButtons').querySelector('button')?.focus({preventScroll:true});
}

document.addEventListener('keydown',e=>{const layer=document.getElementById('gameLayer');if(e.code!=='Tab'||!layer||layer.hidden||document.querySelector('dialog[open]'))return;const buttons=[...layer.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&(document.activeElement===first||!layer.contains(document.activeElement))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||!layer.contains(document.activeElement))){e.preventDefault();first?.focus();}});
