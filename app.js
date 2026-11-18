const $ = id => document.getElementById(id);
const config = JSON.parse($('media-config').textContent);
const media = {
 overview: ['Загальний кадр заняття','Ігрова сесія в закладі дошкільної освіти'],
 play: ['Діти в процесі гри','Дошкільнята виконують ігрове завдання'],
 prop: ['Матеріал для гри','Матеріал до демонстраційного фрагмента'],
 cover: ['Обкладинка розмальовки','Обкладинка видання «Вартові дивосвіту»'],
 page: ['Сторінка розмальовки','Сторінка видання «Вартові дивосвіту»'],
};
const imageIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.2" cy="9" r="1.5"/><path d="m3 17 5-4 3 2 4-4 6 5"/></svg>';
const escape = text => String(text).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
function photo(key, light=false) {
 const [caption,alt] = media[key], src=config.images[key];
 return `<figure class="media-frame${light?' media-light':''}${src?' has-photo':''}" data-photo="${key}">
  <div class="media-image">${src?`<img src="${escape(src)}" alt="${escape(alt)}" decoding="async">`:''}</div>
  <div class="media-empty"${src?' hidden':''}><div class="empty-content"><span class="empty-icon">${imageIcon}</span><strong>${caption}</strong></div></div>
  ${src?'<button type="button" class="button media-open" data-open-photo>Збільшити</button>':''}
  <figcaption>${src?caption:'Місце для фото · '+caption.toLowerCase()}</figcaption>
 </figure>`;
}
const prefix = (label, title) => `<p class="eyebrow">${label}</p><h1 id="slide-title" tabindex="-1">${title}</h1>`;
const cards = items => `<div class="cards">${items.map(([title,desc])=>`<section class="card"><h2>${title}</h2><p>${desc}</p></section>`).join('')}</div>`;
const sequence = steps => `<ol class="sequence">${steps.map(([title,desc],i)=>`<li><span class="count" aria-hidden="true">0${i+1}</span><div><strong>${title}</strong><p>${desc}</p></div></li>`).join('')}</ol>`;
const game = [
 ['Показуємо','«Що ви помітили на малюнку?»','Покажи малюнок стежки з попереджувальним знаком або коротко опиши ситуацію. Дай групі час відповісти.'],
 ['Запитуємо','«Чи підемо цією стежкою? До кого можна звернутися?»','Дай дітям змогу відповісти своїми словами. У залі попроси вихователів навести приклад відповіді, яку зрозуміє дошкільня.'],
 ['Підсумовуємо','«На позначену ділянку не заходимо. Кажемо дорослому».','Запропонуй дітям повторити правило своїми словами. Для живої презентації можна підставити приклад із гри, яку проводить команда.'],
];
let gameIndex = 0;
function gameControls() {
 return `<div class="game-list" role="group" aria-label="Кроки демонстрації">${game.map(([name],i)=>`<button class="game-step" type="button" data-game="${i}" aria-pressed="${i===gameIndex}" aria-controls="game-prompt">${name}</button>`).join('')}</div>
 <div class="prompt" id="game-prompt" aria-live="polite">${gamePrompt()}</div>`;
}
function gamePrompt() {
 const [name,question,instruction]=game[gameIndex];
 return `<small>${name}</small><h2>${question}</h2><p>${instruction}</p>`;
}
const contactLinks = () => {
 const {email,phone,url}=config.contact;
 const link=(href,name,extra='') => `<a class="button-link" href="${escape(href)}"${extra}>${escape(name)}</a>`;
 return [
  email&&link('mailto:'+email,email),
  phone&&link('tel:'+phone.replace(/[^+\d]/g,''),phone),
  url&&link(url,'Відкрити канал звернення',' target="_blank" rel="noopener noreferrer"'),
 ].filter(Boolean).join('');
};
const slides = [
 { id:'pochatok', short:'Початок', layout:'cover slide-split', draw:()=>`<div class="slide-copy">
  ${prefix('Зустріч для працівників дитсадків','Як ми говоримо з дошкільнятами про <span>мінну небезпеку</span>')}
  <p class="lead">Як проходить ігрова сесія та що можемо організувати разом із вашим закладом.</p>
  <button type="button" class="button primary slide-cta" data-go="1">Познайомитися з відділом →</button>
 </div>${photo('overview')}` },
 { id:'viddil', short:'Про відділ', layout:'', draw:()=>`<div class="section-wrap">
  <div class="dept-head">
   ${prefix('Хто ми','Відділ протимінної діяльності')}
   <p class="org-line">Харківська обласна організація Товариства Червоного Хреста України</p>
   <p class="lead">Проводимо заняття для дітей і дорослих, щоб вони знали, як безпечніше діяти в умовах мінної небезпеки.</p>
  </div>
  ${cards([
   ['Проводимо сесії','Працюємо з різними віковими групами. Підбираємо мову, приклади й завдання під аудиторію.'],
   ['Використовуємо навчальні матеріали','Поєднуємо ілюстрації, друковані матеріали та завдання для обговорення.'],
   ['Співпрацюємо із закладами освіти','Разом погоджуємо, для кого потрібна зустріч і який формат підходить групі.'],
  ])}
 </div>` },
 { id:'sesia', short:'Ігрова сесія', layout:'slide-split', draw:()=>`<div class="slide-copy">
  ${prefix('Як ми працюємо з дошкільнятами','Сесія в ігровому форматі')}
  <p class="lead">Діти розглядають, відповідають і повторюють головне своїми словами.</p>
  ${sequence([
   ['Знайомимося й пояснюємо завдання','Фахівець дає коротку інструкцію, яку легко зрозуміти.'],
   ['Граємо й обговорюємо','Діти взаємодіють з ілюстрацією або іншим навчальним матеріалом.'],
   ['Разом повторюємо правило','Фахівець підбиває підсумок, а вихователь може повернутися до теми з групою.'],
  ])}
 </div>${photo('play')}` },
 { id:'hra', short:'Гра наживо', layout:'slide-split', draw:()=>`<div class="slide-copy">
  ${prefix('Демонстрація для освітян','Одна гра наживо')}
  <p class="lead">Приклад короткої розмови з дошкільнятами за ілюстрацією.</p>
  ${gameControls()}
 </div>${photo('prop',true)}` },
 { id:'materialy', short:'Матеріали', layout:'', draw:()=>`<div class="section-wrap">
  ${prefix('Інструменти для роботи з дітьми','Матеріали для заняття й повторення')}
  <p class="lead">Розмальовку <strong>«Вартові дивосвіту»</strong> можна використати як привід повернутися до теми після сесії. Запропонуйте дітям розглянути ілюстрацію й згадати, про що говорили на занятті.</p>
  <div class="media-set">${photo('cover',true)}${photo('page',true)}</div>
 </div>` },
 { id:'propozytsii', short:'Пропозиції', layout:'', draw:()=>`<div class="section-wrap">
  ${prefix('Можливості співпраці','Що можемо організувати для дитсадка?')}
  <p class="lead">Почати можна з однієї групи або погодити кілька зустрічей для різних аудиторій.</p>
  ${cards([
   ['Для дітей','Ігрова інформаційна сесія для дошкільної групи. Враховуємо вік дітей, кількість учасників і умови закладу.'],
   ['Для працівників','Інформаційна зустріч для вихователів та інших працівників. Можна обговорити, як говорити з дітьми про мінну небезпеку.'],
   ['Для батьків','За потреби можемо обговорити тематичну зустріч на батьківських зборах.'],
  ])}
  <div class="formats">
   <div><strong>Очно або онлайн</strong>Формат зустрічі для дорослих та умови проведення сесії для дітей погоджуємо із закладом.</div>
   <div><strong>Друковані матеріали</strong>Добираємо матеріали для групи з урахуванням віку дітей та наявності видань.</div>
  </div>
 </div>` },
 { id:'kontakt', short:'Домовитися', layout:'slide-split', draw:()=>`<div class="slide-copy">
  ${prefix('Співпраця з відділом','Домовмося про першу зустріч')}
  <p class="lead">Підготуйте короткий запит. Разом уточнимо, для кого провести сесію, у якому форматі та коли.</p>
  <div class="site-contacts">${contactLinks()}</div>
  <button id="copy-request" type="button" class="button primary">Скопіювати чернетку звернення</button>
  <p class="inline-note" id="copy-status" role="status"></p>
  <textarea class="copy-output" aria-label="Чернетка звернення" id="copy-output" rows="6" readonly hidden></textarea>
 </div>
 <aside class="final-sheet"><h2>Що вказати у зверненні</h2>
  <ol><li>Назва закладу та громада</li><li>Вік дітей і кількість учасників</li><li>Кількість груп або склад дорослої аудиторії</li><li>Бажаний формат і можливі дати</li></ol>
 </aside>` },
];

