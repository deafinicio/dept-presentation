import report from './report.json';
export const number=n=>n.toLocaleString('uk-UA');
export const svg=(body,view='0 0 360 300')=>`<svg viewBox="${view}" aria-hidden="true">${body}</svg>`;
const loc=([x,y])=>[172+x*95,142-y*95];
const outline=report.outline.map(x=>loc(x).join(',')).join(' ');
export function region(pins=false){
 return `<polygon points="${outline}" fill="#928cd4" stroke="#22253a" stroke-width="2"/>`+report.locations.map(({point,name},i)=>{const [x,y]=loc(point);
  return `<g ${pins?`class="pin" data-place="${i}"`:''}><circle cx="${x}" cy="${y}" r="10" fill="#ef5d59" stroke="#fff" stroke-width="3"/>${pins?`<text x="${x+13}" y="${y+5}">${name}</text>`:''}</g>`;}).join('');
}
const line=(d,stroke='#20253c',w=5)=>`<path d="${d}" stroke="${stroke}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const box=(x,y,w,h,fill,rx=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const ink='#252940',white='#faf9ff',red='#ff6762',lav='#a49ae9';
const page=box(77,33,205,233,ink,10)+box(67,22,205,233,white,10);
const rings=(x,y)=>[60,44,26].map((r,i)=>circle(x,y,r,[ink,lav,white][i])).join('');
function motif(key){
 switch(key){
 case 'region': return svg(region());
 case 'dual':return svg(rings(131,150)+line('M145 150L218 150',red,12)+rings(240,150)+circle(131,150,12,red)+circle(240,150,12,red));
 case 'partners':return svg(line('M180 60L73 215H290Z',lav,8)+[ [180,60],[73,215],[290,215] ].map(([x,y],i)=>circle(x,y,31,i===0?red:white)+circle(x,y,9,ink)).join(''));
 case 'coloring':return svg(page+circle(184,104,32,lav)+line('M86 214L139 145L166 174L205 133L251 214Z',ink,4)+line('M99 65H149',red,6)+line('M93 229H221',ink,3));
 case 'comic':return svg(page+box(84,43,170,72,lav)+box(84,124,74,108,ink)+box(167,124,87,108,red)+`<path d="M107 57h81q15 0 15 13v6q0 12-14 12h-27l-12 12v-12h-43q-12 0-12-11v-8q0-12 12-12" fill="${white}"/>`+circle(122,166,17,lav)+line('M187 152l43 49m-31-58l38 43',white,5));
 case 'games':return svg(`<g transform="rotate(-9 180 150)"><path d="M55 56h103v42q28-11 28 13t-28 13v40h-39q10 26-14 26t-13-26H55Z" fill="${white}"/><path d="M166 50h110v107h-43q7-26-15-26t-14 26h-38v-35q28 10 28-14t-28-14Z" fill="${ink}"/><path d="M166 169h41q-9-28 14-28t13 28h42v81H166Z" fill="${red}"/></g>`);
 case 'vr':return svg(line('M91 148C93 36 261 36 271 145',lav,20)+`<path d="M85 108h190q19 0 22 23l4 43q1 24-24 27l-42 5q-16 1-29-17l-11-14q-12-13-25 0l-16 18q-11 13-28 10l-40-7q-19-3-18-24l3-43q1-21 14-21Z" fill="${ink}" stroke="${white}" stroke-width="5"/>`+box(91,131,63,9,lav)+circle(265,149,6,red));
 case 'request':return svg(page+[68,116,164].map(y=>circle(103,y,7,red)+line(`M124 ${y}h91`,lav,6)).join(''));
 case 'format':return svg([0,1,2].map((i)=>box(42+i*98,70+i*21,85,134-i*10,[ink,lav,white][i],42)).join('')+line('M56 241h243',red,5));
 case 'kit':return svg(line('M136 109V83q0-14 14-14h59q13 0 13 14v26',white,12)+box(65,102,231,127,ink,15)+box(73,113,215,19,lav)+box(99,134,13,22,red)+box(249,134,13,22,red));
 default:return svg(line('M58 182C119 182 120 96 173 96S227 182 302 182',lav,15)+circle(58,182,22,white)+circle(302,182,22,red));
 }
}
export function artwork(p){
 if(p.duration){
  const ticks=Array.from({length:24},(_,i)=>`<path transform="rotate(${i*15} 180 145)" d="M180 34v${i%6?6:13}" stroke="#413c65" stroke-width="${i%6?2:4}"/>`).join('');
  return `<figure>${svg(ticks+`<circle cx="180" cy="145" r="86" fill="#eeecfd" stroke="#b4adcd" stroke-width="2"/><path d="M180 59a86 86 0 0 1 86 86" stroke="#f05954" stroke-width="8" fill="none"/><text x="180" y="116" text-anchor="middle" font-size="19">до</text><text x="180" y="175" text-anchor="middle" font-size="76" font-weight="740">${p.duration}</text><text x="180" y="205" text-anchor="middle" font-size="18">хвилин</text>`).replace('<svg ','<svg class="clock" ')}<figcaption>${p.audience} · тривалість сесії</figcaption></figure>`;
 }
 return `<figure>${motif(p.art)}</figure>`;
}
export function stats(){
 const sum=report.months.reduce((s,[,v])=>s+v,0),max=Math.max(...report.ages.map(([,v])=>v));
 return `<article class="stats"><p class="kicker">${report.period} · Харківська область</p><h2>Робота відділу у 2026 році</h2><div class="stats-grid"><section><div class="metric">${sum}</div><h3>інформаційних сесій за 10 місяців</h3><div class="month-bars">${report.months.map(([m,v])=>`<div class="month" aria-label="${m}, ${v} сесій"><i style="--value:${v/49*100}%"><em>${v}</em></i><small>${m.slice(0,3).toLowerCase()}</small></div>`).join('')}</div></section><section><div class="metric">${number(report.people)}</div><h3>облікованих участей · розподіл за віком</h3>${report.ages.map(([a,v])=>`<div class="age-row"><span>${a}</span><i style="--value:${v/max*100}%"></i><b>${number(v)}</b></div>`).join('')}</section></div><p class="source">Джерело — зведена статистика RASB Харківської області. Одна людина могла відвідати кілька сесій. <a href="https://deafinicio.github.io/mine-risk-map/dashboard.html" target="_blank" rel="noopener">Дашборд відділу</a></p></article>`;
}
