import * as T from 'three';
import {createCanvasRenderer} from './canvas3d.js';
import report from './report.json';

const ink=0x20273e, lilac=0xaaa7ef, pale=0xe0dffb, red=0xfa4c48, ice=0xf6f7ff;
function mesh(parent,geometry,color,x=0,y=0,z=0){
 const part=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.70,metalness:.06}));
 part.position.set(x,y,z);parent.add(part);return part;
}
function cube(p,w,h,d,c,x=0,y=0,z=0){return mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z);}
function group(p,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
function plate(p,points,thickness,color,y,bevel=.016){
 const shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z)));
 const o=mesh(p,new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:!!bevel,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1}),color,0,y,0);
 o.rotation.x=-Math.PI/2;return o;
}
function pin(p,x,y,z){
 mesh(p,new T.CylinderGeometry(.018,.024,.29,8),ink,x,y+.14,z);
 mesh(p,new T.SphereGeometry(.105,16,10),red,x,y+.32,z);
}
function atlas(p){
 const poly=report.outline.map(([x,y])=>[x*1.36,-y*1.36]);
 for(const [y,c] of [[.10,ink],[.23,lilac],[.38,ice]])plate(p,poly,.095,c,y,.012);
 report.locations.forEach(({point:[x,y]})=>pin(p,x*1.36,.49,-y*1.36));
}
function extrudeArch(p,x,height,z,color){
 const outer=height*.47,t=.19,r=outer-t,base=height-outer;
 const a=new T.Shape();a.moveTo(-outer,0);a.lineTo(-outer,base);a.absarc(0,base,outer,Math.PI,0,true);
 a.lineTo(outer,0);a.lineTo(r,0);a.lineTo(r,base);a.absarc(0,base,r,0,Math.PI,false);a.lineTo(-r,0);a.closePath();
 mesh(p,new T.ExtrudeGeometry(a,{depth:.22,bevelEnabled:true,bevelSegments:1,bevelThickness:.02,bevelSize:.015,curveSegments:12}),color,x,0,z);
}
function audiences(p){
 [[-.48,2,-.65,ink],[-.17,1.65,-.18,lilac],[.18,1.28,.28,ice],[.50,.92,.73,red]].forEach(args=>extrudeArch(p,...args));
}
function book(p){
 const book=group(p,0,.30,0);book.rotation.y=-.25;book.rotation.x=.13;
 for(const side of [-1,1]){
  const leaf=group(book);leaf.rotation.z=side*.27;
  cube(leaf,1.24,.095,1.65,side<0?red:ink,side*.62);
  for(let i=0;i<5;i++)cube(leaf,1.18,.027,1.54,i%2?lilac:ice,side*.60,.065+i*.038,0);
  for(let i=0;i<4;i++)cube(leaf,.73-i*.075,.011,.033,ink,side*.59,.24,.06+i*.13);
  if(side===1)cube(leaf,.74,.02,.4,lilac,.58,.24,-.37);
  else for(let i=0;i<3;i++)cube(leaf,.16,.018,.30, i===0?red:lilac,-.34-i*.23,.24,-.37);
 }
}
function links(p){
 [[-.53,.79,.04,red,.2],[.55,.81,-.03,ink,1.12]].forEach(([x,y,z,c,angle])=>{
  const g=group(p,x,y,z);g.rotation.y=angle;g.rotation.z=-.52;
  const ring=mesh(g,new T.TorusGeometry(.59,.15,10,44),c);ring.scale.y=1.36;
 });
}
const makers=[atlas,audiences,book,links];
export function createGallery(host){
 let renderer;
 try{ const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2',{alpha:true,antialias:true});
  if(context)renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true});}catch{}
 renderer??=createCanvasRenderer();if(!renderer)return null;
 host.dataset.renderer=renderer.software?'canvas':'webgl';
 renderer.setPixelRatio(Math.min(devicePixelRatio,renderer.software?1.25:1.8));renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const world=new T.Scene(),camera=new T.OrthographicCamera(-3,3,3,-3,.05,90);
 world.add(new T.HemisphereLight(0xffffff,0x9996bd,2.05));
 const beam=new T.DirectionalLight(0xffffff,2.65);beam.position.set(-4,9,6);world.add(beam);
 const stations=makers.map((make,i)=>{
  const g=group(world,(i-1.5)*7.6,0,Math.sin(i*1.7)*1.55);g.rotation.y=[-.30,.21,-.15,.18][i];
  const shape=[[-1.59,-1.10],[-1.39,-1.30],[1.39,-1.30],[1.59,-1.10],[1.59,1.10],[1.39,1.30],[-1.39,1.30],[-1.59,1.10]];
  plate(g,shape,.10,ink,-.38);plate(g,shape,.10,lilac,-.22);plate(g,shape,.055,0xe5e7fa,-.055);
  for(let j=-4;j<=4;j++)cube(g,.012,.003,2.37,0xc0c2dc,j*.31,.012,0);
  for(let j=-3;j<=3;j++)cube(g,2.95,.003,.012,0xc0c2dc,0,.013,j*.31);
  cube(g,.52,.07,.026,red,-.84,-.12,1.31);
  make(g);return g;
 });
 let active=0,mode='intro',width=1,height=1,animation,frameId=0;
 const state={x:0,y:.4,z:0,yaw:.78,pitch:.57,size:6,shift:0,vertical:0};
 function target(){
  const small=width<760,g=stations[active],inside=mode==='inside',overview=mode==='overview';
  if(overview)return {x:0,y:.15,z:.5,yaw:.13,pitch:.55,size:Math.max(5.6,14.2*height/width),shift:0,vertical:0};
  return {x:g.position.x,y:inside?.55:.40,z:g.position.z,yaw:[.54,-.45,.58,.48][active],pitch:[.64,.30,.71,.32][active],size:inside?.36:(small?Math.max(2.1,2.20*height/width):Math.max(2.05,3.8*height/width)),shift:inside?0:(small?0:.225),vertical:inside?0:(small?-.15:-.015)};
 }
 function paint(){
  const aspect=width/height,s=state.size;camera.left=-s*aspect*(1+2*state.shift);camera.right=s*aspect*(1-2*state.shift);
  camera.top=s*(1-2*state.vertical);camera.bottom=-s*(1+2*state.vertical);camera.updateProjectionMatrix();
  const center=new T.Vector3(state.x,state.y,state.z),r=17;camera.position.set(state.x+r*Math.sin(state.yaw)*Math.cos(state.pitch),state.y+r*Math.sin(state.pitch),state.z+r*Math.cos(state.yaw)*Math.cos(state.pitch));
  camera.lookAt(center);camera.updateMatrixWorld();
  for(const g of stations)g.visible=mode==='overview'||Math.abs(g.position.x-state.x)<s*aspect*2+3.2;
  renderer.render(world,camera);
 }
 function frame(t){
  frameId=0;if(!animation){paint();return;}
  const a=animation,p=Math.min(1,(t-a.start)/a.duration),e=p*p*(3-2*p);
  for(const k of Object.keys(state))state[k]=T.MathUtils.lerp(a.from[k],a.to[k],e);
  state.size+=Math.sin(e*Math.PI)*a.arc;state.yaw+=Math.sin(e*Math.PI)*a.swing;
  paint();if(p<1)frameId=requestAnimationFrame(frame);else{animation=null;a.done(true);}
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function move(i,next,{instant=false}={}){
  const old=active;active=i;mode=next;
  if(animation){animation.done(false);animation=null;}cancelAnimationFrame(frameId);
  const to=target();
  if(instant||reduced.matches){Object.assign(state,to);paint();return Promise.resolve(true);}
  return new Promise(done=>{
   animation={from:{...state},to,start:performance.now(),duration:next==='inside'?480:old===i?660:930,arc:old===i?0:.88,swing:old===i?.04:.22,done};
   frameId=requestAnimationFrame(frame);
  });
 }
 function resize(){
  width=host.clientWidth||1;height=host.clientHeight||1;renderer.setSize(width,height,false);
  if(animation)animation.to=target();else Object.assign(state,target());paint();
 }
 new ResizeObserver(resize).observe(host);resize();
 return {move};
}
