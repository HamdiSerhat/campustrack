/* Generic university-package adapter. No student data or institution-specific rules. */
(function(root){'use strict';
const FORMAT='campustrack-portable-1.0',copy=v=>JSON.parse(JSON.stringify(v));
const components=['lecture','lab','tutorial','exam','class','unknown','lab_or_tutorial'];
const statuses=['present','absent','unreported','cancelled','scheduled','unknown','not_yet_due'];
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
const time=t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
function date(v){if(typeof v!=='string'||!/^20\d\d-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v}
const add=(v,n)=>{const d=new Date(v+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const weekday=v=>new Date(v+'T12:00:00Z').getUTCDay();
const safe=v=>typeof v==='string'&&/^[A-Za-z0-9._-]{1,100}$/.test(v);
const key=c=>JSON.stringify([c.semester_id,c.course_code,c.group]);
const identity=r=>JSON.stringify([r.semester_id,r.course_id,r.group,r.date,r.start_time,r.portal_type]);
const idFor=(prefix,v)=>prefix+Array.from(new TextEncoder().encode(v),b=>b.toString(16).padStart(2,'0')).join('');
const equivalent=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function validate(p){
 const errors=[],fail=s=>{if(errors.length<30)errors.push(s)},arrays=['courses','schedules','attendance_records','attendance_rules','attendance_summary','weekly_calendar','schedule_gaps','sources','issues'];
 if(!p||p.schema_version!==FORMAT)throw new Error('Desteklenmeyen üniversite paketi şeması.');
 for(const name of arrays)if(!Array.isArray(p[name]))fail(`${name}: liste eksik.`);
 if(errors.length)throw new Error(errors.join('\n'));
 if(!date(p.as_of_date)||!p.semester_settings||!safe(p.semester_settings.semester_id))fail('Geçerli dönem / güncellik tarihi gerekli.');
 const sem=p.semester_settings||{};
 if(!date(sem.classes_start)||!date(sem.classes_end)||sem.classes_start>sem.classes_end||(new Date(sem.classes_end)-new Date(sem.classes_start))/86400000>730)fail('Ders dönemi tarihleri geçersiz.');
 if(sem.unknown_is_absent!==false||sem.cancelled_counts_in_attendance_denominator!==false||sem.unreported_counts_in_attendance_denominator!==false)fail('Bilinmeyen / iptal kayıtlarını devamsız sayan paket kabul edilmez.');
 if(p.courses.length>200||p.attendance_records.length>20000||p.schedules.length>1000||p.schedule_gaps.length>20000||p.sources.length>1000||p.attendance_rules.length>2000)fail('Paket boyut sınırları aşıldı.');
 function walk(v,depth=0){if(depth>16){fail('İç içe veri sınırı aşıldı.');return}if(typeof v==='string'&&v.length>20000)fail('Çok uzun metin.');if(v&&typeof v==='object')for(const [k,val]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))fail('Güvensiz nesne anahtarı.');walk(val,depth+1)}}walk(p);
 const courses=new Map(),sourceIds=new Set();
 for(const s of p.sources){if(!s||!safe(s.source_id)||sourceIds.has(s.source_id))fail('Kaynak kimliği geçersiz / yineleniyor.');else sourceIds.add(s.source_id)}
 const refs=(o,label)=>{if(!Array.isArray(o.source_ids)||o.source_ids.some(v=>!sourceIds.has(v)))fail(`${label}: kaynak ilişkisi eksik.`)};
 for(const c of p.courses){if(!c||!safe(c.course_id)||!safe(c.course_code)||typeof c.course_name!=='string'||!c.course_name.trim()||c.course_name.length>120||typeof c.group!=='string'||!safe(c.group)||c.semester_id!==sem.semester_id||courses.has(c.course_id))fail('Ders / grup / dönem bilgisi geçersiz veya yineleniyor.');else courses.set(c.course_id,c);refs(c,'Ders')}
 const relation=(o,label)=>{if(!o||!courses.has(o.course_id))fail(`${label}: ders ilişkisi bulunamadı.`);if(o.semester_id!==undefined&&o.semester_id!==sem.semester_id)fail(`${label}: dönem uyuşmuyor.`);if(o.group!==undefined&&o.group!==courses.get(o.course_id)?.group)fail(`${label}: grup uyuşmuyor.`);refs(o,label)};
 const scheduleIds=new Map();
 for(const s of p.schedules){relation(s,'Program');if(!safe(s.schedule_id)||scheduleIds.has(s.schedule_id))fail('Program kimliği geçersiz / yineleniyor.');else scheduleIds.set(s.schedule_id,s);
  if(!time(s.start_time)||!time(s.end_time)||!Number.isInteger(s.duration_minutes)||s.duration_minutes<=0||s.duration_minutes>minutes(s.end_time)-minutes(s.start_time)||!components.includes(s.component)||!Number.isInteger(s.day_of_week)||s.day_of_week<0||s.day_of_week>6)fail('Program süre / tür alanı geçersiz.');
  if(s.recurrence==='weekly_template'){if(!date(s.effective_start)||!date(s.effective_end)||s.effective_start>s.effective_end)fail('Haftalık program tarihleri eksik.');if(s.active_on_dates!==undefined&&(!Array.isArray(s.active_on_dates)||s.active_on_dates.some(v=>!date(v))))fail('Etkin lab tarihleri geçersiz.');}
  else if(s.recurrence==='single_occurrence_override'){if(!date(s.date)||!Array.isArray(s.overrides_weekly_schedule_ids))fail('Tarihli oturumun tarihi / yerine geçtiği slotlar eksik.');}
  else fail('Bilinmeyen tekrar türü.');
 }
 for(const s of p.schedules)for(const id of s.overrides_weekly_schedule_ids||[]){const w=scheduleIds.get(id);if(!w||w.course_id!==s.course_id||w.recurrence!=='weekly_template')fail('Lab yerine-geçme ilişkisi geçersiz.')}
 for(let i=0;i<p.schedules.length;i++)for(let j=i+1;j<p.schedules.length;j++){const a=p.schedules[i],b=p.schedules[j];if(a.course_id!==b.course_id||a.recurrence!==b.recurrence||minutes(a.start_time)>=minutes(b.end_time)||minutes(b.start_time)>=minutes(a.end_time))continue;if(a.recurrence==='single_occurrence_override'&&a.date===b.date)fail('Aynı tarihli çakışan oturumlar iki kez sayılamaz.');if(a.recurrence==='weekly_template'&&a.day_of_week===b.day_of_week&&a.effective_start<=b.effective_end&&b.effective_start<=a.effective_end&&(!a.active_on_dates||!b.active_on_dates||a.active_on_dates.some(d=>b.active_on_dates.includes(d))))fail('Çakışan haftalık şablonlar doğrulanmalı.');}
 const recordIds=new Map();
 for(const r of p.attendance_records){relation(r,'Yoklama');if(typeof r.record_id!=='string'||r.record_id.length>300||typeof r.portal_type!=='string'||r.portal_type.length>80||!date(r.date)||!time(r.start_time)||!time(r.end_time)||!components.includes(r.component)||!statuses.includes(r.status)||r.recorded_minutes!==null&&(!Number.isInteger(r.recorded_minutes)||r.recorded_minutes<=0||r.recorded_minutes>minutes(r.end_time)-minutes(r.start_time))||r.recorded_units!==null&&(!Number.isFinite(r.recorded_units)||r.recorded_units<=0))fail('Yoklama alanları geçersiz.');if(['present','absent'].includes(r.status)&&r.recorded_minutes===null)fail('İşlenmiş yoklamanın dakika değeri eksik; sıfır varsayılmayacak.');
  const k=identity(r);if(recordIds.has(k)&&!equivalent(recordIds.get(k),r))fail('Aynı doğal anahtar için çelişkili yoklama kayıtları.');recordIds.set(k,r);
 }
 for(const rule of p.attendance_rules){relation(rule,'Kural');if(!safe(rule.rule_id)||typeof rule.description_tr!=='string'||!sourceIds.has(rule.source_id))fail('Kural kimliği / açıklama / kaynak eksik.');for(const n of ['minimum_attendance_percent','maximum_absence_percent'])if(rule[n]!==null&&(typeof rule[n]!=='number'||rule[n]<0||rule[n]>100))fail('Kural yüzde değeri null veya 0–100 sayı olmalı.');}
 for(const summary of p.attendance_summary){relation(summary,'Özet');for(const k of ['semester_eligible_total_units','total_allowed_absence_units','remaining_absence_units','lab_attended_sessions','lab_absent_sessions'])if(summary[k]!==null&&typeof summary[k]!=='number')fail(`Özet ${k}: null veya sayı olmalı.`);}
 for(const g of p.schedule_gaps){relation(g,'Eksik kayıt adayı');if(!date(g.date)||!time(g.start_time)||!time(g.end_time)||g.count_as_absence!==false||g.count_in_denominator!==false)fail('Eksik kayıt adayı sayıma dahil edilemez.');}
 for(const issue of p.issues){if(!issue||typeof issue.issue_id!=='string'||typeof issue.description_tr!=='string')fail('Sorun kaydı geçersiz.');refs(issue,'Sorun')}
 if(errors.length)throw new Error(errors.join('\n'));
 return copy(p);
}
function subset(p,c){const cid=c.course_id;return {...p,courses:[c],schedules:p.schedules.filter(v=>v.course_id===cid),attendance_records:p.attendance_records.filter(v=>v.course_id===cid),attendance_rules:p.attendance_rules.filter(v=>v.course_id===cid),attendance_summary:p.attendance_summary.filter(v=>v.course_id===cid),weekly_calendar:p.weekly_calendar.filter(v=>v.course_id===cid),schedule_gaps:p.schedule_gaps.filter(v=>v.course_id===cid),issues:p.issues.filter(v=>!v.course_id||v.course_id===cid)}}
function planSessions(c){
 const p=c.official.packet,sem=p.semester_settings,weekly=p.schedules.filter(s=>s.recurrence==='weekly_template'),dated=p.schedules.filter(s=>s.recurrence==='single_occurrence_override');const out=[];
 const make=(s,date)=>({id:`plan:${c.id}:${s.schedule_id}:${date}`,courseId:c.id,date,time:s.start_time,endTime:s.end_time,hours:s.duration_minutes/60,minutes:s.duration_minutes,type:s.component==='lab_or_tutorial'?'tutorial':s.component,status:'unrecorded',note:'',generated:true,universityPlan:true,sourceScheduleId:s.schedule_id,sourceStatus:s.attendance_status??'scheduled',held:s.held??null,room:s.room??null,sourceIds:s.source_ids,timezone:s.time_zone??null,noAttendance:(sem.calendar_exceptions||[]).some(x=>x.date===date&&x.kind==='no_attendance_or_exams')});
 for(let d=sem.classes_start;d<=sem.classes_end;d=add(d,1)){
  const overrides=dated.filter(s=>s.date===d),skip=new Set(overrides.flatMap(s=>s.overrides_weekly_schedule_ids));
  const examPeriod=sem.midterm_start&&d>=sem.midterm_start&&d<=sem.midterm_end;
  const holiday=(sem.calendar_exceptions||[]).some(x=>x.date===d&&x.kind==='holiday');
  if(!examPeriod&&!holiday)for(const s of weekly)if(d>=s.effective_start&&d<=s.effective_end&&weekday(d)===s.day_of_week&&!skip.has(s.schedule_id)&&(!s.active_on_dates||s.active_on_dates.includes(d)))out.push(make(s,d));
  // Explicit dated source overrides survive a generic exam-period filter.
  for(const s of overrides)out.push(make(s,d));
 }
 return out;
}
function recordSession(r,c){const k=identity(r);return {id:idFor('record:',k),courseId:c.id,date:r.date,time:r.start_time,endTime:r.end_time,hours:r.recorded_minutes===null?null:r.recorded_minutes/60,minutes:r.recorded_minutes,type:r.component,status:['present','absent','cancelled'].includes(r.status)?r.status:'unrecorded',note:'',generated:true,officialKey:k,sourceRecord:copy(r),sourceStatus:r.status,held:r.held,timezone:c.official.packet.semester_settings.schedule_time_zone??null}}
function sourceStats(p,cid){const records=[...new Map(p.attendance_records.filter(r=>r.course_id===cid).map(r=>[identity(r),r])).values()],by={};for(const type of components){const rr=records.filter(r=>r.component===type&&['present','absent'].includes(r.status)),a=rr.filter(r=>r.status==='present'),m=rr.filter(r=>r.status==='absent');by[type]={present:rr.length?a.length:null,absent:rr.length?m.length:null,rate:rr.length?100*a.length/rr.length:null}}return by}
function buildPlan(input,current){
 const p=validate(input),next=copy(current),changes=[],conflicts=[],counts={coursesAdded:0,coursesUpdated:0,recordsAdded:0,recordsUpdated:0,recordsUnchanged:0,recordsRetained:0,duplicateRecords:0,metadataChanges:0};
 if(current.demo)conflicts.push('Önce demo modundan kendi çalışma alanına dön.');
 const seen=new Set(),allIncoming=new Set(p.attendance_records.map(identity));
 for(const raw of p.courses){
  const k=key(raw),prior=next.courses.find(c=>c.official?.key===k),sameCode=next.courses.filter(c=>c.code===raw.course_code&&!c.official);
  const template=sameCode.find(c=>!c.schedule.length&&!next.sessions.some(s=>s.courseId===c.id)&&c.required===null&&!c.start&&!c.end),existing=prior||template;
  if(!existing&&sameCode.length){conflicts.push(`${raw.course_code}: aynı kodlu mevcut kişisel ders dolu; otomatik birleştirilmedi.`);continue}
  const idx=next.courses.findIndex(c=>c.id===existing?.id),c={...(existing||{id:idFor('uni-',k),color:'#7163db',icon:'book',archived:false}),code:raw.course_code,name:raw.course_name,start:p.semester_settings.classes_start,end:p.semester_settings.classes_end,required:null,schedule:[],official:{key:k,packet:subset(p,raw)}};
  if(idx>=0){next.courses[idx]=c;counts.coursesUpdated++;}else{next.courses.push(c);counts.coursesAdded++}
  if(existing?.name!==c.name)changes.push({kind:'course_name',course:c.code,before:existing?.name??null,after:c.name});
  if(prior){for(const field of ['schedules','attendance_rules','sources','semester_settings'])if(!equivalent(prior.official.packet[field],c.official.packet[field])){counts.metadataChanges++;changes.push({kind:field,course:c.code,before:prior.official.packet[field],after:c.official.packet[field]})}}
  const originalSessions=next.sessions.filter(s=>s.courseId===c.id),existingKeys=new Map(originalSessions.filter(s=>s.officialKey).map(s=>[s.officialKey,s]));
  const incoming=p.attendance_records.filter(r=>r.course_id===raw.course_id);
  for(const r of incoming){const natural=identity(r);if(seen.has(natural)){counts.duplicateRecords++;continue}seen.add(natural);const old=existingKeys.get(natural),fresh=recordSession(r,c);
   if(old){if(old.status!==(old.sourceRecord&&(['present','absent','cancelled'].includes(old.sourceRecord.status)?old.sourceRecord.status:'unrecorded'))&&!equivalent(old.sourceRecord,r))conflicts.push(`${c.code} ${r.date} ${r.start_time}: yerel düzeltme ile yeni kaynak çakışıyor.`);
    if(equivalent(old.sourceRecord,r)){counts.recordsUnchanged++;continue}counts.recordsUpdated++;changes.push({kind:'record',course:c.code,date:r.date,time:r.start_time,before:old.sourceRecord,after:r});next.sessions=next.sessions.map(s=>s.id===old.id?{...fresh,id:old.id,note:old.note}:s);
   }else{const missing=originalSessions.filter(s=>s.officialKey&&!allIncoming.has(s.officialKey)&&s.date===r.date);if(missing.length)conflicts.push(`${c.code} ${r.date}: saat/tür düzeltmesi olabilir; eski ve yeni kayıt otomatik olarak birlikte sayılmayacak.`);counts.recordsAdded++;next.sessions.push(fresh)}
  }
  const retained=originalSessions.filter(s=>s.officialKey&&!allIncoming.has(s.officialKey));counts.recordsRetained+=retained.length;for(const s of retained)changes.push({kind:'retained_missing',course:c.code,date:s.date,time:s.time,before:s.sourceRecord,after:null});
  // Replace only untouched plans; never remove attendance or locally annotated evidence.
  const keep=next.sessions.filter(s=>s.courseId!==c.id||!s.universityPlan||s.status!=='unrecorded'||s.note),oldPlans=new Map(keep.filter(s=>s.courseId===c.id&&s.universityPlan).map(s=>[s.id,s]));
  const records=keep.filter(s=>s.courseId===c.id&&!s.universityPlan);
  const planned=planSessions(c).filter(s=>!oldPlans.has(s.id)&&!records.some(r=>r.date===s.date&&r.time===s.time&&r.endTime===s.endTime));next.sessions=[...keep,...planned];
 }
 next.semester={...next.semester,start:p.semester_settings.classes_start,end:p.semester_settings.classes_end};next.demo=false;
 const sessionIds=new Set();for(const s of next.sessions){if(sessionIds.has(s.id))conflicts.push('Oturum kimliği çakışması.');sessionIds.add(s.id)}
 if(next.sessions.length>20000||next.courses.length>200)conflicts.push('Çalışma alanı boyut sınırı aşıldı.');
 const unique=[...new Map(p.attendance_records.map(r=>[identity(r),r])).values()];
 return {format:FORMAT,packet:p,next,counts,changes,conflicts:[...new Set(conflicts)],base:JSON.stringify(current),summary:{courses:p.courses.length,records:unique.length,present:unique.filter(r=>r.status==='present').length,absent:unique.filter(r=>r.status==='absent').length,weekly:p.schedules.filter(s=>s.recurrence==='weekly_template').length,dated:p.schedules.filter(s=>s.recurrence==='single_occurrence_override').length,gaps:p.schedule_gaps.length,rules:p.attendance_rules.length,sources:p.sources.length,issues:p.issues.length}};
}
function validateStored(o,c){if(!o||typeof o.key!=='string')throw new Error('Kaynaklı ders metaverisi eksik.');const p=validate(o.packet);if(p.courses.length!==1||p.courses[0].course_code!==c.code||key(p.courses[0])!==o.key||c.required!==null)throw new Error('Kaynaklı ders eşleşmesi geçersiz.');return {key:o.key,packet:p}}
const api={FORMAT,components,statuses,validate,validateStored,buildPlan,planSessions,sourceStats,identity,key,copy};root.CampusUniversity=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
