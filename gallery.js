import * as T from 'three';
import { createCanvasRenderer } from './canvas3d.js';

const palettes = {
 paper:'#fbfcff', ink:'#142033', dim:'#51637b', line:'#cfdae8',
 navy:'#212f46', deep:'#131e30', red:'#b7253b', rose:'#fbe7eb',
};
const exhibits = [
 {tag:'ДОШКІЛЬНА ОСВІТА',title:'Ігрові сесії',note:'Інформування про мінну небезпеку',photo:'overview',placeholder:'Загальний кадр заняття'},
 {tag:'ХТО МИ',title:'Наш відділ',lines:['Інформаційні сесії','Навчальні матеріали','Співпраця із закладами']},
 {tag:'ЗАНЯТТЯ ДЛЯ ДІТЕЙ',title:'Ігрова сесія',photo:'play',placeholder:'Діти в процесі гри'},
 {tag:'ПРИКЛАД ДЛЯ ПОКАЗУ',title:'Гра наживо',photo:'prop',placeholder:'Ілюстрація для гри'},
 {tag:'ДРУКОВАНІ МАТЕРІАЛИ',title:'Вартові дивосвіту',book:true},
 {tag:'ПРОПОЗИЦІЇ',title:'Для дитсадка',lines:['Для дітей','Для працівників','Для батьків']},
 {tag:'НАСТУПНИЙ КРОК',title:'Перша зустріч',lines:['Заклад і аудиторія','Формат і кількість груп','Бажані дати']},
];
const v=(x,y,z)=>new T.Vector3(x,y,z);
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function label(c,value,x,y,max,size=26,color=palettes.ink,weight=720){
 c.font=weight+' '+size+'px Montserrat,system-ui,sans-serif';
 c.fillStyle=color;c.fillText(value,x,y,max);
}
function picture(c,image,x,y,w,h,placeholder){
 rect(c,'#e0e8f4',x,y,w,h);
 if(image?.naturalWidth){
  const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight);
  const dw=image.naturalWidth*scale, dh=image.naturalHeight*scale;
  c.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
 }else{
  c.save();
  c.beginPath();c.rect(x,y,w,h);c.clip();
  c.strokeStyle='#aebfd66b';c.lineWidth=1.3;
  for(let j=x;j<x+w;j+=22){c.beginPath();c.moveTo(j,y);c.lineTo(j,y+h);c.stroke();}
  for(let j=y;j<y+h;j+=22){c.beginPath();c.moveTo(x,j);c.lineTo(x+w,j);c.stroke();}
  const tw=Math.min(w-20,290), top=y+h/2-20;
  rect(c,'#f8fbff',x+(w-tw)/2,top,tw,40);
  c.textAlign='center';
  label(c,placeholder,x+w/2,top+26,tw-14,18,'#425971');
  c.restore();
 }
}
function canvasTexture(w,h){
 const canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 return {ctx,texture,width:w,height:h};
}

