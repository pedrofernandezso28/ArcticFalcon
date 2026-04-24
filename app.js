// ============ CURSOR ============
const cur = document.querySelector('.cursor');
const dot = document.querySelector('.cursor-dot');
let cx=0,cy=0,dx=0,dy=0;
window.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;dot.style.transform=`translate(${cx}px,${cy}px)`});
(function raf(){dx+=(cx-dx)*.18;dy+=(cy-dy)*.18;cur.style.transform=`translate(${dx}px,${dy}px)`;requestAnimationFrame(raf)})();
document.querySelectorAll('a,button,.btn,.service,.market').forEach(el=>{
  el.addEventListener('mouseenter',()=>cur.classList.add('hover'));
  el.addEventListener('mouseleave',()=>cur.classList.remove('hover'));
});

// ============ NAV SCROLL ============
const nav = document.getElementById('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>20)});

// ============ REVEAL ============
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ============ COUNTERS ============
const cio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.decimals||0);
    const dur = 1400;
    const start = performance.now();
    function step(t){
      const p = Math.min(1,(t-start)/dur);
      const eased = 1-Math.pow(1-p,3);
      const v = to*eased;
      el.textContent = dec ? v.toFixed(dec) : Math.round(v);
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    cio.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(el=>cio.observe(el));

// ============ SERVICE CARD MOUSE GLOW ============
document.querySelectorAll('.service').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx',(e.clientX-r.left)+'px');
    card.style.setProperty('--my',(e.clientY-r.top)+'px');
  });
});

// ============ PARTICLES (snow) ============
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W,H,parts=[];
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
resize();window.addEventListener('resize',resize);
function initParts(){
  parts=[];
  const n = Math.min(90, Math.floor(W*H/22000));
  for(let i=0;i<n;i++){
    parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.3,vy:Math.random()*.4+.1,vx:(Math.random()-.5)*.2,a:Math.random()*.5+.2});
  }
}
initParts();window.addEventListener('resize',initParts);
let particlesOn = TWEAKS.particles;
function draw(){
  ctx.clearRect(0,0,W,H);
  if(particlesOn){
    for(const p of parts){
      p.y+=p.vy;p.x+=p.vx;
      if(p.y>H)p.y=-5;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(220,236,250,${p.a})`;ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}
draw();

// ============ TERMINAL TYPER ============
const termBody = document.getElementById('termBody');
const lines = [
  {t:'prompt',text:'arctic@falcon ~ $ ',after:{t:'cmd',text:'afl deploy --target=production --agents=all'}},
  {t:'out',text:'⏵ authenticating… ok'},
  {t:'out',text:'⏵ provisioning cluster af-eu-north-1… ok'},
  {t:'out',text:'⏵ rolling out 34 agents across 6 tenants'},
  {t:'out',text:'  ├─ trading.executor      <span class="ok">ready</span>  p50 4ms'},
  {t:'out',text:'  ├─ logistics.router      <span class="ok">ready</span>  p50 12ms'},
  {t:'out',text:'  ├─ clinical.triage       <span class="ok">ready</span>  p50 180ms'},
  {t:'out',text:'  ├─ energy.forecaster     <span class="ok">ready</span>  p50 340ms'},
  {t:'out',text:'  └─ customer.copilot      <span class="ok">ready</span>  p50 90ms'},
  {t:'out',text:'⏵ evals: 2,418 / 2,418 passed · drift 0.02σ · <span class="ok">green</span>'},
  {t:'prompt',text:'arctic@falcon ~ $ ',after:{t:'cmd',text:'afl tail --live'}},
  {t:'out',text:'[08:42:11] agent.trading → order filled AVGO 41.82 · slip 0.3bps'},
  {t:'out',text:'[08:42:11] agent.router  → path rebalanced · 12 routes · Δ-3.4%'},
  {t:'out',text:'[08:42:12] agent.triage  → case #8841 escalated to Dr. Nyström'},
  {t:'out',text:'[08:42:12] platform      → <span class="warn">warn</span>: latency spike eu-w 2 · auto-scaling'},
  {t:'out',text:'[08:42:13] platform      → <span class="ok">ok</span>:   recovered · p99 restored'},
  {t:'prompt',text:'arctic@falcon ~ $ '},
];
let li=0, ci=0;
function typeLoop(){
  if(li>=lines.length){
    const last = termBody.lastElementChild;
    if(last && !last.querySelector('.cur')){
      const c = document.createElement('span');c.className='cur';last.appendChild(c);
    }
    return;
  }
  const l = lines[li];
  let lineEl = termBody.children[li];
  if(!lineEl){
    lineEl = document.createElement('span');
    lineEl.className='line';
    if(l.t==='prompt'){
      lineEl.innerHTML = `<span class="prompt">${l.text}</span>`;
    } else {
      lineEl.innerHTML = '';
    }
    termBody.appendChild(lineEl);
    termBody.scrollTop = termBody.scrollHeight;
  }
  if(l.t==='prompt'){
    if(l.after){
      const target = l.after.text;
      if(ci<target.length){
        if(!lineEl.querySelector('.cmd-span')){
          const s=document.createElement('span');s.className='cmd cmd-span';lineEl.appendChild(s);
        }
        lineEl.querySelector('.cmd-span').textContent += target[ci];
        ci++;
        setTimeout(typeLoop, 28+Math.random()*40);
      } else {
        ci=0;li++;setTimeout(typeLoop, 420);
      }
    } else {
      li++;setTimeout(typeLoop,200);
    }
  } else {
    lineEl.className = 'line '+l.t;
    lineEl.innerHTML = l.text;
    li++;
    setTimeout(typeLoop, 260+Math.random()*120);
  }
}
setTimeout(typeLoop, 1400);

// ============ TWEAKS ============
(function(){
  const root = document.documentElement;
  function apply(){
    root.style.setProperty('--accent', TWEAKS.accent);
    root.style.setProperty('--aurora-intensity', TWEAKS.auroraIntensity);
    particlesOn = !!TWEAKS.particles;
    document.body.classList.toggle('glitch', !!TWEAKS.glitch);
  }
  apply();

  const ta=document.getElementById('tk-accent'),
        tau=document.getElementById('tk-aurora'),
        tp=document.getElementById('tk-particles'),
        tg=document.getElementById('tk-glitch');
  ta.value=TWEAKS.accent;tau.value=TWEAKS.auroraIntensity;tp.checked=TWEAKS.particles;tg.checked=TWEAKS.glitch;

  function push(k,v){
    TWEAKS[k]=v;apply();
    try{window.parent.postMessage({type:'__edit_mode_set_keys',edits:{[k]:v}},'*')}catch(e){}
  }
  ta.addEventListener('input',e=>push('accent',e.target.value));
  tau.addEventListener('input',e=>push('auroraIntensity',parseFloat(e.target.value)));
  tp.addEventListener('change',e=>push('particles',e.target.checked));
  tg.addEventListener('change',e=>push('glitch',e.target.checked));

  const panel = document.getElementById('tweaks');
  window.addEventListener('message', (ev)=>{
    const d = ev.data||{};
    if(d.type==='__activate_edit_mode') panel.classList.add('on');
    if(d.type==='__deactivate_edit_mode') panel.classList.remove('on');
  });
  try{window.parent.postMessage({type:'__edit_mode_available'},'*')}catch(e){}
})();
