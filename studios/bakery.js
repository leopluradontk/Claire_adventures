import {CAST,FRIENDS,COLOURS,TOPPINGS,RECIPES,ORDERS,cleanItems,checkOrder} from './model.js';
import {avatar} from './wardrobe.js';
import {food,prop,topping,bowl,oven} from './food.js';
import {createUI,$,escapeHTML,enableDrag} from './ui.js';
const ui=createUI('meadow'),store=ui.store;
let bake=store.state().bakery,showWelcome=true,selectedTopping=null,baking=false,bakeTimer=null,stirPointer=null,stirSuppress=0;
const titleCase=s=>s[0].toUpperCase()+s.slice(1),names={sprinkles:'Sprinkles',strawberry:'Strawberry',blueberry:'Blueberry',cherry:'Cherry',heart:'Heart',star:'Star'};
function unfinished(){return !!bake&&bake.stage!=='served';}
function save(){store.saveBake(bake);document.body.dataset.gameRunning=String(!showWelcome&&unfinished());ui.saveStatus();}
function change(fn){fn(bake);save();render();}
function look(kind,context=''){return avatar(kind,store.state().looks[kind],{context});}
function countText(item){const counts=TOPPINGS.map(t=>[t,item.toppings.filter(x=>x.kind===t).length]).filter(x=>x[1]);return counts.length?counts.map(([t,n])=>n+' '+(n>1?({strawberry:'strawberries',blueberry:'blueberries',cherry:'cherries',heart:'hearts',star:'stars',sprinkles:'sprinkle patches'}[t]):names[t].toLowerCase())).join(' / '):'Ready for toppings';}
function order(){return bake?.mode==='orders'?ORDERS[bake.order]:null;}
function instructions(){
 if(!bake)return '';
 if(bake.stage==='choose')return 'Choose cupcakes, cookies or a little cake. Then choose how many to make.';
 if(bake.stage==='mix')return bake.ingredients.length<3?'Tap each ingredient, or drag it into the bowl.':'Stir the bowl six times. Tap it, or move your finger in circles.';
 if(bake.stage==='bake')return bake.baked?'All baked! Let us decorate.':baking?'A little oven magic. Nothing can burn.':'Tap Bake my treats, or drag the tray into the oven.';
 if(bake.stage==='decorate')return selectedTopping?'Tap a treat to place '+names[selectedTopping].toLowerCase()+'. Dragging works too.':'Tap a treat, then choose icing. Pick a topping and tap where it should go.';
 if(bake.stage==='serve')return 'Tap '+(order()?CAST[order().friend]:'a stuffy friend')+' to share your creation.';
 return 'Thank you, Claire! Your friends loved baking with you.';
}
function render(){
 const stars=store.stars();$('starTotal').textContent=stars.total;$('starBank').title=stars.trail+' trail stars + '+stars.bakery+' completed orders';
 $('bakeryWelcome').hidden=!showWelcome;$('bakeryPlay').hidden=showWelcome;
 if(showWelcome){renderWelcome();renderAlbum();document.body.dataset.gameRunning='false';ui.saveStatus();return;}
 document.body.dataset.gameRunning=String(unfinished());
 const steps=['choose','mix','bake','decorate','serve'],stage=bake.stage==='served'?4:steps.indexOf(bake.stage);
 $('stepper').innerHTML=['Choose','Mix','Bake','Decorate','Share'].map((t,i)=>'<li class="'+(i===stage?'active':i<stage?'done':'')+'"><b>'+(i<stage?'&#10003;':i+1)+'</b>'+t+'</li>').join('');
 const help=instructions(),heading={choose:'What shall we bake?',mix:'A bowl full of possibility',bake:bake.baked?'Warm from the oven!':'Our little magic oven',decorate:'The fun finishing touches',serve:'Made with love',served:'A delicious little celebration'}[bake.stage];
 let content='<h2 class="scene-heading">'+heading+'</h2><p class="scene-help" id="stepHelp">'+escapeHTML(help)+'</p><button class="read-help" data-read="'+escapeHTML(help)+'">&#9835; Read this step</button>';
 $('bakeTools').innerHTML='';
 if(bake.stage==='choose'){
  content+='<div class="type-choices">'+Object.entries(RECIPES).map(([id,r])=>'<button class="type-choice" data-recipe="'+id+'" aria-pressed="'+(bake.type===id)+'">'+food(id)+'<strong>'+r.name+'</strong></button>').join('')+'</div><div class="quantity"><span>How many?</span>'+[1,2,3].map(n=>'<button data-qty="'+n+'" aria-pressed="'+(bake.qty===n)+'" '+(bake.type==='cake'&&n>1?'disabled':'')+'>'+n+'</button>').join('')+'</div><div class="scene-actions"><button class="primary" id="startMix">Let us mix</button></div>';
 }else if(bake.stage==='mix'){
  content+='<button class="bowl-drop" id="mixBowl" data-drop="bowl" aria-label="Stir the bowl">'+bowl(bake.ingredients,bake.stirs)+'</button><div class="mix-meter" aria-label="'+bake.stirs+' of 6 stirs">'+Array.from({length:6},(_,i)=>'<i class="'+(i<bake.stirs?'filled':'')+'"></i>').join('')+'</div><p class="tiny">'+bake.ingredients.length+' of 3 ingredients &#183; '+bake.stirs+' of 6 stirs</p><div class="scene-actions"><button id="intoOven" class="primary" '+(bake.stirs<6?'disabled':'')+'>Into the oven</button></div>';
  $('bakeTools').innerHTML='<section class="ingredient-tray"><h3>Tap or drag into the bowl</h3><div class="ingredient-buttons">'+RECIPES[bake.type].ingredients.map(id=>'<button class="ingredient" data-drag="ingredient" data-value="'+id+'" data-added="'+bake.ingredients.includes(id)+'" '+(bake.ingredients.includes(id)?'disabled':'')+'>'+prop(id)+'<span>'+titleCase(id)+'</span></button>').join('')+'</div></section>';
 }else if(bake.stage==='bake'){
  const inside='<g transform="translate(102 93) scale(.56)">'+food(bake.type).replace(/<svg[^>]*>|<\/svg>/g,'')+'</g>';
  content+='<div class="oven-view '+(baking?'baking':'')+'" data-drop="oven">'+oven(inside,baking)+'</div><div class="scene-actions">'+(bake.baked?'<button class="primary" id="startDecorate">Time to decorate</button>':'<button class="primary" data-drag="pan" id="startOven" '+(baking?'disabled':'')+'>'+(baking?'Baking with love...':'Bake my treats')+'</button>')+'</div>';
 }else{
  content+='<div class="plate-row">'+bake.items.map((item,i)=>'<button class="food-target '+(bake.stage==='decorate'&&i===bake.selected?'selected':'')+'" data-piece="'+i+'" data-drop="treat" aria-label="Treat '+(i+1)+'. '+escapeHTML(countText(item))+'"><span class="piece-count">'+(i+1)+'</span>'+food(bake.type,item)+'<small>'+escapeHTML(bake.stage==='served'?'Shared with love':countText(item))+'</small></button>').join('')+'</div>';
  if(bake.stage==='decorate'){
   content+='<div class="scene-actions"><button id="readyServe" class="primary">'+(order()?'Check my order':'Ready to share')+'</button></div>';
   $('bakeTools').innerHTML='<section class="decor-tray"><div class="decor-head"><h3>Icing for treat '+(bake.selected+1)+'</h3><button class="text-button" id="copyIcing" '+(bake.qty===1?'hidden':'')+'>Same icing on all</button></div><div class="swatch-row">'+Object.entries(COLOURS).map(([id,col])=>'<button class="swatch" data-icing="'+id+'" style="--swatch:'+col+'" aria-label="'+id+' icing" aria-pressed="'+(bake.items[bake.selected].icing===id)+'"></button>').join('')+'</div><div class="toppings">'+TOPPINGS.map(t=>'<button class="topping '+(selectedTopping===t?'selected':'')+'" data-drag="topping" data-value="'+t+'" aria-pressed="'+(selectedTopping===t)+'">'+prop(t)+'<span>'+names[t]+'</span></button>').join('')+'</div><div class="tool-row"><button id="undoDecor" '+(!bake.undo.length?'disabled':'')+'>Undo</button><button id="removeTopping" '+(!bake.items[bake.selected].toppings.length?'disabled':'')+'>Remove last topping</button><button id="clearToppings" '+(!bake.items[bake.selected].toppings.length?'disabled':'')+'>Clear toppings</button><button id="pickOnly">Just select a treat</button></div><p class="note">'+(selectedTopping?names[selectedTopping]+' selected. Tap a treat to place one.':'No wrong colours in Free Bake. Try anything you like!')+'</p></section>';
  }else if(bake.stage==='serve')content+='<div class="scene-actions"><button class="soft" id="moreDecorate">Add more decorations</button></div>';
  else content+='<div class="success-banner">'+CAST[bake.friend]+' says thank you!'+(bake.mode==='orders'?'<span class="reward">&#9733; One friendship star earned</span>':'<span class="reward">&#9825; Made your way, shared with love</span>')+'</div><div class="scene-actions"><button id="anotherBake" class="primary">'+(order()?'Another friend order':'Bake again')+'</button><a href="dress-up.html" class="soft" data-leave>Try on an outfit</a></div><div class="floating-hearts" aria-hidden="true">'+[12,32,51,71,87].map((n,i)=>'<span style="left:'+n+'%;animation-delay:'+i*.28+'s">&#9829;</span>').join('')+'</div>';
 }
 if(bake.stage!=='served')content+='<div class="baker-badge">'+look('claire','bakery')+'</div>';
 $('scene').innerHTML=content;renderOrder();renderFriends();renderAlbum();ui.saveStatus();
}
function renderOrder(){
 const o=order();$('kitchenSide').classList.toggle('free-side',!o);
 if(!o){$('orderCard').innerHTML='<h3>Free Bake &#9825;</h3><p class="note">Your imagination is the recipe. Any colours, any toppings, any friend.</p>';return;}
 const samples=Array.from({length:o.qty},()=>({icing:o.icing,toppings:Array.from({length:o.fruitCount||0},(_,i)=>({kind:o.fruit,x:.23+(i%2)*.5,y:.22+Math.floor(i/2)*.4}))}));
 $('orderCard').innerHTML='<div class="order-head">'+look(o.friend)+'<strong>'+CAST[o.friend]+'&#39;s order</strong></div><button class="order-text" id="readOrder" data-read="'+escapeHTML(o.text)+'">'+escapeHTML(o.text)+' <span aria-hidden="true">&#9835;</span></button><div class="order-pics">'+samples.map(s=>food(o.type,s)).join('')+'</div>'+(o.icing?'<p class="order-colour" style="--swatch:'+COLOURS[o.icing]+'"><i></i>'+titleCase(o.icing)+' icing</p>':'')+(o.add?'<div class="addition">'+o.add.map(n=>'<span>'+Array.from({length:n},()=>prop(o.fruit)).join('')+'</span>').join('<b>+</b>')+'<b>= ?</b></div>':o.fruit?'<p class="note">'+o.fruitCount+' '+(o.fruit==='strawberry'?'strawberries':'cherries')+'</p>':'')+'<p class="tiny">Tap the order to hear it. Take your time. &#9733; +1 for sharing a finished order.</p>';
}
function renderFriends(){const o=order();$('friendsPanel').classList.toggle('serving',bake.stage==='serve');$('friendsPanel').innerHTML='<h3>'+(bake.stage==='serve'?'Who shall we serve?':'Our happy taste-testers')+'</h3><div class="friend-row">'+FRIENDS.map(id=>'<button class="friend-button '+(o?.friend===id?'requested ':'')+(bake.stage==='served'?'happy':'')+'" data-friend="'+id+'" '+(bake.stage!=='serve'?'disabled':'')+' aria-label="Serve '+CAST[id]+'">'+look(id)+'<span>'+CAST[id]+'</span></button>').join('')+'</div>';}
function renderWelcome(){
 $('bakeryWelcome').innerHTML=(unfinished()?'<div class="resume-banner"><div><strong>Your bake is waiting</strong><p class="note">'+(bake.mode==='orders'?'Friend Order':'Free Bake')+' &#183; '+titleCase(bake.stage)+'</p></div><button id="resumeBake" class="primary">Keep baking</button></div>':'')+'<div class="mode-choices"><button class="mode-card" data-mode="free">'+food('cupcake',{icing:'pink',toppings:[{kind:'star',x:.5,y:.35}]})+'<span><strong>Free Bake</strong><p>Mix, bake and decorate your own way. There are no wrong answers.</p></span></button><button class="mode-card" data-mode="orders">'+food('cookie',{icing:'purple',toppings:[{kind:'strawberry',x:.5,y:.4}]})+'<span><strong>Friend Orders</strong><p>Follow a little picture recipe. Count, choose colours and earn a star.</p></span></button></div><section class="panel"><h2>The kitchen crew</h2><div class="mini-lineup">'+Object.entries(CAST).map(([id,name])=>'<div>'+look(id,id==='claire'?'bakery':'')+'<span>'+name+'</span></div>').join('')+'</div><p class="note">A pretend bakery with unlimited ingredients. No clocks to beat, burnt food or unhappy friends.</p><button class="read-help" data-read="Welcome to Stuffy Bakery! Choose Free Bake to make anything you like, or Friend Orders to follow a picture recipe. Your stuffy friends are always happy to help.">Read the instructions</button></section>';
}
function renderAlbum(){const album=store.state().album;$('bakeAlbum').hidden=!album.length;if(album.length)$('bakeAlbum').innerHTML='<h2>Your little bakery shelf</h2><div class="album-row">'+album.slice().reverse().map(b=>'<div class="album-item">'+food(b.type,b.items[0])+'<span>Shared with '+CAST[b.friend]+'</span></div>').join('')+'</div><p class="note">Your six most recent creations, saved on this device.</p>';}
async function start(mode){if(unfinished()&&!await ui.ask('Start a fresh bake?','This will replace the unfinished bake. Your earned stars and bakery shelf stay safe.','Start fresh','Keep my bake'))return;
 clearTimeout(bakeTimer);baking=false;bake=store.startBake(mode);showWelcome=false;selectedTopping=null;ui.fx();render();}
