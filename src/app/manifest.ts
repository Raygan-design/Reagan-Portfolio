import type { MetadataRoute } from 'next';
// Name, colours and icons for browsers and "add to home screen".
export default function manifest():MetadataRoute.Manifest{return {name:'Reagan Marfo — Creative Entrepreneur',short_name:'Reagan Marfo',description:'Creative entrepreneur telling stories, building communities and designing products.',start_url:'/',display:'browser',background_color:'#ffffff',theme_color:'#000047',icons:[{src:'/favicon.ico',sizes:'48x48',type:'image/x-icon'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'}]}}
