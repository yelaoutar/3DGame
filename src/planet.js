import * as THREE from 'three';
import {material,mesh} from './scene.js';
import {RADIUS} from './gravity.js';
export function surfaceGroup(parent,normal,radius=RADIUS){const g=new THREE.Group();g.position.copy(normal).multiplyScalar(radius);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);parent.add(g);return g;}
export function tree(parent,scale=1,pink=false){const g=new THREE.Group();parent.add(g);g.scale.setScalar(scale);mesh(new THREE.CylinderGeometry(.18,.28,1.8,7),material('#9d7056'),g,[0,.8,0]);const colors=pink?['#ffc1d9','#f89ec8','#e783b4']:['#7baf6b','#91bf78','#62995c'];[[0,2.2,0],[-.55,1.9,.15],[.55,2,.05],[0,2.6,-.1]].forEach((p,i)=>mesh(new THREE.IcosahedronGeometry(.95,1),material(colors[i%3]),g,p));return g;}
export function createPlanet(scene){const root=new THREE.Group();scene.add(root);mesh(new THREE.SphereGeometry(RADIUS,96,64),material('#89ad75'),root);
 for(let i=0;i<170;i++){const n=new THREE.Vector3().randomDirection();if(n.y>.93)continue;const g=surfaceGroup(root,n);const rand=Math.random();if(rand<.25)tree(g,.5+Math.random()*.7,rand<.08);else if(rand<.48){const rock=mesh(new THREE.DodecahedronGeometry(.25+Math.random()*.3),material('#c2b7a4'),g,[0,.1,0]);rock.scale.y=.65;}else {for(let j=0;j<3;j++){const x=(Math.random()-.5)*.7,z=(Math.random()-.5)*.7;mesh(new THREE.CylinderGeometry(.025,.025,.28,4),material('#568650'),g,[x,.14,z]);mesh(new THREE.IcosahedronGeometry(.12,0),material(['#ffe5a3','#fff6e3','#edb7ce'][i%3]),g,[x,.32,z]);}}}
 // A little stepping-stone trail leading toward the first heart.
 for(let i=0;i<12;i++){const n=new THREE.Vector3(Math.sin(i*.035)*.5,1,-i*.07).normalize();const g=surfaceGroup(root,n,12.02);const stone=mesh(new THREE.CylinderGeometry(.32,.38,.08,7),material('#dcd4bd'),g);stone.rotation.y=i;}
 const distant=mesh(new THREE.SphereGeometry(4,32,24),material('#877cae'),scene,[-55,26,-85]);const ring=mesh(new THREE.TorusGeometry(6,.11,8,80),material('#b3a2ce'),distant);ring.rotation.x=1.15;
 mesh(new THREE.SphereGeometry(2.2,24,16),material('#c38d86'),scene,[55,0,-90]);return root;}
export function createGarden(scene){const root=new THREE.Group();root.visible=false;scene.add(root);mesh(new THREE.SphereGeometry(12,80,48),material('#ac91ad'),root);const top=surfaceGroup(root,new THREE.Vector3(0,1,0));tree(top,2.1,true);const glow=new THREE.PointLight("#ffc0dc",18,15);glow.position.set(0,4,0);top.add(glow);for(let i=0;i<70;i++){const n=new THREE.Vector3().randomDirection();const g=surfaceGroup(root,n);mesh(new THREE.IcosahedronGeometry(.13),material('#ffe1c2',{emissive:'#ff9fba',emissiveIntensity:.8}),g,[0,.2,0]);}return root;}


export function createFlowerWorld(scene){
 const root=new THREE.Group();root.visible=false;scene.add(root);
 mesh(new THREE.SphereGeometry(12,80,48),material('#6f9e99'),root);
 const top=surfaceGroup(root,new THREE.Vector3(0,1,0));
 const arch=mesh(new THREE.TorusGeometry(2.5,.12,10,80,Math.PI),material('#f6d7b4',{emissive:'#e9aebf',emissiveIntensity:.4}),top,[0,0,-2]);
 for(let i=0;i<17;i++){const a=i/16*Math.PI;const bloom=mesh(new THREE.IcosahedronGeometry(.28,1),material(i%2?'#ffc5df':'#fff0d6'),top,[Math.cos(a)*2.5,Math.sin(a)*2.5,-2]);}
 for(let i=0;i<170;i++){
  const n=new THREE.Vector3().randomDirection();if(n.y>.94&&Math.abs(n.x)<.15&&n.z>-.25)continue;
  const g=surfaceGroup(root,n);const col=['#f8a2ca','#fff1c6','#c7b6ff'][i%3];
  mesh(new THREE.CylinderGeometry(.018,.025,.35,5),material('#477d65'),g,[0,.17,0]);
  mesh(new THREE.IcosahedronGeometry(.16,1),material(col,{emissive:col,emissiveIntensity:.35}),g,[0,.4,0]);
 }
 const glow=new THREE.PointLight('#ffcfdf',15,18);glow.position.set(0,17,-1);root.add(glow);
 return root;
}
