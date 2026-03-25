import { useState, useEffect, useCallback } from "react";

var START_DATE = "2026-03-24", END_DATE = "2026-05-01", START_W = 111, TARGET_W = 90, BMR_V = 2150, NEAT_V = 350;
var PHASES = [
  { id: 1, name: "Water Flush", start: "2026-03-24", end: "2026-03-30", calT: 1050, wL: 6 },
  { id: 2, name: "The Grind", start: "2026-03-31", end: "2026-04-13", calT: 1020, wL: 7 },
  { id: 3, name: "Deep Cut", start: "2026-04-14", end: "2026-04-25", calT: 950, wL: 7 },
  { id: 4, name: "Water Cut", start: "2026-04-26", end: "2026-04-30", calT: 800, wL: 4 }
];
var WCD = {
  "2026-04-26": { wL: 8, salt: "Normal", note: "Water loading — 8L", calT: 1000 },
  "2026-04-27": { wL: 8, salt: "Normal", note: "Water loading — 8L", calT: 1000 },
  "2026-04-28": { wL: 4, salt: "ZERO", note: "Salt cut. Only haldi pepper lemon.", calT: 900 },
  "2026-04-29": { wL: 2, salt: "ZERO", note: "Tea + 1 shake + 100g paneer only", calT: 350 },
  "2026-04-30": { wL: 0.5, salt: "ZERO", note: "Sips only. Minimal food.", calT: 150 }
};
var TARGETS = [
  { d: "2026-03-30", t: 106, l: "Mar 30" }, { d: "2026-04-06", t: 102, l: "Apr 6" },
  { d: "2026-04-13", t: 98, l: "Apr 13" }, { d: "2026-04-20", t: 95, l: "Apr 20" },
  { d: "2026-04-25", t: 93, l: "Apr 25" }, { d: "2026-05-01", t: 90, l: "May 1" }
];
var MG = {
  morning: [
    { id: "acv", n: "ACV + Warm Water", c: 5, p: 0, t: "6:45 AM" },
    { id: "greentea", n: "Green Tea + Chia Seeds", c: 60, p: 2, t: "7:00 AM" },
    { id: "shake1", n: "Protein Shake (22g)", c: 140, p: 22, t: "9:30 AM" },
    { id: "almonds", n: "Almonds (3-4)", c: 25, p: 1, t: "9:45 AM" }
  ],
  lunch: [
    { id: "l_roti", n: "Roti + Sabzi + Salad + Chaas", c: 280, p: 8, t: "1:00 PM" },
    { id: "l_chilla", n: "Besan Chilla + Sabzi + Salad + Chaas", c: 250, p: 12, t: "1:00 PM" },
    { id: "l_light", n: "Sabzi + Salad + Chaas only", c: 150, p: 5, t: "1:00 PM" }
  ],
  preworkout: [{ id: "coffee", n: "Americano (Black)", c: 5, p: 0, t: "4:30 PM" }],
  postworkout: [{ id: "shake2", n: "Post-Workout Shake (22g)", c: 140, p: 22, t: "6:45 PM" }],
  night: [{ id: "isabgol", n: "Isabgol + Warm Water", c: 10, p: 0, t: "10:00 PM" }]
};
var AM = Object.values(MG).flat();
var DR = [
  {i:1,n:"Black Pepper Capsicum",c:350,p:37,g:"Indian"},{i:2,n:"Coriander-Mint Tikka",c:360,p:38,g:"Indian"},
  {i:3,n:"Tandoori Paneer",c:355,p:38,g:"Indian"},{i:4,n:"Achari Paneer",c:360,p:37,g:"Indian"},
  {i:5,n:"Methi Paneer",c:360,p:37,g:"Indian"},{i:6,n:"Pahadi Tikka",c:360,p:39,g:"Indian"},
  {i:7,n:"Paneer Amritsari",c:370,p:38,g:"Indian"},{i:8,n:"Paneer Afghani",c:365,p:40,g:"Indian"},
  {i:9,n:"Kali Mirch",c:355,p:38,g:"Indian"},{i:10,n:"Tawa Masala",c:365,p:38,g:"Indian"},
  {i:11,n:"Chatpata",c:355,p:37,g:"Indian"},{i:12,n:"Tikka Masala",c:365,p:39,g:"Indian"},
  {i:13,n:"Hariyali Tikka",c:355,p:38,g:"Indian"},{i:14,n:"Hara Bhara",c:355,p:38,g:"Indian"},
  {i:15,n:"Pudina Tikka",c:355,p:37,g:"Indian"},{i:16,n:"Ajwain Tikka",c:360,p:38,g:"Indian"},
  {i:17,n:"Lababdar Dry",c:365,p:38,g:"Indian"},{i:18,n:"Peri Peri",c:360,p:38,g:"Indian"},
  {i:19,n:"Rajasthani Kebab",c:370,p:39,g:"Indian"},{i:20,n:"Chettinad",c:365,p:38,g:"Indian"},
  {i:22,n:"Thai Basil",c:365,p:38,g:"Intl"},{i:24,n:"Mexican Fajita",c:375,p:39,g:"Intl"},
  {i:25,n:"Lebanese Shawarma",c:375,p:40,g:"Intl"},{i:26,n:"Italian Caprese",c:345,p:37,g:"Intl"},
  {i:27,n:"Szechuan",c:370,p:38,g:"Intl"},{i:29,n:"Greek Herb",c:365,p:37,g:"Intl"},
  {i:30,n:"Spanish Romesco",c:375,p:38,g:"Intl"},{i:31,n:"Vietnamese Lemongrass",c:360,p:38,g:"Intl"},
  {i:33,n:"Turkish Shish",c:370,p:39,g:"Intl"},{i:34,n:"Peruvian Aji",c:365,p:38,g:"Intl"},
  {i:36,n:"French Provencal",c:360,p:37,g:"Intl"},{i:40,n:"Zaatar",c:365,p:38,g:"Intl"},
  {i:41,n:"Tomato Soup",c:295,p:30,g:"Soup"},{i:42,n:"Lemon Coriander Soup",c:280,p:28,g:"Soup"},
  {i:43,n:"Moong Dal Soup",c:310,p:32,g:"Soup"},{i:48,n:"Green Pea Soup",c:295,p:30,g:"Soup"},
  {i:50,n:"Chana Dal Soup",c:310,p:32,g:"Soup"},{i:52,n:"Broccoli Soup",c:290,p:30,g:"Soup"},
  {i:55,n:"French Pistou",c:300,p:29,g:"Soup"},{i:57,n:"Minestrone",c:310,p:30,g:"Soup"},
  {i:61,n:"Sprouted Moong Bowl",c:370,p:38,g:"Bowl"},{i:62,n:"Mediterranean Salad",c:365,p:37,g:"Bowl"},
  {i:63,n:"Burrito Bowl",c:380,p:38,g:"Bowl"},{i:65,n:"Fattoush",c:360,p:36,g:"Bowl"},
  {i:67,n:"Kala Chana Chaat",c:375,p:38,g:"Bowl"},{i:70,n:"Quinoa Bowl",c:385,p:38,g:"Bowl"},
  {i:73,n:"Sprouted Lentil",c:360,p:36,g:"Bowl"},{i:74,n:"Caprese Tower",c:345,p:36,g:"Bowl"},
  {i:78,n:"Corn Chickpea Salad",c:370,p:37,g:"Bowl"},{i:79,n:"Raita Bowl",c:335,p:36,g:"Bowl"}
];
var WKS = [
  {id:"chest",d:"Mon",n:"Chest + Triceps",b:550},{id:"back",d:"Tue",n:"Back + Biceps",b:570},
  {id:"quads",d:"Wed",n:"Legs: Quads ★",b:550},{id:"shoulders",d:"Thu",n:"Shoulders + Core",b:530},
  {id:"hams",d:"Fri",n:"Legs: Hams ★",b:540},{id:"arms",d:"Sat",n:"Arms + Circuit",b:500},
  {id:"rest",d:"Sun",n:"Rest Day",b:0}
];
var ACTS = [
  {id:"gym",n:"Gym Walk (2km)",b:165},{id:"w30",n:"Walk 30 min",b:160},
  {id:"w60",n:"Walk 60 min",b:320},{id:"w90",n:"Walk 90 min",b:475},{id:"w120",n:"Walk 2 hours",b:640},
  {id:"hiit15",n:"HIIT 15 min",b:200},{id:"hiit20",n:"HIIT 20 min",b:280},
  {id:"hiit30",n:"HIIT 30 min",b:420},{id:"hiit45",n:"HIIT 45 min",b:580}
];
var SUPPS = [
  {id:"whey",n:"Whey Protein x2"},{id:"multi",n:"Multivitamin"},{id:"omega",n:"Omega-3 Flaxseed"},
  {id:"ors",n:"ORS / Electral"},{id:"glut",n:"Glutamine 5g"},{id:"isab",n:"Isabgol"},{id:"acvs",n:"ACV"}
];

