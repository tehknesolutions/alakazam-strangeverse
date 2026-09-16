import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type TecnomageState='IDLE'|'WALK'|'RUN'|'SPRINT'|'DODGE'|'PULSE';

export class TecnomageController{
  readonly root=new THREE.Group();
  private mixer?:THREE.AnimationMixer;
  private actions=new Map<TecnomageState,THREE.AnimationAction>();
  private state:TecnomageState='IDLE';
  private fallback:THREE.Object3D;

  constructor(){this.fallback=this.makeFallback();this.root.add(this.fallback)}

  async load(url='/assets/characters/tecnomage.glb'){
    try{
      const gltf=await new GLTFLoader().loadAsync(url);
      const model=gltf.scene;
      model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true}});
      const box=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();box.getSize(size);
      if(size.y>0) model.scale.setScalar(2.25/size.y);
      this.root.remove(this.fallback);this.root.add(model);
      this.mixer=new THREE.AnimationMixer(model);
      for(const clip of gltf.animations){const n=clip.name.toUpperCase();const state=this.match(n);if(state&&!this.actions.has(state))this.actions.set(state,this.mixer.clipAction(clip))}
      this.setState('IDLE');
      console.info('[M14-WEB-B2] Rigged Tecnomage loaded',gltf.animations.map(a=>a.name));
      return true;
    }catch(error){console.warn('[M14-WEB-B2] GLB unavailable; procedural fallback active.',error);return false}
  }

  update(dt:number,next:TecnomageState){this.setState(next);this.mixer?.update(dt);this.animateFallback(dt,next)}

  private setState(next:TecnomageState){if(next===this.state)return;const prev=this.actions.get(this.state),action=this.actions.get(next)??this.actions.get(next==='SPRINT'?'RUN':'IDLE');prev?.fadeOut(.16);action?.reset().fadeIn(.16).play();this.state=next}
  private match(n:string):TecnomageState|undefined{if(/DODGE|ROLL/.test(n))return'DODGE';if(/PULSE|CAST|SPELL/.test(n))return'PULSE';if(/SPRINT/.test(n))return'SPRINT';if(/RUN|JOG/.test(n))return'RUN';if(/WALK/.test(n))return'WALK';if(/IDLE/.test(n))return'IDLE'}
  private animateFallback(dt:number,state:TecnomageState){if(this.root.children[0]!==this.fallback)return;const t=performance.now()*.001;this.fallback.position.y=(state==='IDLE'?Math.sin(t*2)*.02:Math.abs(Math.sin(t*(state==='SPRINT'?10:7)))*.045);this.fallback.rotation.z=THREE.MathUtils.damp(this.fallback.rotation.z,state==='DODGE'?-.32:0,12,dt)}
  private makeFallback(){const g=new THREE.Group(),dark=new THREE.MeshStandardMaterial({color:0x252b34,metalness:.3,roughness:.48}),energy=new THREE.MeshStandardMaterial({color:0x28e0c0,emissive:0x087b70,emissiveIntensity:3});const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,5,10),dark);torso.position.y=1.25;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),dark);head.position.y=2;g.add(head);for(const x of[-.22,.22]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.52,4,8),dark);leg.position.set(x,.45,0);g.add(leg)}const core=new THREE.Mesh(new THREE.OctahedronGeometry(.14),energy);core.name='pulse-core';core.position.set(0,1.4,.38);g.add(core);g.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true});return g}
  pulse(){const core=this.root.getObjectByName('pulse-core');if(core instanceof THREE.Mesh&&core.material instanceof THREE.MeshStandardMaterial){core.material.emissiveIntensity=12;setTimeout(()=>core.material.emissiveIntensity=3,180)}}
}
