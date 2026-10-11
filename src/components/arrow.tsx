export function Arrow({direction='up-right'}:{direction?:'up-right'|'left'|'right'|'down'}){
 const paths={ 'up-right':'M6 18 18 6M6 6h12v12',left:'M19 12H5m7-7-7 7 7 7',right:'M5 12h14m-7-7 7 7-7 7',down:'M12 5v14m-7-7 7 7 7-7'};
 return <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]}/></svg>;
}
