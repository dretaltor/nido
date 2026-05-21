'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface VisitaFormProps {
  propiedadId: string
  propiedadTitulo: string
  asesorEmail: string
  asesorWhatsapp?: string
  onClose: () => void
  onSuccess: () => void
}

export function VisitaForm({ propiedadId, propiedadTitulo, asesorEmail, asesorWhatsapp, onClose, onSuccess }: VisitaFormProps) {
  const [form, setForm] = useState({
    comprador_nombre: '', comprador_telefono: '', comprador_email: '',
    fecha: '', hora: '10:00', tipo: 'presencial', notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const guardar = async () => {
    if (!form.comprador_nombre || !form.comprador_telefono || !form.fecha) {
      setError('Nombre, teléfono y fecha son obligatorios.'); return
    }
    setLoading(true); setError('')

    const { error: err } = await supabase.from('visitas').insert({
      propiedad_id: propiedadId,
      propiedad_titulo: propiedadTitulo,
      asesor_email: asesorEmail,
      asesor_whatsapp: asesorWhatsapp,
      comprador_nombre: form.comprador_nombre,
      comprador_telefono: form.comprador_telefono,
      comprador_email: form.comprador_email,
      fecha: form.fecha,
      hora: form.hora,
      tipo: form.tipo,
      notas: form.notas,
    })

    if (err) { setError('Error al agendar.'); setLoading(false); return }

    // Notify both parties immediately
    const fechaFmt = new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-CR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    
    const msgAsesor = `📅 *Visita agendada NIDO*\n\nPropiedad: ${propiedadTitulo}\nComprador: ${form.comprador_nombre}\nTeléfono: ${form.comprador_telefono}\nFecha: ${fechaFmt}\nHora: ${form.hora}\nTipo: ${form.tipo === 'virtual' ? 'Virtual' : 'Presencial'}${form.notas ? '\nNotas: ' + form.notas : ''}`
    
    const msgComprador = `🏠 *Visita confirmada NIDO*\n\nTu visita fue confirmada:\n\nPropiedad: ${propiedadTitulo}\nFecha: ${fechaFmt}\nHora: ${form.hora}\nTipo: ${form.tipo === 'virtual' ? 'Virtual — recibirás el link' : 'Presencial'}\n\nTe enviaremos un recordatorio 24 horas antes.`

    await Promise.all([
      asesorWhatsapp ? fetch('/api/wa-send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: asesorWhatsapp, message: msgAsesor }) }) : Promise.resolve(),
      form.comprador_telefono ? fetch('/api/wa-send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: form.comprador_telefono, message: msgComprador }) }) : Promise.resolve(),
    ])

    setLoading(false)
    onSuccess()
  }

  const CSS = `
    .v-input{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:14px;font-family:var(--sans);outline:none}
    .v-input:focus{border-color:var(--accent)}
    .v-label{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-3);display:block;margin-bottom:6px}
    .v-btn{padding:11px 24px;border-radius:999px;font-size:14px;font-weight:500;cursor:pointer;border:none;font-family:var(--sans)}
  `

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="v-label">Nombre comprador *</label>
            <input className="v-input" placeholder="María Rodríguez" value={form.comprador_nombre} onChange={e => set('comprador_nombre', e.target.value)}/>
          </div>
          <div>
            <label className="v-label">Teléfono *</label>
            <input className="v-input" placeholder="8888-8888" value={form.comprador_telefono} onChange={e => set('comprador_telefono', e.target.value)}/>
          </div>
        </div>
        <div>
          <label className="v-label">Correo (opcional)</label>
          <input className="v-input" type="email" placeholder="comprador@correo.com" value={form.comprador_email} onChange={e => set('comprador_email', e.target.value)}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="v-label">Fecha *</label>
            <input className="v-input" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} min={new Date().toISOString().split('T')[0]}/>
          </div>
          <div>
            <label className="v-label">Hora</label>
            <input className="v-input" type="time" value={form.hora} onChange={e => set('hora', e.target.value)}/>
          </div>
        </div>
        <div>
          <label className="v-label">Tipo de visita</label>
          <div style={{ display:'flex', gap:10 }}>
            {['presencial','virtual'].map(t => (
              <div key={t} onClick={() => set('tipo', t)} style={{ flex:1, padding:'10px', border:'2px solid '+(form.tipo===t?'var(--accent)':'var(--rule)'), borderRadius:8, textAlign:'center', cursor:'pointer', fontSize:13, background:form.tipo===t?'var(--accent-tint)':'white', fontWeight:form.tipo===t?500:400 }}>
                {t === 'presencial' ? '🏠 Presencial' : '💻 Virtual'}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="v-label">Notas (opcional)</label>
          <textarea className="v-input" rows={2} placeholder="Instrucciones, dirección exacta, etc." value={form.notas} onChange={e => set('notas', e.target.value)} style={{ resize:'vertical' }}/>
        </div>

        {error && <div style={{ fontSize:13, color:'oklch(0.45 0.08 20)', background:'oklch(0.97 0.03 20)', padding:'10px 14px', borderRadius:8 }}>{error}</div>}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} className="v-btn" style={{ background:'transparent', border:'1px solid var(--rule)', color:'var(--ink-2)' }}>Cancelar</button>
          <button onClick={guardar} disabled={loading} className="v-btn" style={{ background:'var(--ink)', color:'white', opacity:loading?0.5:1 }}>
            {loading ? 'Agendando...' : 'Agendar visita →'}
          </button>
        </div>
      </div>
    </div>
  )
}
