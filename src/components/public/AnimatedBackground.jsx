// src/components/public/AnimatedBackground.jsx
// ============================================================
// Persistent animated canvas background used across all public
// pages (landing, auth, explore). Extracted so App.jsx can
// keep it mounted while switching between views.
// ============================================================

import { useEffect, useRef } from "react";

const rnd  = (a, b) => a + Math.random() * (b - a);
const rndI = (a, b) => Math.floor(rnd(a, b));
const PI2  = Math.PI * 2;

const OBJ_TYPES  = ["book", "cap", "pencil", "atom", "bulb"];
const DOT_COLORS = ["#ffffff", "#8b82ff", "#3b82f6", "#c4c0ff"];
const DOT_SIZES  = [1.5, 2.5, 3.5];
const GRP_COLORS = ["#8b82ff", "#3b82f6", "#ffffff", "#c4c0ff", "#a78bfa"];

function drawBook(ctx) {
  const w=47,h=58,sp=4;
  ctx.fillStyle="rgba(108,99,255,0.2)";ctx.strokeStyle="rgba(139,130,255,0.85)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.rect(-w/2-sp/2,-h/2,w/2,h);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.rect(sp/2,-h/2,w/2,h);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.rect(-sp/2,-h/2,sp,h);ctx.fillStyle="rgba(139,130,255,0.4)";ctx.fill();ctx.stroke();
  ctx.strokeStyle="rgba(220,216,255,0.5)";ctx.lineWidth=0.7;
  for(let i=-3;i<=3;i++){const y=i*(h/9);ctx.beginPath();ctx.moveTo(-w/2-sp/2+4,y);ctx.lineTo(-sp/2-2,y);ctx.stroke();ctx.beginPath();ctx.moveTo(sp/2+2,y);ctx.lineTo(w/2+sp/2-4,y);ctx.stroke();}
}
function drawCap(ctx) {
  const r=23,bw=38,bh=7;
  ctx.strokeStyle="rgba(139,130,255,0.85)";ctx.fillStyle="rgba(108,99,255,0.22)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.ellipse(0,r*0.45,bw/2+4,bh/2,0,0,PI2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-r*0.12,r,r*0.3,0,0,PI2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-r,-r*0.12);ctx.quadraticCurveTo(-r*0.8,r*0.7,-bw/2-4,r*0.45);ctx.moveTo(r,-r*0.12);ctx.quadraticCurveTo(r*0.8,r*0.7,bw/2+4,r*0.45);ctx.strokeStyle="rgba(139,130,255,0.5)";ctx.stroke();
  ctx.beginPath();ctx.moveTo(r*0.5,-r*0.12);ctx.lineTo(r*0.5,r*0.55);ctx.strokeStyle="rgba(220,216,255,0.75)";ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.arc(r*0.5,r*0.58,4,0,PI2);ctx.fillStyle="rgba(220,216,255,0.6)";ctx.fill();
}
function drawPencil(ctx) {
  const len=72,w=11;
  ctx.fillStyle="rgba(108,99,255,0.22)";ctx.strokeStyle="rgba(139,130,255,0.85)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.rect(-w/2,-len/2+len*0.15,w,len*0.7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-w/2,len/2-len*0.15);ctx.lineTo(0,len/2);ctx.lineTo(w/2,len/2-len*0.15);ctx.closePath();ctx.fillStyle="rgba(220,216,255,0.55)";ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.rect(-w/2,-len/2,w,len*0.14);ctx.fillStyle="rgba(59,130,246,0.45)";ctx.fill();ctx.stroke();
}
function drawAtom(ctx,t) {
  const r=21;
  ctx.beginPath();ctx.arc(0,0,r*0.22,0,PI2);ctx.fillStyle="rgba(108,99,255,0.75)";ctx.fill();
  const oc=["rgba(108,99,255,0.75)","rgba(59,130,246,0.65)","rgba(196,192,255,0.55)"];
  const ec=["rgba(255,255,255,1)","rgba(100,180,255,1)","rgba(210,200,255,1)"];
  [0,Math.PI/3,-Math.PI/3].forEach((angle,i)=>{
    ctx.save();ctx.rotate(angle);ctx.scale(1,0.38);
    ctx.beginPath();ctx.arc(0,0,r,0,PI2);ctx.strokeStyle=oc[i];ctx.lineWidth=1;ctx.stroke();ctx.restore();
    const ex=Math.cos(t*1.4+i*2.1)*r,ey=Math.sin(t*1.4+i*2.1)*r*0.38;
    const rx2=ex*Math.cos(angle)-ey*Math.sin(angle),ry2=ex*Math.sin(angle)+ey*Math.cos(angle);
    ctx.save();ctx.shadowColor=ec[i];ctx.shadowBlur=8;ctx.beginPath();ctx.arc(rx2,ry2,4,0,PI2);ctx.fillStyle=ec[i];ctx.fill();ctx.restore();
  });
}
function drawBulb(ctx) {
  const r=21;
  ctx.strokeStyle="rgba(139,130,255,0.85)";ctx.fillStyle="rgba(108,99,255,0.2)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(0,-r*0.1,r,Math.PI,0,false);ctx.quadraticCurveTo(r,r*0.6,r*0.3,r*0.7);ctx.lineTo(-r*0.3,r*0.7);ctx.quadraticCurveTo(-r,r*0.6,-r,-r*0.1);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.rect(-r*0.3,r*0.7,r*0.6,r*0.25);ctx.fillStyle="rgba(59,130,246,0.38)";ctx.fill();ctx.stroke();
  ctx.strokeStyle="rgba(220,216,255,0.3)";ctx.lineWidth=0.7;
  for(let i=0;i<6;i++){const a=(i/6)*PI2-Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-r*0.1);ctx.lineTo(Math.cos(a)*r*1.6,Math.sin(a)*r*1.6-r*0.1);ctx.stroke();}
}

