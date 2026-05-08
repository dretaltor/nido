'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface OfertaFormProps {
  propiedadId: string
  propiedadTitulo: string
  propiedadRef?: string
  propiedadPrecio: number
  propiedadAsesorEmail: string
  asesorEmail: string
  asesorNombre: string
  onClose: () => void
  onSuccess: () => void
}

export function OfertaForm({ propiedadId, propiedadTitulo, propiedadRef, propiedadPrecio, propiedadAsesorEmail, asesorEmail, asesorNombre, onClose, onSuccess }: OfertaFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    comprador_nombre: '',
    comprador_email: '',
    comprador_telefono: '',
    valor_oferta: '',
    tipo_compra: '',
    forma_pago: '',
    pre_aprobado: '',
    banco: '',
    monto_prima: '',
    condiciones: '',
  })

  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const handleSubmit = async () => {
    if (!form.comprador_nombre || !form.valor_oferta || !form.tipo_compra) {
      setError('Completá los campos obligatorios.')
      return
    }
    setLoading(true); setError('')
    const { error } = await supabase.from('ofertas').insert({
      propiedad_id: propiedadId,
      asesor_email: asesorEmail,
      asesor_nombre: asesorNombre,
      comprador_nombre: form.comprador_nombre,
      comprador_email: form.comprador_email,
      comprador_telefono: form.comprador_telefono,
      valor_oferta: parseFloat(form.valor_oferta.replace(/,/g, '')),
      tipo_compra: form.tipo_compra,
      forma_pago: form.forma_pago,
      pre_aprobado: form.pre_aprobado === 'si',
      banco: form.banco,
      monto_prima: form.monto_prima ? parseFloat(form.monto_prima.replace(/,/g, '')) : null,
      condiciones: form.condiciones,
      estado: 'pendiente',
    })
    if (error) { setError('Error al enviar la oferta. Intentá de nuevo.'); setLoading(false); return }
    // Enviar notificacion por email al asesor
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: propiedadAsesorEmail || asesorEmail,
        tipo: 'nueva_oferta',
        data: {
          asesor_nombre: asesorNombre,
          comprador_nombre: form.comprador_nombre,
          propiedad: propiedadTitulo,
          valor_oferta: form.valor_oferta,
          tipo_compra: form.tipo_compra,
          condiciones: form.condiciones,
        }
      })
    })
    setLoading(false)
    onSuccess()
  }

  const CSS = `
    .oferta-input { width:100%; padding:11px 14px; border:1px solid var(--rule); border-radius:10px; font-size:14px; font-family:var(--sans); color:var(--ink); background:white; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
    .oferta-input:focus { border-color:var(--accent); }
    .oferta-input::placeholder { color:var(--ink-3); }
    .opcion-card { border:1px solid var(--rule); border-radius:10px; padding:12px 16px; cursor:pointer; transition:all 0.15s; background:white; text-align:left; width:100%; font-family:var(--sans); }
    .opcion-card:hover { border-color:var(--accent); background:var(--accent-tint); }
    .opcion-card.selected { border-color:var(--accent); background:var(--accent-tint); }
    .step-dot { width:8px; height:8px; border-radius:50%; transition:all 0.2s; }
  `

  const pct = form.valor_oferta ? Math.round(parseFloat(form.valor_oferta.replace(/,/g,'')) / propiedadPrecio * 100) : 0

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <style>{CSS}</style>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', zIndex:1, background:'white', borderRadius:20, width:'100%', maxWidth:540, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Nueva oferta</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:400 }}>{propiedadTitulo}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, cursor:'pointer', display:'grid', placeItems:'center' }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ padding:'12px 24px', borderBottom:'1px solid var(--rule-soft)', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className="step-dot" style={{ background:step>=s?'var(--accent)':'var(--rule)', width:step===s?10:8, height:step===s?10:8 }}/>
              {s < 3 && <div style={{ width:24, height:1, background:'var(--rule)' }}/>}
            </div>
          ))}
          <span style={{ fontSize:12, color:'var(--ink-3)', marginLeft:8 }}>Paso {step} de 3</span>
        </div>

        {/* Content */}
        <div style={{ padding:'24px', overflowY:'auto', flex:1 }}>

          {/* PASO 1: Datos del comprador */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>Datos del comprador</div>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20 }}>Información del cliente interesado.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Nombre completo *</label>
                  <input className="oferta-input" placeholder="Juan Carlos Pérez" value={form.comprador_nombre} onChange={e => set('comprador_nombre', e.target.value)}/>
                </div>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Correo electrónico</label>
                  <input className="oferta-input" type="email" placeholder="cliente@correo.com" value={form.comprador_email} onChange={e => set('comprador_email', e.target.value)}/>
                </div>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Teléfono</label>
                  <input className="oferta-input" placeholder="+506 8888-8888" value={form.comprador_telefono} onChange={e => set('comprador_telefono', e.target.value)}/>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Condiciones financieras */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>Condiciones financieras</div>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20 }}>Monto y forma de pago de la oferta.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Valor de la oferta (USD) *</label>
                  <input className="oferta-input" placeholder="350,000" value={form.valor_oferta} onChange={e => set('valor_oferta', e.target.value)}/>
                  {form.valor_oferta && (
                    <div style={{ display:'flex', gap:12, marginTop:8 }}>
                      <div style={{ flex:1, height:4, borderRadius:999, background:'var(--rule)', overflow:'hidden' }}>
                        <div style={{ height:'100%', background:pct>=95?'var(--accent)':pct>=85?'oklch(0.62 0.10 75)':'oklch(0.52 0.08 20)', width:Math.min(pct,100)+'%', transition:'width 0.3s' }}/>
                      </div>
                      <span style={{ fontSize:12, color:'var(--ink-3)', flexShrink:0 }}>{pct}% del precio lista</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:10 }}>Tipo de compra *</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[{v:'contado',l:'Contado',d:'Pago inmediato'},{v:'credito',l:'Crédito',d:'Financiamiento bancario'}].map(o => (
                      <button key={o.v} className={'opcion-card'+(form.tipo_compra===o.v?' selected':'')} onClick={() => set('tipo_compra', o.v)}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{o.l}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{o.d}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {form.tipo_compra === 'contado' && (
                  <div>
                    <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:10 }}>Forma de pago</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {[{v:'transferencia',l:'Transferencia',d:'SINPE o wire transfer'},{v:'cheque',l:'Cheque de gerencia',d:'Emitido por banco'}].map(o => (
                        <button key={o.v} className={'opcion-card'+(form.forma_pago===o.v?' selected':'')} onClick={() => set('forma_pago', o.v)}>
                          <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{o.l}</div>
                          <div style={{ fontSize:12, color:'var(--ink-3)' }}>{o.d}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.tipo_compra === 'credito' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:10 }}>¿Tiene pre-aprobación bancaria?</label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {[{v:'si',l:'Sí, pre-aprobado'},{v:'no',l:'No pre-aprobado'}].map(o => (
                          <button key={o.v} className={'opcion-card'+(form.pre_aprobado===o.v?' selected':'')} onClick={() => set('pre_aprobado', o.v)}>
                            <div style={{ fontSize:14, fontWeight:500 }}>{o.l}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.pre_aprobado === 'si' && (
                      <div>
                        <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Banco pre-aprobador</label>
                        <input className="oferta-input" placeholder="Ej. BCR, BAC, BN, Scotiabank..." value={form.banco} onChange={e => set('banco', e.target.value)}/>
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Monto de prima (USD)</label>
                      <input className="oferta-input" placeholder="Ej. 50,000" value={form.monto_prima} onChange={e => set('monto_prima', e.target.value)}/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 3: Condiciones especiales */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:4 }}>Condiciones especiales</div>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:20 }}>Peticiones o condiciones del comprador para cerrar el trato.</p>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Condiciones o peticiones del comprador</label>
                <textarea className="oferta-input" placeholder="Ej. Solicita que se pinte la fachada antes del cierre. Requiere que se incluyan los electrodomésticos. Necesita que se elimine la estructura del jardín..." value={form.condiciones} onChange={e => set('condiciones', e.target.value)} rows={4} style={{ resize:'vertical', minHeight:100 }}/>
              </div>

              {/* Resumen */}
              <div style={{ background:'var(--bg)', border:'1px solid var(--rule)', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Resumen de la oferta</div>
                {[
                  { l:'Comprador', v:form.comprador_nombre },
                  { l:'Oferta', v:'$'+parseFloat(form.valor_oferta||'0').toLocaleString()+' USD ('+pct+'% del precio lista)' },
                  { l:'Tipo de compra', v:form.tipo_compra === 'contado' ? 'Contado — '+(form.forma_pago||'forma por definir') : 'Crédito — '+(form.pre_aprobado==='si'?'Pre-aprobado en '+(form.banco||'banco'):'Sin pre-aprobación') },
                  form.monto_prima ? { l:'Prima', v:'$'+parseFloat(form.monto_prima).toLocaleString()+' USD' } : null,
                  form.condiciones ? { l:'Condiciones', v:form.condiciones } : null,
                ].filter(Boolean).map((r:any) => (
                  <div key={r.l} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                    <span style={{ color:'var(--ink-3)', width:100, flexShrink:0 }}>{r.l}</span>
                    <span style={{ color:'var(--ink)', fontWeight:500 }}>{r.v}</span>
                  </div>
                ))}
              </div>

              {error && <div style={{ marginTop:12, padding:'10px 14px', background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, fontSize:13, color:'oklch(0.45 0.08 20)' }}>{error}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--rule)', display:'flex', gap:10, flexShrink:0 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s-1)} style={{ flex:1, padding:'12px', borderRadius:999, border:'1px solid var(--rule)', background:'transparent', fontSize:14, cursor:'pointer', fontFamily:'var(--sans)' }}>
              ← Anterior
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step===1 && !form.comprador_nombre) { setError('El nombre del comprador es obligatorio.'); return }
                if (step===2 && (!form.valor_oferta || !form.tipo_compra)) { setError('Completá el valor y tipo de compra.'); return }
                setError(''); setStep(s => s+1)
              }}
              style={{ flex:2, padding:'12px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--sans)' }}>
              Continuar →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ flex:2, padding:'12px', borderRadius:999, background:'var(--accent)', color:'white', border:'none', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--sans)', opacity:loading?0.7:1 }}>
              {loading ? 'Enviando...' : 'Enviar oferta al propietario →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
