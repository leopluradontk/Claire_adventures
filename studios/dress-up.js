import {CAST,STYLES,HEADS,COLOURS,DEFAULT_LOOK,cleanLook} from './model.js';
import {avatar} from './wardrobe.js';
import {createUI,$,escapeHTML} from './ui.js';
const ui=createUI('snow'),store=ui.store;
const icons={default:'&#9825;',princess:'&#9813;',everyday:'&#128085;',bakery:'&#129473;',beach:'&#9728;',winter:'&#10052;',halloween:'&#127875;',autumn:'&#127809;',royal:'&#9733;',rainbow:'&#127752;'};
const headNames={outfit:'Matching hat',none:'No extra hat',bow:'Bow',crown:'Crown',chef:'Chef hat',sunhat:'Sun hat',beanie:'Winter hat',witch:'Witch hat'};
let kind='claire',look=cleanLook(store.state().drafts.claire||store.state().looks.claire||DEFAULT_LOOK);
document.body.dataset.gameRunning='true';
function setLook(next,animate=true){look=cleanLook(next);store.draft(kind,look);render(animate);}
function render(animate=false){
 const state=store.state(),score=store.stars();$('starTotal').textContent=score.total;
 $('starBank').title=score.trail+' adventure stars + '+score.bakery+' completed friend orders + '+score.arcade+' playroom stars';
 $('castTabs').innerHTML=Object.entries(CAST).map(([id,name])=>'<button class="cast-tab '+(id===kind?'selected':'')+'" data-kind="'+id+'" aria-pressed="'+(id===kind)+'">'+avatar(id,state.looks[id])+'<span>'+name+'</span></button>').join('');
 $('characterName').textContent=CAST[kind];$('avatarPreview').innerHTML=avatar(kind,look);
 $('avatarPreview').classList.remove('twirl');if(animate){void $('avatarPreview').offsetWidth;$('avatarPreview').classList.add('twirl');}
 const worn=JSON.stringify(state.looks[kind]||DEFAULT_LOOK)===JSON.stringify(look);
 $('lookHint').textContent=worn?'This look is ready for your adventures.':'Draft saved. Tap Wear this look to take it on adventures.';
 $('styleChoices').innerHTML=STYLES.map(s=>'<button class="style-choice '+(look.style===s.id?'selected ':'')+(score.total<s.stars?'locked':'')+'" data-style="'+s.id+'" aria-pressed="'+(look.style===s.id)+'" aria-label="'+s.name+(score.total<s.stars?', unlocks at '+s.stars+' friendship stars':'')+'"><span aria-hidden="true">'+icons[s.id]+'</span><span>'+s.name+'</span>'+(s.stars?'<span class="lock-note">'+(score.total<s.stars?s.stars+' stars to unlock':'Unlocked')+'</span>':'')+'</button>').join('');
 $('colourChoices').innerHTML=[['colour','Clothes'],['accent','Trim'],...(kind==='claire'||kind==='kitty'?[['shoes','Shoes']]:[])].map(([field,label])=>'<div class="colour-group"><h3>'+label+'</h3><div class="swatch-row">'+Object.entries(COLOURS).map(([name,hex])=>'<button class="swatch" data-field="'+field+'" data-colour="'+name+'" style="--swatch:'+hex+'" aria-label="'+name+' '+label.toLowerCase()+'" aria-pressed="'+(look[field]===name)+'"></button>').join('')+'</div></div>').join('');
 $('headChoices').innerHTML=HEADS.map(id=>'<button class="head-choice" data-head="'+id+'" aria-pressed="'+(look.head===id)+'">'+headNames[id]+'</button>').join('');$('glassesChoice').checked=look.glasses;
 $('matchingPreview').innerHTML=Object.entries(CAST).map(([id,name])=>'<div>'+avatar(id,state.looks[id])+'<span>'+name+'</span></div>').join('');
 $('favorites').innerHTML=Array.from({length:3},(_,i)=>{const saved=state.favorites[kind]?.[i];return '<div class="favorite"><button class="thumb" data-favorite="'+i+'" '+(!saved?'disabled':'')+' aria-label="Try favourite '+(i+1)+'">'+(saved?avatar(kind,saved):'<span class="heart-quiet">&#9825;</span><span class="tiny">Favourite '+(i+1)+'</span>')+'</button><button class="save-slot" data-slot="'+i+'">'+(saved?'Replace':'Save')+' favourite '+(i+1)+'</button></div>';}).join('');
 ui.saveStatus();
}
$('castTabs').onclick=e=>{const b=e.target.closest('[data-kind]');if(!b)return;kind=b.dataset.kind;const state=store.state();look=cleanLook(state.drafts[kind]||state.looks[kind]||DEFAULT_LOOK);ui.fx();render();};
$('styleChoices').onclick=e=>{const b=e.target.closest('[data-style]');if(!b)return;const id=b.dataset.style;
 if(!store.unlocked(id)){const s=STYLES.find(x=>x.id===id);const text='Earn '+s.stars+' friendship stars from adventures, Friend Orders, Memory Match or Stuffy Snake to unlock '+s.name+'. Your other outfits are ready now!';ui.notify(text);ui.say(text);return;}
 ui.fx();setLook({...look,style:id,head:'outfit'});
};
$('colourChoices').onclick=e=>{const b=e.target.closest('[data-colour]');if(b){ui.fx();setLook({...look,[b.dataset.field]:b.dataset.colour},false);}};
$('headChoices').onclick=e=>{const b=e.target.closest('[data-head]');if(b){ui.fx();setLook({...look,head:b.dataset.head});}};
$('glassesChoice').onchange=()=>setLook({...look,glasses:$('glassesChoice').checked});
$('wearLook').onclick=()=>{if(store.wear(kind,look)){ui.fx('checkpoint');render(true);ui.notify(CAST[kind]+' will wear this look in the bakery and adventures.');}};
$('randomLook').onclick=()=>{const choose=a=>a[Math.floor(Math.random()*a.length)];ui.fx();setLook({style:choose(STYLES.filter(s=>store.unlocked(s.id))).id,colour:choose(Object.keys(COLOURS)),accent:choose(Object.keys(COLOURS)),shoes:choose(Object.keys(COLOURS)),head:choose(HEADS),glasses:Math.random()<.3});};
$('matchAll').onclick=async()=>{if(await ui.ask('Matching best friends?','Dress Claire, Pusheen, Hello Kitty and Raspberry in this style and these colours. Favourites stay safe.','Match everyone')){store.wear(kind,look,true);ui.fx('checkpoint');render(true);ui.notify('Four best friends. Four matching looks!');}};
$('defaultLook').onclick=async()=>{if(await ui.ask('Back to the storybook look?','Restore '+CAST[kind]+"'s default outfit. Their saved favourites stay safe.",'Restore default')){store.default(kind);look={...DEFAULT_LOOK};ui.fx();render(true);}};
$('favorites').onclick=async e=>{
 const use=e.target.closest('[data-favorite]'),save=e.target.closest('[data-slot]');
 if(use){const next=store.state().favorites[kind]?.[Number(use.dataset.favorite)];if(next){setLook(next);ui.fx();}return;}
 if(save){const i=Number(save.dataset.slot);if(store.state().favorites[kind]?.[i]&&!await ui.ask('Replace this favourite?','Only this favourite slot will change.','Save new favourite'))return;
  store.favorite(kind,i,look);store.wear(kind,look);ui.fx('checkpoint');render();ui.notify('Favourite '+(i+1)+' saved, and the look is ready to wear.');}
};
document.querySelectorAll('[data-leave]').forEach(a=>a.onclick=e=>{e.preventDefault();ui.leave(a.getAttribute('href'),!store.available);});
window.addEventListener('beforeunload',e=>{if(!store.available){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',()=>render());render();
if(new URLSearchParams(location.search).has('debug'))window.studioDebug={store,get kind(){return kind;},get look(){return look;},setLook,render};

window.addEventListener('pageshow',e=>{if(e.persisted){const state=store.state();look=cleanLook(state.drafts[kind]||state.looks[kind]||DEFAULT_LOOK);render();}});
