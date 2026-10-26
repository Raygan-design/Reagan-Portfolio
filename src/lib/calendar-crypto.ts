import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
export function sealCalendarToken(token:string,key:string){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',Buffer.from(key,'base64'),iv);
 const encrypted=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),encrypted].map(b=>b.toString('base64url')).join('.');
}
export function openCalendarToken(value:string,key:string){
 const [iv,tag,encrypted]=value.split('.').map(b=>Buffer.from(b,'base64url'));
 const decipher=createDecipheriv('aes-256-gcm',Buffer.from(key,'base64'),iv);decipher.setAuthTag(tag);
 return Buffer.concat([decipher.update(encrypted),decipher.final()]).toString('utf8');
}