function ingredient(id){if(bake?.stage!=='mix'||!RECIPES[bake.type].ingredients.includes(id)||bake.ingredients.includes(id))return;ui.fx();change(b=>b.ingredients.push(id));}
function stir(n=1){if(bake?.stage!=='mix')return;if(bake.ingredients.length<3){ui.notify('Add the three ingredients first. They are on the tray below.');return;}ui.fx('treat');change(b=>b.stirs=Math.min(6,b.stirs+n));}
function startOven(){if(bake?.stage!=='bake'||baking||bake.baked)return;baking=true;ui.fx('checkpoint');render();const id=bake.id;
 bakeTimer=setTimeout(()=>{if(bake?.id!==id||bake.stage!=='bake')return;baking=false;change(b=>b.baked=true);ui.fx('checkpoint');},2300);
}
function edit(fn){bake.undo.push(JSON.parse(JSON.stringify(bake.items)));bake.undo=bake.undo.slice(-20);fn(bake.items);save();render();}
function addTop(kind,index,point){if(bake?.stage!=='decorate'||!TOPPINGS.includes(kind))return;
 const item=bake.items[index];if(item.toppings.length>=24){ui.notify('A very full treat! Remove a topping to make room.');return;}
 bake.selected=index;const n=item.toppings.length;let x=point?.x??(.2+(n%3)*.3),y=point?.y??(.2+(Math.floor(n/3)%3)*.28);
 x=Math.max(.12,Math.min(.88,x));y=Math.max(.12,Math.min(.88,y));ui.fx();edit(items=>items[index].toppings.push({kind,x,y}));}
