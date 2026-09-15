import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {computeBoundsTree,acceleratedRaycast} from 'three-mesh-bvh';
T.BufferGeometry.prototype.computeBoundsTree=computeBoundsTree;T.Mesh.prototype.raycast=acceleratedRaycast;
const $=id=>document.getElementById(id),scene=new T.Scene();scene.background=new T.Color('#bdcbd0');
const camera=new T.PerspectiveCamera(68,innerWidth/innerHeight,.04,100),renderer=new T.WebGLRenderer({canvas:$('view'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.65;
scene.add(new T.HemisphereLight(0xe5eefb,0xa59a82,1.8));const sun=new T.DirectionalLight(0xffecd2,2.4);sun.position.set(15,20,5);scene.add(sun);
const controls=new PointerLockControls(camera,document.body);controls.pointerSpeed=.65;
let dragMode=false,dragging=false;
renderer.domElement.addEventListener('pointerdown',()=>{dragging=true});addEventListener('pointerup',()=>dragging=false);
addEventListener('pointermove',e=>{if(!dragMode||!dragging)return;const a=new T.Euler().setFromQuaternion(camera.quaternion,'YXZ');a.y-=e.movementX*.0013;a.x=T.MathUtils.clamp(a.x-e.movementY*.0013,-Math.PI/2+.02,Math.PI/2-.02);camera.quaternion.setFromEuler(a)});
addEventListener('keydown',e=>{if(e.code==='Escape'&&dragMode){dragMode=false;dragging=false;keys.clear();$('panel').hidden=false;$('crosshair').hidden=true}});
const keys=new Set(),staticMeshes=[],doors=[],ray=new T.Raycaster();ray.firstHitOnly=true;let ready=false,last=performance.now(),target=null;
const locations={entry:[4.1,1.67,-3.05],living:[7.7,1.67,-3.05],upper:[5.9,4.66,-3.7]};
function teleport(name){camera.position.fromArray(locations[name]);camera.lookAt(camera.position.clone().add(new T.Vector3(1,0,0)));keys.clear()};teleport('entry');
controls.addEventListener('lock',()=>{$('panel').hidden=true;$('crosshair').hidden=false});controls.addEventListener('unlock',()=>{$('panel').hidden=false;$('crosshair').hidden=true;keys.clear()});
$('start').onclick=()=>{document.body.requestPointerLock().catch(()=>{dragMode=true;$('panel').hidden=true;$('crosshair').hidden=false;document.querySelector('footer').textContent='WASD · PRZECIĄGNIJ MYSZĄ ABY SIĘ ROZEJRZEĆ · O DRZWI · ESC MENU'})};document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{if(ready)teleport(b.dataset.place)});
addEventListener('keydown',e=>{if(!(controls.isLocked||dragMode))return;if(['KeyW','KeyA','KeyS','KeyD','KeyO'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyO'&&!e.repeat&&target)target.goal=target.goal===0?target.openAngle:0});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
const specs=[
 {id:'parter-1',match:'83ad408f',suffix:false,hinge:'min',sign:-1,merged:true},
 {id:'parter-2',match:'83ad408f',suffix:true,hinge:'min',sign:-1,merged:true},
 {id:'parter-3',match:'c650bcd0',hinge:'min',sign:1,merged:true},
 {id:'wejsciowe',match:'8e3d96e1',hinge:'min',sign:-1},
 {id:'pietro-1',match:'f70019eb',suffix:false,hinge:'max',sign:1},
 {id:'pietro-2',match:'f70019eb',suffix:true,hinge:'max',sign:-1}
];
function matches(name,s){return name.includes(s.match)&&(s.suffix===undefined||name.includes('.001')===s.suffix)}
function splitLeaf(mesh,box){
 const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrixWorld);const pos=g.attributes.position;const leaf=[],frame=[];const v=new T.Vector3();
 for(let i=0;i<pos.count;i+=3){let inside=true;for(let j=0;j<3;j++){v.fromBufferAttribute(pos,i+j);if(!box.containsPoint(v))inside=false}(inside?leaf:frame).push(i,i+1,i+2)}
 if(!leaf.length)return null;
 function make(ids){const out=new T.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const values=new a.array.constructor(ids.length*a.itemSize);ids.forEach((idx,i)=>{for(let k=0;k<a.itemSize;k++)values[i*a.itemSize+k]=a.array[idx*a.itemSize+k]});out.setAttribute(name,new T.BufferAttribute(values,a.itemSize,a.normalized))}return out}
 const moving=new T.Mesh(make(leaf),mesh.material);scene.add(moving);mesh.geometry=make(frame);mesh.removeFromParent();scene.add(mesh);mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);mesh.updateMatrixWorld();return moving;
}
function configureDoors(root){
 root.updateMatrixWorld(true);const all=[];root.traverse(o=>{if(o.isMesh)all.push(o)});
 for(const spec of specs){const node=all.find(o=>matches(o.userData.sourceName||'',spec));if(!node)continue;
 let box=new T.Box3().setFromObject(node),size=box.getSize(new T.Vector3()),axis=size.x<size.z?'z':'x',thin=axis==='x'?'z':'x',moving=node;
 if(spec.merged){const inner=box.clone();inner.min[axis]+=.053;inner.max[axis]-=.053;inner.max.y=inner.min.y+2.047;inner.max[thin]=inner.min[thin]+.0502;inner.expandByScalar(.0002);moving=splitLeaf(node,inner);if(!moving)continue;box=new T.Box3().setFromObject(moving)}
 const pivot=new T.Group();pivot.name='DOOR_'+spec.id;pivot.position.copy(box.getCenter(new T.Vector3()));pivot.position[axis]=box[spec.hinge][axis];pivot.position.y=box.min.y;scene.add(pivot);pivot.updateMatrixWorld();pivot.attach(moving);
 if(!spec.merged)for(const part of all)if(part!==moving&&part.userData.sourceName===node.userData.sourceName)pivot.attach(part);
 // Keep the existing handles and the entrance inset on the moving leaf.
 const attachBox=box.clone().expandByScalar(.14);
 for(const obj of all){if(obj===node||obj===moving||obj.userData.door)continue;const b=new T.Box3().setFromObject(obj),s=b.getSize(new T.Vector3());if(attachBox.containsBox(b)&&((s.x<.25&&s.y<.15&&s.z<.25)||((spec.id==='wejsciowe'&&(obj.userData.sourceName||'').includes('69fe9409'))||(spec.id==='pietro-1'&&(obj.userData.sourceName||'').includes('0b7058eb')))))pivot.attach(obj)}
 const d={id:spec.id,pivot,goal:0,openAngle:spec.sign*Math.PI/2,meshes:[]};pivot.traverse(o=>{if(o.isMesh){o.userData.door=d;d.meshes.push(o)}});doors.push(d);
 }
}
function buildCollision(){scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.isMesh)return;if(o.geometry.attributes.position?.count){o.geometry.computeBoundsTree();o.userData.bounds=new T.Box3().setFromObject(o);if(!o.userData.door)staticMeshes.push(o)}})}
function candidates(origin,distance){const near=[];for(const m of staticMeshes)if(m.userData.bounds.distanceToPoint(origin)<distance+.02)near.push(m);for(const d of doors)near.push(...d.meshes);return near}
function cast(origin,direction,length,meshes=null){ray.set(origin,direction);ray.near=0;ray.far=length;return ray.intersectObjects(meshes||candidates(origin,length),false)[0]}
const radial=Array.from({length:16},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/8),0,Math.sin(i*Math.PI/8)));
function blocked(p,only=null){for(const h of [.2,.65,1.15,1.55]){const origin=new T.Vector3(p.x,p.y-1.65+h,p.z),near=only||candidates(origin,.245);for(const dir of radial)if(cast(origin,dir,.235,near))return true}return false}
function move(delta){const candidate=camera.position.clone().add(delta);if(blocked(candidate))return false;
 const origin=candidate.clone();origin.y=camera.position.y-1.65+.22;const hit=cast(origin,new T.Vector3(0,-1,0),.5);if(!hit)return false;const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);if(normal.y<.55)return false;candidate.y=hit.point.y+1.65;if(Math.abs(candidate.y-camera.position.y)>.23)return false;camera.position.copy(candidate);return true}
