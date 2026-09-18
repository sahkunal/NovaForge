'use client'
import { Planet } from '@/lib/types'
import { useAttackTimer } from '@/lib/hooks/useAttackTimer'

interface Props { planet: Planet; compact?: boolean }

function pad(n: number) { return String(Math.floor(n)).padStart(2, '0') }
function fmt(secs: number) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.floor(secs % 60)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export default function AttackCountdown({ planet, compact = false }: Props) {
  const status = useAttackTimer(planet)

  const colors = {
    safe:     { text: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)'   },
    warn:     { text: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)'  },
    danger:   { text: '#f97316', bg: 'rgba(249,115,22,0.1)',    border: 'rgba(249,115,22,0.3)'   },
    critical: { text: '#f43f5e', bg: 'rgba(244,63,94,0.12)',    border: 'rgba(244,63,94,0.4)'    },
    attack:   { text: '#f43f5e', bg: 'rgba(244,63,94,0.18)',    border: 'rgba(244,63,94,0.6)'    },
  }
  const c = colors[status.urgency]

  if (compact) {
    // Compact version for PlanetCard
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{background: c.bg, border: `1px solid ${c.border}`}}>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: c.text, boxShadow: `0 0 6px ${c.text}`, animation: status.urgency !== 'safe' ? 'pulse 1s infinite' : 'none'}}/>
        <span className="font-mono text-xs" style={{color: c.text, fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600}}>
          {status.isUnderAttack ? '⚔️ ATTACK!' :
           status.isCritical    ? `💀 ${fmt(status.timeToAttack)}` :
           status.isDanger      ? `🔴 ${fmt(status.timeToCritical)}` :
           status.isUnderThreat ? `⚠️ ${fmt(status.timeToDanger)}` :
                                  `✅ ${fmt(status.timeToWarn)}`}
        </span>
      </div>
    )
  }

  // Full version for detail panel
  return (
    <div className="rounded-xl overflow-hidden" style={{border: `1px solid ${c.border}`, background: c.bg}}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{borderColor: c.border}}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{background: c.text, boxShadow: `0 0 8px ${c.text}`}}/>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color: c.text, letterSpacing:'0.12em', fontWeight:700}}>
          {status.urgency === 'attack'   ? 'UNDER ATTACK' :
           status.urgency === 'critical' ? 'ATTACK IMMINENT' :
           status.urgency === 'danger'   ? 'DANGER ZONE' :
           status.urgency === 'warn'     ? 'MONSTER SPOTTED' : 'PLANET SECURE'}
        </span>
      </div>
      {/* Main countdown */}
      <div className="px-3 py-3">
        {status.isUnderAttack ? (
          <div className="text-center">
            <div style={{fontSize:'28px', marginBottom:4}}>⚔️</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f43f5e',letterSpacing:'0.08em'}}>CLAIM TO FIGHT</div>
            <div className="text-xs text-slate-400 mt-1">Monster is attacking your planet right now</div>
          </div>
        ) : (
          <div className="space-y-2">
            {status.urgency === 'safe' && (
              <Row label="Monster arrives in" value={fmt(status.timeToWarn)} color={c.text} active={false}/>
            )}
            {(status.urgency === 'warn' || status.urgency === 'danger') && (
              <Row label="⚠️ Enters danger zone" value={fmt(status.timeToDanger)} color="#f97316" active={status.urgency === 'warn'}/>
            )}
            {(status.urgency === 'warn' || status.urgency === 'danger' || status.urgency === 'critical') && (
              <Row label="💀 Attack in" value={fmt(status.timeToAttack)} color="#f43f5e" active={status.urgency === 'critical'}/>
            )}
            {status.urgency === 'safe' && (
              <div className="text-xs text-slate-500 mt-1 text-center">Claim before 10 min to stay safe</div>
            )}
          </div>
        )}
      </div>
      {/* Threat bar */}
      <div className="px-3 pb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Threat Level</span>
          <span style={{color: c.text, fontFamily:'JetBrains Mono,monospace', fontWeight:600}}>{Math.floor(status.threatLevel)}/100</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${status.threatLevel}%`,
            background: `linear-gradient(to right, #4ade80, #fbbf24 50%, #f43f5e)`,
            boxShadow: status.urgency !== 'safe' ? `0 0 8px ${c.text}` : 'none',
          }}/>
        </div>
        <div className="flex justify-between text-xs mt-1" style={{color:'#334155',fontFamily:'Orbitron,monospace',fontSize:'7px'}}>
          <span>SAFE</span><span>WARNING</span><span>DANGER</span><span>CRITICAL</span>
        </div>
      </div>
    </div>
  )
}

function Row({label, value, color, active}: {label:string; value:string; color:string; active:boolean}) {
  return (
    <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${active ? 'animate-pulse' : ''}`}
      style={{background: active ? `${color}15` : 'transparent'}}>
      <span className="text-xs text-slate-400">{label}</span>
      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'13px',fontWeight:700,color,letterSpacing:'0.05em'}}>{value}</span>
    </div>
  )
}