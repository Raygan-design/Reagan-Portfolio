import 'server-only';
import {timingSafeEqual} from 'node:crypto';

export function validPrivateBookingToken(value:unknown){
 const expected=process.env.BOOKING_PREVIEW_TOKEN;
 if(typeof value!=='string'||!expected)return false;
 const supplied=Buffer.from(value),known=Buffer.from(expected);
 return supplied.length===known.length&&timingSafeEqual(supplied,known);
}