export function createGallery(host, sources, select, refreshPoster){
 let renderer;
 try{
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true});
  if(context)renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true});
 }catch{/* Use the same scene through the Canvas renderer. */}
 if(!renderer)renderer=createCanvasRenderer();
 if(!renderer)return null;
 renderer.domElement.className='gallery-canvas';
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,renderer.software?1.35:1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;
 host.prepend(renderer.domElement);
 host.dataset.renderer=renderer.software?'canvas':'webgl';

 const scene=new T.Scene();
 const camera=new T.OrthographicCamera(-1,1,1,-1,.03,36);
 const root=new T.Group();root.name='StoryRibbon';scene.add(root);
 scene.add(new T.HemisphereLight(0xf5f9ff,0x8192b4,2.1));
 const light=new T.DirectionalLight(0xf6f9ff,1.65);light.position.set(-3,7,4);scene.add(light);
 const material=color=>new T.MeshStandardMaterial({color,roughness:.83});
 const frames=material(0x354761),paper=material(0xe6eefb),red=material(0xb7253b),steel=material(0x758ba8),under=material(0x4a5d7a);
 const bolt=material(0xa9bbd5);
 function group(parent,x=0,y=0,z=0){
  const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;
 }
 function box(parent,m,w,h,d,x=0,y=0,z=0){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 function display(parent,canvas,w,h,x=0,y=0,z=.04){
  canvas.texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:canvas.texture}));
  face.position.set(x,y,z);parent.add(face);return face;
 }
 const loaded={}, surfaces=[], pickable=[], gameTabs=[], bookPanels=[];
 const stations=exhibits.map((_,i)=>{
  const angle=(i-3)*.267;
  return {x:4.85*Math.sin(angle),z:3.50*(1-Math.cos(angle)),yaw:-angle*.8};
 });
 function rail(a,b,y,depth,thickness,m){
  const dx=b.x-a.x,dz=b.z-a.z;
  const rail=box(root,m,Math.hypot(dx,dz)+.025,thickness,depth,(a.x+b.x)/2,y,(a.z+b.z)/2);
  rail.rotation.y=Math.atan2(-dz,dx);
 }
 for(let i=0;i<stations.length-1;i++){
  rail(stations[i],stations[i+1],.138,.141,.047,under);
  rail(stations[i],stations[i+1],.167,.104,.015,steel);
 }
 function redraw(index){
  const e=exhibits[index], a=surfaces[index], c=a.ctx,w=a.width,h=a.height;
  const final=index===6;
  rect(c,final?palettes.deep:palettes.paper,0,0,w,h);
  rect(c,palettes.red,0,0,w,7);
  label(c,e.tag,29,40,w-65,18,final?'#f8cbd4':palettes.red,780);
  label(c,e.title,28,91,w-65,index===4?43:50,final?'#f8fbff':palettes.ink,825);
  rect(c,final?'#536780':palettes.line,29,109,w-58,2);
  if(e.photo){
   picture(c,loaded[e.photo],29,127,w-58,index===0?252:286,e.placeholder);
   if(e.note)label(c,e.note,29,407,w-60,19,palettes.dim);
  }else if(e.book){
   rect(c,'#eaf1fb',29,127,w-58,280);
   label(c,'ДРУКОВАНА РОЗМАЛЬОВКА',33,430,w-64,17,palettes.dim,780);
  }else{
   e.lines.forEach((s,i)=>{
    const y=134+i*89;
    rect(c,final?'#243650':'#e9eff8',29,y,w-58,65);
    rect(c,i===0?palettes.red:(final?'#708bae':'#8da4c0'),29,y,5,65);
    label(c,s,51,y+40,w-99,26,final?'#f9fbff':palettes.ink,730);
   });
  }
  a.texture.needsUpdate=true;
 }
 stations.forEach((s,i)=>{
  const station=group(root,s.x,0,s.z);station.rotation.y=s.yaw;
  box(station,under,.82,.071,.39,0,.071,0);
  box(station,steel,.56,.031,.26,0,.119,0);
  for(const x of [-.38,.38]){
   box(station,frames,.045,.60,.057,x,.389,-.03);
   box(station,bolt,.077,.041,.091,x,.191,-.03);
  }
  const board=box(station,i===0||i===6?red:frames,1.126,.901,.069,0,.89,0);
  board.userData.station=i;pickable.push(board);
  box(station,paper,1.105,.880,.012,0,.89,.037);
  const a=canvasTexture(550,445);surfaces.push(a);
  display(station,a,1.074,.868,0,.89,.044);
  box(station,red,.08,.027,.135,.457,1.36,-.01);
  if(i===4){
   const book=group(station,0,.835,.095);
   box(book,frames,.033,.54,.054,0,0,0);
   for(const [side,key,caption] of [[-1,'cover','Обкладинка'],[1,'page','Сторінка']]){
    const hinge=group(book);hinge.rotation.y=-side*.68;
    const page=box(hinge,side<0?red:paper,.427,.537,.039,side*.215,0,0);
    page.userData.station=i;pickable.push(page);
    const print=canvasTexture(352,440);
    display(hinge,print,.405,.514,side*.215,0,.021);
    bookPanels.push({side,hinge,print,key,caption});
   }
   redrawBook();
  }
  if(i===3){
   ['Показуємо','Запитуємо','Підсумовуємо'].forEach((name,j)=>{
    const g=group(station,(j-1)*.36,.35,.12);
    g.rotation.y=(j-1)*.10;
    const card = box(g,frames,.337,.134,.052);
    card.userData.station=i;card.userData.game=j;pickable.push(card);
    const a=canvasTexture(350,130);
    display(g,a,.310,.112,0,0,.030);
    gameTabs.push({g,a,name,selected:null});
   });
  }
  redraw(i);
 });
 function redrawBook(){
  for(const {print,key,caption} of bookPanels){
   const {ctx:c,width:w,height:h}=print;
   rect(c,key==='cover'?palettes.navy:palettes.paper,0,0,w,h);
   picture(c,loaded[key],10,10,w-20,h-20,caption);
   print.texture.needsUpdate=true;
  }
 }
 for(const [key,src] of Object.entries(sources)){
  const img=new Image();
  img.onload=()=>{loaded[key]=img;exhibits.forEach((e,i)=>{if(e.photo===key)redraw(i);});if(key==='cover'||key==='page')redrawBook();refreshPoster?.();wake();};
  img.src=src;
 }
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0, mode='overview', game=0, aspect=host.clientWidth/host.clientHeight||1.25;
 let token=0, started=0, animation=null;
 const aim=v(0,0,0),look=v(0,0,0), offset=v(0,0,0);
 let height=.9;
 const fixedFront=v(0,0,1);
 function shot(){
  const station=stations[index];
  if(mode==='overview')return {aim:v(0,.62,.2),yaw:.13,radius:8.6,lift:4.25,half:Math.max(1.18,4.55/aspect)};
  if(mode==='inside')return {aim:v(station.x,.90,station.z+.04),yaw:station.yaw,radius:.58,lift:.09,half:.28};
  const yaw=station.yaw+(index%2===0?.19:-.17);
  return {aim:v(station.x,index===3?.78:.84,station.z),yaw,radius:3.3,lift:index===3?1.04:1.18,half:.73};
 }
 const initial=shot();
 let yaw=initial.yaw,radius=initial.radius,lift=initial.lift;
 aim.copy(initial.aim);
 height=initial.half;
 function redrawTabs(){
  gameTabs.forEach(({a,name,selected,g},i)=>{
   const active=game===i;
   if(active!==selected){
    rect(a.ctx,active?palettes.red:'#ecf2fa',0,0,a.width,a.height);
    label(a.ctx,name,16,78,a.width-33,32,active?'#fff':palettes.ink,810);
    a.texture.needsUpdate=true;gameTabs[i].selected=active;
   }
   g.position.z+=((active?.22:.12)-g.position.z)*(.23);
   g.position.y+=((active?.337:.316)-g.position.y)*(.23);
  });
 }
 function updateCamera(){
  const pad=Math.max(1,1.02/aspect),h=height*pad;
  camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;
  camera.updateProjectionMatrix();
  offset.copy(fixedFront).applyAxisAngle(T.Object3D.DEFAULT_UP,yaw).multiplyScalar(radius);
  camera.position.copy(aim).add(offset);camera.position.y+=lift;
  look.copy(aim);camera.lookAt(look);camera.updateMatrixWorld();
 }
 function wake(){if(!token)token=requestAnimationFrame(frame);}
 function frame(now){
  token=0;
  let finished;
  if(animation){
   if(!started)started=now;
   const p=motion.matches?1:Math.min(1,(now-started)/animation.duration);
   const ease=p*p*(3-2*p);
   const {from,to,arch,swing}=animation;
   aim.copy(from.aim).lerp(to.aim,ease);
   aim.y+=Math.sin(Math.PI*ease)*arch*.14;
   yaw=T.MathUtils.lerp(from.yaw,to.yaw,ease)+Math.sin(Math.PI*ease)*swing;
   radius=T.MathUtils.lerp(from.radius,to.radius,ease);
   height=T.MathUtils.lerp(from.half,to.half,ease)+Math.sin(Math.PI*ease)*arch*.27;
   lift=T.MathUtils.lerp(from.lift,to.lift,ease)+Math.sin(Math.PI*ease)*arch*.55;
   if(p>=1){finished=animation.done;animation=null;}
  }
  redrawTabs();
  const opened=index===4&&mode!=='overview';
  for(const {side,hinge} of bookPanels)hinge.rotation.y+=(-side*(opened?.19:.68)-hinge.rotation.y)*(motion.matches?1:.20);
  updateCamera();
  renderer.render(scene,camera);
  host.classList.add('gallery-ready');
  if(finished){host.dataset.moving='false';finished(true);}
  const unsettled=gameTabs.some(({g},i)=>Math.abs(g.position.z-(game===i?.22:.12))>.002);
  const pageMoving=bookPanels.some(({side,hinge})=>Math.abs(hinge.rotation.y+side*(opened?.19:.68))>.004);
  if(animation||unsettled||pageMoving)wake();
 }
 function resize(){
  const {clientWidth:w,clientHeight:h}=host;
  if(!w||!h)return;
  aspect=w/h;
  renderer.setSize(w,h,false);
  if(mode==='overview'&&!animation)height=shot().half;
  wake();
 }
 new ResizeObserver(resize).observe(host);
 resize();
 const ray=new T.Raycaster(), mouse=new T.Vector2();
 function hit(e){
  const b=renderer.domElement.getBoundingClientRect();
  mouse.set((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2);
  ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(pickable,false)[0];
  return hit?.object.userData;
 }
 renderer.domElement.addEventListener('pointermove',e=>{
  renderer.domElement.style.cursor=hit(e)?'pointer':'default';
 });
 renderer.domElement.addEventListener('click',e=>{
  const target=hit(e);
  if(target)select(target.station,target.game);
 });
 function drawPoster(next,canvas){
  const source=surfaces[next]?.ctx.canvas;
  if(!source)return;
  canvas.width=source.width;canvas.height=source.height;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(source,0,0);
  if(next===4){
   bookPanels.forEach(({print},i)=>ctx.drawImage(print.ctx.canvas,75+i*200,126,195,274));
  } else if(next===3){
   gameTabs.forEach(({a},i)=>ctx.drawImage(a.ctx.canvas,30+i*166,414,153,28));
  }
 }
 return {
  drawPoster,
  setGame(step){game=step;redrawTabs();wake();},
  move(next,view,{instant=false}={}){
   const distance=Math.abs(next-index), sourceMode=mode, changed=next!==index||view!==mode;
   index=next;mode=view;
   if(!changed&&!instant){wake();return animation?.promise??Promise.resolve(true);}
   if(animation){animation.done(false);animation=null;}
   const to=shot();
   if(instant||motion.matches){
    aim.copy(to.aim);yaw=to.yaw;radius=to.radius;lift=to.lift;height=to.half;
    host.dataset.moving='false';wake();return Promise.resolve(true);
   }
   started=0;
   const zoom=view==='inside'||sourceMode==='inside';
   const promise=new Promise(done=>{
    animation={
     from:{aim:aim.clone(),yaw,radius,lift,half:height},to,
     arch:zoom?0:(view==='overview'?.65:Math.min(distance*.57,1.9)),
     swing:(to.aim.x>=aim.x?1:-1)*(zoom?.055:.23),
     duration:zoom?(view==='inside'?575:410):Math.min(1120,690+distance*63),done,
    };
   });
   animation.promise=promise;
   host.dataset.moving='true';
   wake();
   return promise;
  }
 };
}
