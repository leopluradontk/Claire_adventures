/* Stable card identities. The two copies of a card share this exact SVG recipe. */
import {avatar} from '../studios/wardrobe.js';
const K=['claire','pusheen','kitty','raspberry'];
const N={claire:'Claire',pusheen:'Pusheen',kitty:'Hello Kitty',raspberry:'Raspberry'};
export const DESIGNS=[];
const add=(cast,layout='row',style='default',colour='pink')=>DESIGNS.push({id:'picture-'+DESIGNS.length,cast,layout,style,colour});
K.forEach(k=>add([k]));
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){add([K[i],K[j]]);add([K[j],K[i]]);}
for(let omit=0;omit<4;omit++){
 const a=K.filter((_,i)=>i!==omit);add(a,'triangle');add([a[1],a[2],a[0]],'triangle');add(a,'row');
}
add(K,'square');add(['raspberry','kitty','pusheen','claire'],'square');
add(['kitty','claire','raspberry','pusheen'],'square');add(['pusheen','raspberry','claire','kitty'],'square');
for(const style of ['bakery','winter','halloween','beach'])add(K,'square',style,{bakery:'pink',winter:'blue',halloween:'purple',beach:'green'}[style]);
K.forEach(k=>add([k],'row','bakery','cream'));
K.forEach(k=>add([k],'row','winter','blue'));
export const byId=Object.fromEntries(DESIGNS.map(d=>[d.id,d]));
export const COUNTS={easy:12,medium:18,hard:24,expert:30};
export const STAGES=[12,15,18,21,24,27,30];
export function shuffled(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function selectDesigns(pairs,rng=Math.random){
 if(!STAGES.includes(pairs))throw Error('Unsupported board');
 // Lower boards deliberately include solo, duo and trio cards. Harder boards add quads and outfits.
 let chosen=[...shuffled(DESIGNS.slice(0,4),rng),...shuffled(DESIGNS.slice(4,16),rng).slice(0,4),...shuffled(DESIGNS.slice(16,28),rng).slice(0,4)];
 if(pairs>=15)chosen.push(...shuffled(DESIGNS.slice(4,28).filter(d=>!chosen.includes(d)),rng).slice(0,Math.min(pairs-12,6)));
 if(pairs>=21)chosen.push(...shuffled(DESIGNS.slice(28,36),rng).slice(0,Math.min(pairs-18,6)));
 const rest=DESIGNS.filter(d=>!chosen.includes(d));chosen.push(...shuffled(rest,rng).slice(0,pairs-chosen.length));
 return shuffled(chosen.map(d=>d.id),rng);
}
const artCache=new Map();
export function characterSVG(kind,look=null){return avatar(kind,look);}
export function cardName(id){const d=byId[id];return d.cast.map(k=>N[k]).join(', ')+(d.style==='default'?'':' in '+d.style+' outfits');}
export function cardSVG(id){
 if(artCache.has(id))return artCache.get(id);
 const d=byId[id];if(!d)throw Error('Unknown picture');
 let boxes;
 if(d.cast.length===1)boxes=[[35,2,130,150]];
 else if(d.cast.length===2)boxes=[[0,16,100,133],[100,16,100,133]];
 else if(d.layout==='triangle')boxes=[[50,0,100,87],[0,69,100,87],[100,69,100,87]];
 else if(d.layout==='square')boxes=[[0,0,100,79],[100,0,100,79],[0,79,100,79],[100,79,100,79]];
 else boxes=[[0,19,67,135],[67,19,66,135],[133,19,67,135]];
 const body=d.cast.map((kind,i)=>{
  const b=boxes[i],look=d.style==='default'?null:{style:d.style,colour:d.colour,accent:'purple',shoes:'purple',head:'outfit',glasses:false};
  return characterSVG(kind,look).replace('<svg ',`<svg x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" `);
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" aria-hidden="true"><rect width="200" height="160" rx="12" fill="#fffaf3"/>'+body+'</svg>';
 artCache.set(id,svg);return svg;
}
