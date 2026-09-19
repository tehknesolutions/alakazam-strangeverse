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

const HERO_URL='/assets/characters/tecnomage-prime-v2.8-runtime-q.glb';
const HERO_FLOAT_FALLBACK_URL='/assets/characters/tecnomage-prime-v2.8-runtime-optimized.glb';
const LEGACY_URL='/assets/characters/tecnomage.gltf';

const CLIP_BY_STATE:Record<TecnomageState,string>={
  IDLE:'UAL1_Idle_Loop',
  WALK:'UAL1_Walk_Loop',
  RUN:'UAL1_Jog_Fwd_Loop',
  SPRINT:'UAL1_Sprint_Loop',
  DODGE:'UAL1_Roll',
  PULSE:'UAL1_Spell_Simple_Shoot',
  ATTACK_LIGHT:'UAL1_Sword_Attack',
  ATTACK_HEAVY:'UAL2_Sword_Heavy_Combo'
};

const ONE_SHOT_STATES=new Set<TecnomageState>([
  'DODGE','PULSE','ATTACK_LIGHT','ATTACK_HEAVY'
]);

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
  private mixer?:THREE.AnimationMixer;
  private actions=new Map<TecnomageState,THREE.AnimationAction>();
  private activeAction?:THREE.AnimationAction;
  private embeddedAnimationMode=false;
  private heroIdentityMaterials=new Map<THREE.MeshStandardMaterial,number>();
  private pulseResetTimer?:number;
  private tmpEuler=new THREE.Euler();
  private tmpOffset=new THREE.Quaternion();
  private tmpTarget=new THREE.Quaternion();

  constructor(){
    this.fallback=this.makeFallback();
    this.root.add(this.fallback);
  }

  async load(url=HERO_URL){
    const attempts=[url,HERO_FLOAT_FALLBACK_URL,LEGACY_URL];
    const unique=[...new Set(attempts)];
    for(const candidate of unique){
      try{
        const loaded=await this.loadAsset(candidate);
        if(loaded)return true;
      }catch(error){
        console.warn(`[V2.8] Tecnomage asset failed: ${candidate}`,error);
      }
    }
    console.warn('[V2.8] All Tecnomage assets unavailable; procedural fallback active.');
    return false;
  }

  private async loadAsset(url:string){
    const gltf=await new GLTFLoader().loadAsync(url);
    const model=gltf.scene;
    model.name=url.includes('v2.8')?'TecnomagePrimeV28':'TecnomageLegacy';
    model.traverse(o=>{
      if(o instanceof THREE.Mesh){
        o.castShadow=true;
        o.receiveShadow=true;
        o.visible=true;
        if(o instanceof THREE.SkinnedMesh)o.frustumCulled=false;
      }
    });

    for(const required of ['Eyebrows','Eyes','SuperHero_Male']){
      const part=model.getObjectByName(required);
      if(part)part.visible=true;
    }

    const box=new THREE.Box3().setFromObject(model);
    const size=new THREE.Vector3();
    box.getSize(size);
    if(size.y>0)model.scale.setScalar(2.25/size.y);
    box.setFromObject(model);
    model.position.y-=box.min.y;

    this.detachCurrentModel();
    this.model=model;
    this.root.remove(this.fallback);
    this.root.add(model);

    this.captureHeroIdentityMaterials(model);
    const embedded=this.configureEmbeddedAnimations(model,gltf.animations);
    if(!embedded){
      this.bindBones(model);
      this.addLegacyEnergyCore();
    }

    console.info('[V2.8] Tecnomage loaded',{
      url,
      embeddedAnimationMode:embedded,
      animations:gltf.animations.map(a=>a.name),
      mappedStates:[...this.actions.keys()],
      heroIdentityMaterials:this.heroIdentityMaterials.size
    });
    return true;
  }

  update(dt:number,next:TecnomageState){
    if(next!==this.state){
      this.state=next;
      this.stateTime=0;
      if(this.embeddedAnimationMode)this.transitionAnimation(next);
    }
    this.stateTime+=dt;
    const cadence=next==='SPRINT'?11:next==='RUN'?8.2:next==='WALK'?5.2:2;
    this.gaitPhase+=dt*cadence;

    if(this.embeddedAnimationMode&&this.mixer){
      this.mixer.update(dt);
    }else if(this.model){
      this.animateRig(dt,next);
    }else{
      this.animateFallback(dt,next);
    }
  }

  pulse(){
    if(this.heroIdentityMaterials.size){
      if(this.pulseResetTimer!==undefined)window.clearTimeout(this.pulseResetTimer);
      for(const [material,base] of this.heroIdentityMaterials){
        material.emissiveIntensity=Math.max(5.5,base*3.2);
      }
      this.pulseResetTimer=window.setTimeout(()=>{
        for(const [material,base] of this.heroIdentityMaterials){
          material.emissiveIntensity=base;
        }
      },220);
      return;
    }

    if(!this.energy)return;
    this.energy.material.emissiveIntensity=14;
    this.energy.scale.setScalar(1.45);
    window.setTimeout(()=>{
      if(!this.energy)return;
      this.energy.material.emissiveIntensity=3.5;
      this.energy.scale.setScalar(1);
    },220);
  }

  private configureEmbeddedAnimations(model:THREE.Object3D,clips:THREE.AnimationClip[]){
    this.actions.clear();
    this.activeAction=undefined;
    this.mixer=undefined;
    this.embeddedAnimationMode=false;

    const byName=new Map(clips.map(clip=>[clip.name.toLowerCase(),clip]));
    const mixer=new THREE.AnimationMixer(model);
    for(const [state,clipName] of Object.entries(CLIP_BY_STATE) as [TecnomageState,string][]){
      const clip=byName.get(clipName.toLowerCase());
      if(!clip)continue;
      const action=mixer.clipAction(clip);
      action.enabled=true;
      if(ONE_SHOT_STATES.has(state)){
        action.setLoop(THREE.LoopOnce,1);
        action.clampWhenFinished=true;
      }else{
        action.setLoop(THREE.LoopRepeat,Infinity);
        action.clampWhenFinished=false;
      }
      this.actions.set(state,action);
    }

    if(!this.actions.has('IDLE')||this.actions.size<4){
      mixer.stopAllAction();
      return false;
    }

    this.mixer=mixer;
    this.embeddedAnimationMode=true;
    this.transitionAnimation('IDLE',0);
    return true;
  }

  private transitionAnimation(state:TecnomageState,fade?:number){
    if(!this.mixer)return;
    const next=this.actions.get(state)
      ??this.actions.get(state==='WALK'?'RUN':'IDLE')
      ??this.actions.get('IDLE');
    if(!next||next===this.activeAction)return;

    const duration=fade??(ONE_SHOT_STATES.has(state)?.055:.13);
    next.enabled=true;
    next.reset();
    next.setEffectiveTimeScale(1);
    next.setEffectiveWeight(1);
    next.play();

    if(this.activeAction){
      this.activeAction.crossFadeTo(next,duration,false);
    }else if(duration>0){
      next.fadeIn(duration);
    }
    this.activeAction=next;
  }

  private captureHeroIdentityMaterials(model:THREE.Object3D){
    this.heroIdentityMaterials.clear();
    model.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      for(const material of materials){
        if(!(material instanceof THREE.MeshStandardMaterial))continue;
        const identity=`${o.name} ${material.name}`.toUpperCase();
        if(!/(NEXUS|TIFERET)/.test(identity))continue;
        this.heroIdentityMaterials.set(material,material.emissiveIntensity);
      }
    });
  }

  private detachCurrentModel(){
    if(this.model)this.root.remove(this.model);
    if(this.energy){
      this.root.remove(this.energy);
      this.energy.geometry.dispose();
      this.energy.material.dispose();
      this.energy=undefined;
    }
    this.mixer?.stopAllAction();
    this.mixer=undefined;
    this.actions.clear();
    this.activeAction=undefined;
    this.embeddedAnimationMode=false;
    this.heroIdentityMaterials.clear();
    this.bones.clear();
    this.rest.clear();
  }

  private bindBones(model:THREE.Object3D){
    this.bones.clear();
    this.rest.clear();
    for(const name of BONE_NAMES){
      const bone=model.getObjectByName(name);
      if(!bone)continue;
      this.bones.set(name,bone);
      this.rest.set(name,bone.quaternion.clone());
    }
  }

  private addLegacyEnergyCore(){
    if(this.heroIdentityMaterials.size)return;
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
    const s=Math.sin(this.gaitPhase);

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
    const g=new THREE.Group();
    const dark=new THREE.MeshStandardMaterial({color:0x252b34,metalness:.3,roughness:.48});
    const energy=new THREE.MeshStandardMaterial({color:0x28e0c0,emissive:0x087b70,emissiveIntensity:3});
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,5,10),dark);torso.position.y=1.25;g.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),dark);head.position.y=2;g.add(head);
    for(const x of[-.22,.22]){
      const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.52,4,8),dark);
      leg.position.set(x,.45,0);g.add(leg);
    }
    const core=new THREE.Mesh(new THREE.OctahedronGeometry(.14),energy);
    core.name='pulse-core';core.position.set(0,1.4,.38);g.add(core);
    g.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true});
    return g;
  }
}
