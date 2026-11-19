import {Vector3,Matrix4,Color,SRGBColorSpace} from 'three';

// Orthographic triangle rasterizer for browsers without WebGL2. A depth buffer
// keeps pins, stacked sheets and interlocking solids correctly occluded.
export function createCanvasRenderer(){
 const domElement=document.createElement('canvas'),ctx=domElement.getContext('2d');
 if(!ctx)return null;
 let ratio=1,image,pixels,depth;
 const matrix=new Matrix4(),a=new Vector3(),b=new Vector3(),normal=new Vector3(),light=new Vector3(-.45,.8,.45).normalize(),color=new Color();
 const cache=new WeakMap();
 function vertices(geometry){
  if(cache.has(geometry))return cache.get(geometry);
  const attr=geometry.attributes.position,idx=geometry.index;
  const points=Array.from({length:attr.count},(_,i)=>new Vector3().fromBufferAttribute(attr,i));
  const faces=[];
  for(let i=0;i<(idx?.count??attr.count);i+=3)faces.push([0,1,2].map(k=>idx?idx.getX(i+k):i+k));
  const result={points,faces};cache.set(geometry,result);return result;
 }
 function triangle(p,q,r,fill){
  const dx=q.x-p.x,dy=q.y-p.y,ex=r.x-p.x,ey=r.y-p.y,det=dx*ey-dy*ex;
  if(det>=-.00001)return;
  const dzx=((q.z-p.z)*ey-(r.z-p.z)*dy)/det,dzy=(dx*(r.z-p.z)-ex*(q.z-p.z))/det;
  const [lo,mid,hi]=[p,q,r].sort((a,b)=>a.y-b.y),height=hi.y-lo.y;
  const w=image.width,h=image.height,y1=Math.max(0,Math.ceil(lo.y-.5)),y2=Math.min(h,Math.ceil(hi.y-.5));
  for(let y=y1;y<y2;y++){
   const cy=y+.5,u=cy<mid.y?lo:mid,v=cy<mid.y?mid:hi;
   if(v.y===u.y)continue;
   const edge1=lo.x+(hi.x-lo.x)*(cy-lo.y)/height,edge2=u.x+(v.x-u.x)*(cy-u.y)/(v.y-u.y);
   const start=Math.max(0,Math.ceil(Math.min(edge1,edge2)-.5)),end=Math.min(w,Math.ceil(Math.max(edge1,edge2)-.5));
   let z=p.z+(start+.5-p.x)*dzx+(cy-p.y)*dzy;
   for(let i=y*w+start,last=y*w+end;i<last;i++,z+=dzx){
    if(z<depth[i]){depth[i]=z;pixels[i]=fill;}
   }
  }
 }
 return {domElement,software:true,setPixelRatio(v){ratio=v;},setSize(w,h){
  domElement.width=Math.max(1,Math.round(w*ratio));domElement.height=Math.max(1,Math.round(h*ratio));
  image=ctx.createImageData(domElement.width,domElement.height);pixels=new Uint32Array(image.data.buffer);depth=new Float32Array(pixels.length);
 },render(scene,camera){
  if(!image)return;const w=image.width/2,h=image.height/2;
  pixels.fill(0);depth.fill(Infinity);scene.updateMatrixWorld(true);matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  scene.traverseVisible(o=>{
   if(!o.isMesh)return;
   const geom=vertices(o.geometry),wp=geom.points.map(p=>p.clone().applyMatrix4(o.matrixWorld)),screen=wp.map(p=>{
    const s=p.clone().applyMatrix4(matrix);s.x=(1+s.x)*w;s.y=(1-s.y)*h;return s;
   });
   for(const [i,j,k] of geom.faces){
    const p=screen[i],q=screen[j],r=screen[k];
    if((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x)>=0)continue;
    if(Math.max(p.x,q.x,r.x)<0||Math.min(p.x,q.x,r.x)>2*w)continue;
    a.subVectors(wp[j],wp[i]);b.subVectors(wp[k],wp[i]);normal.crossVectors(a,b).normalize();
    const rgb=color.copy(o.material.color).multiplyScalar(.77+.27*normal.dot(light)).getHex(SRGBColorSpace);
    triangle(p,q,r,0xff000000|((rgb&255)<<16)|(rgb&0xff00)|(rgb>>>16));
   }
  });ctx.putImageData(image,0,0);
 }};
}
