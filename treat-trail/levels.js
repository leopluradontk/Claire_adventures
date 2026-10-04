/* Treat Trail 1.0. Level data is separate from controls, outfits and sound. */
export const LEVELS = [{
  id: 'sunshine-meadow', name: 'Sunshine Meadow', version: 1, music: 'meadow', theme: 'meadow', description: 'Flower meadows, little creeks and a sunny picnic.', outfit: 'Pink dress & lavender bows',
  width: 6100, height: 600, start: {x: 300, y: 460},
  goal: {x: 5810, y: 460},
  ground: [
    {x: 0, y: 460, w: 1500}, {x: 1620, y: 460, w: 1230},
    {x: 2980, y: 460, w: 1390}, {x: 4510, y: 460, w: 1590}
  ],
  platforms: [
    {x: 650, y: 367, w: 200}, {x: 970, y: 315, w: 185},
    {x: 1240, y: 360, w: 165}, {x: 1860, y: 368, w: 180},
    {x: 2150, y: 310, w: 180}, {x: 2460, y: 359, w: 190},
    {x: 3220, y: 365, w: 185}, {x: 3520, y: 306, w: 200},
    {x: 3830, y: 360, w: 175}, {x: 4740, y: 365, w: 190},
    {x: 5050, y: 309, w: 185}, {x: 5360, y: 360, w: 180}
  ],
  checkpoints: [{x: 1830, y: 460}, {x: 3200, y: 460}, {x: 4740, y: 460}],
  signs: [
    {x: 510, text: 'Follow the treats!'}, {x: 1280, text: 'Jump the little creek'},
    {x: 2270, text: 'Your friends follow you'}, {x: 4100, text: 'Almost picnic time!'}
  ],
  /* [x, feet-relative world y, treat kind]. Extra-high treats reward exploring. */
  treats: [
    [430,423,'cookie'],[540,423,'berry'],[700,329,'cookie'],[798,329,'cupcake'],
    [1010,277,'berry'],[1100,277,'cookie'],[1280,322,'cupcake'],[1360,322,'berry'],
    [1490,362,'cookie'],[1570,334,'berry'],[1660,386,'cookie'],
    [1900,330,'cookie'],[1990,330,'berry'],[2190,272,'cupcake'],[2280,272,'cookie'],
    [2500,321,'berry'],[2600,321,'cupcake'],[2790,413,'cookie'],[2850,355,'berry'],
    [2925,333,'cookie'],[3010,395,'cupcake'],
    [3260,327,'berry'],[3360,327,'cookie'],[3560,268,'cupcake'],[3670,268,'berry'],
    [3880,322,'cookie'],[3960,322,'cupcake'],[4150,423,'berry'],[4300,413,'cookie'],
    [4380,350,'cupcake'],[4440,333,'berry'],[4530,390,'cookie'],
    [4780,327,'berry'],[4880,327,'cookie'],[5090,271,'cupcake'],[5180,271,'cookie'],
    [5400,322,'berry'],[5490,322,'cupcake'],[5590,423,'cookie'],[5680,423,'berry']
  ]
}];

/* Each new adventure has its own geometry and a route of 40 treats.
   Three platforms per section, forgiving rises, no moving hazards or enemies. */
