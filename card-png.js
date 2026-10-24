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
export async function makeCardPng({description,picture,contactPhone,example}){
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
  const footerY=bodyY+bodyHeight+25;
  const hasPhone=!example&&Boolean(contactPhone);
  const footerHeight=hasPhone?102:66;
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

  ctx.beginPath();ctx.moveTo(left,footerY);ctx.lineTo(width-left,footerY);
  ctx.strokeStyle='#dfeae4';ctx.lineWidth=2;ctx.stroke();
  ctx.font='bold 26px system-ui, sans-serif';ctx.fillStyle='#175b45';
  ctx.fillText('LoNecesito',left,footerY+40);
  if(hasPhone){
    ctx.font='28px system-ui, sans-serif';ctx.fillStyle='#2c4c40';
    ctx.fillText('Teléfono y WhatsApp: '+String(contactPhone),left,footerY+79);
  }

  return new Promise((resolve,reject)=>{
    drawing.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo generar el PNG.')),'image/png');
  });
}
