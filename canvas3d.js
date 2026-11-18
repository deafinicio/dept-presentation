import { Vector3, Color, SRGBColorSpace } from 'three';

// Software projection of the same 3D geometry and camera without WebGL2.
export function createCanvasRenderer(){
 const domElement=document.createElement('canvas');
 const ctx=domElement.getContext('2d');
 if(!ctx)return null;
 const temp=new Vector3(), rgb=new Color(), primitives=new WeakMap();
 let ratio=1;
 const normals=[.78,.88,1.10,.58,.83,.9];
 const color=(material,light=1)=>'#'+rgb.copy(material.color).multiplyScalar(light).getHexString(SRGBColorSpace);
 function primitive(o){
  if(primitives.has(o))return primitives.get(o);
  const {type,parameters:p}=o.geometry;
  let res;
  if(type==='BoxGeometry'){
   const x=p.width/2,y=p.height/2,z=p.depth/2;
   res={vertices:[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]],faces:[[1,2,6,5],[4,7,3,0],[3,7,6,2],[4,0,1,5],[5,6,7,4],[0,3,2,1]],box:true};
  }else if(type==='PlaneGeometry'){
   const x=p.width/2,y=p.height/2;
   res={vertices:[[-x,y,0],[x,y,0],[x,-y,0],[-x,-y,0]],faces:[[0,1,2,3]],box:false};
  }
  primitives.set(o,res);return res;
 }
 return {domElement,shadowMap:{},software:true,capabilities:{getMaxAnisotropy:()=>1},
  setPixelRatio(value){ratio=value;},
  setSize(w,h){domElement.width=Math.round(w*ratio);domElement.height=Math.round(h*ratio);},
  render(scene,camera){
   const W=domElement.width,H=domElement.height;
   if(!W||!H)return;
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
   scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   const polygons=[];
   scene.traverseVisible(o=>{
    if(!o.isMesh)return;
    const geom=primitive(o);if(!geom)return;
    const vertices=geom.vertices.map(pos=>{temp.set(...pos).applyMatrix4(o.matrixWorld).project(camera);return [(temp.x+1)*W/2,(1-temp.y)*H/2,temp.z];});
    geom.faces.forEach((face,i)=>{
     const pts=face.map(j=>vertices[j]);
     const [a,b,c]=pts;
     const facing=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
     if(geom.box?facing>=0:facing<=0)return;
     polygons.push({pts,depth:pts.reduce((sum,p)=>sum+p[2],0)/pts.length, tex:!geom.box&&o.material.map?.image,color:color(o.material,geom.box?normals[i]:1)});
    });
   });
   polygons.sort((a,b)=>b.depth-a.depth);
   for(const {pts,tex,color:fill} of polygons){
    if(tex){
     const [a,b,,d]=pts;const tw=tex.width,th=tex.height;
     ctx.setTransform((b[0]-a[0])/tw,(b[1]-a[1])/tw,(d[0]-a[0])/th,(d[1]-a[1])/th,a[0],a[1]);
     ctx.drawImage(tex,0,0);
     ctx.setTransform(1,0,0,1,0,0);
    }else{
     ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
     ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    }
   }
  }
 };
}
