// Filled, lightly shaded architecture keeps the streetscape legible at small sizes.
export function MovingNeighborhood() {
  return <svg className="moving-neighborhood" viewBox="0 0 1000 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g className="neighborhood-distant" fill="#f0eef1"><path d="M0 237V132l59-33 65 39v99m74 0V107l52-29 60 35v124m200 0V111l61-35 61 39v122m159 0V108l59-31 72 40v120m110 0V141l78-47 70 43v100"/></g>
    <g className="moving-buildings">
      <Tree x={4} scale={.95}/><Tree x={240} scale={1.12} slender/><Tree x={502} scale={.94}/><Tree x={762} scale={1.1} slender/><Tree x={980} scale={.94}/>
      <House x={36} y={53} wall="#eee3d2" side="#dfd1bc" roof="#bfa39b"/>
      <House x={329} y={53} wall="#dfe8e8" side="#cad7d9" roof="#9dabbc" dormer/>
      <House x={620} y={53} wall="#e9dfd9" side="#d9c9c1" roof="#b4aaa4"/>
      <House x={905} y={53} wall="#e2e5d9" side="#cfd5c6" roof="#a6b5ac" dormer/>
      <g fill="#e6e0d9" stroke="#c4bdb4" strokeWidth="1">
        <path d="M0 217h37v17H0m231-17h98v17h-98m292-17h97v17h-97m292-17h90v17h-90"/>
      </g>
      {[245, 536, 828].map(x => <g key={x} transform={`translate(${x} 204)`} stroke="#c5c0b8" strokeWidth="1.5" fill="#f5f1e9">
        <path d="M0 30V0h8v30m58 0V0h8v30"/><path d="M9 9h56v3H9zm0 12h56v3H9Z"/>
        {[17,27,37,47,57].map(p => <path key={p} d={`M${p} 9v15`}/>) }
      </g>)}
      <g fill="#c1cbb9" stroke="#aab7a3" strokeWidth=".8">
        <path d="M5 235q-5-13 7-16 3-15 16-10 14-7 20 7 14-4 17 19Zm203 0q-5-13 7-16 4-14 17-10 12-6 19 8 14-4 17 18Zm282 0q-5-13 8-16 3-14 16-10 13-6 19 8 14-4 17 18Zm292 0q-5-13 8-16 3-14 16-10 13-6 19 8 14-4 17 18Z"/>
      </g>
      <path d="M0 237h1000" stroke="#cbc5bc" strokeWidth="3"/>
    </g>
  </svg>;
}

function Window({x,y,width=28,height=38}: {x:number;y:number;width?:number;height?:number}) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={width} height={height} rx=".6" fill="#f8f7f1" stroke="#b5b6b1" strokeWidth="1"/>
    <rect x="3" y="3" width={width-6} height={height-6} fill="#b9cfd5"/>
    <path d={`m4 ${height-7} ${width-11}-${height-11}h6L10 ${height-4}H4Z`} fill="#d4e2e5"/>
    <path d={`M${width/2} 3v${height-6}M3 ${height*.5}h${width-6}`} stroke="#f6f6ef" strokeWidth="2"/>
    <path d={`M-2 ${height+2}h${width+4}`} stroke="#b9b6ae" strokeWidth="2"/>
  </g>;
}

