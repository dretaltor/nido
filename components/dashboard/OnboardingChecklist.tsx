'use client'

interface Props {
  tieneFoto: boolean
  tieneValeria: boolean
  tieneKYC: boolean
  tienePropiedades: boolean
  onDismiss: () => void
}

export function OnboardingChecklist({ tieneFoto, tieneValeria, tieneKYC, tienePropiedades, onDismiss }: Props) {
  const pasos = [
    {
      id: 'valeria',
      label: 'Configurá tu Valeria personal',
      desc: 'Personalizá tu asistente IA con tu estilo de trabajo',
      hecho: tieneValeria,
      href: '/dashboard/valeria-onboarding',
      cta: 'Configurar →',
      icon: '✦',
    },
    {
      id: 'foto',
      label: 'Agregá tu foto de perfil',
      desc: 'Los asesores con foto reciben 3× más confianza de los clientes',
      hecho: tieneFoto,
      href: '/dashboard/perfil',
      cta: 'Subir foto →',
      icon: '👤',
    },
    {
      id: 'kyc',
      label: 'Verificá tu identidad',
      desc: 'Obtené el badge de Asesor Verificado NIDO',
      hecho: tieneKYC,
      href: '/dashboard/perfil#kyc',
      cta: 'Verificar →',
      icon: '🪪',
    },
    {
      id: 'propiedad',
      label: 'Publicá tu primera propiedad',
      desc: 'Los asesores con 3+ propiedades reciben 4× más leads',
      hecho: tienePropiedades,
      href: '/dashboard/nueva-propiedad',
      cta: 'Publicar →',
      icon: '🏠',
    },
  ]

  const completados = pasos.filter(p => p.hecho).length
  const total = pasos.length
  const pct = Math.round(completados / total * 100)

  if (completados === total) return null

  return (
    <div style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'20px 24px', marginBottom:24, animation:'fadeUp 0.4s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Primeros pasos</div>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:400, marginBottom:2 }}>Completá tu perfil para empezar a recibir leads</h3>
          <p style={{ fontSize:12, color:'var(--ink-3)' }}>{completados} de {total} pasos completados</p>
        </div>
        <button onClick={onDismiss} style={{ fontSize:11, color:'var(--ink-3)', background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}>
          Ocultar
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height:4, background:'var(--rule)', borderRadius:999, marginBottom:20, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'var(--accent)', width:pct+'%', borderRadius:999, transition:'width 0.5s ease' }}/>
      </div>

      {/* Steps */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {pasos.map(p => (
          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, background: p.hecho ? 'var(--accent-tint)' : 'var(--bg)', border:'1px solid '+(p.hecho?'oklch(0.85 0.04 150)':'var(--rule)'), opacity: p.hecho ? 0.7 : 1 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background: p.hecho ? 'var(--accent)' : 'white', border:'1px solid '+(p.hecho?'var(--accent)':'var(--rule)'), display:'grid', placeItems:'center', fontSize:16, flexShrink:0 }}>
              {p.hecho ? '✓' : p.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:2, color: p.hecho ? 'var(--accent)' : 'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.label}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.desc}</div>
            </div>
            {!p.hecho && (
              <a href={p.href} style={{ fontSize:11, color:'var(--accent)', fontWeight:500, whiteSpace:'nowrap', textDecoration:'none', flexShrink:0 }}>
                {p.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