export default function AnimatedBackground() {
  const bgRef  = useRef(null);
  const conRef = useRef(null);
  const fxRef  = useRef(null);
  const porRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const bgC=bgRef.current,conC=conRef.current,fxC=fxRef.current,porC=porRef.current;
    if (!bgC||!conC||!fxC||!porC) return;
    const bgX=bgC.getContext("2d"),conX=conC.getContext("2d"),fxX=fxC.getContext("2d"),porX=porC.getContext("2d");

    let alive=true,W=window.innerWidth,H=window.innerHeight,mx=W/2,my=H/2;
    const setSize=()=>{W=window.innerWidth;H=window.innerHeight;[bgC,conC,fxC,porC].forEach(c=>{c.width=W;c.height=H;});};
    setSize();

    const mkObj=()=>{const d=rnd(0.3,1),sp=d*0.22;return{x:rnd(0,W),y:rnd(0,H),vx:(Math.random()-0.5)*sp,vy:(Math.random()-0.5)*sp,rot:rnd(0,PI2),rotV:(Math.random()-0.5)*0.004,sz:22+d*58,depth:d,type:OBJ_TYPES[rndI(0,5)],hue:Math.random()<0.5?"p":"b",alpha:0.35+d*0.4,dx:0,dy:0,glowPhase:rnd(0,PI2)};};
    const mkDot=()=>({x:rnd(0,W),y:rnd(0,H),vx:(Math.random()-0.5)*0.45,vy:(Math.random()-0.5)*0.45,r:DOT_SIZES[rndI(0,3)],col:DOT_COLORS[rndI(0,4)],alpha:rnd(0.5,1),twinkle:rnd(0,PI2),twinkleSpd:rnd(0.01,0.04)});
    const mkGrp=()=>({x:rnd(0,W),y:rnd(0,H),vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:rnd(2,5.5),col:GRP_COLORS[rndI(0,5)],alpha:rnd(0.55,0.95)});
    const mkNebula=()=>({x:rnd(-100,W+100),y:rnd(-100,H+100),r:rnd(180,380),vx:(Math.random()-0.5)*0.06,vy:(Math.random()-0.5)*0.06,hue:Math.random()<0.5?108:220,alpha:rnd(0.04,0.09),pulse:rnd(0,PI2),pulseSpd:rnd(0.004,0.01)});
    const mkShoot=()=>({x:rnd(0,W),y:rnd(-20,H*0.4),vx:rnd(4,9),vy:rnd(1.5,4),len:rnd(80,200),life:1,decay:rnd(0.012,0.025)});
    const mkPP=()=>{const a=rnd(0,PI2),sp=rnd(1.5,6);return{x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:rnd(0.008,0.022),r:rnd(1.5,4),col:["#fff","#8b82ff","#3b82f6","#c4c0ff"][rndI(0,4)],active:false};};

    let bgObjs=[],dots=[],grps=[],nebulae=[],shoots=[],porParts=[],porStart=null,porDone=false,shootTimer=0;
    const populate=()=>{bgObjs=Array.from({length:20},mkObj);dots=Array.from({length:160},mkDot);grps=Array.from({length:90},mkGrp);nebulae=Array.from({length:7},mkNebula);shoots=[];porParts=Array.from({length:200},mkPP);};
    populate();

    // nebulae
    const drawNebulae=()=>{nebulae.forEach(n=>{n.x+=n.vx;n.y+=n.vy;n.pulse+=n.pulseSpd;if(n.x<-n.r-200)n.x=W+n.r;if(n.x>W+n.r+200)n.x=-n.r;if(n.y<-n.r-200)n.y=H+n.r;if(n.y>H+n.r+200)n.y=-n.r;const pa=n.alpha*(0.85+Math.sin(n.pulse)*0.15);const g=bgX.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);if(n.hue===108){g.addColorStop(0,`rgba(108,50,255,${pa*2})`);g.addColorStop(0.4,`rgba(120,60,255,${pa})`);g.addColorStop(1,"rgba(0,0,0,0)");}else{g.addColorStop(0,`rgba(20,70,200,${pa*2})`);g.addColorStop(0.4,`rgba(40,90,230,${pa})`);g.addColorStop(1,"rgba(0,0,0,0)");}bgX.beginPath();bgX.arc(n.x,n.y,n.r,0,PI2);bgX.fillStyle=g;bgX.fill();});};

    // aurora
    const drawAurora=(ts)=>{const t=ts*0.0004;[{y:H*0.88,amp:22,col:"rgba(108,99,255,0.14)",freq:2.1,ph:0},{y:H*0.92,amp:14,col:"rgba(59,130,246,0.12)",freq:1.7,ph:1.2},{y:H*0.96,amp:8,col:"rgba(167,139,250,0.10)",freq:2.8,ph:2.4}].forEach(b=>{bgX.beginPath();bgX.moveTo(0,H);for(let x=0;x<=W;x+=4)bgX.lineTo(x,b.y+Math.sin((x/W)*PI2*b.freq+t+b.ph)*b.amp);bgX.lineTo(W,H);bgX.closePath();bgX.fillStyle=b.col;bgX.fill();});};

    // shooting stars
    const updateShoots=(dt)=>{shootTimer+=dt;if(shootTimer>rnd(1400,3800)){shootTimer=0;if(shoots.length<5)shoots.push(mkShoot());}shoots=shoots.filter(s=>{s.x+=s.vx*2;s.y+=s.vy*2;s.life-=s.decay;if(s.life<=0)return false;const tail=s.len*s.life,ang=Math.atan2(s.vy,s.vx);const grd=bgX.createLinearGradient(s.x-Math.cos(ang)*tail,s.y-Math.sin(ang)*tail,s.x,s.y);grd.addColorStop(0,"rgba(255,255,255,0)");grd.addColorStop(0.7,`rgba(196,192,255,${s.life*0.7})`);grd.addColorStop(1,`rgba(255,255,255,${s.life})`);bgX.save();bgX.strokeStyle=grd;bgX.lineWidth=1.8;bgX.beginPath();bgX.moveTo(s.x-Math.cos(ang)*tail,s.y-Math.sin(ang)*tail);bgX.lineTo(s.x,s.y);bgX.stroke();bgX.restore();return true;});};

    // objects
    const updObjs=(t)=>{bgObjs.forEach(o=>{const px=(mx-W/2)*0.02*o.depth,py=(my-H/2)*0.02*o.depth;o.x+=o.vx;o.y+=o.vy;o.rot+=o.rotV;o.glowPhase+=0.008;const p=o.sz*2;if(o.x<-p)o.x=W+p;if(o.x>W+p)o.x=-p;if(o.y<-p)o.y=H+p;if(o.y>H+p)o.y=-p;o.dx=o.x-px;o.dy=o.y-py;});};
    const drawObj=(o,t)=>{const ga=o.alpha*(0.85+Math.sin(o.glowPhase)*0.15);bgX.save();bgX.translate(o.dx,o.dy);bgX.rotate(o.rot);[o.sz*2.2,o.sz*1.5,o.sz*1.1].forEach((gr,gi)=>{const gAl=[0.05,0.12,0.25][gi]*ga;const g=bgX.createRadialGradient(0,0,0,0,0,gr);g.addColorStop(0,o.hue==="p"?`rgba(108,50,255,${gAl})`:`rgba(20,100,246,${gAl})`);g.addColorStop(1,"rgba(0,0,0,0)");bgX.beginPath();bgX.arc(0,0,gr,0,PI2);bgX.fillStyle=g;bgX.fill();});bgX.globalAlpha=ga;const sc=o.sz/55;bgX.scale(sc,sc);bgX.save();bgX.shadowColor=o.hue==="p"?"#a78bfa":"#60a5fa";bgX.shadowBlur=16;if(o.type==="book")drawBook(bgX);else if(o.type==="cap")drawCap(bgX);else if(o.type==="pencil")drawPencil(bgX);else if(o.type==="atom")drawAtom(bgX,t);else drawBulb(bgX);bgX.restore();bgX.restore();};
    const drawEnergyLinks=()=>{for(let i=0;i<bgObjs.length;i++){for(let j=i+1;j<bgObjs.length;j++){const dx=bgObjs[i].dx-bgObjs[j].dx,dy=bgObjs[i].dy-bgObjs[j].dy,d=Math.sqrt(dx*dx+dy*dy);if(d<200){bgX.save();bgX.globalAlpha=(1-d/200)*0.12;bgX.beginPath();bgX.moveTo(bgObjs[i].dx,bgObjs[i].dy);bgX.lineTo(bgObjs[j].dx,bgObjs[j].dy);bgX.strokeStyle="#a78bfa";bgX.lineWidth=0.7;bgX.stroke();bgX.restore();}}}};

    // constellation
    const updDots=()=>{dots.forEach(d=>{d.twinkle+=d.twinkleSpd;const ddx=mx-d.x,ddy=my-d.y,dist=Math.sqrt(ddx*ddx+ddy*ddy);if(dist<150){const f=(1-dist/150)*0.03;d.vx+=ddx*f;d.vy+=ddy*f;}d.vx*=0.97;d.vy*=0.97;d.x+=d.vx;d.y+=d.vy;if(d.x<0){d.x=0;d.vx*=-1;}if(d.x>W){d.x=W;d.vx*=-1;}if(d.y<0){d.y=0;d.vy*=-1;}if(d.y>H){d.y=H;d.vy*=-1;}});};
    const drawCon=()=>{conX.clearRect(0,0,W,H);for(let i=0;i<dots.length;i++){for(let j=i+1;j<dots.length;j++){const dx=dots[i].x-dots[j].x,dy=dots[i].y-dots[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<130){conX.beginPath();conX.moveTo(dots[i].x,dots[i].y);conX.lineTo(dots[j].x,dots[j].y);conX.strokeStyle=`rgba(139,130,255,${(1-d/130)*0.35})`;conX.lineWidth=0.85;conX.stroke();}}}dots.forEach(d=>{const tw=0.6+Math.sin(d.twinkle)*0.4;conX.save();conX.shadowColor=d.col;conX.shadowBlur=d.r>2?7:3;conX.beginPath();conX.arc(d.x,d.y,d.r,0,PI2);conX.fillStyle=d.col;conX.globalAlpha=d.alpha*tw;conX.fill();conX.restore();});};

    // gravity fx
    const updGrp=()=>{grps.forEach(p=>{const dx=mx-p.x,dy=my-p.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<140&&dist>1){const f=((140-dist)/140)*0.09;p.vx+=(dx/dist)*f;p.vy+=(dy/dist)*f;}p.vx*=0.96;p.vy*=0.96;p.x+=p.vx;p.y+=p.vy;if(p.x<0){p.x=0;p.vx*=-0.7;}if(p.x>W){p.x=W;p.vx*=-0.7;}if(p.y<0){p.y=0;p.vy*=-0.7;}if(p.y>H){p.y=H;p.vy*=-0.7;}});};
    const drawGrp=()=>{fxX.clearRect(0,0,W,H);grps.forEach(p=>{fxX.save();fxX.globalAlpha=p.alpha;fxX.shadowColor=p.col;fxX.shadowBlur=12;fxX.beginPath();fxX.arc(p.x,p.y,p.r,0,PI2);fxX.fillStyle=p.col;fxX.fill();fxX.restore();});};

    // portal
    const PD=3500;
    const drawPortal=(ts)=>{
      if(porStart===null)porStart=ts;
      const t=(ts-porStart)/PD;
      porX.clearRect(0,0,W,H);
      porX.fillStyle=`rgba(6,6,16,${Math.max(0,1-Math.pow(t,0.6))})`;porX.fillRect(0,0,W,H);
      const cx=W/2,cy=H/2,maxR=Math.hypot(W,H)/2*1.2;
      if(t>=0.14&&t<0.71){const st=(t-0.14)/0.57,r=st*st*180;const ig=porX.createRadialGradient(cx,cy,0,cx,cy,r);ig.addColorStop(0,`rgba(180,140,255,${0.65*st})`);ig.addColorStop(0.5,`rgba(108,50,255,${0.4*st})`);ig.addColorStop(1,"rgba(0,0,0,0)");porX.beginPath();porX.arc(cx,cy,r,0,PI2);porX.fillStyle=ig;porX.fill();porX.save();porX.shadowColor="#a78bfa";porX.shadowBlur=40*st;porX.beginPath();porX.arc(cx,cy,r,0,PI2);porX.strokeStyle=`rgba(230,210,255,${0.98*st})`;porX.lineWidth=3;porX.stroke();porX.restore();porX.save();porX.shadowColor="#3b82f6";porX.shadowBlur=20*st;porX.beginPath();porX.arc(cx,cy,r*0.85,0,PI2);porX.strokeStyle=`rgba(59,130,246,${0.5*st})`;porX.lineWidth=1;porX.stroke();porX.restore();for(let i=0;i<36;i++){const a=(i/36)*PI2+ts*0.002;porX.beginPath();porX.arc(cx+Math.cos(a)*(r+5),cy+Math.sin(a)*(r+5),i%3===0?3.5:2,0,PI2);porX.fillStyle=i%3===0?`rgba(255,255,255,${st*0.95})`:`rgba(167,139,250,${st*0.65})`;porX.fill();}if(st>0.3){for(let i=0;i<8;i++){const a0=(i/8)*PI2+ts*0.0008,a1=a0+rnd(0.05,0.3),rm=r*rnd(0.75,1.15);porX.save();porX.globalAlpha=rnd(0.2,0.6)*(st-0.3)/0.7;porX.shadowColor="#6c63ff";porX.shadowBlur=15;porX.beginPath();porX.arc(cx,cy,rm,a0,a1);porX.strokeStyle="#d4c0ff";porX.lineWidth=1.8;porX.stroke();porX.restore();}}}
      if(t>=0.42){if(t<0.5)porParts.forEach(p=>{if(!p.active){p.active=true;p.life=1;p.x=W/2;p.y=H/2;}});porParts.forEach(p=>{if(!p.active)return;p.x+=p.vx*2.5;p.y+=p.vy*2.5;p.life-=p.decay;if(p.life<=0){p.active=false;return;}porX.save();porX.globalAlpha=p.life*0.88;porX.shadowColor=p.col;porX.shadowBlur=10;porX.beginPath();porX.arc(p.x,p.y,p.r*p.life,0,PI2);porX.fillStyle=p.col;porX.fill();porX.restore();});const st2=Math.min(1,(t-0.42)/0.14),fa=Math.sin(st2*Math.PI)*0.6;if(fa>0){porX.fillStyle=`rgba(180,140,255,${fa})`;porX.fillRect(0,0,W,H);}const r2=((t-0.42)/0.29)*maxR*1.8;if(r2>0&&t<0.71){porX.save();porX.globalAlpha=Math.max(0,1-(t-0.42)/0.29)*0.6;porX.beginPath();porX.arc(cx,cy,r2,0,PI2);porX.strokeStyle="#a78bfa";porX.lineWidth=4;porX.stroke();porX.restore();}}
      if(t>=0.71){const st3=(t-0.71)/0.29;porX.save();porX.globalCompositeOperation="destination-out";porX.beginPath();porX.arc(cx,cy,st3*maxR*1.5,0,PI2);porX.fillStyle="rgba(0,0,0,1)";porX.fill();porX.restore();const fa3=Math.max(0,0.7-st3*2.5)*0.9;if(fa3>0){porX.fillStyle=`rgba(160,120,255,${fa3})`;porX.fillRect(0,0,W,H);}}
      if(t>=1&&!porDone){porDone=true;porC.style.display="none";window.dispatchEvent(new CustomEvent("m360PortalDone"));}
    };

    let prevTs=0;
    const loop=(ts)=>{
      if(!alive)return;
      const dt=ts-prevTs;prevTs=ts;
      try{
        bgX.clearRect(0,0,W,H);bgX.fillStyle="#060610";bgX.fillRect(0,0,W,H);
        drawNebulae();updObjs(ts*0.001);bgObjs.forEach(o=>drawObj(o,ts*0.001));
        drawEnergyLinks();drawAurora(ts);updateShoots(dt);
        updDots();drawCon();updGrp();drawGrp();
        if(!porDone)drawPortal(ts);
      }catch(e){console.error("[bg]",e);}
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);

    const onResize=()=>{setSize();populate();};
    const onMouse=(e)=>{mx=e.clientX;my=e.clientY;};
    window.addEventListener("resize",onResize);
    window.addEventListener("mousemove",onMouse);
    return()=>{alive=false;cancelAnimationFrame(rafRef.current);rafRef.current=null;window.removeEventListener("resize",onResize);window.removeEventListener("mousemove",onMouse);};
  },[]);

  const cvs={position:"fixed",inset:0,width:"100%",height:"100%",display:"block"};
  return (
    <>
      <canvas ref={bgRef}  style={{...cvs,zIndex:1}}/>
      <canvas ref={conRef} style={{...cvs,zIndex:2}}/>
      <canvas ref={fxRef}  style={{...cvs,zIndex:3,pointerEvents:"none"}}/>
      <canvas ref={porRef} style={{...cvs,zIndex:4,pointerEvents:"none"}}/>
    </>
  );
}