function House({x,y,wall,side,roof,dormer=false}: {x:number;y:number;wall:string;side:string;roof:string;dormer?:boolean}) {
  return <g transform={`translate(${x} ${y})`} strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 80 80-12 100 12v96H18Z" fill={wall} stroke="#beb7af" strokeWidth="1"/>
    <path d="m161 80 37-8v104h-37Z" fill={side}/>
    <path d="M10 81 52 14h111l45 67Z" fill={roof} stroke="#a8a4a1" strokeWidth="1.5"/>
    <path d="M163 14 208 81h-34l-29-67Z" fill="#6c7482" opacity=".12"/>
    <path d="M43 28h129M35 41h145M27 54h161M18 68h180" fill="none" stroke="#827e80" strokeWidth="1" opacity=".35"/>
    <path d="M10 81h198v6H10Z" fill="#f7f3eb" stroke="#c0bbb3" strokeWidth="1"/>
    <path d="M18 88h180v5H18Z" fill="#b8aba0" opacity=".22"/>
    {dormer ? <g><path d="M96 61V33l16-21 21 21v28Z" fill="#f3f0e9" stroke="#b5b9bd" strokeWidth="1"/><path d="m91 34 21-27 26 27h-6l-20-20-16 20Z" fill="#8697aa"/><Window x={103} y={31} width={22} height={26}/></g> : <g><path d="M40 30V7h18v23" fill={side} stroke="#bbaea4" strokeWidth="1"/><path d="M37 7h24v5H37Z" fill="#d5c6b6"/><path d="M43 19h12m-10 6h10" stroke="#bbab9d" strokeWidth="1"/></g>}
    <Window x={31} y={105}/><Window x={125} y={105} width={26}/>
    <Window x={170} y={109} width={17} height={31}/>
    <path d="M77 107h28v69H77Z" fill="#b8aba0" stroke="#a89b91" strokeWidth="1"/>
    <path d="M81 112h20v27H81Z" fill="#c7d7d9"/><path d="M81 144h20v26H81Z" fill="none" stroke="#cfc2b5"/>
    <circle cx="99" cy="146" r="1.4" fill="#958572"/>
    <path d="m66 107 25-18 25 18Z" fill={roof} stroke="#a9a29b" strokeWidth="1"/>
    <path d="M67 110h48M70 111v63m42-63v63" stroke="#f8f5ee" strokeWidth="4"/>
    <path d="M66 176h51v4H66zm-4 4h59v4H62Z" fill="#d6d0c5" stroke="#bfb8af" strokeWidth=".7"/>
    <path d="M19 172h45m56 0h76" stroke="#d0c7bc" strokeWidth="1.5"/>
    <path d="M31 148h28l-3 9H34Z" fill="#ccb5a6"/>
    <path d="M34 148q-3-7 4-8 4-8 9-3 7-4 9 4 5 2 1 7" fill="#b8c8ae"/>
    <path d="M177 174v-22m-5 10h10m-8-10h6" stroke="#b5b0a3" strokeWidth="1.5"/>
  </g>;
}

function Tree({x,scale,slender=false}: {x:number;scale:number;slender?:boolean}) {
  if (slender) return <g transform={`translate(${x} ${237 - 154 * scale}) scale(${scale})`}>
    <path d="m-4 154 1-65h6l4 65Z" fill="#b9aa94"/>
    <path d="M-13 126q-23-8-15-35 8-26 9-53Q-16 1-3 0q15-2 18 34 2 32 13 58 8 29-15 35Z" fill="#c6d2b8" stroke="#b3c0a4" strokeWidth="1"/>
    <path d="M4 8q6 34 8 55 2 30 12 39-1 26-26 26l-8-4Q8 101 4 8Z" fill="#b3c2a1"/>
    <path d="M-7 26q-7 24-5 49m-1 15-4 15" fill="none" stroke="#dce4d2" strokeWidth="2"/>
  </g>;
  return <g transform={`translate(${x} ${237 - 154 * scale}) scale(${scale})`}>
    <path d="m-5 154 2-95h8l3 95Z" fill="#bcae9b"/>
    <path d="m1 107-20-22m22 5 21-25" fill="none" stroke="#b5a58f" strokeWidth="3"/>
    <path d="M-24 100q-30-4-26-28-17-24 7-40-2-25 25-27 14-18 34-3 30-1 31 25 27 11 15 36 11 27-18 34-18 16-40 3Z" fill="#ccd6c2" stroke="#b9c6af" strokeWidth="1"/>
    <path d="M-40 42q-13 27 11 35 17 18 38 5 24 8 42-9-1 23-26 26-19 13-38 0-30 6-38-18-12-19 11-39Z" fill="#bac9b0"/>
    <path d="M-26 21q18-13 29-3m11 10q19-1 23 14m-63 9q10-7 20-1" fill="none" stroke="#e1e7d9" strokeWidth="3"/>
  </g>;
}
