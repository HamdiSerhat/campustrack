// Synthetic data written for tests. No real student, institution, teacher or attendance data.
const semester='demo-term',sourceIds=['demo-records','demo-policy'];
const course=(code,name)=>({course_id:code,course_code:code,course_name:name,semester_id:semester,group:'D1',source_ids:sourceIds});
const record=(code,date,status,time='09:00',end='09:50')=>({record_id:`demo-${code}-${date}-${time}`,course_id:code,semester_id:semester,group:'D1',date,start_time:time,end_time:end,portal_type:'SyntheticLecture',component:'lecture',status,recorded_units:1,recorded_minutes:50,held:true,cancelled:false,source_ids:['demo-records']});
const weekly=(id,code,start,end,component)=>({schedule_id:id,course_id:code,semester_id:semester,group:'D1',recurrence:'weekly_template',day_of_week:1,start_time:start,end_time:end,duration_minutes:50,component,effective_start:'2026-09-07',effective_end:'2026-10-26',time_zone:null,source_ids:sourceIds});
const dated=(id,date,component='lab')=>({schedule_id:id,course_id:'DEMO202',semester_id:semester,group:'D1',recurrence:'single_occurrence_override',date,day_of_week:1,start_time:'09:00',end_time:'10:50',duration_minutes:100,elapsed_minutes:110,break_minutes:10,component,overrides_weekly_schedule_ids:['demo-lab-slot-1','demo-lab-slot-2'],attendance_status:'unknown',held:null,time_zone:null,source_ids:sourceIds});
module.exports=function fixture(){
 const labDates=['2026-09-07','2026-09-14','2026-09-21'];
 const schedules=[weekly('demo-class-slot','DEMO201','09:00','09:50','unknown'),{...weekly('demo-lab-slot-1','DEMO202','09:00','09:50','lab'),active_on_dates:labDates},{...weekly('demo-lab-slot-2','DEMO202','10:00','10:50','lab'),active_on_dates:labDates},dated('demo-lab-1',labDates[0]),dated('demo-lab-2',labDates[1]),dated('demo-lab-final',labDates[2],'exam')];
 return {
  schema_version:'campustrack-portable-1.0',as_of_date:'2026-09-30',exported_at:'2026-09-30T12:00:00',
  courses:[course('DEMO201','Fictional Logic Workshop'),course('DEMO202','Fictional Systems Studio')],schedules,
  attendance_records:[record('DEMO201','2026-09-07','present'),record('DEMO201','2026-09-14','absent'),record('DEMO202','2026-09-08','present','14:00','14:50')],
  attendance_rules:[
   {rule_id:'demo-general',course_id:'DEMO201',semester_id:semester,component:'classes_exams',description_tr:'Kurgusal test kuralı; bileşen paydası bilinmiyor.',minimum_attendance_percent:70,maximum_absence_percent:30,minimum_attended_sessions:null,source_id:'demo-policy',source_ids:['demo-policy'],source_section:'Synthetic section',automation_status:'manual_review_required'},
   {rule_id:'demo-lab-rule',course_id:'DEMO202',semester_id:semester,component:'lab',description_tr:'Kurgusal lab koşulu; kişisel katılım bilinmiyor.',minimum_attendance_percent:null,maximum_absence_percent:null,minimum_attended_sessions:2,source_id:'demo-policy',source_ids:['demo-policy'],source_section:'Synthetic lab section',automation_status:'manual_review_required'}
  ],
  semester_settings:{semester_id:semester,classes_start:'2026-09-07',classes_end:'2026-10-26',midterm_start:'2026-10-12',midterm_end:'2026-10-16',final_start:'2026-11-02',final_end:'2026-11-06',schedule_time_zone:null,academic_period_minutes:50,unknown_is_absent:false,cancelled_counts_in_attendance_denominator:false,unreported_counts_in_attendance_denominator:false,calendar_exceptions:[]},
  attendance_summary:['DEMO201','DEMO202'].map(code=>({course_id:code,semester_eligible_total_units:null,total_allowed_absence_units:null,remaining_absence_units:null,lab_attended_sessions:null,lab_absent_sessions:null,actual_cancelled_total_units:null,unpublished_or_unreported_total_units:null,allowance_reason_tr:'Kurgusal pakette kesin dönem paydası yok.',source_ids:sourceIds})),
  weekly_calendar:[],schedule_gaps:[{candidate_id:'demo-gap',course_id:'DEMO201',date:'2026-09-21',start_time:'09:00',end_time:'09:50',status:'unreported',held:null,count_as_absence:false,count_in_denominator:false,source_ids:['demo-records']}],
  sources:[{source_id:'demo-records',source_url:'https://example.invalid/synthetic-records',collection_method:'synthetic_fixture'},{source_id:'demo-policy',source_url:'https://example.invalid/synthetic-policy',collection_method:'existing_local_copy_remote_bytes_not_verified',sha256:null}],
  issues:[{issue_id:'demo-version-unknown',course_id:'DEMO202',description_tr:'Bu kaynak yalnızca kurgusal test verisidir; kaynak sürümü doğrulanmadı.',source_ids:['demo-policy']}]
 };
};