function update(dt){if(!ready)return;for(const d of doors){const old=d.pivot.rotation.y;d.pivot.rotation.y=T.MathUtils.damp(old,d.goal,5,dt);if(Math.abs(d.pivot.rotation.y-d.goal)<.002)d.pivot.rotation.y=d.goal;d.pivot.updateMatrixWorld(true);if(old!==d.pivot.rotation.y&&blocked(camera.position,d.meshes)){d.pivot.rotation.y=old;d.goal=old;d.pivot.updateMatrixWorld(true)}}
 if((controls.isLocked||dragMode)){const forward=new T.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new T.Vector3().crossVectors(forward,camera.up);const delta=new T.Vector3().addScaledVector(forward,Number(keys.has('KeyW'))-Number(keys.has('KeyS'))).addScaledVector(right,Number(keys.has('KeyD'))-Number(keys.has('KeyA')));if(delta.lengthSq()){delta.normalize().multiplyScalar(1.2*dt);const n=Math.ceil(delta.length()/.025);delta.divideScalar(n);for(let i=0;i<n;i++){if(!move(delta)){move(new T.Vector3(delta.x,0,0));move(new T.Vector3(0,0,delta.z))}}}}
 const dir=new T.Vector3();camera.getWorldDirection(dir);const hit=cast(camera.position,dir,2.2);target=hit?.object.userData.door||null;$('hint').textContent=(controls.isLocked||dragMode)&&target?'O · '+(target.goal===0?'Otwórz drzwi':'Zamknij drzwi'):'';
}
new GLTFLoader().load('./assets/interior.glb',async gltf=>{try{scene.add(gltf.scene);gltf.scene.traverse(o=>{const a=gltf.parser.associations.get(o);if(a?.nodes!==undefined)o.userData.sourceName=gltf.parser.json.nodes[a.nodes].name;else if(o.parent)o.userData.sourceName=o.parent.userData.sourceName;if(o.isMesh){o.material.side=T.DoubleSide;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!/glass|szk|mirror|lustro|metal|chrome|steel/i.test(m.name)){m.metalness=0;m.roughness=Math.max(.45,m.roughness)}m.envMapIntensity=.6}}});$('status').textContent='Przygotowanie kolizji…';await new Promise(r=>setTimeout(r,30));configureDoors(gltf.scene);buildCollision();ready=true;$('progress').hidden=true;$('start').disabled=false;$('start').textContent='Rozpocznij spacer';$('status').textContent=`Gotowe · ${doors.length} drzwi interaktywnych`;window.walkthrough={scene,camera,doors,move,cast,blocked,teleport,renderer,controls,ready:true};}catch(e){fail(e)}},p=>{if(p.total){$('progress').value=p.loaded/p.total*100;$('status').textContent=`Wczytywanie ${Math.round(p.loaded/p.total*100)}%`}},fail);
function fail(e){console.error(e);$('status').textContent='Nie udało się wczytać modelu. Sprawdź dostęp do plików strony i odśwież.'}
if(new URLSearchParams(location.search).has('qa')){const timer=setInterval(()=>{if(!ready)return;clearInterval(timer);import('./qa.js').then(m=>m.run(window.walkthrough,T))},300)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;update(dt);renderer.render(scene,camera)});


