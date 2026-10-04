'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertex = `
varying vec3 vWorld;
void main(){
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorld=normalize(wp.xyz);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`
const fragment = `
varying vec3 vWorld;
uniform float uTime;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
  vec3 d=normalize(vWorld);
  float n=noise(d*3.5+uTime*.006)+.5*noise(d*9.0-uTime*.01);
  float band=exp(-pow((d.y+.08)*3.2,2.0));
  vec3 col=vec3(.001,.003,.012)+vec3(.018,.008,.045)*n+vec3(.02,.025,.055)*band;
  float stars=step(.9976,hash(floor(d*420.0)));
  float bright=step(.9992,hash(floor(d*760.0)));
  col+=stars*vec3(.32,.52,.78)+bright*vec3(.75,.88,1.0);
  gl_FragColor=vec4(col,1.0);
}`

export default function SpaceBackdrop(){
  const mat=useRef<THREE.ShaderMaterial>(null)
  useFrame(({clock})=>{if(mat.current)mat.current.uniforms.uTime.value=clock.elapsedTime})
  return <mesh>
    <sphereGeometry args={[145,64,64]}/>
    <shaderMaterial ref={mat} uniforms={{uTime:{value:0}}} vertexShader={vertex} fragmentShader={fragment} side={THREE.BackSide} depthWrite={false}/>
  </mesh>
}
