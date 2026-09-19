import * as THREE from 'three';
import './style.css';
import {TecnomageController,type TecnomageState} from './tecnomage';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x07120f);
scene.fog=new THREE.FogExp2(0x10251d,.023);

const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,160);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.querySelector('#app')!.appendChild(renderer.domElement);

// V2.8C Runtime Visual Parity rig:
// cool sky/fill preserves ivory/black separation, warm key reveals gold,
// and a character-following rim restores the hero silhouette in TPS gameplay.
scene.add(new THREE.HemisphereLight(0xb9d9ff,0x101812,1.35));
const sun=new THREE.DirectionalLight(0xffdfb5,3.1);
sun.position.set(-10,16,7);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.near=.5;
sun.shadow.camera.far=55;
sun.shadow.camera.left=-16;
sun.shadow.camera.right=16;
sun.shadow.camera.top=16;
sun.shadow.camera.bottom=-16;
sun.shadow.bias=-.00015;
scene.add(sun);

const heroKey=new THREE.DirectionalLight(0xffd6a0,1.45);
const heroRim=new THREE.DirectionalLight(0x8fcfff,2.15);
const heroFill=new THREE.PointLight(0xe9f3ff,.8,8,2);
scene.add(heroKey,heroRim,heroFill);

const MAP_RADIUS=22.5;
const PLAYER_RADIUS=.38;
const ground=new THREE.Mesh(
  new THREE.CircleGeometry(24,64),
  new THREE.MeshStandardMaterial({color:0x193d27,roughness:1})
);
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

type Obstacle={x:number,z:number,r:number,object?:THREE.Object3D};
const obstacles:Obstacle[]=[];
const trunkMat=new THREE.MeshStandardMaterial({color:0x4b3323});
const leafMats=[0x28643a,0x347646,0x205a35].map(color=>new THREE.MeshStandardMaterial({color,roughness:.9}));

function tree(x:number,z:number,s=1,variant=0){
  const g=new THREE.Group();
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,2.6,7),trunkMat);
  t.position.y=1.3;t.castShadow=true;g.add(t);
  for(let i=0;i<3;i++){
    const c=new THREE.Mesh(new THREE.ConeGeometry(1.25-i*.15,2.2,7+variant%3),leafMats[variant%3]);
    c.position.y=2.6+i*.75;c.rotation.y=variant*.37;c.castShadow=true;g.add(c);
  }
  g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);
  obstacles.push({x,z,r:.5*s,object:g});
}
for(let i=0;i<46;i++){
  const a=i*2.399,r=9+(i%10)*1.25;
  tree(Math.cos(a)*r,Math.sin(a)*r,.7+(i%6)*.09,i);
}

const rockMat=new THREE.MeshStandardMaterial({color:0x53615a,roughness:1});
for(let i=0;i<28;i++){
  const a=i*1.77,r=5+(i%9)*1.6,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.hypot(x+5,z+6)<3)continue;
  const radius=.18+(i%4)*.08;
  const m=new THREE.Mesh(new THREE.DodecahedronGeometry(radius),rockMat);
  m.position.set(x,.15,z);m.scale.y=.55;m.rotation.set(i*.2,i*.37,0);m.castShadow=true;scene.add(m);
  obstacles.push({x,z,r:radius*.9,object:m});
}

const grassMat=new THREE.MeshStandardMaterial({color:0x3f7c46,side:THREE.DoubleSide});
for(let i=0;i<110;i++){
  const a=i*2.31,r=3+(i%19)*.95,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.hypot(x,z)<2.2)continue;
  const g=new THREE.Mesh(new THREE.ConeGeometry(.10,.48,3),grassMat);
  g.position.set(x,.22,z);g.rotation.y=a;scene.add(g);
}

const tecnomage=new TecnomageController();
const player=tecnomage.root;
scene.add(player);
void tecnomage.load();

const energyMat=new THREE.MeshStandardMaterial({color:0x28e0c0,emissive:0x087b70,emissiveIntensity:3});
const nexus=new THREE.Group();
const ringMat=new THREE.MeshStandardMaterial({color:0x172e34,metalness:.8,roughness:.25,emissive:0x093b48,emissiveIntensity:1.5});
for(let i=0;i<3;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.15+i*.25,.045,8,48),ringMat);
  ring.rotation.set(Math.PI/2,i*.7,i*.35);nexus.add(ring);
}
nexus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.35,2),energyMat));
nexus.position.set(-5,2,-6);scene.add(nexus);
obstacles.push({x:-5,z:-6,r:1.1,object:nexus});

