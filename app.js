import {createGallery} from './gallery.js';
import {scenes,photoNames} from './exhibits.js';
import {artwork,stats,svg,region,number} from './graphics.js';
import report from './report.json';

const $=id=>document.getElementById(id);
const config=JSON.parse($('media-config').textContent);
const mapURL='https://deafinicio.github.io/mine-risk-map/';
const steps=[{id:'pochatok',chapter:0,kind:'panorama'}];
scenes.forEach((scene,chapter)=>{
 steps.push({id:scene.id,chapter,kind:'stand'});
 scene.pages.forEach(page=>{
  steps.push({id:page.id,chapter,kind:'page',page});
  if(page.map)steps.push({id:'mapa',chapter,kind:'map',page});
  for(const key of page.photos||[]){
   if(config.images[key])steps.push({id:'foto-'+key,chapter,kind:'photo',page,key});
  }
 });
});
steps.push({id:'zavershennia',chapter:scenes.length-1,kind:'panorama'});
const indexFor=id=>steps.findIndex(step=>step.id===id);
const fromHash=()=>Math.max(0,indexFor(location.hash.slice(1)));
const fmt=n=>String(n).padStart(2,'0');
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const chartCities=report.locations;
const onlineMapAvailable=()=>location.origin===new URL(mapURL).origin&&navigator.onLine;
let cursor=fromHash(),ticket=0,overview=false,phase='stand',cameraChapter=0,cameraMode='stand',mapMode,city=0;
const gallery=createGallery($('space'));
const current=()=>steps[cursor];
const details=$('details');
$('timeline').innerHTML=scenes.map((s,i)=>`<button data-scene="${s.id}" aria-label="${s.name}"><i>${fmt(i+1)}</i><span>${s.name}</span></button>`).join('');
function phaseTo(value){
 phase=value;$('deck').dataset.phase=value;
 $('stand').hidden=value==='detail';details.hidden=value!=='detail';
 $('space').style.visibility=value==='detail'?'hidden':'visible';
}
function controls(hash){
 const {chapter,id,kind}=current(),scene=scenes[chapter];
 const panorama=kind==='panorama',wide=panorama||overview,ending=panorama&&cursor===steps.length-1;
 $('deck').dataset.wide=String(wide);
 [...$('timeline').children].forEach((b,i)=>{if(i===chapter&&!wide)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('prev').disabled=cursor===0&&!overview;$('next').disabled=cursor===steps.length-1&&!overview;
 $('counter').textContent=fmt(cursor+1)+' / '+fmt(steps.length);
 $('progress').style.setProperty('--progress',100*(cursor+1)/steps.length+'%');
 $('stand-label').textContent=wide?'Харківщина · Закладам освіти':'Стенд '+fmt(chapter+1)+' / 04';
 $('stand-title').textContent=wide?(ending?'Дякуємо за увагу':overview?'Чотири стенди':'Безпека починається зі знань'):scene.title;
 $('stand-intro').textContent=wide?(ending?'Запрошуйте команду до вашого закладу.':overview?'Оберіть стенд або поверніться до показу.':'Як наш відділ може допомогти вашому закладу освіти.'):scene.intro;
 $('enter').hidden=ending;
 $('enter').textContent=overview?'До поточного кроку':panorama?'До першого стенда':'Увійти до стенда';
 $('overview').hidden=panorama;
 $('overview').textContent=overview?'До показу':'Усі стенди';$('overview').setAttribute('aria-pressed',String(overview));
 if(hash)history.replaceState(null,'','#'+id);
}
function contacts(){
 return Object.entries(config.contact).filter(([,v])=>v).map(([key,value])=>{
  const href=key==='email'?'mailto:'+value:key==='phone'?'tel:'+value.replace(/[^+\d]/g,''):value;
  return `<a class="link-contact" href="${escape(href)}">${escape(key==='url'?'Контакти відділу':value)}</a>`;
 }).join('');
}
function pageMarkup(step){
 const p=step.page,scene=scenes[step.chapter],images=(p.photos||[]).filter(k=>config.images[k]);
 if(p.chart)return stats();
 const first=images[0];
 const visual=first?`<img src="${escape(config.images[first])}" alt="${photoNames[first]}"><button class="photo-link" data-jump="foto-${first}">Збільшити фото</button>`:artwork(p);
 return `<article class="layout"><div class="copy"><p class="kicker">${scene.name}</p><h2>${p.title}</h2><p class="lead">${p.lead}</p>
 ${p.rows?`<ul class="list">${p.rows.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul>`:''}
 ${p.duration?`<p class="secondary"><b>До ${p.duration} хвилин.</b> ${p.vr?'Інтерактивні сесії з VR плануємо запровадити з початку 2027 року.':''}</p>`:''}
 ${p.note?`<p class="secondary">${p.note}</p>`:''}${p.contacts?contacts():''}</div>
 <aside class="art ${['partners','kit','vr','invite'].includes(p.art)&&!first?'dark':''}" aria-label="Ілюстрація до теми">${visual}</aside></article>`;
}
function regionalMap(){
 const l=chartCities[city];
 return `<div class="map-alt">${svg(region(true)).replace('aria-hidden="true"','role="img" aria-label="Харківська область, три звітні локації"')}<div><p>Сесії за звітною локацією</p><strong>${number(l.sessions)}</strong><h3>${l.name}</h3><p>${report.period}. Показники охоплюють роботу команд у громадах.</p><div>${chartCities.map((p,i)=>`<button data-place="${i}" aria-pressed="${i===city}">${p.name}</button>`).join('')}</div></div></div>`;
}
function mediaMarkup(step){
 const isMap=step.kind==='map';
 return `<section class="fullview"><div class="view-bar"><div class="view-title"><img class="org-logo" src="media/urcs-logo.png" alt="Товариство Червоного Хреста України"><h2>${isMap?'Мапа проведених сесій':photoNames[step.key]}</h2></div><div class="map-controls">
 ${isMap&&onlineMapAvailable()?`<button id="toggle-map">${mapMode==='live'?'Зведення за локаціями':'Інтерактивна мапа'}</button>`:''}
 ${isMap&&!onlineMapAvailable()?`<a class="photo-link" href="${mapURL}" target="_blank" rel="noopener">Мапа онлайн ↗</a>`:''}
 <button class="photo-link" id="close-media">Закрити й продовжити</button></div></div>
 <div class="media-body">${isMap?(mapMode==='live'?`<iframe id="live-map" title="Інтерактивна мапа сесій відділу" src="${mapURL}"></iframe>`:regionalMap()):`<img src="${escape(config.images[step.key])}" alt="${photoNames[step.key]}">`}</div></section>`;
}
function showDetail(resetMap=true){
 const step=current();
 if(step.kind==='map'&&resetMap){mapMode=onlineMapAvailable()?'live':'summary';city=0;}
 details.innerHTML=step.kind==='page'?pageMarkup(step):mediaMarkup(step);
 const iframe=$('live-map');
 if(iframe)iframe.addEventListener('load',()=>{
  try{iframe.contentWindow.addEventListener('keydown',e=>keys(e,true),true);}
  catch{if(current().kind==='map'){mapMode='summary';showDetail(false);}}
 });
 details.scrollTop=0;phaseTo('detail');
 const heading=details.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});
}
function fly(chapter,mode,instant){
 cameraChapter=chapter;cameraMode=mode;
 return gallery?.move(chapter,mode,{instant})??Promise.resolve(true);
}
async function go(target,{hash=true,force=false,instant=false}={}){
 if(target<0||target>=steps.length||(target===cursor&&!force&&!overview))return;
 const id=++ticket,next=steps[target],oldChapter=cameraChapter,oldMode=cameraMode;
 const wasReading=phase==='detail'&&!overview;cursor=target;overview=false;controls(hash);
 if(wasReading&&oldChapter===next.chapter&&['page','map','photo'].includes(next.kind)){showDetail();return;}
 details.replaceChildren();phaseTo('stand');
 if(oldMode==='inside'&&(oldChapter!==next.chapter||next.kind==='panorama')){
  if(!await fly(oldChapter,'stand',instant)||ticket!==id)return;
 }
 if(next.kind==='panorama'){await fly(next.chapter,'overview',instant);return;}
 if(next.kind==='stand'){await fly(next.chapter,'stand',instant);return;}
 if(oldChapter!==next.chapter||oldMode==='overview'){
  if(!await fly(next.chapter,'stand',instant)||ticket!==id)return;
 }
 phaseTo('entering');
 if(await fly(next.chapter,'inside',instant)&&ticket===id)showDetail();
}
function stride(n){overview?go(cursor,{force:true}):go(cursor+n);}
function keys(e,fromMap=false){
 if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.isComposing)return;
 const forward=['ArrowRight','ArrowDown','PageDown'].includes(e.key),back=['ArrowLeft','ArrowUp','PageUp'].includes(e.key);
 if(forward||back){e.preventDefault();e.stopPropagation();stride(forward?1:-1);return;}
 if(e.target.closest?.('input,select,textarea,[contenteditable=true]'))return;
 if(e.key==='Escape'&&(current().kind==='map'||current().kind==='photo')){e.preventDefault();e.stopPropagation();go(indexFor(current().page.id));}
 else if(!fromMap&&['Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:steps.length-1);}
}
document.addEventListener('keydown',keys,true);
document.addEventListener('click',e=>{
 const scene=e.target.closest('[data-scene]'),jump=e.target.closest('[data-jump]'),place=e.target.closest('[data-place]');
 if(scene)go(indexFor(scene.dataset.scene));
 else if(jump)go(indexFor(jump.dataset.jump));
 else if(place){city=Number(place.dataset.place);showDetail(false);}
 else if(e.target.closest('#toggle-map')){mapMode=mapMode==='live'?'summary':'live';showDetail(false);}
 else if(e.target.closest('#close-media'))stride(1);
 else if(e.target.closest('.brand')){e.preventDefault();go(0);}
});
$('prev').onclick=()=>stride(-1);$('next').onclick=$('enter').onclick=()=>stride(1);
$('overview').onclick=()=>{
 if(overview){go(cursor,{force:true});return;}
 ++ticket;overview=true;details.replaceChildren();phaseTo('stand');controls(false);fly(current().chapter,'overview',false);
};
$('full').hidden=!document.fullscreenEnabled;
$('full').onclick=()=>{(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});};
document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'Згорнути':'На весь екран';$('full').lastElementChild.textContent=label;$('full').setAttribute('aria-label',label);});
window.addEventListener('hashchange',()=>go(fromHash(),{hash:false}));
go(cursor,{hash:false,force:true,instant:true});
