import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export type TecnomageState=
  |'IDLE'|'WALK'|'RUN'|'SPRINT'
  |'DODGE'|'PULSE'
  |'ATTACK_LIGHT'|'ATTACK_HEAVY';

type BoneName=
  |'pelvis'|'spine_03'
  |'upperarm_l'|'upperarm_r'|'lowerarm_l'|'lowerarm_r'
  |'thigh_l'|'thigh_r'|'calf_l'|'calf_r';

const BONE_NAMES:BoneName[]=[
  'pelvis','spine_03','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r',
  'thigh_l','thigh_r','calf_l','calf_r'
];

export class TecnomageController{
  readonly root=new THREE.Group();
  private fallback:THREE.Object3D;
  private model?:THREE.Object3D;
  private state:TecnomageState='IDLE';
  private stateTime=0;
  private gaitPhase=0;
  private bones=new Map<BoneName,THREE.Object3D>();
  private rest=new Map<BoneName,THREE.Quaternion>();
  private energy?:THREE.Mesh<THREE.OctahedronGeometry,THREE.MeshStandardMaterial>;
  private tmpEuler=new THREE.Euler();
  private tmpOffset=new THREE.Quaternion();
  private tmpTarget=new THREE.Quaternion();

  constructor(){
    this.fallback=this.makeFallback();
    this.root.add(this.fallback);
  }