function toD(s){return new Date(s+"T12:00:00")} function fm(d){return d.toISOString().split("T")[0]}
function now(){return fm(new Date())} function dB(a,b){return Math.round((toD(b)-toD(a))/864e5)}
function cl(v,l,h){return Math.max(l,Math.min(h,v))}
function wd(s){return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][toD(s).getDay()]}
function dn(s){return toD(s).getDate()} function msh(s){return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][toD(s).getMonth()]}
function gP(d){return PHASES.find(function(p){return d>=p.start&&d<=p.end})||PHASES[0]}
function gCT(d){return WCD[d]?WCD[d].calT:gP(d).calT} function gWT(d){return WCD[d]?WCD[d].wL:gP(d).wL}

var ED={meals:[],dinner:null,workout:null,walks:[],weight:null,water:0,supplements:[],sleep:null,custom:[],notes:""};
var SK="cutv7";
async function sL(){try{var r=await window.storage.get(SK);return r?JSON.parse(r.value):{}}catch(e){return{}}}
async function sS(d){try{await window.storage.set(SK,JSON.stringify(d))}catch(e){}}

var G="\u2018DM Sans\u2019, sans-serif";
var M="'JetBrains Mono', monospace";
var lime="#d4ff3a",red="#ff5c6c",blue="#60b8ff",org="#ffc05c",cyn="#33eeff",prp="#c9a0ff",pnk="#ff80b0";
var bg="#070710",cd="#0e0e1c",bd="#1c1c30",tx="#f5f3ef",mt="#8888a8",dm="#555578";

