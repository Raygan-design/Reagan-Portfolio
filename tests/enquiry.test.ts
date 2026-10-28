import test from 'node:test';
import assert from 'node:assert/strict';
import {contactSchema,inquiryRecord} from '../src/lib/validation';
const event={kind:'speaking',eventType:'Conference',name:'Test Organiser',email:'test@example.com',topic:'Speaking & event hosting',message:'Host our annual design conference.',company:'Example company',phone:'+233201234567',eventName:'Design gathering',eventDate:'2027-08-20',eventFormat:'In person',location:'Accra',engagement:'Event hosting',audience:'100 creative professionals',budget:'Yes',budgetAmount:'1000',currency:'GHS'};
test('speaking enquiry requires event details and positive budget when selected',()=>{assert.equal(contactSchema.safeParse(event).success,true);for(const change of [{company:''},{engagement:undefined},{budgetAmount:''},{budgetAmount:'0'},{budgetAmount:'-50'},{currency:undefined},{eventDate:'2027-02-31'},{eventDate:'2020-01-01'}])assert.equal(contactSchema.safeParse({...event,...change}).success,false)});
test('no budget and unconfirmed budget do not require an amount',()=>{for(const budget of ['No','To be confirmed'])assert.equal(contactSchema.safeParse({...event,budget,budgetAmount:undefined,currency:undefined}).success,true)});
test('persisted event record retains the full brief and excludes stale budget amounts',()=>{const result=inquiryRecord(contactSchema.parse(event));assert.match(result.message,/GHS 1000/);assert.match(result.message,/Event hosting/);assert.match(result.message,/2027-08-20/);assert.match(result.message,/Example company/);assert.match(result.message,/Host our annual/);assert.doesNotMatch(inquiryRecord(contactSchema.parse({...event,budget:'No'})).message,/GHS 1000/)});
test('general enquiry keeps the original short contact contract',()=>{const general={name:'Test Visitor',email:'test@example.com',topic:'Project idea',message:'Please discuss our new project.'};assert.deepEqual(inquiryRecord(contactSchema.parse(general)),general)});

test('simple contact accepts no subject or phone and retains optional phone',()=>{const base={name:'Test Visitor',email:'test@example.com',message:'Please discuss our new project.'};const empty=contactSchema.parse({...base,phone:''});assert.equal(empty.topic,'General enquiry');assert.equal(inquiryRecord(empty).message,base.message);const withPhone=contactSchema.parse({...base,phone:'+233241234567'});assert.match(inquiryRecord(withPhone).message,/Phone: \+233241234567/);assert.equal(contactSchema.safeParse({...base,phone:'not a phone'}).success,false)});

test('enquiries map onto their Dash Forms fields and email Reagan with replies going to the visitor',async()=>{
  const {dashFormsEnquiry,enquiryEmail}=await import('../src/lib/enquiry-notifications');
  const row=dashFormsEnquiry(contactSchema.parse(event),'2027-01-01T00:00:00Z');
  assert.equal(row.organisation,'Example company');assert.equal(row.budget,'GHS 1000');assert.equal(row.event_brief,'Host our annual design conference.');assert.equal(row.submitted_at,'2027-01-01T00:00:00Z');
  const general=dashFormsEnquiry(contactSchema.parse({name:'Test Visitor',email:'test@example.com',message:'Please discuss our new project.'}),'t');
  assert.deepEqual(Object.keys(general),['name','email','phone','topic','message','submitted_at']);
  const mail=enquiryEmail(contactSchema.parse({...event,message:'<script>alert(1)</script> brief'}));
  assert.match(mail.subject,/Speaking enquiry: Design gathering — Test Organiser/);assert.doesNotMatch(mail.html,/<script>/);assert.match(mail.text,/Budget: GHS 1000/);
});