  async load(url='/assets/characters/tecnomage.gltf'){
    try{
      const gltf=await new GLTFLoader().loadAsync(url);
      const model=gltf.scene;
      model.traverse(o=>{
        if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;o.visible=true}
      });
      for(const required of ['Eyebrows','Eyes','SuperHero_Male']){
        const part=model.getObjectByName(required);
        if(part)part.visible=true;
      }
      const box=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();box.getSize(size);
      if(size.y>0)model.scale.setScalar(2.25/size.y);
      box.setFromObject(model);model.position.y-=box.min.y;
      this.model=model;
      this.bindBones(model);
      this.root.remove(this.fallback);
      this.root.add(model);
      this.addEnergyCore();
      console.info('[M15-F] Tecnomage base loaded with face/eyes/hair and procedural rig',{
        bones:[...this.bones.keys()],embeddedAnimations:gltf.animations.map(a=>a.name)
      });
      return true;
    }catch(error){
      console.warn('[M15-F] Tecnomage glTF unavailable; procedural fallback active.',error);
      return false;
    }
  }

  update(dt:number,next:TecnomageState){
    if(next!==this.state){this.state=next;this.stateTime=0}
    this.stateTime+=dt;
    const cadence=next==='SPRINT'?11:next==='RUN'?8.2:next==='WALK'?5.2:2;
    this.gaitPhase+=dt*cadence;
    if(this.model)this.animateRig(dt,next);
    else this.animateFallback(dt,next);
  }

  pulse(){
    if(!this.energy)return;
    this.energy.material.emissiveIntensity=14;
    this.energy.scale.setScalar(1.45);
    setTimeout(()=>{
      if(!this.energy)return;
      this.energy.material.emissiveIntensity=3.5;
      this.energy.scale.setScalar(1);
    },220);
  }

  private bindBones(model:THREE.Object3D){
    this.bones.clear();this.rest.clear();
    for(const name of BONE_NAMES){
      const bone=model.getObjectByName(name);
      if(!bone)continue;
      this.bones.set(name,bone);
      this.rest.set(name,bone.quaternion.clone());
    }
  }

  private addEnergyCore(){
    const material=new THREE.MeshStandardMaterial({
      color:0x80efff,emissive:0x08b9e9,emissiveIntensity:3.5,
      metalness:.25,roughness:.2
    });
    this.energy=new THREE.Mesh(new THREE.OctahedronGeometry(.11),material);
    this.energy.name='tecnomage-energy-core';
    this.energy.position.set(0,1.34,-.29);
    this.energy.rotation.y=Math.PI/4;
    this.root.add(this.energy);
  }

  private animateRig(dt:number,state:TecnomageState){
    const pose=new Map<BoneName,[number,number,number]>();
    const set=(n:BoneName,x=0,y=0,z=0)=>pose.set(n,[x,y,z]);
    const s=Math.sin(this.gaitPhase),c=Math.cos(this.gaitPhase);

    if(state==='IDLE'){
      set('spine_03',Math.sin(this.stateTime*2.1)*.018,0,0);
      set('upperarm_l',0,0,.05);set('upperarm_r',0,0,-.05);
    }else if(state==='WALK'||state==='RUN'||state==='SPRINT'){
      const amp=state==='WALK'?.36:state==='RUN'?.62:.86;
      const arm=amp*.72,lean=state==='SPRINT'?.18:state==='RUN'?.09:.03;
      set('spine_03',lean,0,-s*.025);
      set('pelvis',0,s*.035,0);
      set('thigh_l',s*amp,0,0);set('thigh_r',-s*amp,0,0);
      set('calf_l',Math.max(0,-s)*amp*.72,0,0);set('calf_r',Math.max(0,s)*amp*.72,0,0);
      set('upperarm_l',-s*arm,0,.06);set('upperarm_r',s*arm,0,-.06);
      set('lowerarm_l',-.12-Math.max(0,s)*.22,0,0);set('lowerarm_r',-.12-Math.max(0,-s)*.22,0,0);
    }else if(state==='DODGE'){
      const p=Math.min(1,this.stateTime/.38),arc=Math.sin(p*Math.PI);
      set('spine_03',.52*arc,0,.16*arc);
      set('pelvis',.18*arc,0,0);
      set('thigh_l',-.58*arc,0,0);set('thigh_r',-.58*arc,0,0);
      set('calf_l',.78*arc,0,0);set('calf_r',.78*arc,0,0);
      set('upperarm_l',.35*arc,0,.22);set('upperarm_r',.35*arc,0,-.22);
    }else if(state==='PULSE'){
      const p=Math.min(1,this.stateTime/.62),arc=Math.sin(p*Math.PI);
      set('spine_03',-.08*arc,0,0);
      set('upperarm_l',-.72*arc,0,-.36*arc);set('upperarm_r',-.72*arc,0,.36*arc);
      set('lowerarm_l',-.42*arc,0,0);set('lowerarm_r',-.42*arc,0,0);
    }else if(state==='ATTACK_LIGHT'){
      const p=Math.min(1,this.stateTime/.42),arc=Math.sin(p*Math.PI);
      set('spine_03',0,-.38*arc,-.08*arc);
      set('upperarm_r',-.22*arc,-.18*arc,-1.05*arc);
      set('lowerarm_r',-.6*arc,0,0);
      set('upperarm_l',.08*arc,0,.18*arc);
    }else if(state==='ATTACK_HEAVY'){
      const p=Math.min(1,this.stateTime/.72),arc=Math.sin(p*Math.PI);
      set('spine_03',.14*arc,.52*arc,.12*arc);
      set('pelvis',0,-.18*arc,0);
      set('upperarm_l',-.48*arc,.18*arc,.72*arc);set('upperarm_r',-.48*arc,-.18*arc,-.72*arc);
      set('lowerarm_l',-.72*arc,0,0);set('lowerarm_r',-.72*arc,0,0);
    }

    const alpha=1-Math.exp(-dt*14);
    for(const name of BONE_NAMES){
      const bone=this.bones.get(name),rest=this.rest.get(name);
      if(!bone||!rest)continue;
      const [x,y,z]=pose.get(name)??[0,0,0];
      this.tmpEuler.set(x,y,z,'XYZ');
      this.tmpOffset.setFromEuler(this.tmpEuler);
      this.tmpTarget.copy(rest).multiply(this.tmpOffset);
      bone.quaternion.slerp(this.tmpTarget,alpha);
    }

    if(this.energy){
      const beat=1+Math.sin(performance.now()*.004)*.06;
      this.energy.scale.lerp(new THREE.Vector3(beat,beat,beat),.12);
    }
  }

  private animateFallback(dt:number,state:TecnomageState){
    const t=performance.now()*.001;
    const moving=state==='WALK'||state==='RUN'||state==='SPRINT';
    this.fallback.position.y=moving?Math.abs(Math.sin(t*(state==='SPRINT'?10:7)))*.045:Math.sin(t*2)*.02;
    this.fallback.rotation.z=THREE.MathUtils.damp(this.fallback.rotation.z,state==='DODGE'?-.32:0,12,dt);
  }

  private makeFallback(){
    const g=new THREE.Group(),dark=new THREE.MeshStandardMaterial({color:0x252b34,metalness:.3,roughness:.48}),energy=new THREE.MeshStandardMaterial({color:0x28e0c0,emissive:0x087b70,emissiveIntensity:3});
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,5,10),dark);torso.position.y=1.25;g.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),dark);head.position.y=2;g.add(head);
    for(const x of[-.22,.22]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.52,4,8),dark);leg.position.set(x,.45,0);g.add(leg)}
    const core=new THREE.Mesh(new THREE.OctahedronGeometry(.14),energy);core.name='pulse-core';core.position.set(0,1.4,.38);g.add(core);
    g.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true});return g;
  }
}
