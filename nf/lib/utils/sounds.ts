let ctx:AudioContext|null=null
function getCtx(){if(!ctx)ctx=new AudioContext();return ctx}
function beep(freq:number,dur:number,type:OscillatorType='sine',vol=0.25){
  try{const c=getCtx(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(freq,c.currentTime);o.type=type;g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);o.start(c.currentTime);o.stop(c.currentTime+dur)}catch(e){}
}
export const sounds={
  colonize:()=>{beep(440,0.1,'sine',0.2);setTimeout(()=>beep(660,0.15,'sine',0.2),100);setTimeout(()=>beep(880,0.2,'sine',0.2),220)},
  claim:()=>{beep(523,0.08,'square',0.15);setTimeout(()=>beep(659,0.08,'square',0.15),80);setTimeout(()=>beep(784,0.12,'square',0.15),160)},
  victory:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.15,'sine',0.25),i*100))},
  defeat:()=>{beep(200,0.3,'sawtooth',0.2);setTimeout(()=>beep(150,0.5,'sawtooth',0.15),300)},
  alert:()=>{beep(880,0.1,'square',0.2);setTimeout(()=>beep(880,0.1,'square',0.2),200);setTimeout(()=>beep(880,0.1,'square',0.2),400)},
  attack:()=>{beep(110,0.4,'sawtooth',0.3);setTimeout(()=>beep(90,0.5,'sawtooth',0.25),200)},
  mint:()=>{[440,880,1320,1760].forEach((f,i)=>setTimeout(()=>beep(f,0.1,'sine',0.2),i*70))},
}