const keys=new Set<string>();
let dodge=0,pulse=0,attackLight=0,attackHeavy=0;
addEventListener('keydown',e=>{
  keys.add(e.code);
  if(e.repeat)return;
  if(e.code==='KeyQ'&&pulse<=0&&attackLight<=0&&attackHeavy<=0){pulse=.62;tecnomage.pulse()}
  if(e.code==='Space'&&dodge<=0&&attackLight<=0&&attackHeavy<=0)dodge=.38;
  if(e.code==='KeyJ'&&attackLight<=0&&attackHeavy<=0&&pulse<=0)attackLight=.42;
  if(e.code==='KeyK'&&attackHeavy<=0&&attackLight<=0&&pulse<=0)attackHeavy=.72;
});
addEventListener('keyup',e=>keys.delete(e.code));

let yaw=.65,pitch=.34,drag=false,px=0,py=0;
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==2)return;drag=true;px=e.clientX;py=e.clientY});
addEventListener('pointerup',()=>drag=false);
addEventListener('pointermove',e=>{
  if(!drag)return;
  yaw-=(e.clientX-px)*.006;
  pitch=Math.max(.12,Math.min(.92,pitch+(e.clientY-py)*.004));
  px=e.clientX;py=e.clientY;
});

function blocked(x:number,z:number){
  if(Math.hypot(x,z)>MAP_RADIUS-PLAYER_RADIUS)return true;
  return obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+PLAYER_RADIUS);
}

function moveWithSlide(v:THREE.Vector3,distance:number){
  const dx=v.x*distance,dz=v.z*distance;
  const nx=player.position.x+dx;
  if(!blocked(nx,player.position.z))player.position.x=nx;
  const nz=player.position.z+dz;
  if(!blocked(player.position.x,nz))player.position.z=nz;
}

const clock=new THREE.Clock();
const up=new THREE.Vector3(0,1,0);
const cameraRay=new THREE.Raycaster();
const cameraBlockers:THREE.Object3D[]=[];
for(const o of obstacles)if(o.object)cameraBlockers.push(o.object);

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.04);
  dodge=Math.max(0,dodge-dt);pulse=Math.max(0,pulse-dt);
  attackLight=Math.max(0,attackLight-dt);attackHeavy=Math.max(0,attackHeavy-dt);

  const v=new THREE.Vector3(
    (keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),0,
    (keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)
  );

  let state:TecnomageState='IDLE';
  if(attackHeavy>0)state='ATTACK_HEAVY';
  else if(attackLight>0)state='ATTACK_LIGHT';
  else if(pulse>0)state='PULSE';
  else if(dodge>0)state='DODGE';

  const actionLocked=attackHeavy>0||attackLight>0||pulse>0;
  if(v.lengthSq()){
    v.normalize().applyAxisAngle(up,yaw);
    const walk=keys.has('ControlLeft')||keys.has('ControlRight');
    const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');
    let speed=walk?2.2:sprint?7.1:4.25;
    if(dodge>0)speed=13;
    if(actionLocked)speed*=attackHeavy>0?.15:.35;
    moveWithSlide(v,speed*dt);
    player.rotation.y=Math.atan2(v.x,v.z)+Math.PI;
    if(!actionLocked)state=dodge>0?'DODGE':walk?'WALK':sprint?'SPRINT':'RUN';
  }

  tecnomage.update(dt,state);

  const target=new THREE.Vector3(player.position.x,1.32,player.position.z);
  const desired=new THREE.Vector3(
    player.position.x+Math.sin(yaw)*Math.cos(pitch)*6.8,
    player.position.y+Math.sin(pitch)*6.8+1.05,
    player.position.z+Math.cos(yaw)*Math.cos(pitch)*6.8
  );
  const dir=desired.clone().sub(target),max=dir.length();
  cameraRay.set(target,dir.clone().normalize());
  const hits=cameraRay.intersectObjects(cameraBlockers,true);
  const safe=hits.length&&hits[0].distance<max?Math.max(1.7,hits[0].distance-.42):max;
  camera.position.lerp(target.clone().addScaledVector(dir.normalize(),safe),.18);
  camera.lookAt(target);

  // Character-following studio/gameplay hybrid lighting.
  heroKey.position.set(player.position.x-4,player.position.y+6,player.position.z+5);
  heroKey.target.position.set(player.position.x,player.position.y+1.15,player.position.z);
  scene.add(heroKey.target);
  heroRim.position.set(player.position.x+4.5,player.position.y+4.5,player.position.z-5);
  heroRim.target.position.copy(heroKey.target.position);
  scene.add(heroRim.target);
  heroFill.position.set(player.position.x,player.position.y+1.7,player.position.z+2.1);

  nexus.rotation.y+=dt*.35;
  nexus.children.forEach((c,i)=>c.rotation.z+=dt*(.12+i*.05));
  renderer.render(scene,camera);
}
loop();

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
