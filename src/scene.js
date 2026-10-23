import * as THREE from 'three';
export function createScene(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#10172c');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#10172c',.002);const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,600);
 scene.add(new THREE.HemisphereLight('#d4eaff','#625170',2.3));const sun=new THREE.DirectionalLight('#fff2d2',3.2);sun.position.set(-18,35,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:100});sun.shadow.bias=-.0008;scene.add(sun);
 const points=[];for(let i=0;i<2200;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(130+Math.random()*150);points.push(v.x,v.y,v.z);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#d8d9ff',size:.22,transparent:true,opacity:.8})));
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});return {scene,camera,renderer};
}
export const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
export function mesh(geometry,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geometry,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
