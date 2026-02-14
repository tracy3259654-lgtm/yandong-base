/* =========================
   YANDONG CORE · SYSTEM KERNEL
   ========================= */

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 权限系统 ---------- */
const ROLE_KEY = "yd_role";
const LAST_CMD = "yd_last_cmd";

const ROLES = ["GUEST","OPERATOR","ADMIN","ROOT"];

function getRole(){
  return localStorage.getItem(ROLE_KEY) || "GUEST";
}
function setRole(r){
  localStorage.setItem(ROLE_KEY, r);
  document.body.dataset.role = r;
}
setRole(getRole());

/* ---------- Canvas 核心 ---------- */
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

/* ---------- 能量核心参数 ---------- */
let t = 0;
let particles = Array.from({length:120},()=>({
  a: Math.random()*Math.PI*2,
  r: 60+Math.random()*120,
  s: .002+Math.random()*.004
}));

function drawCore(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2;
  const cy = canvas.height/2;

  /* 核心光 */
  const g = ctx.createRadialGradient(cx,cy,10,cx,cy,180);
  g.addColorStop(0,"rgba(0,255,156,.35)");
  g.addColorStop(1,"transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx,cy,180,0,Math.PI*2);
  ctx.fill();

  /* 粒子轨道 */
  particles.forEach(p=>{
    p.a += p.s;
    const x = cx + Math.cos(p.a+t)*p.r;
    const y = cy + Math.sin(p.a+t)*p.r;
    ctx.fillStyle="rgba(0,255,156,.6)";
    ctx.fillRect(x,y,2,2);
  });

  /* 核心环 */
  ctx.strokeStyle="rgba(0,255,156,.5)";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(cx,cy,120+Math.sin(t)*6,0,Math.PI*2);
  ctx.stroke();

  t+=.01;
  requestAnimationFrame(drawCore);
}
drawCore();

/* ---------- 矩阵雨 ---------- */
const cols = Math.floor(innerWidth/14);
const drops = Array(cols).fill(0);

function matrix(){
  ctx.fillStyle="rgba(0,0,0,.05)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="rgba(0,255,156,.35)";
  ctx.font="14px monospace";
  drops.forEach((y,i)=>{
    const text = String.fromCharCode(0x30A0+Math.random()*96);
    ctx.fillText(text,i*14,y*14);
    if(y*14>canvas.height && Math.random()>.98) drops[i]=0;
    drops[i]++;
  });
}
setInterval(matrix,80);

/* ---------- AI 终端 ---------- */
async function type(el,text,delay=30){
  for(let c of text){
    el.textContent+=c;
    await sleep(delay+Math.random()*20);
  }
  el.innerHTML+='<span class="cursor"></span>';
}

/* ---------- BOOT SEQUENCE ---------- */
async function boot(el){
  el.textContent="";
  await type(el,"INITIALIZING CORE...\n");
  await sleep(600);
  await type(el,"LOADING MODULES...\n");
  await sleep(500);
  await type(el,"SECURITY CHECK...\n");
  await sleep(800);
  await type(el,"ACCESS GRANTED\n\n");
}

/* ---------- 指令系统 ---------- */
async function handleCmd(cmd,el){
  localStorage.setItem(LAST_CMD,cmd);
  await sleep(400+Math.random()*800);

  switch(cmd){
    case "status":
      await type(el,
`SYSTEM STATUS: STABLE
CORE LOAD: ${40+Math.floor(Math.random()*30)}%
ROLE: ${getRole()}\n\n`);
      break;

    case "scan":
      await type(el,"SCANNING ENVIRONMENT...\n");
      await sleep(1000);
      await type(el,"NO THREATS DETECTED\n\n");
      break;

    case "help":
      await type(el,
`AVAILABLE COMMANDS:
status
scan
clear
upgrade\n\n`);
      break;

    case "upgrade":
      if(getRole()==="GUEST"){
        setRole("OPERATOR");
        await type(el,"ROLE UPGRADED: OPERATOR\n\n");
      } else if(getRole()==="OPERATOR"){
        setRole("ADMIN");
        await type(el,"ROLE UPGRADED: ADMIN\n\n");
      } else {
        await type(el,"ACCESS DENIED\n\n");
      }
      break;

    case "clear":
      el.textContent="";
      break;

    case "selfdestruct":
      await type(el,"SELF DESTRUCT SEQUENCE INITIATED\n");
      for(let i=10;i>=0;i--){
        await type(el,` ${i}...\n`,80);
      }
      await type(el,"ABORTED\n\n");
      break;

    default:
      await type(el,"DATA INCOMPLETE\n\n");
  }
}

/* ---------- 空闲自言自语 ---------- */
let idleTimer;
function idle(el){
  clearTimeout(idleTimer);
  idleTimer=setTimeout(async()=>{
    await type(el,"MONITORING SYSTEM...\n\n",40);
  },20000);
}

/* ---------- 绑定终端 ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  const term = $(".terminal pre");
  if(!term) return;

  boot(term).then(()=>{
    idle(term);
    document.addEventListener("keydown",async e=>{
      if(e.key==="Enter"){
        const cmd = prompt(">");
        if(cmd){
          await handleCmd(cmd.trim(),term);
          idle(term);
        }
      }
    });
  });
});