function normalize(target,point){const r=target.querySelector('svg').getBoundingClientRect();const px=(point.x-r.left)/r.width*200,py=(point.y-r.top)/r.height*200;return {x:(px-42)/116,y:bake.type==='cake'?(py-47)/46:bake.type==='cupcake'?(py-40)/66:(py-53)/105};}
function hint(text){ui.notify(text);$('stepHelp').textContent=text;}
document.addEventListener('click',async e=>{
 const a=e.target.closest('[data-leave]');if(a){e.preventDefault();ui.leave(a.getAttribute('href'),unfinished());return;}
 const mode=e.target.closest('[data-mode]');if(mode){start(mode.dataset.mode);return;}
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.id==='resumeBake'){bake=store.state().bakery;showWelcome=false;ui.touch();render();return;}
 if(!bake||showWelcome)return;
 if(b.dataset.recipe){change(x=>{x.type=b.dataset.recipe;x.qty=x.type==='cake'?1:x.qty;x.items=cleanItems([],x.qty);});ui.fx();}
 if(b.dataset.qty)change(x=>{x.qty=Number(b.dataset.qty);x.items=cleanItems([],x.qty);});
 if(b.id==='startMix'){
  const o=order();if(o&&(bake.type!==o.type||bake.qty!==o.qty)){hint('For this order, choose '+o.qty+' '+RECIPES[o.type].name.toLowerCase()+'. Follow the picture. You can try again!');return;}
  change(x=>{x.stage='mix';x.ingredients=[];x.stirs=0;});ui.fx();
 }
 if(b.id==='mixBowl'&&Date.now()>stirSuppress)stir();
 if(b.id==='intoOven'&&bake.stirs===6)change(x=>x.stage='bake');
 if(b.id==='startDecorate'&&bake.baked)change(x=>x.stage='decorate');
 if(b.dataset.icing){selectedTopping=null;ui.fx();edit(items=>items[bake.selected].icing=b.dataset.icing);}
 const piece=b.closest('[data-piece]');if(piece&&bake.stage==='decorate'){
  const i=Number(piece.dataset.piece);if(selectedTopping)addTop(selectedTopping,i,e.detail?normalize(piece,{x:e.clientX,y:e.clientY}):null);else change(x=>x.selected=i);
 }
 if(b.id==='copyIcing'){const c=bake.items[bake.selected].icing;edit(items=>items.forEach(x=>x.icing=c));}
 if(b.id==='undoDecor'&&bake.undo.length){bake.items=bake.undo.pop();save();render();}
 if(b.id==='removeTopping')edit(items=>items[bake.selected].toppings.pop());
 if(b.id==='clearToppings'&&await ui.ask('Clear these toppings?','Only the selected treat changes. Undo can bring the toppings back.','Clear toppings'))edit(items=>items[bake.selected].toppings=[]);
 if(b.id==='pickOnly'){selectedTopping=null;render();}
 if(b.id==='readyServe'){
  const message=order()?checkOrder(bake):'';if(message){hint(message);return;}
  change(x=>x.stage='serve');ui.fx('checkpoint');
 }
 if(b.id==='moreDecorate')change(x=>x.stage='decorate');
 if(b.dataset.friend&&bake.stage==='serve'){
  const result=store.serve(bake,b.dataset.friend);if(!result.ok){hint(result.hint);return;}
  ui.audio.unlock();ui.audio.victory(false);save();render();ui.notify(CAST[bake.friend]+' loved your creation!');
 }
 if(b.id==='newBake')start(bake.mode);
 if(b.id==='anotherBake')start(bake.mode);
 if(b.id==='bakeryMenu'){save();showWelcome=true;ui.stop();render();}
});
enableDrag(document.body,{tap:source=>{
 if(source.dataset.drag==='ingredient')ingredient(source.dataset.value);
 if(source.dataset.drag==='pan')startOven();
 if(source.dataset.drag==='topping'){selectedTopping=source.dataset.value;ui.touch();render();}
},drop:(source,target,point)=>{
 if(source.dataset.drag==='ingredient'&&target.dataset.drop==='bowl')ingredient(source.dataset.value);
 if(source.dataset.drag==='pan'&&target.dataset.drop==='oven')startOven();
 if(source.dataset.drag==='topping'&&target.dataset.drop==='treat')addTop(source.dataset.value,Number(target.dataset.piece),normalize(target,point));
}});
document.addEventListener('pointerdown',e=>{const bowlEl=e.target.closest('#mixBowl');if(!bowlEl||stirPointer||e.button>0)return;e.preventDefault();stirPointer={id:e.pointerId,x:e.clientX,y:e.clientY,d:0};bowlEl.setPointerCapture?.(e.pointerId);});
document.addEventListener('pointermove',e=>{const p=stirPointer;if(!p||p.id!==e.pointerId)return;p.d+=Math.hypot(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;const spoon=$('mixBowl')?.querySelector('g');if(spoon)spoon.style.transform='rotate('+(p.d*.7)+'deg)';});
function endStir(e,cancel=false){if(stirPointer?.id!==e.pointerId)return;const p=stirPointer;stirPointer=null;stirSuppress=Date.now()+500;if(!cancel)stir(Math.max(1,Math.floor(p.d/115)));}
document.addEventListener('pointerup',e=>endStir(e));document.addEventListener('pointercancel',e=>endStir(e,true));
window.addEventListener('pagehide',()=>{if(bake)save();});window.addEventListener('beforeunload',e=>{if(unfinished()&&!store.available){e.preventDefault();e.returnValue='';}});
render();if(new URLSearchParams(location.search).has('debug'))window.bakeryDebug={store,get bake(){return bake;},get baking(){return baking;},render,stir,ingredient,startOven};

window.addEventListener('pageshow',e=>{if(e.persisted){bake=store.state().bakery;render();}});
