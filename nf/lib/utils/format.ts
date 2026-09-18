export const fmt = (n:number) => n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toString()