function Chk(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}

function CB({on,color}){
  var c=color||lime;
  return <div style={{width:24,height:24,borderRadius:7,flexShrink:0,border:on?"none":"2px solid #333348",background:on?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#080808",transition:"all .2s"}}>{on&&<Chk/>}</div>;
}

function Bx({title,accent,children}){
  var ac=accent||"#222240";
  return <div style={{background:cd,borderRadius:16,border:"1px solid "+bd,marginBottom:10,overflow:"hidden"}}>
    <div style={{padding:"12px 16px 6px",borderBottom:"1px solid "+bd,background:"linear-gradient(135deg,"+ac+"22,"+cd+")"}}>
      <span style={{fontSize:12,fontWeight:700,color:mt,fontFamily:M,letterSpacing:1.5,textTransform:"uppercase"}}>{title}</span>
    </div>
    <div style={{padding:"6px 16px 14px"}}>{children}</div>
  </div>;
}

function MI({meal,on,onTap}){
  return <button onClick={onTap} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"10px 0",cursor:"pointer",background:"transparent",border:"none",borderBottom:"1px solid "+bd,color:tx,textAlign:"left"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <CB on={on}/>
      <div>
        <div style={{fontSize:15,fontWeight:600,opacity:on?1:.45}}>{meal.n}</div>
        <div style={{fontSize:11,color:dm,fontFamily:M}}>{meal.t}</div>
      </div>
    </div>
    <div style={{textAlign:"right"}}>
      <div style={{fontSize:15,fontFamily:M,fontWeight:700,color:on?lime:dm}}>{meal.c}</div>
      <div style={{fontSize:10,color:dm,fontFamily:M}}>{meal.p}g</div>
    </div>
  </button>;
}

function OB({on,label,sub,val,onTap,color}){
  var c=color||lime;
  return <button onClick={onTap} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"12px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",color:tx,marginBottom:4,background:on?"linear-gradient(135deg,"+c+"15,"+cd+")":bg,border:on?"1px solid "+c+"44":"1px solid "+bd}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <CB on={on} color={c}/>
      <span style={{fontSize:14,fontWeight:600}}>{sub&&<span style={{color:mt,fontFamily:M,fontSize:11}}>{sub} </span>}{label}</span>
    </div>
    <span style={{fontSize:14,fontFamily:M,fontWeight:700,color:on?c:dm}}>{val}</span>
  </button>;
}

export default function App(){
  var[data,setData]=useState({});var[ok,setOk]=useState(false);var[sel,setSel]=useState(now());var[tab,setTab]=useState("food");
  var[dO,setDO]=useState(false);var[dS,setDS]=useState("");var[dF,setDF]=useState("All");
  var[cO,setCO]=useState(false);var[cN,setCN]=useState("");var[cC,setCC]=useState("");var[cP,setCP]=useState("");

  useEffect(function(){sL().then(function(d){setData(d);setOk(true)});},[]);
  useEffect(function(){if(ok)sS(data);},[data,ok]);

  var day=Object.assign({},ED,data[sel]);
  var ph=gP(sel),calT=gCT(sel),waterT=gWT(sel),wc=WCD[sel]||null;
  var dIn=cl(dB(START_DATE,sel)+1,1,38),dLeft=cl(dB(sel,END_DATE),0,38);

  var upd=useCallback(function(p){setData(function(pv){var n=Object.assign({},pv);n[sel]=Object.assign({},ED,pv[sel],p);return n;});},[sel]);
  function tog(f,id){var a=day[f]||[];upd(Object.fromEntries([[f,a.includes(id)?a.filter(function(x){return x!==id}):a.concat([id])]]));}

  var mC=day.meals.reduce(function(s,id){var m=AM.find(function(x){return x.id===id});return s+(m?m.c:0);},0);
  var mP=day.meals.reduce(function(s,id){var m=AM.find(function(x){return x.id===id});return s+(m?m.p:0);},0);
  var dR=DR.find(function(r){return r.i===day.dinner});var dC=dR?dR.c:0,dP=dR?dR.p:0;
  var xC=(day.custom||[]).reduce(function(s,m){return s+(m.c||0);},0);
  var xP=(day.custom||[]).reduce(function(s,m){return s+(m.p||0);},0);
  var tIn=mC+dC+xC,tPr=mP+dP+xP;
  var tef=Math.round(tIn*.08);
  var wB=day.workout?(WKS.find(function(w){return w.id===day.workout})||{b:0}).b:0;
  var aB=(day.walks||[]).reduce(function(s,id){var a=ACTS.find(function(x){return x.id===id});return s+(a?a.b:0);},0);
  var tOut=BMR_V+NEAT_V+tef+wB+aB,def=tOut-tIn,ou=tIn-calT;

  var wE=Object.entries(data).filter(function(e){return e[1]&&e[1].weight}).sort(function(a,b){return a[0].localeCompare(b[0])});
  var lW=wE.length>0?wE[wE.length-1][1].weight:START_W;
  var cW=day.weight||lW,tL=START_W-cW,pct=cl((tL/(START_W-TARGET_W))*100,0,100);

  var cks=[(day.meals||[]).length>=4,day.dinner!==null,day.workout!==null||wd(sel)==="Sun",(day.water||0)>=waterT,tPr>=85,(day.supplements||[]).length>=5,day.sleep>=7];
  var comp=Math.round((cks.filter(Boolean).length/cks.length)*100);

  var nD=[];for(var i=-3;i<=3;i++){var dd=toD(sel);dd.setDate(dd.getDate()+i);nD.push(fm(dd))}
  function sh(n){var dd=toD(sel);dd.setDate(dd.getDate()+n);setSel(fm(dd))}

  var fDR=DR.filter(function(r){return dF==="All"||r.g===dF}).filter(function(r){return r.n.toLowerCase().includes(dS.toLowerCase())});
  function addCM(){if(!cN||!cC)return;upd({custom:(day.custom||[]).concat([{n:cN,c:parseInt(cC)||0,p:parseInt(cP)||0,id:Date.now()}])});setCN("");setCC("");setCP("");setCO(false)}

  var catL={morning:"☀️ MORNING",lunch:"🍽️ LUNCH",preworkout:"☕ PRE-WORKOUT",postworkout:"💪 POST-WORKOUT",night:"🌙 NIGHT"};
  var catA={morning:lime,lunch:org,preworkout:cyn,postworkout:blue,night:prp};
  var inp={padding:"12px 14px",borderRadius:10,border:"1px solid "+bd,background:bg,color:tx,fontSize:14,outline:"none",width:"100%",fontFamily:G};

  if(!ok) return <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#555",fontFamily:"monospace",fontSize:18}}>Loading...</div>;

  return <div style={{minHeight:"100vh",background:bg,color:tx,fontFamily:G,maxWidth:480,margin:"0 auto"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}input[type=number]{-moz-appearance:textfield}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}button{font-family:inherit}`}</style>

    {/* HEADER */}
    <div style={{background:"linear-gradient(180deg,#0c0c1a,"+bg+")",padding:"16px 16px 0",borderBottom:"1px solid "+bd}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:10,height:10,borderRadius:5,background:lime,boxShadow:"0 0 10px "+lime+"88"}}/>
            <span style={{fontSize:16,fontWeight:800,color:lime,letterSpacing:1}}>CUT TRACKER</span>
          </div>
          <p style={{fontSize:12,color:mt,fontFamily:M,marginTop:4}}>P{ph.id} {ph.name} • Day {dIn}/38 • {dLeft}d left</p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,fontWeight:800,fontFamily:M,color:def>0?lime:red,lineHeight:1}}>{def>0?"-":"+"}{Math.abs(def).toLocaleString()}</div>
          <p style={{fontSize:11,color:mt,fontFamily:M,marginTop:2}}>DEFICIT KCAL</p>
        </div>
      </div>

      {wc&&<div style={{margin:"12px 0 6px",padding:"10px 14px",borderRadius:10,background:"linear-gradient(135deg,#2a0a0a,#1a0505)",border:"1px solid #4a1515"}}>
        <div style={{fontSize:12,fontWeight:800,color:red,fontFamily:M}}>⚠ WATER CUT DAY</div>
        <div style={{fontSize:14,color:"#ff8888",marginTop:3}}>{wc.note}</div>
        <div style={{fontSize:11,color:mt,fontFamily:M,marginTop:2}}>Water: {wc.wL}L • Salt: {wc.salt}</div>
      </div>}

      {/* Date nav */}
      <div style={{display:"flex",alignItems:"center",gap:2,marginTop:12,paddingBottom:10}}>
        <button onClick={function(){sh(-7)}} style={{background:"none",border:"none",color:mt,cursor:"pointer",padding:4,fontSize:20,fontWeight:700}}>‹</button>
        {nD.map(function(d){var s=d===sel,t=d===now(),h=data[d]&&((data[d].meals||[]).length>0||data[d].dinner||data[d].weight);
          return <button key={d} onClick={function(){setSel(d)}} style={{flex:1,padding:"6px 0",borderRadius:10,cursor:"pointer",textAlign:"center",transition:"all .15s",background:s?lime:"transparent",color:s?"#080808":t?lime:mt,border:t&&!s?"1px solid #2a3a1a":"1px solid transparent"}}>
            <div style={{fontSize:10,fontFamily:M,fontWeight:600,opacity:.7}}>{wd(d)}</div>
            <div style={{fontSize:16,fontWeight:s?800:500}}>{dn(d)}</div>
            {h&&!s&&<div style={{width:4,height:4,borderRadius:2,background:"#3a5a1a",margin:"2px auto 0"}}/>}
          </button>})}
        <button onClick={function(){sh(7)}} style={{background:"none",border:"none",color:mt,cursor:"pointer",padding:4,fontSize:20,fontWeight:700}}>›</button>
      </div>
    </div>

    {/* STATS */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,padding:"10px 14px"}}>
      {[{l:"IN",v:tIn,u:"kcal",col:Math.abs(ou)<100?lime:ou>100?red:blue},
        {l:"OUT",v:tOut,u:"kcal",col:blue},
        {l:"PROTEIN",v:tPr,u:"g",col:tPr>=85?lime:red},
        {l:"WATER",v:day.water||0,u:"/"+waterT+"L",col:(day.water||0)>=waterT?lime:org}
      ].map(function(s,i){return <div key={i} style={{background:cd,borderRadius:12,padding:"8px 4px",textAlign:"center",border:"1px solid "+bd}}>
        <div style={{fontSize:10,color:dm,fontFamily:M,letterSpacing:1,fontWeight:600}}>{s.l}</div>
        <div style={{fontSize:20,fontWeight:800,color:s.col,fontFamily:M,marginTop:2}}>{s.v}</div>
        <div style={{fontSize:10,color:dm}}>{s.u}</div>
      </div>})}
    </div>

    {/* Bars */}
    <div style={{padding:"0 14px 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,color:dm,fontFamily:M}}>vs {calT} kcal target</span>
        <span style={{fontSize:13,fontWeight:800,fontFamily:M,color:ou>100?red:ou>0?org:lime}}>{ou>0?"+":""}{ou}</span>
      </div>
      <div style={{height:7,background:bd,borderRadius:4,overflow:"hidden"}}>
        <div style={{height:7,borderRadius:4,transition:"width .4s",width:cl((tIn/calT)*100,0,120)+"%",background:ou>100?red:ou>0?org:lime}}/>
      </div>
    </div>
    <div style={{padding:"4px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:11,color:dm,fontFamily:M}}>COMPLETION</span>
        <span style={{fontSize:13,fontWeight:800,fontFamily:M,color:comp===100?lime:mt}}>{comp}%</span>
      </div>
      <div style={{height:5,background:bd,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:5,borderRadius:3,width:comp+"%",background:comp===100?lime:mt,transition:"width .4s"}}/>
      </div>
      <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
        {["Meals","Dinner","Train","Water","Protein","Supps","Sleep"].map(function(l,i){
          return <span key={i} style={{fontSize:9,fontFamily:M,fontWeight:600,padding:"3px 6px",borderRadius:5,background:cks[i]?"#1a2a10":"#15152a",color:cks[i]?lime:dm}}>{cks[i]?"✓":"○"} {l}</span>
        })}
      </div>
    </div>

    {/* TABS */}
    <div style={{display:"flex",padding:"0 14px",marginBottom:8}}>
      {[{id:"food",l:"FOOD",c:lime},{id:"burn",l:"BURN",c:red},{id:"body",l:"BODY",c:blue},{id:"more",l:"MORE",c:prp}].map(function(t,i){
        var active=tab===t.id;
        return <button key={t.id} onClick={function(){setTab(t.id)}} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",background:active?cd:"transparent",color:active?t.c:dm,fontSize:11,fontWeight:800,fontFamily:M,letterSpacing:1,borderTop:active?"3px solid "+t.c:"3px solid transparent",borderRadius:i===0?"8px 0 0 8px":i===3?"0 8px 8px 0":0,transition:"all .15s"}}>{t.l}</button>
      })}
    </div>

    <div style={{padding:"0 14px 120px"}}>

    {/* FOOD TAB */}
    {tab==="food"&&<div>
      {Object.entries(MG).map(function(entry){var cat=entry[0],meals=entry[1];
        return <Bx key={cat} title={catL[cat]} accent={catA[cat]}>
          {meals.map(function(m){return <MI key={m.id} meal={m} on={day.meals.includes(m.id)} onTap={function(){tog("meals",m.id)}}/>})}
          {cat==="lunch"&&<div style={{fontSize:11,color:dm,fontStyle:"italic",paddingTop:4}}>Pick one: Roti (P1) • Chilla 3x/wk (P2) • No roti 4x (P3)</div>}
        </Bx>})}

      <Bx title="🍳 DINNER — 200g PANEER" accent={pnk}>
        {day.dinner?<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}><span style={{color:mt,fontFamily:M,fontSize:12}}>#{dR&&dR.i} </span>{dR&&dR.n}</div>
            <div style={{fontSize:12,color:mt,fontFamily:M,marginTop:3}}>{dC} kcal • {dP}g protein • {dR&&dR.g}</div>
          </div>
          <button onClick={function(){upd({dinner:null});setDO(true)}} style={{background:bd,border:"none",borderRadius:8,padding:"6px 12px",color:lime,fontSize:11,cursor:"pointer",fontFamily:M,fontWeight:700}}>Swap</button>
        </div>:<button onClick={function(){setDO(!dO)}} style={{width:"100%",padding:14,borderRadius:10,border:"2px dashed "+bd,background:"transparent",color:mt,cursor:"pointer",fontSize:14,fontWeight:600}}>+ Pick tonight's recipe</button>}
        {dO&&<div style={{marginTop:8}}>
          <input value={dS} onChange={function(e){setDS(e.target.value)}} placeholder="Search recipes..." style={inp}/>
          <div style={{display:"flex",gap:4,margin:"6px 0"}}>
            {["All","Indian","Intl","Soup","Bowl"].map(function(f){return <button key={f} onClick={function(){setDF(f)}} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",fontFamily:M,background:dF===f?lime:bd,color:dF===f?"#080808":mt}}>{f}</button>})}
          </div>
          <div style={{maxHeight:240,overflowY:"auto"}}>
            {fDR.map(function(r){return <button key={r.i} onClick={function(){upd({dinner:r.i});setDO(false);setDS("")}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid "+bd,background:bg,color:tx,cursor:"pointer",textAlign:"left",marginBottom:3,fontSize:13}}>
              <span><span style={{color:dm,fontFamily:M,fontSize:11}}>#{r.i} </span>{r.n}</span>
              <span style={{fontSize:12,color:mt,fontFamily:M,whiteSpace:"nowrap",marginLeft:8,fontWeight:700}}>{r.c} • {r.p}g</span>
            </button>})}
          </div>
        </div>}
      </Bx>

      <Bx title="📝 UNPLANNED FOOD" accent={org}>
        {(day.custom||[]).map(function(m){return <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+bd}}>
          <div><div style={{fontSize:14,fontWeight:600}}>{m.n}</div><div style={{fontSize:11,color:mt,fontFamily:M}}>{m.c} kcal • {m.p}g</div></div>
          <button onClick={function(){upd({custom:(day.custom||[]).filter(function(x){return x.id!==m.id})})}} style={{background:"transparent",border:"none",color:red,cursor:"pointer",fontSize:20,fontWeight:700}}>×</button>
        </div>})}
        {cO?<div style={{padding:"8px 0",display:"flex",flexDirection:"column",gap:6}}>
          <input value={cN} onChange={function(e){setCN(e.target.value)}} placeholder="What did you eat?" style={inp}/>
          <div style={{display:"flex",gap:6}}>
            <input value={cC} onChange={function(e){setCC(e.target.value)}} placeholder="Calories" type="number" style={Object.assign({},inp,{flex:1})}/>
            <input value={cP} onChange={function(e){setCP(e.target.value)}} placeholder="Protein g" type="number" style={Object.assign({},inp,{flex:1})}/>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={addCM} style={{flex:1,padding:10,borderRadius:8,border:"none",background:lime,color:"#080808",fontWeight:800,fontSize:14,cursor:"pointer"}}>Add</button>
            <button onClick={function(){setCO(false)}} style={{padding:"10px 16px",borderRadius:8,border:"1px solid "+bd,background:"transparent",color:mt,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>:<button onClick={function(){setCO(true)}} style={{width:"100%",padding:12,borderRadius:8,border:"2px dashed "+bd,background:"transparent",color:dm,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:4}}>+ Log unplanned food (party, eating out)</button>}
      </Bx>

      <Bx title={"💧 WATER — "+waterT+"L TARGET"} accent={blue}>
        <div style={{display:"flex",gap:6,padding:"6px 0"}}>
          {[1,2,3,4,5,6,7,8].map(function(n){var active=(day.water||0)>=n;
            return <button key={n} onClick={function(){upd({water:day.water===n?n-1:n})}} style={{width:34,height:40,borderRadius:8,border:"none",cursor:"pointer",background:active?"linear-gradient(180deg,#4da6ff,#2563eb)":bd,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:4,opacity:n>waterT&&!active?.25:1,transition:"all .2s"}}>
              <span style={{fontSize:10,fontFamily:M,fontWeight:700,color:active?"#fff":dm}}>{n}</span>
            </button>})}
        </div>
      </Bx>

      <Bx title="📋 NOTES" accent={prp}>
        <textarea value={day.notes||""} onChange={function(e){upd({notes:e.target.value})}} placeholder="How do you feel today? Struggles? Energy?" rows={3} style={Object.assign({},inp,{resize:"vertical",fontSize:13})}/>
      </Bx>
    </div>}

    {/* BURN TAB */}
    {tab==="burn"&&<div>
      <Bx title="🏋️ WORKOUT SESSION" accent={red}>
        {WKS.map(function(w){var s=day.workout===w.id;
          return <OB key={w.id} on={s} label={w.n} sub={w.d} val={w.b>0?"-"+w.b:"—"} color={red} onTap={function(){upd({workout:s?null:w.id})}}/>})}
      </Bx>
      <Bx title="🚶 WALKING + 🔥 HIIT" accent={org}>
        {ACTS.map(function(a){var s=(day.walks||[]).includes(a.id);
          return <OB key={a.id} on={s} label={a.n} val={"-"+a.b} color={a.id.startsWith("hiit")?pnk:org} onTap={function(){tog("walks",a.id)}}/>})}
      </Bx>
      <Bx title="📊 CALORIE BREAKDOWN" accent={blue}>
        {[{l:"BMR (resting metabolism)",v:BMR_V},{l:"NEAT (daily activity)",v:NEAT_V},{l:"TEF (food digestion)",v:tef},{l:"Workout session",v:wB},{l:"Walking + HIIT",v:aB}].map(function(r,i){
          return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:13,color:mt}}>{r.l}</span><span style={{fontSize:14,fontFamily:M,fontWeight:600,color:r.v>0?tx:dm}}>{r.v}</span></div>})}
        <div style={{borderTop:"2px solid "+bd,marginTop:6,paddingTop:8}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:14,fontWeight:700}}>Total Burn</span><span style={{fontSize:18,fontWeight:800,fontFamily:M,color:blue}}>{tOut}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:14,fontWeight:700}}>Total Intake</span><span style={{fontSize:18,fontWeight:800,fontFamily:M,color:org}}>{tIn}</span></div>
          <div style={{borderTop:"2px solid "+bd,marginTop:6,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:16,fontWeight:800,color:lime}}>NET DEFICIT</span>
            <span style={{fontSize:24,fontWeight:800,fontFamily:M,color:def>0?lime:red}}>{def>0?"-":"+"}{Math.abs(def)}</span>
          </div>
          <div style={{fontSize:12,color:mt,textAlign:"center",marginTop:6,fontFamily:M,fontWeight:600}}>= {(def/7700).toFixed(2)} kg fat burned today</div>
        </div>
      </Bx>
    </div>}

    {/* BODY TAB */}
    {tab==="body"&&<div>
      <Bx title="⚖️ MORNING WEIGH-IN" accent={cyn}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
          <input type="number" step="0.1" placeholder="0.0" value={day.weight||""} onChange={function(e){upd({weight:e.target.value?parseFloat(e.target.value):null})}} style={{flex:1,padding:14,borderRadius:12,border:"2px solid "+bd,background:bg,color:tx,fontSize:32,fontWeight:800,fontFamily:M,outline:"none",textAlign:"center"}}/>
          <span style={{fontSize:20,color:mt,fontWeight:700}}>kg</span>
        </div>
        {day.weight&&<div style={{display:"flex",justifyContent:"center",gap:20,marginTop:8}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,fontFamily:M,color:lime}}>{(START_W-day.weight).toFixed(1)}</div><div style={{fontSize:10,color:mt,fontWeight:600}}>KG LOST</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,fontFamily:M,color:org}}>{(day.weight-TARGET_W).toFixed(1)}</div><div style={{fontSize:10,color:mt,fontWeight:600}}>TO GO</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,fontFamily:M,color:blue}}>{pct.toFixed(0)}%</div><div style={{fontSize:10,color:mt,fontWeight:600}}>DONE</div></div>
        </div>}
      </Bx>

      <Bx title="😴 SLEEP HOURS" accent={prp}>
        <div style={{display:"flex",gap:5,padding:"6px 0"}}>
          {[5,5.5,6,6.5,7,7.5,8,8.5,9].map(function(h){return <button key={h} onClick={function(){upd({sleep:day.sleep===h?null:h})}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",background:day.sleep===h?(h>=7?lime:red):bd,color:day.sleep===h?"#080808":dm,fontSize:12,fontWeight:800,fontFamily:M}}>{h}</button>})}
        </div>
        <div style={{fontSize:12,color:mt,marginTop:5,fontWeight:500}}>{day.sleep?(day.sleep>=7?"✓ "+day.sleep+"h — Cortisol low. Recovery on track.":"⚠ "+day.sleep+"h — Under 7! Water retention risk."):"Tap your hours. Target: 7-8h."}</div>
      </Bx>

      <Bx title="📊 OVERALL PROGRESS" accent={lime}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,color:mt,fontFamily:M,fontWeight:600}}>111 kg</span>
          <span style={{fontSize:12,color:lime,fontFamily:M,fontWeight:600}}>90 kg</span>
        </div>
        <div style={{height:16,background:bd,borderRadius:8,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:8,width:pct+"%",background:"linear-gradient(90deg,"+lime+",#8bbc14)",transition:"width .5s"}}/>
        </div>
        <div style={{textAlign:"center",marginTop:12}}>
          <span style={{fontSize:42,fontWeight:800,fontFamily:M,color:lime}}>{tL.toFixed(1)}</span>
          <span style={{fontSize:16,color:mt,marginLeft:6,fontWeight:600}}>kg lost</span>
        </div>
      </Bx>

      <Bx title="🎯 MILESTONES" accent={cyn}>
        {TARGETS.map(function(tg,i){var a=data[tg.d]?data[tg.d].weight:null;var cur=sel>=(i>0?TARGETS[i-1].d:START_DATE)&&sel<=tg.d;
          return <div key={tg.d} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+bd,opacity:tg.d<sel&&!cur?.3:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>{cur&&<div style={{width:6,height:6,borderRadius:3,background:lime,boxShadow:"0 0 6px "+lime}}/>}<span style={{fontSize:13,fontWeight:cur?700:500,color:cur?tx:mt}}>{tg.l}</span></div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:13,fontFamily:M,color:dm,fontWeight:600}}>{tg.t}kg</span>{a!=null&&<span style={{fontSize:14,fontFamily:M,fontWeight:800,color:a<=tg.t?lime:red}}>{a} {a<=tg.t?"✓":"✗"}</span>}</div>
          </div>})}
      </Bx>

      <Bx title="📋 WEIGHT LOG" accent={blue}>
        {wE.length===0?<p style={{fontSize:13,color:dm}}>No entries yet. Start logging!</p>:
          wE.slice(-14).reverse().map(function(entry,i,arr){var d=entry[0],v=entry[1];var prev=i<arr.length-1?arr[i+1][1].weight:null;var diff=prev?(v.weight-prev).toFixed(1):null;
            return <div key={d} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+bd}}>
              <span style={{fontSize:11,color:dm,fontFamily:M}}>{msh(d)} {dn(d)}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>{diff&&<span style={{fontSize:11,fontFamily:M,fontWeight:700,color:parseFloat(diff)<=0?lime:red}}>{parseFloat(diff)>0?"+":""}{diff}</span>}<span style={{fontSize:15,fontWeight:800,fontFamily:M}}>{v.weight}</span></div>
            </div>})}
      </Bx>
    </div>}

    {/* MORE TAB */}
    {tab==="more"&&<div>
      <Bx title={"💊 SUPPLEMENTS — "+(day.supplements||[]).length+"/"+SUPPS.length} accent={prp}>
        {SUPPS.map(function(s){var on=(day.supplements||[]).includes(s.id);
          return <button key={s.id} onClick={function(){tog("supplements",s.id)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 0",cursor:"pointer",background:"transparent",border:"none",borderBottom:"1px solid "+bd,color:tx,textAlign:"left"}}>
            <CB on={on} color={prp}/><span style={{fontSize:14,fontWeight:600,opacity:on?1:.4}}>{s.n}</span>
          </button>})}
        {ph.id>=4&&<div style={{fontSize:12,color:red,paddingTop:6,fontFamily:M,fontWeight:700}}>⚠ Stop ORS after April 28</div>}
      </Bx>

      <Bx title="📅 DAILY SCHEDULE" accent={cyn}>
        {[["6:45","ACV + warm water"],["7:00","Green tea + chia seeds"],["9:30","Protein shake + almonds"],["1:00","Lunch"],["4:30","Americano (pre-workout)"],["5:00","Walk to gym (1km)"],["5:15","Workout + cardio"],["6:30","Walk home (1km)"],["6:45","Post-workout shake"],["8:30","Dinner (paneer recipe)"],["9:00","Evening walk 60-90 min"],["10:00","Isabgol + warm water"],["10:15","Sleep"]].map(function(item,i){
          return <div key={i} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:"1px solid "+bd}}>
            <span style={{fontSize:12,color:cyn,fontFamily:M,fontWeight:700,width:42,flexShrink:0}}>{item[0]}</span>
            <span style={{fontSize:13,fontWeight:500}}>{item[1]}</span>
          </div>})}
      </Bx>

      <Bx title="⚠️ THE RULES" accent={red}>
        {["No cheat meals. 38 days. ZERO.","Protein above 85g/day always","Sleep 7-8 hours minimum","No alcohol","No packaged or outside food","Walk BRISK to gym — not stroll","Weigh every morning, same time","Dizzy or faint? EAT IMMEDIATELY."].map(function(r,i){
          return <div key={i} style={{fontSize:13,color:mt,padding:"5px 0",borderBottom:"1px solid "+bd,fontWeight:500}}><span style={{color:red,fontWeight:800}}>{i+1}.</span> {r}</div>})}
      </Bx>

      <Bx title="🛒 WEEKLY GROCERY" accent={lime}>
        {["Paneer 1.4kg (200g × 7)","Whey protein (14 scoops)","Chia seeds 100g","Green tea bags × 7","Almonds ~25","Besan 250g","Sabzi 3-4 types","Fresh veg + coriander + lemon","Low-fat dahi ~500g","Whole wheat atta 500g","Isabgol","ORS/Electral × 10"].map(function(item,i){
          return <div key={i} style={{fontSize:13,color:mt,padding:"4px 0",borderBottom:"1px solid "+bd,fontWeight:500}}>• {item}</div>})}
      </Bx>
    </div>}

    </div>
  </div>;
}
