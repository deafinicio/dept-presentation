import * as T from 'three';
import { softwareDesk } from './software.js';

export function createDesk(host){
 let renderer;
 try {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true});
  if(context)renderer = new T.WebGLRenderer({canvas,context,alpha:true,antialias:true});
 } catch { /* Canvas fallback below. */ }
 if(!renderer)renderer=softwareDesk();
 if(!renderer)return null;
 renderer.domElement.className='render';
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFShadowMap;
 host.prepend(renderer.domElement);
 const scene=new T.Scene();
 const camera=new T.OrthographicCamera(-1,1,1,-1,.01,30);
 const ambient=new T.HemisphereLight(0xedf5ff,0x6e88aa,1.7);
 const sun = new T.DirectionalLight(0xf2f8ff,1.65);
 sun.position.set(-1.6,3,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-1.25,right:1.25,top:1.25,bottom:-1.25,near:.3,far:7});
 sun.shadow.normalBias=.008;
 host.dataset.renderer=renderer.software?'canvas':'webgl';
 scene.add(ambient,sun);
 const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const cream=material(0xeaf1fc),paper=material(0xfcfdff), red=material(0xa92c42), rose=material(0x8aaacc), graphite=material(0x202d40,.38,.12), keys=material(0x172234), deskEdge=material(0x7a91ad);
 const v=(x,y,z)=>new T.Vector3(x,y,z);
 function group(name,x=0,y=0,z=0,parent=scene){const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
 function box(parent, m,x,y,z,w,h,d, shadow=true){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function texture(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d');if(draw)draw(ctx,w,h);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return {t,ctx,w,h};
 }
 function plane(parent, tex,w,h,x,y,z,flat=true,unlit=false){
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),unlit?new T.MeshBasicMaterial({map:tex.t}):new T.MeshStandardMaterial({map:tex.t,roughness:.92}));
  mesh.position.set(x,y,z);if(flat)mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=!unlit;parent.add(mesh);return mesh;
 }
 const txt=(c,t,x,y,size=26,color='#263a55',isTitle=false)=>{
  c.fillStyle=color;
  c.font=(isTitle?'800 ':'700 ')+size+'px Montserrat,system-ui,sans-serif';
  c.fillText(t,x,y,Math.max(1,c.canvas.width-x-12));
 };
 const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function lines(c, color, x, y, w, count){for(let i=0;i<count;i++)rect(c,color,x,y+i*24,w*(i===count-1?.69:1),4);}
 let rng=317;const rand=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
 const laminate=texture(1024,720,(c,w,h)=>{
  const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#d5e0ee');grad.addColorStop(.48,'#aebfd4');grad.addColorStop(1,'#c7d7e9');c.fillStyle=grad;c.fillRect(0,0,w,h);
  for(let i=0;i<1600;i++){const x=rand()*w,y=rand()*h, n=rand(),l=25+rand()*440;c.strokeStyle=n>.5?'rgba(36,60,91,.10)':'rgba(255,255,255,.30)';c.lineWidth=.35+n;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+l*.34,y+rand()*4,x+l*.7,y-rand()*4,x+l,y+rand()*3);c.stroke();}
 });
 const root=group('SCENE_ROOT');const desk=group('Desk_Root',0,0,0,root);
 box(desk,deskEdge,0,-.031,0,1.50,.060,1.10,false);
 plane(desk,laminate,1.50,1.10,0,.0007,0);
 const legs=material(0x6f86a2);for(const x of [-.65,.65])for(const z of [-.47,.47])box(desk,legs,x,-.24,z,.056,.40,.056,false);
 const schedule=group('Planner_Root',-.255,.012,.015,root);schedule.rotation.y=.13;
 const planner=texture(768,540,(c,w,h)=>{
  rect(c,'#fbfdff',0,0,w,h);rect(c,'#a92c42',30,34,5,72);
  txt(c,'ТИЖНЕВИЙ  ПЛАН',51,55,17,'#a92c42');txt(c,'Шкільний розклад',51,102,44,'#213853',true);
  const xs=34,ys=157,cw=140,ch=88;
  ['ПН','ВТ','СР','ЧТ','ПТ'].forEach((d,i)=>txt(c,d,xs+i*cw+16,142,20,'#415e80'));
  c.strokeStyle='#b9cade';c.lineWidth=2;
  for(let col=0;col<5;col++)for(let row=0;row<4;row++)c.strokeRect(xs+col*cw,ys+row*ch,cw,ch);
  for(const [a,b] of [[0,0],[0,2],[1,1],[1,3],[2,0],[2,3],[3,0],[3,2],[4,1],[4,2]])lines(c,'#b5c8de',xs+a*cw+18,ys+b*ch+31,91,2);
  const x=xs+2*cw+5,y=ys+1*ch+5;rect(c,'#dceaff',x,y,130,78);
  c.setLineDash([7,5]);c.strokeStyle='#4c76a4';c.strokeRect(x,y,130,78);c.setLineDash([]);
  txt(c,'ВІЛЬНО',x+26,y+46,19,'#214c7c');
 });
 box(schedule,cream,0,-.006,0,.54,.011,.38);const plannerArt=plane(schedule,planner,.54,.38,0,0,0);plannerArt.name='Planner_Artwork';
 const entry=group('Planner_EntryCard',-.0007,.003,.013,schedule);
 const entryTex=texture(360,215);
 plane(entry,entryTex,.090,.054,0,0,0);
 const entryAnchor=group('Planner_EmptySlot_Anchor',-.0007,.003,.013,schedule);
 let entryLabel;
 function setEntry(label,online,phase){
  const key=label+'|'+online;
  if(key!==entryLabel){entryLabel=key;const {ctx:c,w,h}=entryTex;rect(c,'#24598f',0,0,w,h);txt(c,label,15,88,Math.min(46,570/Math.max(label.length,1)),'#fdfdff');txt(c,online?'ОНЛАЙН':'ОЧНО',15,156,39,'#e0efff');entryTex.t.needsUpdate=true;}
  entry.visible=!!label&&phase!==0;
 }
 const exercise=group('ExerciseCard_Root',.094,.013,.275,root);
 const card=group('ExerciseCard_Paper',0,0,0,exercise);
 box(card,paper,0,-.004,0,.237,.008,.148);
 function drawExercise(c,w,h){
  rect(c,'#fbfdff',0,0,w,h);rect(c,'#dfecfc',0,0,w,h*.42);txt(c,'СИТУАЦІЯ ДЛЯ ОБГОВОРЕННЯ',22,36,21,'#264d77');
  c.strokeStyle='#789cca';c.lineWidth=18;c.beginPath();c.moveTo(32,190);c.quadraticCurveTo(226,174,165,109);c.quadraticCurveTo(155,84,295,76);c.stroke();
  c.beginPath();c.moveTo(302,72);c.lineTo(255,157);c.lineTo(350,157);c.closePath();c.fillStyle='#b42335';c.fill();
  txt(c,'!',293,147,56,'#ffffff');txt(c,'Що зробимо?',20,254,43,'#213853',true);
 }
 const exerciseTex=texture(480,300,drawExercise);
 const exArt=plane(card,exerciseTex,.237,.148,0,.0006,0);exArt.name='ExerciseCard_Front';
 const laptop=group('Laptop_Root',.415,.008,-.17,root);laptop.rotation.y=-.12;
 box(laptop,graphite,0,.006,0,.43,.014,.294);
 const keyboard=group('Laptop_Keyboard',0,0,0,laptop);
 box(keyboard,keys,0,.014,-.017,.37,.002,.17,false);
 const keyGeo=new T.BoxGeometry(.020,.002,.014);const keyMat=material(0x405574);
 for(let row=0;row<5;row++)for(let col=0;col<14;col++){const k=new T.Mesh(keyGeo,keyMat);k.position.set((col-6.5)*.024,.016,-.089+row*.027);keyboard.add(k);}
 box(keyboard,material(0x526b89),0,.014,.101,.144,.003,.061,false);
 const hinge=group('Laptop_LidPivot',0,.02,-.142,laptop);hinge.rotation.x=Math.PI/2;
 const lid=box(hinge,graphite,0,.131,0,.43,.274,.016);lid.name='Laptop_LidMesh';
 const screenTex=texture(640,400,(c,w,h)=>{rect(c,'#14253d',0,0,w,h);rect(c,'#24598f',0,0,w,64);txt(c,'ОНЛАЙН  /  ВИХОВНА ГОДИНА',27,41,27,'#f5faff');c.drawImage(exerciseTex.ctx.canvas,136,76,368,230);txt(c,'Яке рішення запропонує ваша група?',71,360,26,'#f5faff');});
 const screen=plane(hinge,screenTex,.406,.254,0,.136,.0085,false,true);screen.name='Laptop_ScreenSurface';
 const screenAnchor=group('Laptop_ScreenCenter_Anchor',0,.136,.012,hinge);
 const book=group('Booklet_Root',-.504,.012,-.331,root);book.rotation.y=.11;
 box(book,cream,0,-.003,0,.166,.011,.225);
 const coverPivot=group('Booklet_CoverPivot',-.083,.005,0,book);
 box(coverPivot,red,.083,0,0,.166,.006,.225);
 const coverTex=texture(400,540,(c,w,h)=>{rect(c,'#244e78',0,0,w,h);rect(c,'#b8d2ef',23,23,w-46,h-46);rect(c,'#285584',33,33,w-66,h-66);txt(c,'РОЗМАЛЬОВКА',67,105,23,'#dbeaff');txt(c,'Вартові',63,195,59,'#ffffff',true);txt(c,'дивосвіту',55,269,57,'#ffffff',true);txt(c,'СХЕМАТИЧНИЙ ЗРАЗОК',58,435,20,'#dbeaff');});
 plane(coverPivot,coverTex,.166,.225,.083,.0035,0);
 const pageText=texture(400,540,(c,w,h)=>{rect(c,'#f5f9ff',0,0,w,h);txt(c,'ІЛЮСТРАЦІЯ ДЛЯ ДІТЕЙ',27,58,25,'#254e79');c.strokeStyle='#385b81';c.lineWidth=5;c.strokeRect(27,84,w-54,336);c.beginPath();c.moveTo(53,346);c.quadraticCurveTo(250,145,352,306);c.stroke();c.beginPath();c.arc(242,177,29,0,Math.PI*2);c.stroke();lines(c,'#a3b9d6',37,462,w-75,2);});
 plane(book,pageText,.157,.214,0,.0035,0);
 const leftPage=plane(coverPivot,pageText,.157,.214,.083,-.0035,0);leftPage.rotation.x=Math.PI/2;leftPage.rotation.z=Math.PI;
 function infoCard(name,x,z,angle,w,d,draw){const g=group(name,x,.011,z,root);g.rotation.y=angle;box(g,paper,0,-.004,0,w,.007,d);plane(g,texture(540,360,draw),w,d,0,0,0);return g;}
 const department=infoCard('DepartmentCard_Root',-.056,-.308,-.13,.254,.169,(c,w,h)=>{rect(c,'#f8fbff',0,0,w,h);rect(c,'#af2438',0,0,w,24);txt(c,'ВІДДІЛ ПРОТИМІННОЇ',31,86,27,'#253e60');txt(c,'ДІЯЛЬНОСТІ',31,122,27,'#253e60');rect(c,'#dae8f8',30,149,238,167);rect(c,'#c7d9ef',53,176,191,111);txt(c,'ПОЛЕ ДЛЯ ФОТО',63,237,19,'#39597c');lines(c,'#9cb4d1',295,169,205,6);});
 const contact=infoCard('ContactCard_Root',.505,.28,.17,.236,.157,(c,w,h)=>{rect(c,'#fafcff',0,0,w,h);rect(c,'#b42335',20,24,500,6);txt(c,'ПЛАНУВАННЯ ЗУСТРІЧІ',36,91,23,'#254e79');txt(c,'Перший крок',34,172,62,'#1d3554',true);lines(c,'#a3b9d6',36,224,454,4);});
 const pencil=group('Pencil',-.397,.015,.341,root);pencil.rotation.y=-.47;box(pencil,red,0,0,0,.163,.012,.012,false);const tip=new T.Mesh(new T.ConeGeometry(.007,.032,6),material(0xdbe5f0));tip.rotateZ(-Math.PI/2);tip.position.x=.094;pencil.add(tip);
 const shots=[
  [v(1.08,1.41,1.48),v(0,-.10,0),.98],
  [v(.36,1.23,1.0),v(-.05,.02,-.27),.51],
  [v(.19,1.65,1.14),v(-.24,0,.02),.62],
  [v(.23,1.43,1.2),v(.14,.015,.235),.59],
  [v(.42,1.45,1.22),v(-.49,.014,-.28),.61],
  [v(.67,1.33,1.26),v(.27,.01,.25),.63],
  [v(.88,1.48,1.29),v(.02,-.006,.12),.84],
 ];
 const onlineShot=[v(.67,1.06,1.04),v(.31,.11,-.08),.55];
 const aim=shots[0][1].clone();camera.position.copy(shots[0][0]);let extent=shots[0][2],aspect=1;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const temp=v(0,0,0), start=exercise.position.clone();
 const upright=new T.Quaternion();const flat=new T.Quaternion();
 const endRot=new T.Quaternion();
 flat.setFromEuler(new T.Euler(0,-.11,0));upright.setFromEuler(new T.Euler(Math.PI/2,0,0));
 let s={step:0}, progress=0,dirty=100,frameId=0,old=0;
 function updateView(){
  const h=extent*Math.max(1,1.1/aspect);camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;camera.updateProjectionMatrix();camera.lookAt(aim);
 }
 function frame(now){
  frameId=0;
  const dt=old?Math.min(.12,(now-old)/1000):.016;old=now;
  const ease=reduce.matches?1:1-Math.pow(.007,dt);
  const close=s.step===3&&s.online;
  const shot=s.overview?shots[0]:close?onlineShot:shots[s.step];
  camera.position.lerp(shot[0],ease);aim.lerp(shot[1],ease);extent+=(shot[2]-extent)*ease;updateView();
  hinge.rotation.x+=((close?-.15:Math.PI/2)-hinge.rotation.x)*ease;
  keyboard.visible=hinge.rotation.x<1.28;
  coverPivot.rotation.z+=((s.step===4&&s.book?Math.PI-.02:0)-coverPivot.rotation.z)*ease;
  progress+=((close?1:0)-progress)*(reduce.matches?1:1-Math.pow(.03,dt));
  screenAnchor.getWorldPosition(temp);
  exercise.position.copy(start).lerp(temp,progress);exercise.position.y+=Math.sin(progress*Math.PI)*.24;
  endRot.copy(upright).premultiply(laptop.quaternion);
  exercise.quaternion.copy(flat).slerp(endRot,progress);
  exercise.scale.setScalar(1+.52*progress);
  exercise.visible=progress<.925;
  screen.material.color.setRGB(.12+.88*progress,.12+.88*progress,.12+.88*progress);
  renderer.render(scene,camera);host.classList.add('ready');
  if(--dirty>0)frameId=requestAnimationFrame(frame);else old=0;
 }
 function wake(){dirty=reduce.matches?2:96;if(!frameId)frameId=requestAnimationFrame(frame);}
 function resize(){
  const {clientWidth:w,clientHeight:h}=host;if(!w||!h)return;
  aspect=w/h;renderer.setSize(w,h,false);wake();
 }
 new ResizeObserver(resize).observe(host);resize();
 return {update(state){s=state;setEntry(state.label,state.online,state.step);wake();}};
}
