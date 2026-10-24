const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.js');
const now=new Date('2026-10-24T12:00:00');
const course={id:'c1',start:'2026-10-01',end:'2026-12-31',required:75,schedule:[]};
const session=(id,date,hours,status)=>({id,courseId:'c1',date,time:'09:00',hours,status,note:'',type:'lecture',generated:false});
test('Recorded rate uses hours, excludes unknown, cancellations and future records',()=>{
 const s=E.stats(course,[session('1','2026-10-02',3,'present'),session('2','2026-10-03',1,'absent'),session('3','2026-10-04',2,'unrecorded'),session('4','2026-10-05',2,'cancelled'),session('5','2026-11-01',2,'present')],now);
 assert.equal(s.rate,75);assert.equal(s.a,3);assert.equal(s.m,1);assert.equal(s.total,8);assert.equal(s.allowance,2);assert.equal(s.left,1);assert.equal(s.need,3);assert.equal(s.pastUnknown,2);assert.equal(s.future,2);assert.equal(s.possible,true);
});
test('Zero recordings do not create a false 0% rate or automatic absences',()=>{const s=E.stats(course,[session('1','2026-10-02',2,'unrecorded')],now);assert.equal(s.rate,null);assert.equal(s.m,0);assert.equal(s.possible,true);assert.equal(s.need,1.5)});
test('Overrun is mathematically impossible even with every unknown hour attended',()=>{const s=E.stats({...course,required:80},[session('1','2026-10-02',4,'absent'),session('2','2026-11-01',6,'unrecorded')],now);assert.equal(s.left,-2);assert.equal(s.need,8);assert.equal(s.possible,false);assert.equal(s.status,'risk')});
test('Cancelling shrinks eligible denominator and absence allowance',()=>{const base=[session('1','2026-10-02',2,'present'),session('2','2026-11-01',2,'unrecorded')];assert.equal(E.stats(course,base,now).allowance,1);base[1].status='cancelled';assert.equal(E.stats(course,base,now).allowance,.5)});
test('Semester boundaries exclude preserved records, including attended and missed',()=>{const s=E.stats({...course,start:'2026-11-01'},[session('1','2026-10-02',4,'absent'),session('2','2026-11-01',2,'unrecorded')],now);assert.equal(s.total,2);assert.equal(s.m,0);assert.equal(s.rate,null)});
test('Missing requirement and empty or fully cancelled schedule have no allowance',()=>{assert.equal(E.stats({...course,required:null},[],now).left,null);assert.equal(E.stats(course,[session('1','2026-10-02',2,'cancelled')],now).status,'setup')});
test('Weekly generation includes both semester boundaries and preserves rule types',()=>{const c={...course,start:'2026-10-05',end:'2026-10-12',schedule:[{id:'r1',day:1,time:'10:00',hours:1.5,type:'lab'}]};const ss=E.generate(c);assert.deepEqual(ss.map(s=>s.date),['2026-10-05','2026-10-12']);assert.equal(ss[0].type,'lab');assert.equal(ss[0].hours,1.5);assert.equal(ss[0].status,'unrecorded')});
test('Reconciliation is idempotent, preserves records and their original duration',()=>{const c={...course,start:'2026-10-05',end:'2026-10-12',schedule:[{id:'r1',day:1,time:'10:00',hours:2,type:'lecture'}]};let ss=E.generate(c);ss[0].status='present';c.schedule[0].hours=3;ss=E.reconcile(c,ss);assert.equal(ss[0].hours,2);assert.equal(ss[1].hours,3);assert.equal(E.reconcile(c,ss).length,2);c.schedule=[];ss=E.reconcile(c,ss);assert.equal(ss.length,1);assert.equal(ss[0].retained,true);assert.equal(ss[0].generated,false)});
test('Quarter-hour sessions with decimal requirement retain precise allowance',()=>{const s=E.stats({...course,required:99.9},[session('1','2026-10-02',.25,'unrecorded')],now);assert.equal(s.allowance,.00025);assert.equal(s.need,.24975)});
test('Requirements at 0 and 100 percent behave correctly',()=>{const ss=[session('1','2026-10-02',2,'absent')];assert.equal(E.stats({...course,required:0},ss,now).possible,true);assert.equal(E.stats({...course,required:100},ss,now).possible,false)});

