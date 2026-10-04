/* Stuffy Studios 1.1.0. Additive saves; existing trail keys and colouring DB are never reset. */
import {ProgressStore} from '../treat-trail/progress.js';
export const CAST = {claire:'Claire',pusheen:'Pusheen',kitty:'Hello Kitty',raspberry:'Raspberry'};
export const FRIENDS = ['pusheen','kitty','raspberry'];
export const COLOURS = {pink:'#ed9ec3',purple:'#baa0dc',blue:'#85bada',green:'#91c8a7',yellow:'#f4d17c',orange:'#eaaa75',red:'#df8292',cream:'#fff1d5'};
export const STYLES = [
 {id:'default',name:'Storybook',icon:'heart',stars:0},
 {id:'princess',name:'Princess',icon:'crown',stars:0},
 {id:'everyday',name:'Everyday',icon:'shirt',stars:0},
 {id:'bakery',name:'Little chef',icon:'cake',stars:0},
 {id:'beach',name:'Beach day',icon:'sun',stars:0},
 {id:'winter',name:'Snow day',icon:'snow',stars:0},
 {id:'halloween',name:'Halloween',icon:'pumpkin',stars:0},
 {id:'autumn',name:'Pumpkin patch',icon:'leaf',stars:0},
 {id:'royal',name:'Star princess',icon:'star',stars:3},
 {id:'rainbow',name:'Rainbow party',icon:'rainbow',stars:6}
];
export const HEADS = ['outfit','none','bow','crown','chef','sunhat','beanie','witch'];
export const TOPPINGS = ['sprinkles','strawberry','blueberry','cherry','heart','star'];
export const DEFAULT_LOOK = Object.freeze({style:'default',colour:'pink',accent:'purple',head:'outfit',glasses:false,shoes:'purple'});
export const RECIPES = {cupcake:{name:'Cupcakes',single:'cupcake',ingredients:['flour','milk','egg']},cookie:{name:'Cookies',single:'cookie',ingredients:['flour','butter','egg']},cake:{name:'Little cake',single:'little cake',ingredients:['flour','milk','egg']}};
export const ORDERS = [
 {friend:'pusheen',type:'cupcake',qty:2,icing:'pink',text:'Two cupcakes with pink icing, please!'},
 {friend:'kitty',type:'cookie',qty:1,fruit:'strawberry',fruitCount:3,text:'One cookie with three strawberries, please!'},
 {friend:'raspberry',type:'cake',qty:1,icing:'yellow',text:'A little cake with yellow icing, please!'},
 {friend:'kitty',type:'cupcake',qty:1,icing:'blue',text:'One cupcake with blue icing, please!'},
 {friend:'pusheen',type:'cookie',qty:2,icing:'purple',text:'Two cookies with purple icing, please!'},
 {friend:'raspberry',type:'cookie',qty:1,fruit:'strawberry',fruitCount:3,add:[1,2],text:'One strawberry plus two strawberries. How many on my cookie?'},
 {friend:'kitty',type:'cake',qty:1,icing:'pink',fruit:'cherry',fruitCount:2,text:'A little cake with pink icing and two cherries, please!'},
 {friend:'pusheen',type:'cupcake',qty:3,icing:'green',text:'Three cupcakes with green icing, please!'},
 {friend:'raspberry',type:'cake',qty:1,fruit:'blueberry',fruitCount:4,add:[2,2],text:'Two blueberries plus two blueberries. How many on my little cake?'}
];
export const KEY = 'claire-stuffy-studios:v1';
const copy = v => JSON.parse(JSON.stringify(v));
const int = (v,min,max,fallback=min) => Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
export function cleanLook(v) {
 const r={...DEFAULT_LOOK};if(!v||typeof v!=='object')return r;
 if(STYLES.some(s=>s.id===v.style))r.style=v.style;
 for(const k of ['colour','accent','shoes'])if(Object.hasOwn(COLOURS,v[k]))r[k]=v[k];
 if(HEADS.includes(v.head))r.head=v.head;r.glasses=v.glasses===true;return r;
}
export function cleanItems(v,qty) {
 if(!Array.isArray(v))v=[];
 return Array.from({length:qty},(_,i)=>({icing:Object.hasOwn(COLOURS,v[i]?.icing)?v[i].icing:null,
  toppings:Array.isArray(v[i]?.toppings)?v[i].toppings.filter(t=>TOPPINGS.includes(t?.kind)&&Number.isFinite(t.x)&&Number.isFinite(t.y)).slice(0,24).map(t=>({kind:t.kind,x:Math.max(.12,Math.min(.88,t.x)),y:Math.max(.12,Math.min(.88,t.y))})):[]}));
}
export function cleanBake(v) {
 if(!v||typeof v!=='object'||typeof v.id!=='string'||v.id.length>80||!['free','orders'].includes(v.mode)||!['choose','mix','bake','decorate','serve','served'].includes(v.stage))return null;
 const type=Object.hasOwn(RECIPES,v.type)?v.type:'cupcake',qty=type==='cake'?1:int(v.qty,1,3,1);
 return {id:v.id,mode:v.mode,stage:v.stage,type,qty,order:int(v.order,0,ORDERS.length-1),ingredients:[...new Set((Array.isArray(v.ingredients)?v.ingredients:[]).filter(x=>RECIPES[type].ingredients.includes(x)))],
  stirs:int(v.stirs,0,6),baked:v.baked===true,selected:int(v.selected,0,qty-1),items:cleanItems(v.items,qty),
  undo:(Array.isArray(v.undo)?v.undo:[]).slice(-20).map(x=>cleanItems(x,qty)),friend:FRIENDS.includes(v.friend)?v.friend:null};
}
function fresh(){return {schema:1,looks:{},drafts:{},favorites:{},ordersCompleted:0,rewarded:[],bakery:null,album:[]};}
export class StudioStore extends ProgressStore {
 read(){
  const raw=this.json(KEY),r=fresh();if(!raw||raw.schema!==1)return r;
  for(const kind of Object.keys(CAST)){
   for(const key of ['looks','drafts'])if(raw[key]?.[kind])r[key][kind]=cleanLook(raw[key][kind]);
   r.favorites[kind]=Array.from({length:3},(_,i)=>raw.favorites?.[kind]?.[i]?cleanLook(raw.favorites[kind][i]):null);
  }
  r.ordersCompleted=int(raw.ordersCompleted,0,1000000);r.rewarded=(Array.isArray(raw.rewarded)?raw.rewarded:[]).filter(x=>typeof x==='string').slice(-256);
  r.bakery=cleanBake(raw.bakery);r.album=(Array.isArray(raw.album)?raw.album:[]).map(cleanBake).filter(x=>x?.stage==='served').slice(-6);return r;
 }
 write(state){
  this.session=copy(state);const ok=this.put(KEY,JSON.stringify(state));
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studios:saved',{detail:{ok}}));return ok;
 }
 state(){return this.available?this.read():(this.session||this.read());}
 change(fn){const s=this.state();fn(s);this.write(s);return s;}
 stars(){const s=this.state();let trail=0;for(const id of ['sunshine-meadow','pumpkin-patch','snowflake-trail','sunny-seaside'])trail+=this.best({id,treats:{length:40}}).stars;return {trail,bakery:s.ordersCompleted,total:trail+s.ordersCompleted};}
 unlocked(style){const found=STYLES.find(x=>x.id===style);return !!found&&this.stars().total>=found.stars;}
 draft(kind,look){if(!CAST[kind])return;this.change(s=>s.drafts[kind]=cleanLook(look));}
 wear(kind,look,all=false){if(!CAST[kind]||!this.unlocked(look.style))return false;this.change(s=>{for(const k of all?Object.keys(CAST):[kind])s.looks[k]=s.drafts[k]=cleanLook(look);});return true;}
 default(kind){this.change(s=>{delete s.looks[kind];s.drafts[kind]={...DEFAULT_LOOK};});}
 favorite(kind,index,look){if(CAST[kind]&&index>=0&&index<3)this.change(s=>{s.favorites[kind]||=[null,null,null];s.favorites[kind][index]=cleanLook(look);});}
 saveBake(b){const v=cleanBake(b);if(!v)return false;this.change(s=>s.bakery=v);return this.available;}
 startBake(mode){
  const s=this.state(),order=s.ordersCompleted%ORDERS.length;
  const b={id:(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),mode,stage:'choose',type:'cupcake',qty:1,order,ingredients:[],stirs:0,baked:false,selected:0,items:cleanItems([],1),undo:[],friend:null};
  this.saveBake(b);return b;
 }
 serve(b,friend){
  if(!b.baked||!['decorate','serve'].includes(b.stage)||!FRIENDS.includes(friend))return {ok:false,hint:'Let us finish baking first.'};
  const order=b.mode==='orders'?ORDERS[b.order]:null;
  if(order){const hint=checkOrder(b,order);if(hint)return {ok:false,hint};if(friend!==order.friend)return {ok:false,hint:CAST[order.friend]+' asked for this bake. Tap '+CAST[order.friend]+' to share it.'};}
  let gained=0;this.change(s=>{
   if(order&&!s.rewarded.includes(b.id)){s.ordersCompleted++;s.rewarded.push(b.id);s.rewarded=s.rewarded.slice(-256);gained=1;}
   b.stage='served';b.friend=friend;s.bakery=copy(b);if(!s.album.some(x=>x.id===b.id))s.album=[...s.album,copy(b)].slice(-6);
  });return {ok:true,gained};
 }
}
export function checkOrder(b,o=ORDERS[b.order]) {
 if(b.type!==o.type)return 'This friend would love '+RECIPES[o.type].name.toLowerCase()+'. Use Change bake to choose them. Your friend is happy to wait!';
 if(b.qty!==o.qty)return 'Let us count: this order needs '+o.qty+' '+RECIPES[o.type].name.toLowerCase()+'. Use Change bake to try again.';
 if(o.icing&&b.items.some(x=>x.icing!==o.icing))return 'Try '+o.icing+' icing on '+(o.qty>1?'each treat':'your treat')+'. Tap a treat, then the '+o.icing+' icing dot.';
 if(o.fruit){const counts=b.items.map(x=>x.toppings.filter(t=>t.kind===o.fruit).length);if(counts.some(n=>n!==o.fruitCount))return 'Count '+o.fruitCount+' '+({strawberry:'strawberries',blueberry:'blueberries',cherry:'cherries'}[o.fruit])+' on '+(o.qty>1?'each treat':'your treat')+'. You have '+counts.join(', ')+'. Add more, or use Undo / Remove topping.';}
 return '';
}
