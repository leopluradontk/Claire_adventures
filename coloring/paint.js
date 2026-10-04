/* Ink and paint are separate: the eraser never removes the template. */
export function segment(ctx,stroke,a,b,distance=0){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(length/Math.max(1,stroke.width*.12)));
 ctx.globalCompositeOperation=stroke.mode==='eraser'?'destination-out':'source-over';
 for(let i=0;i<=steps;i++){
  const k=i/steps;
  ctx.fillStyle=stroke.mode==='rainbow'?`hsl(${(stroke.hue+(distance+length*k)*.8)%360} 82% 64%)`:stroke.color;
  ctx.beginPath();ctx.arc(a[0]+dx*k,a[1]+dy*k,stroke.width/2,0,Math.PI*2);ctx.fill();
 }
 ctx.globalCompositeOperation='source-over';return length;
}
export function replay(ctx,ops,w=800,h=1000){
 ctx.clearRect(0,0,w,h);
 for(const s of ops){
  if(s.type==='clear'){ctx.clearRect(0,0,w,h);continue;}
  let distance=0;segment(ctx,s,s.points[0],s.points[0],0);
  for(let i=1;i<s.points.length;i++)distance+=segment(ctx,s,s.points[i-1],s.points[i],distance);
 }
}
export function composite(paint,art,w=800,h=1000){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');
 c.fillStyle='white';c.fillRect(0,0,w,h);c.drawImage(paint,0,0,w,h);c.globalCompositeOperation='multiply';c.drawImage(art,0,0,w,h);c.globalCompositeOperation='source-over';return canvas;
}
