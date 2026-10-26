import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {consultationDates,consultationSlots,isConsultationSlot} from '../src/lib/calendar-policy';
import {sealCalendarToken,openCalendarToken} from '../src/lib/calendar-crypto';
const now=Date.parse('2026-10-26T08:00:00Z');
test('weekday hours include only sessions that finish by 4pm Ghana time',()=>{
 assert.equal(consultationSlots('2026-10-26',30,[],now).length,10);
 assert.deepEqual(consultationSlots('2026-10-26',60,[],now),['2026-10-26T11:00:00.000Z','2026-10-26T12:00:00.000Z','2026-10-26T13:00:00.000Z','2026-10-26T14:00:00.000Z','2026-10-26T15:00:00.000Z']);
 assert.equal(consultationSlots('2026-10-26',60,[],now).at(-1),'2026-10-26T15:00:00.000Z');
 assert.deepEqual(consultationSlots('2026-10-31',30,[],now),[]);
 assert.equal(isConsultationSlot('2026-10-26T16:00:00Z',30,now),false);
 assert.equal(isConsultationSlot('2026-10-26T11:15:00Z',30,now),false);
 assert.deepEqual(consultationSlots('2026-02-30',30,[],now),[]);
});
test('calendar busy periods enforce a 30-minute gap on both sides',()=>{
 const slots=consultationSlots('2026-10-26',30,[{start:'2026-10-26T12:00:00Z',end:'2026-10-26T13:00:00Z'}],now);
 assert.ok(slots.includes('2026-10-26T11:00:00.000Z'));
 assert.ok(!slots.includes('2026-10-26T11:30:00.000Z'));
 assert.ok(!slots.includes('2026-10-26T13:00:00.000Z'));
 assert.ok(slots.includes('2026-10-26T13:30:00.000Z'));
 assert.deepEqual(consultationSlots('2026-12-31',30,[],now),[]);
});
test('month availability contains only dates that still have at least one valid slot',()=>{
 const fullyBusy={start:'2026-10-28T10:30:00Z',end:'2026-10-28T16:30:00Z'};
 const dates=consultationDates('2026-10',30,[fullyBusy],now);
 assert.ok(dates.includes('2026-10-27'));
 assert.ok(!dates.includes('2026-10-28'));
 assert.ok(!dates.includes('2026-10-31'));
 assert.deepEqual(consultationDates('2026-13',30,[],now),[]);
});
test('refresh tokens are authenticated and encrypted at rest',()=>{
 const key=randomBytes(32).toString('base64'),sealed=sealCalendarToken('private-refresh-token',key);
 assert.ok(!sealed.includes('private-refresh-token'));assert.equal(openCalendarToken(sealed,key),'private-refresh-token');
 assert.throws(()=>openCalendarToken(sealed,randomBytes(32).toString('base64')));
});
