'use client'
import { ActionStatus } from '@/lib/hooks/useAnchorActions'
interface Props{label:string;loadingLabel?:string;successLabel?:string;status:ActionStatus;onClick:()=>void;variant?:'primary'|'teal'|'ghost'|'danger';disabled?:boolean;className?:string}
export default function ActionButton({label,loadingLabel,successLabel,status,onClick,variant='primary',disabled,className=''}:Props){
  const isLoading=status==='pending',isSuccess=status==='success',isError=status==='error'
  const cls=variant==='teal'?'btn-teal':variant==='ghost'?'btn-ghost':variant==='danger'?'btn-danger':'btn-primary'
  const style=isSuccess?{background:'linear-gradient(135deg,#15803d,#14532d)',border:'1px solid rgba(74,222,128,0.4)'}:isError?{background:'linear-gradient(135deg,#7f1d1d,#450a0a)',border:'1px solid rgba(244,63,94,0.4)'}:{}
  return(
    <button onClick={onClick} disabled={disabled||isLoading} className={`${cls} w-full flex items-center justify-center gap-2 ${disabled||isLoading?'btn-disabled':''} ${className}`} style={style}>
      {isLoading&&<svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="2" strokeDasharray="22" strokeDashoffset="11"/></svg>}
      {isLoading?(loadingLabel||'Processing...'):isSuccess?(successLabel||'✓ Done!'):isError?'✕ Failed — Check Console':label}
    </button>
  )
}
