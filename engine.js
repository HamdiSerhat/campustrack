/* CampusTrack's shared, dependency-free attendance model. */
(function(root){
const round=n=>Math.round((n+Number.EPSILON)*100000000)/100000000;
const day=d=>new Date(d+'T12:00:00');
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const add=(d,n)=>{const v=day(d);v.setDate(v.getDate()+n);return iso(v)};
const ended=(s,now=new Date())=>s.endTime?new Date(s.date+'T'+s.endTime).getTime()<=now.getTime():s.hours!==null&&new Date(s.date+'T'+s.time).getTime()+s.hours*3600000<=now.getTime();
const inTerm=(c,s)=>{const end=c.official&&s.type==='exam'?(c.official.packet.semester_settings.resit_end||c.official.packet.semester_settings.final_end||c.end):c.end;return !!c.start&&!!end&&s.date>=c.start&&s.date<=end};
function generate(c){
 if(!c.start||!c.end||c.start>c.end)return [];
 const out=[];let count=0;
 for(let date=c.start;date<=c.end&&count<1100;date=add(date,1),count++){
  for(const r of c.schedule||[])if(day(date).getDay()===Number(r.day))out.push({id:`${c.id}:${r.id}:${date}`,courseId:c.id,date,time:r.time,hours:Number(r.hours),type:r.type,status:'unrecorded',note:'',generated:true});
 }return out;
}
function reconcile(c,old){
 const fresh=generate(c), ids=new Set(fresh.map(s=>s.id)), prior=new Map(old.map(s=>[s.id,s]));
 return [...fresh.map(s=>{const p=prior.get(s.id);return p&&(p.status!=='unrecorded'||p.note)?{...p}:s}),...old.filter(s=>!ids.has(s.id)&&(!s.generated||s.status!=='unrecorded'||s.note)).map(s=>({...s,generated:false,retained:s.generated||s.retained}))];
}
function stats(c,sessions,now=new Date()){
 if(c.official)return universityStats(c,sessions,now);
 const eligible=sessions.filter(s=>s.courseId===c.id&&inTerm(c,s)&&s.status!=='cancelled');
 const sum=arr=>round(arr.reduce((v,s)=>v+s.hours,0));
 const a=sum(eligible.filter(s=>ended(s,now)&&s.status==='present')), m=sum(eligible.filter(s=>ended(s,now)&&s.status==='absent'));
 const total=sum(eligible), unknown=sum(eligible.filter(s=>!ended(s,now)||s.status==='unrecorded'));
 const pastUnknown=sum(eligible.filter(s=>ended(s,now)&&s.status==='unrecorded'));
 const future=sum(eligible.filter(s=>!ended(s,now))), rate=a+m?100*a/(a+m):null;
 const configured=c.required!==null&&c.required!==''&&Number.isFinite(Number(c.required))&&total>0;
 const allowance=configured?round(total*(1-Number(c.required)/100)):null;
 const left=configured?round(allowance-m):null, need=configured?round(Math.max(0,total*Number(c.required)/100-a)):null;
 const possible=configured?need<=unknown+0.00001:null;
 const status=!configured?'setup':!possible||left<0?'risk':left<=Math.max(2,total*.05)?'warning':'safe';
 return {a,m,total,unknown,pastUnknown,future,rate,allowance,left,need,possible,status,min:total?100*a/total:0,max:total?100*(a+unknown)/total:0};
}
function universityStats(c,sessions,now){
 const all=sessions.filter(s=>s.courseId===c.id&&inTerm(c,s)),known=all.filter(s=>ended(s,now)&&['present','absent'].includes(s.status));
 function measure(arr){if(!arr.length)return {a:null,m:null,present:null,absent:null,rate:null,units:null,presentUnits:null};const a=arr.filter(s=>s.status==='present'),m=arr.filter(s=>s.status==='absent');
  const hours=ss=>ss.some(s=>s.minutes===null||s.hours===null)?null:round(ss.reduce((v,s)=>v+(s.minutes??s.hours*60),0)/60);
  const units=ss=>ss.some(s=>!s.sourceRecord||s.sourceRecord.recorded_units===null)?null:ss.reduce((v,s)=>v+s.sourceRecord.recorded_units,0);
  const total=units(arr),present=units(a);return {a:hours(a),m:hours(m),present:a.length,absent:m.length,units:total,presentUnits:present,rate:total&&present!==null?100*present/total:null};
 }
 const source=known.filter(s=>s.officialKey),primary=measure(source),components={};
 for(const type of ['lecture','class','tutorial','lab','exam','unknown'])components[type]={source:measure(source.filter(s=>s.type===type)),local:measure(known.filter(s=>!s.officialKey&&s.type===type)),plannedUnknown:all.filter(s=>s.universityPlan&&s.type===type&&s.status==='unrecorded').length};
 // No compound rule, lab penalty, missing source version, or tentative plan is a final quota.
 return {...primary,total:null,unknown:null,pastUnknown:null,future:null,rate:primary.rate,allowance:null,left:null,need:null,possible:null,status:'review',min:null,max:null,components,portalRecords:source.length,localRecords:known.length-source.length};
}
const api={round,day,iso,add,ended,inTerm,generate,reconcile,stats};root.CampusEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