const stage = $('stage'), timeline=$('timeline'), dialog=$('photo-dialog');
const pathIndex = () => slides.findIndex(slide=>location.hash.slice(1)===slide.id);
let current=Math.max(0,pathIndex()), opener;
const two = n => String(n).padStart(2,'0');
timeline.innerHTML=slides.map(({short},i)=>`<button class="nav-item" type="button" data-go="${i}"><span aria-hidden="true">${two(i+1)}</span>${short}</button>`).join('');
function render(focus=false, updateAddress=false) {
 const slide = slides[current];
 stage.innerHTML=`<article class="slide ${slide.layout}" aria-labelledby="slide-title">${slide.draw()}</article>`;
 for(const img of stage.querySelectorAll('.media-image img')){
  const fallback=()=>{
   const frame=img.closest('.media-frame');
   frame.classList.remove('has-photo');
   frame.querySelector('.media-empty').hidden=false;
   frame.querySelector('[data-open-photo]').hidden=true;
   img.remove();
  };
  img.addEventListener('error',fallback,{once:true});
  if(img.complete&&!img.naturalWidth)fallback();
 }
 for(const [i,button] of [...timeline.children].entries()){
  if(i===current)button.setAttribute('aria-current','step');
  else button.removeAttribute('aria-current');
 }
 $('prev').disabled=current===0;
 $('next').disabled=current===slides.length-1;
 $('counter').textContent=`${two(current+1)} / ${two(slides.length)} · ${slide.short}`;
 if(updateAddress){
  try { history.replaceState(null,'','#'+slide.id); }
  catch { /* Navigation remains available when opened as a local file. */ }
 }
 if(focus){ $('slide-title').focus({preventScroll:true});window.scrollTo(0,0); }
}
function navigate(index,{updateAddress=true,focus=true}={}) {
 if(index<0||index>=slides.length||index===current)return;
 current=index;
 gameIndex=0;
 render(focus,updateAddress);
}
function pickGame(index,button){
 if(!game[index])return;
 gameIndex=index;
 for(const b of stage.querySelectorAll('[data-game]'))b.setAttribute('aria-pressed',String(b===button));
 $('game-prompt').innerHTML=gamePrompt();
}
const draft=`Добрий день! Хотіли б погодити зустріч з інформування про мінну небезпеку.

Заклад і громада:
Для кого потрібна зустріч:
Вік дітей і кількість учасників:
Кількість груп або склад дорослої аудиторії:
Бажаний формат і можливі дати:
Контакт для зв’язку:`;
async function copyRequest(){
 const status=$('copy-status'),box=$('copy-output');
 try { await navigator.clipboard.writeText(draft);status.textContent='Чернетку скопійовано.'; }
 catch { box.value=draft;box.hidden=false;box.focus();box.select();status.textContent='Чернетка готова. Скопіюйте виділений текст.'; }
}
document.addEventListener('click', e=>{
 const go=e.target.closest('[data-go]');
 if(go){navigate(Number(go.dataset.go));return;}
 const choice=e.target.closest('[data-game]');
 if(choice){pickGame(Number(choice.dataset.game),choice);return;}
 const trigger=e.target.closest('[data-open-photo]');
 if(trigger){
  const key=trigger.closest('[data-photo]').dataset.photo;
  const [caption,alt]=media[key];
  $('photo-caption').textContent=caption;
  const image=$('photo-enlarged');image.alt=alt;image.src=config.images[key];
  opener=trigger;dialog.showModal();$('photo-close').focus();
  return;
 }
 if(e.target.closest('#copy-request'))copyRequest();
});
$('photo-close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>opener?.focus());
$('identity').onclick=e=>{e.preventDefault();navigate(0);};
$('prev').onclick=()=>navigate(current-1);
$('next').onclick=()=>navigate(current+1);
$('full').onclick=async()=>{
 try {
  if(document.fullscreenElement)await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
 }catch{/* Browser settings can restrict fullscreen. */}
};
if(!document.fullscreenEnabled)$('full').hidden=true;
document.addEventListener('fullscreenchange',()=>{
 const label=document.fullscreenElement?'Вийти з повного екрана':'На весь екран';
 $('full').setAttribute('aria-label',label);
 $('full').lastElementChild.textContent=label;
});
document.addEventListener('keydown', e=>{
 if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.target.closest('textarea,input,select,[contenteditable]'))return;
 const forward=['ArrowRight','ArrowDown','PageDown'].includes(e.key);
 const back=['ArrowLeft','ArrowUp','PageUp'].includes(e.key);
 if(forward||back){e.preventDefault();navigate(current+(forward?1:-1));}
 if(e.key==='Home'||e.key==='End'){e.preventDefault();navigate(e.key==='Home'?0:slides.length-1);}
});
window.addEventListener('hashchange',()=>navigate(Math.max(0,pathIndex()),{updateAddress:false}));
render();
