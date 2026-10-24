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
/* Retorna un archivo PNG que puede enviarse por cualquier aplicación.
   En el PNG se incluye el teléfono REAL para que la copia gráfica sea útil.
   En la ficha de la web el teléfono continúa oculto tras sus dos iconos. */
export async function makeCardPng({title,description,picture,contactPhone,example}){
  const width=1080,margin=35,padding=54;
  const left=margin+padding;
  const available=width-2*left;
  const imageWidth=270,imageGap=28;
  const bodyWidth=available-imageWidth-imageGap;
  const drawing=document.createElement('canvas');
  const ctx=drawing.getContext('2d');
  if(!ctx)throw new Error('El navegador no puede crear la imagen.');
  ctx.font='bold 58px system-ui, sans-serif';
  const titleLines=wrapLines(ctx,title,available);
  const titleHeight=titleLines.length*68;
  ctx.font='33px system-ui, sans-serif';
  const bodyLines=wrapLines(ctx,description,bodyWidth);
  const paragraphHeight=bodyLines.length*46;
  const photoHeight=345;
  const bodyHeight=Math.max(paragraphHeight,photoHeight);
  const bodyY=margin+padding+titleHeight+28;
  const footerY=bodyY+bodyHeight+35;
  const hasPhone=!example&&Boolean(contactPhone);
  const footerHeight=hasPhone?115:80;
  const height=Math.ceil(footerY+footerHeight+margin+36);
  drawing.width=width;drawing.height=height;

  ctx.fillStyle='#f3f7f5';ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#ffffff';
  ctx.shadowColor='rgba(27,65,49,0.16)';
  ctx.shadowBlur=30;ctx.shadowOffsetY=8;
  roundedRect(ctx,margin,margin,width-2*margin,height-2*margin,38);
  ctx.fill();
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;

  ctx.fillStyle='#0f2420';ctx.font='bold 58px system-ui, sans-serif';
  drawWrapped(ctx,titleLines,left,margin+padding+55,available,68);
  ctx.fillStyle='#334843';ctx.font='33px system-ui, sans-serif';
  drawWrapped(ctx,bodyLines,left,bodyY+32,bodyWidth,46,true);

  // La columna derecha existe incluso sin foto; en ese caso no se pinta nada.
  const image=await photoImage(picture);
  paintImage(ctx,image,left+bodyWidth+imageGap,bodyY,imageWidth,photoHeight);

  ctx.beginPath();ctx.moveTo(left,footerY);ctx.lineTo(width-left,footerY);
  ctx.strokeStyle='#dfeae4';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#175b45';ctx.font='bold 30px system-ui, sans-serif';
  ctx.fillText('LoNecesito',left,footerY+49);
  if(hasPhone){
    ctx.fillStyle='#2c4c40';ctx.font='30px system-ui, sans-serif';
    ctx.fillText('Teléfono y WhatsApp: '+String(contactPhone),left,footerY+93);
  }

  return new Promise((resolve,reject)=>{
    drawing.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo generar el PNG.')),'image/png');
  });
}
