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
 const ambient=new T.HemisphereLight(0xfff9ed,0x9e6860,2.1);
 const sun = new T.DirectionalLight(0xfff3e2,2.2);
 sun.position.set(-1.6,3,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-1.25,right:1.25,top:1.25,bottom:-1.25,near:.3,far:7});
 sun.shadow.normalBias=.008;
 host.dataset.renderer=renderer.software?'canvas':'webgl';
 scene.add(ambient,sun);
 const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const cream=material(0xfdf0dc),paper=material(0xfff6e8), red=material(0x922d33), rose=material(0xca887e), graphite=material(0x292429,.38,.12), keys=material(0x1c1920), wood=material(0xad7255);
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
 const txt=(c,t,x,y,size=26,color='#3b2926',serif=false)=>{c.fillStyle=color;c.font=(serif?'bold ':'700 ')+size+'px '+(serif?'Georgia,serif':'system-ui,sans-serif');c.fillText(t,x,y);};
 const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function lines(c, color, x, y, w, count){for(let i=0;i<count;i++)rect(c,color,x,y+i*24,w*(i===count-1?.69:1),4);}
 let rng=317;const rand=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
 const timber=texture(1024,720,(c,w,h)=>{
  const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#c48f6a');grad.addColorStop(.48,'#bc8462');grad.addColorStop(1,'#d3a17e');c.fillStyle=grad;c.fillRect(0,0,w,h);
  for(let i=0;i<1600;i++){const x=rand()*w,y=rand()*h, n=rand(),l=25+rand()*440;c.strokeStyle=n>.5?'rgba(78,31,15,.10)':'rgba(255,227,190,.23)';c.lineWidth=.35+n;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+l*.34,y+rand()*4,x+l*.7,y-rand()*4,x+l,y+rand()*3);c.stroke();}
 });
 const root=group('SCENE_ROOT');const desk=group('Desk_Root',0,0,0,root);
 box(desk,wood,0,-.031,0,1.50,.060,1.10,false);
 plane(desk,timber,1.50,1.10,0,.0007,0);
 const legs=material(0x85513b);for(const x of [-.65,.65])for(const z of [-.47,.47])box(desk,legs,x,-.24,z,.056,.40,.056,false);
 const schedule=group('Planner_Root',-.255,.012,.015,root);schedule.rotation.y=.13;
 const planner=texture(768,540,(c,w,h)=>{
  rect(c,'#faf0dc',0,0,w,h);rect(c,'#8e2630',30,34,5,72);
  txt(c,'ТИЖНЕВИЙ  ПЛАН',51,55,17,'#902932');txt(c,'Шкільний розклад',51,102,44,'#392823',true);
  const xs=34,ys=157,cw=140,ch=88;
  ['ПН','ВТ','СР','ЧТ','ПТ'].forEach((d,i)=>txt(c,d,xs+i*cw+16,142,20,'#78514a'));
  c.strokeStyle='#d3bdaa';c.lineWidth=2;
  for(let col=0;col<5;col++)for(let row=0;row<4;row++)c.strokeRect(xs+col*cw,ys+row*ch,cw,ch);
  for(const [a,b] of [[0,0],[0,2],[1,1],[1,3],[2,0],[2,3],[3,0],[3,2],[4,1],[4,2]])lines(c,'#c9ac96',xs+a*cw+18,ys+b*ch+31,91,2);
  const x=xs+2*cw+5,y=ys+1*ch+5;rect(c,'#f4dcd0',x,y,130,78);
  c.setLineDash([7,5]);c.strokeStyle='#a13b43';c.strokeRect(x,y,130,78);c.setLineDash([]);
  txt(c,'ВІЛЬНО',x+26,y+46,19,'#94313b');
 });
 box(schedule,cream,0,-.006,0,.54,.011,.38);const plannerArt=plane(schedule,planner,.54,.38,0,0,0);plannerArt.name='Planner_Artwork';
 const entry=group('Planner_EntryCard',-.0007,.003,.013,schedule);
 const entryTex=texture(360,215);
 plane(entry,entryTex,.090,.054,0,0,0);
 const entryAnchor=group('Planner_EmptySlot_Anchor',-.0007,.003,.013,schedule);
 let entryLabel;
 function setEntry(label,online,phase){
  const key=label+'|'+online;
  if(key!==entryLabel){entryLabel=key;const {ctx:c,w,h}=entryTex;rect(c,'#a32d36',0,0,w,h);txt(c,label,15,88,Math.min(46,570/Math.max(label.length,1)),'#fff3df');txt(c,online?'ОНЛАЙН':'ОЧНО',15,156,39,'#f7d9ca');entryTex.t.needsUpdate=true;}
  entry.visible=!!label&&phase!==0;
 }
 const exercise=group('ExerciseCard_Root',.094,.013,.275,root);
 const card=group('ExerciseCard_Paper',0,0,0,exercise);
 box(card,paper,0,-.004,0,.237,.008,.148);
 function drawExercise(c,w,h){
  rect(c,'#faeed8',0,0,w,h);rect(c,'#f3dcd0',0,0,w,h*.42);txt(c,'СИТУАЦІЯ ДЛЯ ОБГОВОРЕННЯ',22,36,21,'#832934');
  c.strokeStyle='#9a6353';c.lineWidth=18;c.beginPath();c.moveTo(32,190);c.quadraticCurveTo(226,174,165,109);c.quadraticCurveTo(155,84,295,76);c.stroke();
  c.beginPath();c.moveTo(302,72);c.lineTo(255,157);c.lineTo(350,157);c.closePath();c.fillStyle='#a12b32';c.fill();
  txt(c,'!',293,147,56,'#fff6e5');txt(c,'Що зробимо?',20,254,43,'#492f2b',true);
 }
 const exerciseTex=texture(480,300,drawExercise);
 const exArt=plane(card,exerciseTex,.237,.148,0,.0006,0);exArt.name='ExerciseCard_Front';
 const laptop=group('Laptop_Root',.415,.008,-.17,root);laptop.rotation.y=-.12;
 box(laptop,graphite,0,.006,0,.43,.014,.294);
 const keyboard=group('Laptop_Keyboard',0,0,0,laptop);
 box(keyboard,keys,0,.014,-.017,.37,.002,.17,false);
 const keyGeo=new T.BoxGeometry(.020,.002,.014);const keyMat=material(0x51464c);
 for(let row=0;row<5;row++)for(let col=0;col<14;col++){const k=new T.Mesh(keyGeo,keyMat);k.position.set((col-6.5)*.024,.016,-.089+row*.027);keyboard.add(k);}
 box(keyboard,material(0x58505a),0,.014,.101,.144,.003,.061,false);
 const hinge=group('Laptop_LidPivot',0,.02,-.142,laptop);hinge.rotation.x=Math.PI/2;
 const lid=box(hinge,graphite,0,.131,0,.43,.274,.016);lid.name='Laptop_LidMesh';
 const screenTex=texture(640,400,(c,w,h)=>{rect(c,'#372a31',0,0,w,h);rect(c,'#ab353e',0,0,w,64);txt(c,'ОНЛАЙН  /  ВИХОВНА ГОДИНА',27,41,27,'#fff3e4');c.drawImage(exerciseTex.ctx.canvas,136,76,368,230);txt(c,'Яке рішення запропонує ваша група?',71,360,26,'#fff4dd');});
 const screen=plane(hinge,screenTex,.406,.254,0,.136,.0085,false,true);screen.name='Laptop_ScreenSurface';
 const screenAnchor=group('Laptop_ScreenCenter_Anchor',0,.136,.012,hinge);
 const book=group('Booklet_Root',-.504,.012,-.331,root);book.rotation.y=.11;
 box(book,cream,0,-.003,0,.166,.011,.225);
 const coverPivot=group('Booklet_CoverPivot',-.083,.005,0,book);
 box(coverPivot,red,.083,0,0,.166,.006,.225);
 const coverTex=texture(400,540,(c,w,h)=>{rect(c,'#954036',0,0,w,h);rect(c,'#dba580',23,23,w-46,h-46);rect(c,'#982a34',33,33,w-66,h-66);txt(c,'РОЗМАЛЬОВКА',67,105,23,'#f8d6b3');txt(c,'Вартові',63,195,59,'#ffecd4',true);txt(c,'дивосвіту',55,269,57,'#ffecd4',true);txt(c,'СХЕМАТИЧНИЙ ЗРАЗОК',58,435,20,'#ffdfc9');});
 plane(coverPivot,coverTex,.166,.225,.083,.0035,0);
 const pageText=texture(400,540,(c,w,h)=>{rect(c,'#f5e8d0',0,0,w,h);txt(c,'ІЛЮСТРАЦІЯ ДЛЯ ДІТЕЙ',27,58,25,'#8c302d');c.strokeStyle='#644436';c.lineWidth=5;c.strokeRect(27,84,w-54,336);c.beginPath();c.moveTo(53,346);c.quadraticCurveTo(250,145,352,306);c.stroke();c.beginPath();c.arc(242,177,29,0,Math.PI*2);c.stroke();lines(c,'#b28e72',37,462,w-75,2);});
 plane(book,pageText,.157,.214,0,.0035,0);
 const leftPage=plane(coverPivot,pageText,.157,.214,.083,-.0035,0);leftPage.rotation.x=Math.PI/2;leftPage.rotation.z=Math.PI;
 function infoCard(name,x,z,angle,w,d,draw){const g=group(name,x,.011,z,root);g.rotation.y=angle;box(g,paper,0,-.004,0,w,.007,d);plane(g,texture(540,360,draw),w,d,0,0,0);return g;}
 const department=infoCard('DepartmentCard_Root',-.056,-.308,-.13,.254,.169,(c,w,h)=>{rect(c,'#f6e6ce',0,0,w,h);rect(c,'#9e3139',0,0,w,24);txt(c,'ВІДДІЛ ПРОТИМІННОЇ',31,86,27,'#8c2630');txt(c,'ДІЯЛЬНОСТІ',31,122,27,'#8c2630');rect(c,'#dbb9a3',30,149,238,167);rect(c,'#cba28b',53,176,191,111);txt(c,'ПОЛЕ ДЛЯ ФОТО',63,237,19,'#68473c');lines(c,'#c19a7d',295,169,205,6);});
 const contact=infoCard('ContactCard_Root',.505,.28,.17,.236,.157,(c,w,h)=>{rect(c,'#f4e4cc',0,0,w,h);rect(c,'#a2353b',20,24,500,6);txt(c,'ПЛАНУВАННЯ ЗУСТРІЧІ',36,91,23,'#8f3034');txt(c,'Перший крок',34,172,62,'#392725',true);lines(c,'#bb9279',36,224,454,4);});
 const pencil=group('Pencil',-.397,.015,.341,root);pencil.rotation.y=-.47;box(pencil,red,0,0,0,.163,.012,.012,false);const tip=new T.Mesh(new T.ConeGeometry(.007,.032,6),material(0xd49e73));tip.rotateZ(-Math.PI/2);tip.position.x=.094;pencil.add(tip);
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
