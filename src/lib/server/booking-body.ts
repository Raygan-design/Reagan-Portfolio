import 'server-only';
import {attachmentError,validAttachmentContent,MAX_ATTACHMENT_BYTES} from '../attachments';
import {HttpError,readJson} from './http';
export async function bookingBody(request:Request):Promise<{input:unknown;files:File[]}>{
 if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return {input:await readJson(request),files:[]};
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Missing booking details.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_ATTACHMENT_BYTES+100000){await reader.cancel();throw new HttpError(413,'Files must total 3 MB or less.')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 let form:FormData;try{form=await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')!}}).formData()}catch{throw new HttpError(400,'Invalid attachment request.')}
 const files=form.getAll('files');if(files.some(f=>!(f instanceof File)))throw new HttpError(400,'Invalid file attachment.');
 const typed=files as File[],error=attachmentError(typed);if(error)throw new HttpError(400,error);
 for(const file of typed)if(!await validAttachmentContent(file))throw new HttpError(400,`The contents of ${file.name.slice(0,100)} do not match its file type.`);
 const raw=form.get('booking');if(typeof raw!=='string'||raw.length>25000)throw new HttpError(400,'Invalid booking details.');
 try{return {input:JSON.parse(raw),files:typed}}catch{throw new HttpError(400,'Invalid booking details.')}
}
