/* Exportación local de una ficha a PNG. No se envían datos a un servidor. */
function roundedRect(ctx,x,y,w,h,r){
  const radius=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+radius,y);
  ctx.lineTo(x+w-radius,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+radius);
  ctx.lineTo(x+w,y+h-radius);
  ctx.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);
  ctx.lineTo(x+radius,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-radius);
  ctx.lineTo(x,y+radius);
  ctx.quadraticCurveTo(x,y,x+radius,y);
  ctx.closePath();
}
function wrapLines(ctx,text,maxWidth){
  const lines=[];
  for(const paragraph of String(text||'').split(/\n/)){
    const words=paragraph.trim().split(/\s+/).filter(Boolean);
    if(!words.length){lines.push({text:'',last:true});continue;}
    let line='';
    for(const word of words){
      const candidate=line?line+' '+word:word;
      if(line&&ctx.measureText(candidate).width>maxWidth){
        lines.push({text:line,last:false});
        line=word;
      }else line=candidate;
    }
    if(line)lines.push({text:line,last:true});
  }
  return lines;
}
function drawWrapped(ctx,lines,x,startY,maxWidth,lineHeight,justify=false){
  let y=startY;
  for(const {text,last} of lines){
    if(text){
      const pieces=text.split(/\s+/);
      if(justify&&!last&&pieces.length>1){
        const wordsWidth=pieces.reduce((sum,word)=>sum+ctx.measureText(word).width,0);
        const spacing=Math.max(0,(maxWidth-wordsWidth)/(pieces.length-1));
        let at=x;
        for(const word of pieces){ctx.fillText(word,at,y);at+=ctx.measureText(word).width+spacing;}
      }else ctx.fillText(text,x,y);
    }
    y+=lineHeight;
  }
  return y;
}
function photoImage(src){
  return new Promise(resolve=>{
    if(!/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(String(src||''))){resolve(null);return;}
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}
function paintImage(ctx,img,x,y,width,height){
  if(!img)return;
  const naturalW=img.naturalWidth||img.width,naturalH=img.naturalHeight||img.height;
  if(!naturalW||!naturalH)return;
  const ratio=Math.min(width/naturalW,height/naturalH);
  const w=naturalW*ratio,h=naturalH*ratio;
  ctx.save();
  roundedRect(ctx,x,y,width,height,22);
  ctx.clip();
  ctx.drawImage(img,x+(width-w)/2,y+(height-h)/2,w,h);
  ctx.restore();
}
/* PNG fiel a la ficha: sin título, altura según contenido y ancho total si no hay foto.
   El teléfono de una publicación real se incluye únicamente en la copia compartida. */
export async function makeCardPng({description,picture,contactPhone,location,example}){
  const hasLocation=!example&&location&&typeof location.latitude==='number'
    &&Number.isFinite(location.latitude)&&typeof location.longitude==='number'
    &&Number.isFinite(location.longitude)&&Number.isFinite(location.accuracy);
  const placeFields=hasLocation?[
    ['País',location.country],['Departamento',location.department],
    ['Ciudad',location.city],['Dirección',location.address],
    ['Barrio o localidad',location.neighborhood]
  ].filter(([,value])=>Boolean(String(value||'').trim()))
    .map(([label,value])=>label+': '+String(value).trim()):[];
  if(hasLocation){
    placeFields.push('Latitud: '+location.latitude.toFixed(6)+' · Longitud: '+location.longitude.toFixed(6));
    placeFields.push('Precisión estimada: ±'+Math.round(location.accuracy)+' m');
  }
  const width=1080,margin=35,padding=46;
  const left=margin+padding;
  const available=width-2*left;
  const imageWidth=260,imageGap=24;
  const img=await photoImage(picture);
  const hasPhoto=Boolean(img);
  const bodyWidth=hasPhoto?available-imageWidth-imageGap:available;
  const drawing=document.createElement('canvas');
  const ctx=drawing.getContext('2d');
  if(!ctx)throw new Error('El navegador no puede generar el PNG.');
  ctx.font='33px system-ui, sans-serif';
  const bodyLines=wrapLines(ctx,description,bodyWidth);
  const lineHeight=46;
  const paragraphHeight=Math.max(lineHeight,bodyLines.length*lineHeight);
  const aspect=hasPhoto?(img.naturalHeight||img.height)/(img.naturalWidth||img.width):0;
  const photoHeight=hasPhoto?Math.min(340,Math.max(175,Math.round(imageWidth*aspect))):0;
  const bodyHeight=Math.max(paragraphHeight,photoHeight);
  const bodyY=margin+padding;
  ctx.font='22px system-ui, sans-serif';
  const locationWidth=available-50;
  const gpsLines=placeFields.flatMap(line=>wrapLines(ctx,line,locationWidth).map(item=>item.text));
  const locationY=bodyY+bodyHeight+20;
  const locationHeight=hasLocation?60+gpsLines.length*32:0;
  const footerY=locationY+locationHeight+(hasLocation?18:5);
  const hasPhone=!example&&Boolean(contactPhone);
  const footerHeight=hasPhone?132:66;
  const height=Math.ceil(footerY+footerHeight+margin);

  drawing.width=width;drawing.height=height;
  ctx.fillStyle='#f3f7f5';ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(27,65,49,0.12)';
  ctx.shadowBlur=23;ctx.shadowOffsetY=6;
  roundedRect(ctx,margin,margin,width-2*margin,height-2*margin,30);
  ctx.fill();
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;

  ctx.font='33px system-ui, sans-serif';ctx.fillStyle='#334843';
  drawWrapped(ctx,bodyLines,left,bodyY+32,bodyWidth,lineHeight,true);
  if(hasPhoto)paintImage(ctx,img,left+bodyWidth+imageGap,bodyY,imageWidth,photoHeight);
  if(hasLocation){
    ctx.fillStyle='#eaf6f2';
    roundedRect(ctx,left,locationY,available,locationHeight,18);
    ctx.fill();
    ctx.fillStyle='#17644d';ctx.font='bold 21px system-ui, sans-serif';
    ctx.fillText('UBICACIÓN GPS',left+24,locationY+31);
    ctx.font='22px system-ui, sans-serif';ctx.fillStyle='#254c45';
    let lineY=locationY+61;
    for(const line of gpsLines){
      ctx.fillText(line,left+24,lineY);
      lineY+=32;
    }
  }

  ctx.beginPath();ctx.moveTo(left,footerY);ctx.lineTo(width-left,footerY);
  ctx.strokeStyle='#dfeae4';ctx.lineWidth=2;ctx.stroke();
  ctx.font='bold 30px system-ui, sans-serif';ctx.fillStyle='#175b45';
  ctx.fillText('LoNecesito',left,footerY+63);
  if(hasPhone){
    // El número aparece siempre en el PNG real, destacado en una banda sobria.
    const digits=String(contactPhone).replace(/\D/g,'');
    const number=/^57[3-9]\d{9}$/.test(digits)
      ?'+57 '+digits.slice(2,5)+' '+digits.slice(5,8)+' '+digits.slice(8)
      :String(contactPhone).trim();
    const panelWidth=480,panelHeight=98,panelX=width-left-panelWidth,panelY=footerY+15;
    ctx.fillStyle='#e8f5ef';
    roundedRect(ctx,panelX,panelY,panelWidth,panelHeight,19);
    ctx.fill();
    ctx.font='bold 17px system-ui, sans-serif';ctx.fillStyle='#4b745e';
    ctx.fillText('TELÉFONO · WHATSAPP',panelX+25,panelY+32);
    let size=34;
    do{ctx.font='bold '+size+'px system-ui, sans-serif';size-=1;}
    while(ctx.measureText(number).width>panelWidth-50&&size>19);
    ctx.fillStyle='#17493e';
    ctx.fillText(number,panelX+25,panelY+75);
  }

  return new Promise((resolve,reject)=>{
    drawing.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo generar el PNG.')),'image/png');
  });
}