function adventure(id, name, theme, width, ground, platformRows, description, outfit) {
  const platforms=platformRows.flatMap(row=>row.map(([x,y,w])=>({x,y,w})));
  const treats=[], kinds=['cookie','berry','cupcake'];
  platformRows.forEach((row,i)=>{
    const bank=ground[i], base=i===0?430:bank.x+170;
    treats.push([base,423,kinds[i%3]],[base+105,423,kinds[(i+1)%3]]);
    row.forEach(([x,y,w],j)=>treats.push([x+45,y-38,kinds[(i+j)%3]],[x+w-42,y-38,kinds[(i+j+1)%3]]));
    if(i<3){const edge=bank.x+bank.w, gap=ground[i+1].x-edge;
      treats.push([edge-12,360,'cookie'],[edge+gap*.54,335,'berry']);}
  });
  const goal={x:width-290,y:460};
  treats.push([goal.x-190,423,'cupcake'],[goal.x-85,423,'cookie']);
  return {id,name,theme,music:theme,description,outfit,version:1,width,height:600,
    start:{x:300,y:460},goal,ground,platforms,treats,
    checkpoints:ground.slice(1).map(s=>({x:s.x+100,y:460})),
    signs:[{x:500,text:'A new trail together!'},
      {x:ground[1].x+220,text:'Your friends follow you'},
      {x:ground[2].x+220,text:'Keep hopping, little team!'},
      {x:goal.x-380,text:'Celebration just ahead!'}]};
}
LEVELS.push(
  adventure('pumpkin-patch','Pumpkin Patch','autumn',6450,
    [{x:0,y:460,w:1600},{x:1720,y:460,w:1400},{x:3250,y:460,w:1390},{x:4780,y:460,w:1670}],
    [[[660,368,205],[975,304,195],[1260,353,190]],
     [[2080,370,195],[2380,299,200],[2675,356,200]],
     [[3590,364,210],[3910,301,195],[4200,354,200]],
     [[5120,368,200],[5430,307,200],[5720,356,200]]],
    'Golden leaves, hay-bale hops and a pumpkin-barn party.', 'Orange sweater, overalls & pumpkin scarves'),
  adventure('snowflake-trail','Snowflake Trail','snow',6660,
    [{x:0,y:460,w:1640},{x:1760,y:460,w:1420},{x:3310,y:460,w:1470},{x:4910,y:460,w:1750}],
    [[[680,369,205],[995,300,200],[1285,350,190]],
     [[2120,366,205],[2430,302,205],[2730,353,200]],
     [[3670,368,200],[3980,301,210],[4280,357,200]],
     [[5270,368,205],[5580,300,200],[5870,351,210]]],
    'Snowy pines, snow-bank platforms and a warm cocoa lodge.', 'Warm coat, boots, scarves & knitted hats'),
  adventure('sunny-seaside','Sunny Seaside','beach',6590,
    [{x:0,y:460,w:1630},{x:1750,y:460,w:1420},{x:3290,y:460,w:1410},{x:4830,y:460,w:1760}],
    [[[670,366,200],[980,306,205],[1280,355,185]],
     [[2110,370,205],[2425,302,195],[2715,356,205]],
     [[3650,366,200],[3960,305,200],[4260,355,190]],
     [[5190,369,210],[5510,302,195],[5800,356,200]]],
    'Palm trees, sandy islands and a beach-hut celebration.', 'Turquoise sundress, sun hats & beachwear')
);

export function validateLevel(level) {
  if (!level || !level.id || !Number.isFinite(level.width) || level.width < 720) throw new Error('Invalid level');
  const surfaces = [...level.ground, ...level.platforms];
  for (const p of surfaces) {
    if (![p.x,p.y,p.w].every(Number.isFinite) || p.w <= 0 || p.x < 0 || p.x+p.w > level.width) throw new Error('Invalid platform');
  }
  for (const t of level.treats) {
    if (!Number.isFinite(t[0]) || !Number.isFinite(t[1]) || !['cookie','berry','cupcake'].includes(t[2])) throw new Error('Invalid treat');
  }
  if(!['meadow','autumn','snow','beach'].includes(level.theme) || level.music!==level.theme) throw new Error('Invalid theme');
  for(const p of [level.start,level.goal,...level.checkpoints]) {
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!level.ground.some(s=>p.x>s.x+15&&p.x<s.x+s.w-15&&p.y===s.y)) throw new Error('Unsafe start, goal or checkpoint');
  }
  if(new Set(LEVELS.map(l=>l.id)).size!==LEVELS.length) throw new Error('Duplicate level id');
  return level;
}
