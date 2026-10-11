export function Arrow({direction='up-right'}:{direction?:'up-right'|'left'|'right'|'down'}){
 if(direction==='up-right')return <svg className="arrow-icon" width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></svg>;
 const paths={ 'up-right':'M6 18 18 6M6 6h12v12',left:'M19 12H5m7-7-7 7 7 7',right:'M5 12h14m-7-7 7 7-7 7',down:'M12 5v14m-7-7 7 7 7-7'};
 return <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]}/></svg>;
}
