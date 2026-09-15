export function run(w,T){
 const result={doors:[],movement:{},errors:[]};const saved=w.camera.position.clone();
 for(const d of w.doors){const b=new T.Box3().setFromObject(d.pivot),s=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),axis=s.x<s.z?'x':'z',origin=center.clone();origin[axis]-=.6;const direction=new T.Vector3();direction[axis]=1;
 const closed=w.cast(origin,direction,1.2);d.pivot.rotation.y=d.openAngle;d.pivot.updateMatrixWorld(true);const opened=w.cast(origin,direction,1.2);result.doors.push({id:d.id,closedBlocked:!!closed,closedHit:closed?.object.userData.door?.id,openPassage:!opened,openHit:opened?.object.userData.sourceName||opened?.object.name,parts:d.meshes.length});d.pivot.rotation.y=0;d.pivot.updateMatrixWorld(true)}
 w.teleport('entry');const a=w.camera.position.clone();for(let i=0;i<40;i++)w.move(new T.Vector3(.025,0,0));result.movement.corridorDistance=w.camera.position.distanceTo(a);result.movement.eyeHeight=w.camera.position.y;
 const d=w.doors[0];const b=new T.Box3().setFromObject(d.pivot),c=b.getCenter(new T.Vector3());w.camera.position.set(c.x,1.67,c.z-.65);for(let i=0;i<52;i++)w.move(new T.Vector3(0,0,.025));result.movement.closedZ=w.camera.position.z;
 d.pivot.rotation.y=d.openAngle;d.pivot.updateMatrixWorld(true);w.camera.position.set(c.x,1.67,c.z-.65);for(let i=0;i<52;i++)w.move(new T.Vector3(0,0,.025));result.movement.openZ=w.camera.position.z;result.movement.crossedDoor=w.camera.position.z>c.z+.3;d.pivot.rotation.y=0;d.pivot.updateMatrixWorld(true);
 w.camera.position.copy(saved);const out=document.createElement('pre');out.id='qa-results';out.style='position:fixed;right:0;top:0;background:#111;color:white;max-height:90vh;overflow:auto;font-size:11px';out.textContent=JSON.stringify(result,null,2);document.body.append(out);
 // Place the camera in front of a real door for keyboard O verification.
 w.camera.position.set(c.x,1.65,c.z-.9);w.camera.lookAt(c.x,1.4,c.z);
}
