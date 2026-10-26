export const HOST_TIME_ZONE='Africa/Accra';
export const BUFFER_MINUTES=30;
export type BusyTime={start:string;end:string};
export function consultationSlots(date:string,duration:30|60,busy:BusyTime[],now=Date.now()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
 const day=new Date(`${date}T00:00:00Z`);
 if(!Number.isFinite(+day)||day.toISOString().slice(0,10)!==date||[0,6].includes(day.getUTCDay())||+day>now+60*86400000)return [];
 const slots:string[]=[];
 for(let minute=11*60;minute+duration<=16*60;minute+=30){
  const start=+day+minute*60000,end=start+duration*60000;
  if(start<=now+60*60000)continue;
  if(busy.some(b=>start<+new Date(b.end)+BUFFER_MINUTES*60000&&end+BUFFER_MINUTES*60000>+new Date(b.start)))continue;
  slots.push(new Date(start).toISOString());
 }
 return slots;
}
export function isConsultationSlot(start:string,duration:30|60,now=Date.now()){
 const d=new Date(start);return Number.isFinite(+d)&&consultationSlots(d.toISOString().slice(0,10),duration,[],now).includes(d.toISOString());
}
