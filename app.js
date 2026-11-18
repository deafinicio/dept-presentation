import { createDesk } from './desk.js';

const $ = id => document.getElementById(id);
const audiences = [
 {name:'Дошкільнята', short:'Дошкільнята', exercise:'Роздивіться малюнок. До кого з дорослих можна звернутися, якщо помітили попереджувальний знак?', method:'Коротка розмова за ілюстрацією й повторення разом.'},
 {name:'Молодші класи', short:'Молодші класи', exercise:'Ваш знайомий пропонує пройти стежкою, біля якої стоїть попереджувальний знак. Що ти йому скажеш?', method:'Ілюстрація, просте запитання і коротке пояснення свого рішення.'},
 {name:'Середні класи', short:'Середні класи', exercise:'Друзі бачать попереджувальний знак на стежці. Як група може домовитися про рішення, щоб не наближатися до небезпечної ділянки?', method:'Робота в парах та обговорення того, чому група обрала саме таке рішення.'},
 {name:'Старші класи', short:'Старші класи', exercise:'У груповому чаті знайомі пропонують скоротити шлях через ділянку з попереджувальним знаком. Яке повідомлення допоможе змінити рішення групи?', method:'Аналіз ситуації, коротка відповідь і обговорення впливу однолітків.'},
 {name:'Студенти', short:'Студенти', exercise:'Група обговорює маршрут до місця виїзного заняття. На запропонованому шляху є попереджувальний знак. Що варто уточнити з організаторами до виїзду?', method:'Практичне завдання за ситуацією з навчання або побуту.'},
 {name:'Працівники', short:'Працівники', exercise:'Учень запитує, навіщо біля стежки стоїть попереджувальний знак. Як відповісти просто й спокійно та перевірити, що дитина зрозуміла пояснення?', method:'Окрема зустріч для педагогів, адміністрації та інших працівників. Розбираємо запитання, які виникають у дорослих та дітей.'},
];
const chapters = [
 ['Початок','Презентація для освітян','Виховна година, якої ще немає в розкладі','Сплануймо першу зустріч про мінну небезпеку для вашого закладу освіти.','Робочий стіл педагога','Порожня клітинка'],
 ['Про відділ','Знайомство','З чим ми можемо допомогти','Відділ протимінної діяльності Харківської обласної організації ТЧХУ проводить інформаційні сесії про мінну небезпеку.','Картка відділу','Пропозиція для закладу'],
 ['Аудиторії','Вибір аудиторії','Для кого буде зустріч?','Оберіть групу. Перегляньте, як змінюється подача однієї теми залежно від віку й потреб учасників.','Тижневий розклад','Оберіть групу'],
 ['Виховна година','Приклад заняття','Як проходить виховна година','Погляньмо на одну ситуацію очима обраної групи. Потім змінимо формат і покажемо, як та сама вправа працює онлайн.','Вправа на столі','Демонстрація вправи'],
 ['Матеріали','Після заняття','До теми можна повернутися','На зустрічі фахівець може використати друковані матеріали, а педагог — повернутися до них під час повторення.','Друковані матеріали','Демонстраційна розгортка'],
 ['Батьки','Зв’язок із родинами','Як залучити батьків','За потреби можна обговорити окрему тематичну зустріч або запросити фахівця на батьківські збори.','Картка для розмови','Продовження вдома'],
 ['Співпраця','Наступний крок','Запис у розкладі','Почнімо з однієї зустрічі. Повідомте, для кого вона потрібна, і разом погодимо тему, формат, час та умови проведення.','Картка зустрічі','Проєкт домовленості'],
];
const state = {step:0,audience:null,online:false,answered:false,book:false,overview:false};
let visual;
const demo = () => audiences[state.audience ?? 2];
const set = (values, focus) => {Object.assign(state,values); update(focus);};
const go = (step, focus=false) => {if(step<0||step>=chapters.length||step===state.step)return;set({step,overview:false},focus);};
function choice(label, pressed, action) {
 const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=label;b.setAttribute('aria-pressed',pressed);b.onclick=action;return b;
}
function line(parent,node){const rail=document.createElement('div');rail.className='rail';parent.append(rail);rail.append(...node);return rail;}
function format(parent){
 line(parent,['Очно','Онлайн'].map((label,i)=>choice(label,state.online===!!i,()=>{set({online:!!i});$('body').querySelectorAll('.chip')[i]?.focus();})));
}
function button(parent,label,cls,fn,id){
 const b=document.createElement('button');b.type='button';b.className='btn '+cls;b.textContent=label;b.onclick=fn;if(id)b.id=id;parent.append(b);return b;
}
function build(){
 const b=$('body');
 if(state.step===0){
  b.innerHTML='<div class="note"><strong>Запитання до залу</strong><p>Для кого у вашому закладі варто провести першу зустріч?</p></div>';
 }else if(state.step===1){
  b.innerHTML='<ul class="bullets"><li>Інформаційні сесії для дітей, підлітків і студентів.</li><li>Окремі зустрічі для педагогів та інших працівників.</li><li>Виховні години очно й онлайн та друковані матеріали для повторення.</li></ul>';
 }else if(state.step===2){
  line(b,audiences.map((a,i)=>choice(a.name,state.audience===i,()=>{set({audience:i,answered:false});$('body').querySelectorAll('.chip')[i]?.focus();})));
  const d=document.createElement('div');d.className='note';
  d.innerHTML=state.audience===null?'<strong>Запис ще порожній</strong><p>Натисніть назву групи, щоб додати її до розкладу.</p>':'<strong>'+demo().name+'</strong><p>'+demo().method+'</p>';b.append(d);
 }else if(state.step===3){
  format(b);
  const label = state.audience===null ? 'Демонстрація · середні класи' : demo().name;
  let exercise=document.createElement('div');exercise.className='lesson';exercise.innerHTML='<strong>'+label+'</strong><p>'+demo().exercise+'</p>';b.append(exercise);
  if(state.answered){let p=document.createElement('p');p.className='note';p.textContent='Попросіть учасників запропонувати й пояснити свій варіант. Обговоріть, яке рішення допомагає уникнути наближення до небезпечної ділянки.';b.append(p);}
  button(b,state.answered?'Згорнути підказку':'Показати підказку ведучому','secondary',()=>{set({answered:!state.answered});$('tip').focus();},'tip');
 }else if(state.step===4){
  b.innerHTML='<div class="note"><strong>«Вартові дивосвіту»</strong><p>Розмальовка для молодшої аудиторії. У макеті показано схематичну розгортку. Під час презентації тут можна буде відкрити сторінку з оригіналу.</p></div>';
  button(b,state.book?'Закрити розгортку':'Розгорнути розмальовку','secondary',()=>{set({book:!state.book});$('bookToggle').focus();},'bookToggle');
 }else if(state.step===5){
  b.innerHTML='<div class="note"><strong>Тема для батьків</strong><p>Як пояснити дитині правила безпечнішої поведінки, відповісти на її запитання та повторити вивчене вдома.</p></div>';
 }else{
  const audience=state.audience===null?'Аудиторію ще не обрано':demo().name;
  b.innerHTML='<div class="note"><strong>'+audience+' · '+(state.online?'онлайн':'очно')+'</strong><p>Для першого звернення підготуйте назву закладу, кількість учасників, бажаний формат і орієнтовні дати.</p></div>';
  if(state.audience===null)button(b,'Обрати аудиторію','secondary',()=>go(2,true));
  else button(b,'Скопіювати чернетку звернення','secondary',copy,'copy');
 }
}
async function copy(){
 const t='Добрий день! Хотіли б погодити інформаційну зустріч про мінну небезпеку.\nЗаклад освіти: ______\nАудиторія: '+demo().name.toLowerCase()+'\nКількість учасників: ______\nБажаний формат: '+(state.online?'онлайн':'очно')+'\nБажані дати: ______';
 try{await navigator.clipboard.writeText(t);$('status').textContent='Чернетку скопійовано.';}
 catch{const area=document.createElement('textarea');area.value=t;area.rows=7;area.readOnly=true;area.style.width='100%';area.setAttribute('aria-label','Чернетка звернення');$('body').append(area);area.focus();area.select();}
}
function update(focus){
 const ch=chapters[state.step];
 $('eyebrow').textContent=ch[1];$('title').textContent=ch[2];$('lead').textContent=ch[3];
 $('stage').textContent=String(state.step+1).padStart(2,'0')+' / 07';
 $('scene-label').textContent=state.overview?chapters[0][4]:(state.step===3&&state.online?'Вправа на екрані':ch[4]);
 $('scene-note').textContent=state.step===0&&state.audience!==null?'План зустрічі':ch[5];
 $('overview').setAttribute('aria-pressed',String(state.overview));
 $('overview').textContent=state.overview?'Повернути ракурс':'Загальний план';
 $('fallback-entry').textContent=state.audience===null?'Вільна клітинка':demo().name+' · '+(state.online?'онлайн':'очно');
 $('status').textContent='';$('body').replaceChildren();$('controls').replaceChildren();build();
 if(state.step>0)button($('controls'),'← Назад','secondary',()=>go(state.step-1,true));
 button($('controls'),state.step===0?'Почати →':state.step===6?'На початок':'Далі →','primary',()=>state.step===6?set({step:0,audience:null,online:false,answered:false,book:false,overview:false},true):go(state.step+1,true));
 [...$('timeline').children].forEach((b,i)=>i===state.step?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
 visual?.update({...state,label:state.audience===null?'':demo().short});
 if(focus)$('title').focus({preventScroll:true});
}
chapters.forEach(([name],i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+name;b.onclick=()=>go(i);$('timeline').append(b);});
$('overview').onclick=()=>set({overview:!state.overview});
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('status').textContent='Повноекранний режим недоступний у цьому вікні.';}};
document.addEventListener('fullscreenchange',()=>{$('full').lastElementChild.textContent=document.fullscreenElement?'Вийти з повного екрана':'На весь екран';});
if(!document.fullscreenEnabled)$('full').hidden=true;
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.target.closest('textarea,input,select,[contenteditable]'))return;
 const dir=['ArrowRight','ArrowDown','PageDown'].includes(e.key)?1:['ArrowLeft','ArrowUp','PageUp'].includes(e.key)?-1:0;
 if(dir){e.preventDefault();go(state.step+dir,true);}
 if(e.key==='Home'||e.key==='End'){e.preventDefault();go(e.key==='Home'?0:6,true);}
});
update();

async function startDesk(){
 // Wait for both character sets before baking text into Canvas textures.
 try { await document.fonts?.load('700 22px Montserrat','Виховна година ABC'); }
 catch { /* The scene also works with the system font. */ }
 visual = createDesk($('visual'));
 visual?.update({...state,label:state.audience===null?'':demo().short});
}
startDesk();
