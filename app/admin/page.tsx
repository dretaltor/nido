'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { getPlanConfig } from '../../lib/planes'
import type {
  Perfil, Propietario, Propiedad, Contrato, Comision, SoporteTicket, SoporteMensaje, Referido,
  AdminAuditLog, AdminMetricas, Admin, ResumenComisiones, Suscripcion, Lead, Json, ReferidoPagoMensual, Oficina, CursoCompra, AlertaBusqueda,
  Oferta, Calificacion, Noticia, Equipo, EquipoMiembro, ValeriaBitacora, Visita,
} from '../../lib/database.types'

// Item polimórfico seleccionado en el drawer lateral: puede ser un asesor, propietario,
// propiedad, contrato, comisión, ticket o referido. Se define como un objeto plano con
// todos los campos posibles opcionales (en vez de una intersección de las interfaces reales)
// porque intersectar tipos con el mismo nombre de campo pero distinta nulabilidad entre
// entidades colapsa el tipo de forma incorrecta. `_tipo` distingue de cuál entidad viene.
type SelItem = {
  acepta_colaboracion?: boolean
  activo?: boolean | null
  amenidades?: Json | null
  anotaciones?: string | null
  area_registral?: number | null
  asesor_email?: string
  asesor_nombre?: string | null
  asesor_whatsapp?: string | null
  asunto?: string | null
  banos?: number | null
  canal?: string
  canton?: string | null
  cedula?: string | null
  cedula_frente_url?: string | null
  cedula_reverso_url?: string | null
  codigo_corredor?: string | null
  codigo_referido?: string | null
  codigo_usado?: string
  colaborador_email?: string | null
  colaborador_nombre?: string | null
  colindancias?: string | null
  comision_porcentaje?: number | null
  compania?: string | null
  contrato_asesor_aceptado?: boolean | null
  contrato_asesor_aceptado_at?: string | null
  contrato_equipo_nido_aceptado?: boolean | null
  contrato_equipo_nido_aceptado_at?: string | null
  correo?: string
  creado_por?: string | null
  es_fundador?: boolean | null
  descuento_pct?: number | null
  created_at?: string | null
  cuota_condominal?: number | null
  descripcion?: string | null
  direccion?: string | null
  disponible?: boolean | null
  distrito?: string | null
  equipo_nido_estado?: string | null
  es_equipo_nido?: boolean | null
  es_trial?: boolean | null
  estacionamientos?: number | null
  estado?: string | null
  fecha_cierre_estimada?: string | null
  fecha_cierre_real?: string | null
  fecha_inicio?: string | null
  fecha_vencimiento?: string | null
  firma_tipo?: string | null
  firma_url?: string | null
  firmado_at?: string | null
  firmado_nido?: boolean | null
  firmado_propietario?: boolean | null
  foto_url?: string | null
  fotos?: Json | null
  gravamenes?: string | null
  habitaciones?: number | null
  id?: string
  imagen_url?: string | null
  libre_gravamenes?: boolean | null
  lote_m2?: number | null
  metros?: number | null
  monto_asesor?: number | null
  monto_colaborador_split?: number | null
  monto_comision?: number | null
  monto_nido?: number | null
  monto_principal?: number | null
  naturaleza?: string | null
  nombre?: string | null
  notas?: string | null
  notas_admin?: string | null
  numero_finca?: string | null
  numero_plano?: string | null
  operacion?: string
  pagado_asesor?: boolean | null
  pagado_asesor_at?: string | null
  periodo?: string | null
  periodo_dias?: number | null
  plan?: string | null
  porcentaje_colaborador?: number | null
  porcentaje_comision?: number | null
  porcentaje_principal?: number | null
  precio?: number
  precio_anterior?: number | null
  precio_mensual?: number | null
  precio_venta?: number | null
  prioridad?: string
  propiedad_id?: string | null
  propiedad_ref?: string | null
  propiedad_titulo?: string | null
  propiedad_zona?: string | null
  propietario_correo?: string
  propietario_email?: string | null
  propietario_nombre?: string | null
  provincia?: string | null
  recompensa_monto?: number | null
  recompensa_tipo?: string
  recompensa_pct?: number | null
  recompensa_meses_max?: number | null
  meses_pagados?: number
  ref_id?: string | null
  referido_email?: string
  referido_nombre?: string | null
  referido_por?: string | null
  referido_tipo?: string
  referidor_email?: string
  referidor_tipo?: string
  relacion?: string
  selfie_url?: string | null
  solicita_equipo_nido?: boolean | null
  split_confirmado_colaborador?: boolean | null
  split_registrado_at?: string | null
  suspendido?: boolean
  telefono?: string | null
  terreno_tipo?: string | null
  tipo?: string | null
  titulo?: string
  topografia?: string | null
  trial_fin?: string | null
  updated_at?: string | null
  user_id?: string | null
  uso_suelo?: string | null
  usuario_email?: string
  usuario_nombre?: string | null
  usuario_telefono?: string | null
  usuario_tipo?: string
  valeria_onboarding_completo?: boolean | null
  valeria_perfil?: Json | null
  verificacion_estado?: string | null
  verificacion_notas?: string | null
  verificado?: boolean | null
  verificado_at?: string | null
  verificado_por?: string | null
  visita_agendada?: boolean | null
  visita_fecha?: string | null
  visita_tipo?: string | null
  whatsapp?: string | null
  zona?: string
  _tipo?: string
  _sus?: Suscripcion
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .sidebar-link{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.15s;border:none;background:transparent;width:100%;text-align:left;font-family:var(--sans)}
  .sidebar-link:hover{background:rgba(255,255,255,0.06);color:white}
  .sidebar-link.active{background:rgba(255,255,255,0.1);color:white}
  .card{background:white;border:1px solid var(--rule);border-radius:12px}
  .card-pad{padding:20px 24px}
  .badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:500}
  .tab{padding:7px 16px;border-radius:999px;border:1px solid var(--rule);font-size:12px;cursor:pointer;transition:all 0.15s;background:transparent;font-family:var(--sans)}
  .tab.active{background:var(--ink);color:white;border-color:var(--ink)}
  .row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--rule-soft);cursor:pointer;transition:background 0.15s}
  .row:hover{background:var(--bg-elev)}
  .row:last-child{border-bottom:none}
  .drawer{position:fixed;top:0;right:0;bottom:0;width:500px;background:white;border-left:1px solid var(--rule);z-index:200;overflow-y:auto;box-shadow:-8px 0 40px rgba(0,0,0,0.12)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199}
  .field{width:100%;padding:10px 14px;border:1px solid var(--rule);border-radius:8px;font-size:13px;font-family:var(--sans);outline:none;transition:border-color 0.2s;box-sizing:border-box}
  .field:focus{border-color:var(--accent)}
  .btn{padding:10px 20px;border-radius:999px;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--sans);transition:all 0.2s}
  .btn-primary{background:var(--accent);color:white}
  .btn-primary:hover{background:oklch(0.38 0.06 150)}
  .btn-dark{background:var(--ink);color:white}
  .btn-danger{background:oklch(0.45 0.08 20);color:white}
  .btn-outline{background:transparent;border:1px solid var(--rule);color:var(--ink-2)}
  @media(max-width:900px){.sidebar{display:none!important}.main-content{margin-left:0!important}}
`

const MODULES = [
  { id:'dashboard', icon:'◈', label:'Dashboard' },
  { id:'asesores', icon:'👥', label:'Asesores afiliados' },
  { id:'propietarios', icon:'🏠', label:'Propietarios' },
  { id:'propiedades', icon:'🗂', label:'Propiedades' },
  { id:'leads', icon:'📥', label:'Leads' },
  { id:'ofertas', icon:'💼', label:'Ofertas' },
  { id:'suscripciones', icon:'💳', label:'Suscripciones' },
  { id:'kyc', icon:'🪪', label:'Verificaciones KYC' },
  { id:'mensajes', icon:'✉', label:'Mensajes internos' },
  { id:'soporte', icon:'🎫', label:'Soporte' },
  { id:'resenas', icon:'★', label:'Reseñas' },
  { id:'referidos', icon:'🤝', label:'Referidos' },
  { id:'atribucion', icon:'📊', label:'Atribución' },
  { id:'inteligencia', icon:'🧠', label:'Inteligencia de mercado' },
  { id:'kyc_propietarios', icon:'🏠', label:'KYC Propietarios' },
  { id:'contratos', icon:'📋', label:'Contratos' },
  { id:'comisiones', icon:'💰', label:'Comisiones' },
  { id:'oficinas', icon:'🏢', label:'Oficinas afiliadas' },
  { id:'cursos_compras', icon:'🎓', label:'Cursos individuales' },
  { id:'equipo_nido', icon:'⭐', label:'Equipo NIDO' },
  { id:'equipos_asesores', icon:'🧩', label:'Equipos de asesores' },
  { id:'noticias', icon:'📰', label:'Noticias' },
  { id:'valeria_actividad', icon:'🤖', label:'Actividad de Valeria' },
  { id:'actividad', icon:'🕐', label:'Actividad de admins' },
  { id:'administradores', icon:'🔑', label:'Administradores' },
]

// Convierte un arreglo de objetos planos a un archivo CSV y dispara la descarga en el
// navegador. Se usa desde varios módulos (asesores, propiedades, comisiones, leads) para
// exportar sin depender de una librería externa.
function exportarCSV(filas: Record<string, unknown>[], nombreArchivo: string) {
  if (filas.length === 0) return
  const columnas = Object.keys(filas[0])
  const escapar = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const csv = [columnas.join(','), ...filas.map(f => columnas.map(c => escapar(f[c])).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

// Botón de exportar reutilizable — recibe la función que arma las filas para no calcular
// nada hasta que el admin realmente hace clic.
function BotonExportarCSV({ filas, nombreArchivo }: { filas: () => Record<string, unknown>[]; nombreArchivo: string }) {
  return (
    <button onClick={() => exportarCSV(filas(), nombreArchivo)} style={{ padding:'10px 16px', borderRadius:999, border:'1px solid var(--rule)', background:'white', fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>
      ⤓ Exportar CSV
    </button>
  )
}

export default function AdminPanel() {
  const router = useRouter()
  const [modulo, setModulo] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<AdminMetricas | null>(null)
  const [asesores, setAsesores] = useState<Perfil[]>([])
  const [propietarios, setPropietarios] = useState<Propietario[]>([])
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [resumenComisiones, setResumenComisiones] = useState<ResumenComisiones[]>([])
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [tickets, setTickets] = useState<SoporteTicket[]>([])
  const [referidos, setReferidos] = useState<Referido[]>([])
  const [pagosMensuales, setPagosMensuales] = useState<ReferidoPagoMensual[]>([])
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [oficinaSel, setOficinaSel] = useState<Oficina | null>(null)
  const [nuevaOficina, setNuevaOficina] = useState({ nombre:'', contacto_nombre:'', contacto_email:'', telefono:'', asientos_contratados:'1' })
  const [creandoOficina, setCreandoOficina] = useState(false)
  const [emailAsignar, setEmailAsignar] = useState('')
  const [cursosCompras, setCursosCompras] = useState<CursoCompra[]>([])
  const [alertasBusqueda, setAlertasBusqueda] = useState<AlertaBusqueda[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [waLogs, setWaLogs] = useState<{ id: string; from_number: string | null; message: string | null; reply: string | null; wa_send_ok: boolean | null; wa_send_error: string | null; user_type: string | null; user_name: string | null; created_at: string }[]>([])
  const [reintentandoWa, setReintentandoWa] = useState<string | null>(null)
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [auditoria, setAuditoria] = useState<AdminAuditLog[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [equipoMiembros, setEquipoMiembros] = useState<EquipoMiembro[]>([])
  const [valeriaBitacora, setValeriaBitacora] = useState<ValeriaBitacora[]>([])
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [sel, setSel] = useState<SelItem | null>(null)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaGlobal, setBusquedaGlobal] = useState('')
  const [kycSeleccionados, setKycSeleccionados] = useState<string[]>([])
  const [aprobandoLote, setAprobandoLote] = useState(false)
  const [filtroSus, setFiltroSus] = useState('pendientes')
  const [susSeleccionadas, setSusSeleccionadas] = useState<string[]>([])
  const [activandoLote, setActivandoLote] = useState(false)
  const [msg, setMsg] = useState('')
  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [modalNuevoAsesor, setModalNuevoAsesor] = useState(false)
  const [nuevoAsesor, setNuevoAsesor] = useState({ nombre:'', correo:'', telefono:'', plan:'gratis', activarTrial:true, esFundador:false })
  const [creandoAsesor, setCreandoAsesor] = useState(false)
  const [errorNuevoAsesor, setErrorNuevoAsesor] = useState('')
  const [linkClaveNuevoAsesor, setLinkClaveNuevoAsesor] = useState('')

  // Cada consulta se envuelve para que un fallo puntual (timeout de red, tabla momentáneamente
  // inaccesible) nunca tumbe las otras dieciocho -- antes esto era un solo Promise.all: si
  // cualquiera de las consultas rechazaba la promesa (no solo devolvía {error}, sino que la
  // llamada fetch subyacente lanzaba), el panel entero se quedaba en "Cargando..." para
  // siempre, sin mensaje ni forma de reintentar. safe() nunca rechaza: en el peor caso
  // devuelve {data:null, error}, así que Promise.all(...) siempre resuelve.
  const safe = async <T,>(nombre: string, q: PromiseLike<{ data: T | null; error: { message?: string } | null }>) => {
    try {
      const r = await q
      return { nombre, data: r.data, error: r.error }
    } catch (err) {
      return { nombre, data: null as T | null, error: err as { message?: string } }
    }
  }

  const loadAll = async () => {
    const [met, as, pr, pp, sus, coms, cons, tks, refs, pagosRef, lds, audit, adms, ofs, ccs, alts, wal, ofertasR, califsR, noticiasR, equiposR, equipoMiembrosR, valeriaR, visitasR] = await Promise.all([
      safe('metricas', supabase.from('admin_metricas').select('*').maybeSingle()),
      safe('asesores', supabase.from('perfiles').select('id,nombre,correo,telefono,cedula,foto_url,verificado,verificacion_estado,verificacion_notas,verificado_at,plan,solicita_equipo_nido,equipo_nido_estado,contrato_equipo_nido_aceptado,contrato_asesor_aceptado,valeria_onboarding_completo,cedula_frente_url,cedula_reverso_url,selfie_url,compania,created_at,referido_por,suspendido').order('created_at', { ascending: false })),
      safe('propietarios', supabase.from('propietarios').select('id,nombre,correo,telefono,cedula,verificado,verificacion_estado,verificacion_notas,verificado_at,created_at,referido_por,suspendido').order('created_at', { ascending: false })),
      safe('propiedades', supabase.from('propiedades').select('id,ref_id,titulo,descripcion,tipo,precio,precio_anterior,zona,provincia,canton,distrito,direccion,disponible,verificacion_estado,verificacion_notas,verificado_at,verificado_por,asesor_email,asesor_nombre,asesor_whatsapp,acepta_colaboracion,propietario_email,habitaciones,banos,metros,lote_m2,estacionamientos,numero_finca,numero_plano,naturaleza,area_registral,colindancias,gravamenes,anotaciones,libre_gravamenes,fotos,created_at').order('created_at', { ascending: false })),
      safe('suscripciones', supabase.from('suscripciones').select('id,correo,plan,activo,es_trial,trial_fin,created_at,updated_at').order('created_at', { ascending: false })),
      safe('comisiones', supabase.from('comisiones').select('*').order('created_at', { ascending: false })),
      safe('contratos', supabase.from('contratos').select('id,propietario_correo,propietario_nombre,propiedad_id,tipo,estado,fecha_inicio,fecha_vencimiento,firmado_propietario,firmado_nido,firmado_at,firma_tipo,firma_url,created_at').order('created_at', { ascending: false })),
      safe('tickets', supabase.from('soporte_tickets').select('*').order('updated_at', { ascending: false })),
      safe('referidos', supabase.from('referidos').select('*').order('created_at', { ascending: false })),
      safe('pagos_referidos', supabase.from('referidos_pago_mensual').select('*')),
      safe('leads', supabase.from('leads').select('id,nombre,email,telefono,mensaje,zona_interes,fuente,estado,created_at,presupuesto,tipo_busqueda,asignado_automaticamente,asesor_email,archivado').order('created_at', { ascending: false })),
      safe('auditoria', supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)),
      safe('admins', supabase.from('admins').select('*').order('created_at', { ascending: false })),
      safe('oficinas', supabase.from('oficinas').select('*').order('created_at', { ascending: false })),
      safe('cursos', supabase.from('cursos_compras').select('*').order('created_at', { ascending: false })),
      safe('alertas', supabase.from('alertas_busqueda').select('*').order('created_at', { ascending: false })),
      safe('wa_logs', supabase.from('whatsapp_logs').select('id, from_number, message, reply, wa_send_ok, wa_send_error, user_type, user_name, created_at').gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString()).order('created_at', { ascending: false }).limit(1000)),
      safe('ofertas', supabase.from('ofertas').select('*').order('created_at', { ascending: false })),
      safe('calificaciones', supabase.from('calificaciones').select('*').order('created_at', { ascending: false })),
      safe('noticias', supabase.from('noticias').select('*').order('created_at', { ascending: false })),
      safe('equipos', supabase.from('equipos').select('*').order('created_at', { ascending: false })),
      safe('equipo_miembros', supabase.from('equipo_miembros').select('*')),
      safe('valeria_bitacora', supabase.from('valeria_bitacora').select('*').order('created_at', { ascending: false }).limit(500)),
      safe('visitas', supabase.from('visitas').select('id,propiedad_id,asesor_email,comprador_nombre,fecha,estado,resultado,created_at').order('created_at', { ascending: false }).limit(2000)),
    ])
    setMetricas(met.data)
    // Estas queries seleccionan solo un subconjunto de columnas (no '*'), por eso el cast:
    // la forma real en runtime es un subconjunto válido del tipo completo de la fila.
    setAsesores((as.data || []) as unknown as Perfil[])
    setPropietarios((pr.data || []) as unknown as Propietario[])
    setPropiedades((pp.data || []) as unknown as Propiedad[])
    setSuscripciones((sus.data || []) as unknown as Suscripcion[])
    setComisiones(coms.data || [])
    setContratos((cons.data || []) as unknown as Contrato[])
    setTickets(tks.data || [])
    setReferidos(refs.data || [])
    setPagosMensuales(pagosRef.data || [])
    setLeads((lds.data || []) as unknown as Lead[])
    setAuditoria(audit.data || [])
    setAdmins(adms.data || [])
    setOficinas(ofs.data || [])
    setCursosCompras(ccs.data || [])
    setAlertasBusqueda(alts.data || [])
    setWaLogs(wal.data || [])
    setOfertas(ofertasR.data || [])
    setCalificaciones(califsR.data || [])
    setNoticias(noticiasR.data || [])
    setEquipos(equiposR.data || [])
    setEquipoMiembros(equipoMiembrosR.data || [])
    setValeriaBitacora(valeriaR.data || [])
    setVisitas((visitasR.data || []) as unknown as Visita[])
    const fallidas = [met, as, pr, pp, sus, coms, cons, tks, refs, pagosRef, lds, audit, adms, ofs, ccs, alts, wal, ofertasR, califsR, noticiasR, equiposR, equipoMiembrosR, valeriaR, visitasR].filter(r => r.error)
    setLoadErrors(fallidas.map(r => r.nombre))
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/admin/login'; return }
      const { data: admin } = await supabase.from('admins').select('*').eq('correo', user.email!).maybeSingle()
      if (!admin) { window.location.href = '/admin/login'; return }
      setAdminUser(user)
      loadAll()
    })
  }, [])

  const logAccion = async (accion: string, entidadTipo?: string, entidadId?: string, detalle?: string) => {
    await supabase.from('admin_audit_log').insert({
      admin_email: adminUser?.email || 'desconocido',
      accion, entidad_tipo: entidadTipo || null, entidad_id: entidadId || null, detalle: detalle || null,
    }).then(() => {}, () => {})
  }

  const crearAsesor = async () => {
    setCreandoAsesor(true)
    setErrorNuevoAsesor('')
    setLinkClaveNuevoAsesor('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/crear-asesor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session?.access_token },
      body: JSON.stringify(nuevoAsesor),
    })
    const json = await res.json()
    setCreandoAsesor(false)
    if (!res.ok) { setErrorNuevoAsesor(json.error || 'Error creando el asesor'); return }
    logAccion('Creó asesor manualmente', 'asesor', json.id, nuevoAsesor.correo)
    setLinkClaveNuevoAsesor(json.linkClave || '')
    loadAll()
    setMsg('✓ Asesor creado: ' + nuevoAsesor.correo)
    setTimeout(() => setMsg(''), 4000)
  }

  const cambiarPlan = async (correo: string, plan: string) => {
    await supabase.from('suscripciones').upsert({ correo, plan, activo: true, updated_at: new Date().toISOString() }, { onConflict: 'correo' })
    logAccion('Cambió plan', 'suscripcion', correo, 'Nuevo plan: ' + plan)
    loadAll()
    setMsg('✓ Plan actualizado a ' + plan)
    setTimeout(() => setMsg(''), 3000)
  }

  // Programa "asesor fundador": para un asesor que ya se registró solo (no
  // creado desde el admin), otorga el mismo beneficio -- trial extendido a
  // 21 días (si todavía no pagó) + 20% de descuento permanente. Si ya es una
  // suscripción activa y paga, solo marca el descuento para el próximo cobro
  // manual, sin tocar el plan ni la fecha de trial.
  const marcarFundador = async (correo: string) => {
    const sus = suscripciones.find(s => s.correo === correo)
    const payload: Record<string, unknown> = { correo, es_fundador: true, descuento_pct: 20, updated_at: new Date().toISOString() }
    if (!sus?.activo) {
      const trialFin = new Date()
      trialFin.setDate(trialFin.getDate() + 21)
      payload.plan = 'enterprise'
      payload.activo = true
      payload.es_trial = true
      payload.trial_fin = trialFin.toISOString()
    }
    await supabase.from('suscripciones').upsert(payload, { onConflict: 'correo' })
    logAccion('Marcó como asesor fundador', 'suscripcion', correo, '')
    loadAll()
    setMsg('⭐ ' + correo + ' marcado como asesor fundador')
    setTimeout(() => setMsg(''), 3000)
  }

  // Activa una suscripcion pendiente (pago manual ya confirmado por el equipo,
  // ver comprobante recibido por WhatsApp) sin tocar el plan que el asesor ya
  // eligio al registrarse.
  const activarSuscripcion = async (correo: string) => {
    await supabase.from('suscripciones').update({ activo: true, es_trial: false, updated_at: new Date().toISOString() }).eq('correo', correo)
    logAccion('Activó suscripción', 'suscripcion', correo)
  }

  const activarSuscripcionesLote = async (correos: string[]) => {
    setActivandoLote(true)
    for (const correo of correos) {
      await activarSuscripcion(correo)
    }
    logAccion('Activó suscripciones en lote', 'suscripcion', undefined, correos.length + ' cuentas')
    setSusSeleccionadas([])
    setActivandoLote(false)
    loadAll()
    setMsg('✓ ' + correos.length + ' suscripcion' + (correos.length > 1 ? 'es activadas' : ' activada'))
    setTimeout(() => setMsg(''), 3000)
  }

  const togglePropiedad = async (id: string, disponible: boolean) => {
    await supabase.from('propiedades').update({ disponible: !disponible }).eq('id', id)
    logAccion(disponible ? 'Ocultó propiedad' : 'Publicó propiedad', 'propiedad', id)
    loadAll()
  }

  const verificarPropiedad = async (id: string, aprobar: boolean, notas?: string) => {
    const { data: prop } = await supabase.from('propiedades').select('titulo,asesor_email,asesor_nombre,asesor_whatsapp,zona,tipo,operacion,precio').eq('id', id).maybeSingle()
    await supabase.from('propiedades').update({
      verificacion_estado: aprobar ? 'aprobada' : 'rechazada',
      verificacion_notas: notas || null,
      disponible: aprobar,
      verificado_por: adminUser?.email,
      verificado_at: new Date().toISOString(),
    }).eq('id', id)
    logAccion(aprobar ? 'Aprobó propiedad' : 'Rechazó propiedad', 'propiedad', id, prop?.titulo)
    if (aprobar && prop?.asesor_email) {
      const { data: { session: ses1 } } = await supabase.auth.getSession()
      fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses1?.access_token}, body: JSON.stringify({
        to: prop.asesor_email,
        tipo: 'propiedad_aprobada',
        data: { asesor_nombre: prop.asesor_nombre, propiedad: prop.titulo, propiedad_id: id, asesor_telefono: prop.asesor_whatsapp }
      }) }).catch(() => {})
    }
    // Alertas de busqueda guardada: avisar a quien guardo una busqueda que coincide con esta propiedad
    if (aprobar && prop) {
      try {
        const { data: matches } = await supabase.rpc('alertas_match_propiedad', {
          p_zona: prop.zona, p_tipo: prop.tipo, p_operacion: prop.operacion, p_precio: prop.precio,
        })
        if (matches && matches.length > 0) {
          const { data: { session: ses5 } } = await supabase.auth.getSession()
          await Promise.all(matches.map((m: { id: string; email: string }) =>
            fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
              to: m.email,
              tipo: 'alerta_nueva_propiedad',
              data: { titulo: prop.titulo, zona: prop.zona, precio: prop.precio, link: 'https://www.nido-cr.com/propiedades/'+id, bajaLink: 'https://www.nido-cr.com/alertas/baja/'+m.id }
            }) }).catch(() => {})
          ))
          await supabase.from('alertas_busqueda').update({ ultima_notificacion_at: new Date().toISOString() }).in('id', matches.map((m: { id: string; email: string }) => m.id))
        }
      } catch {}
    }
    loadAll()
    setMsg(aprobar ? '✓ Propiedad aprobada y publicada' : '✓ Propiedad rechazada')
    setSel(null)
  }

  const aprobarKYC = async (id: string, aprobar: boolean, notas?: string) => {
    const { data: asesorRow } = await supabase.from('perfiles').select('nombre,correo,telefono').eq('id', id).maybeSingle()
    await supabase.from('perfiles').update({
      verificado: aprobar,
      verificacion_estado: aprobar ? 'aprobado' : 'rechazado',
      verificacion_notas: notas || null,
      verificado_at: new Date().toISOString(),
    }).eq('id', id)
    if (asesorRow?.correo) {
      const { data: { session: ses2 } } = await supabase.auth.getSession()
      if (aprobar) {
        fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses2?.access_token}, body: JSON.stringify({
          to: asesorRow.correo,
          tipo: 'kyc_aprobado',
          data: { nombre: asesorRow.nombre, asesor_telefono: asesorRow.telefono }
        }) }).catch(() => {})
      }
      fetch('/api/whatsapp-notify', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses2?.access_token}, body: JSON.stringify({
        correo: asesorRow.correo,
        tipo: aprobar ? 'kyc_aprobado' : 'kyc_rechazado',
        data: { notas: notas || undefined }
      }) }).catch(() => {})
    }
    logAccion(aprobar ? 'Aprobó KYC' : 'Rechazó KYC', 'asesor', id, asesorRow?.correo)
    loadAll()
    setSel((p: SelItem | null) => p ? {...p, verificado: aprobar, verificacion_estado: aprobar ? 'aprobado' : 'rechazado'} : null)
  }

  const responderEquipoNido = async (asesor: Perfil, aprobar: boolean) => {
    await supabase.from('perfiles').update({
      equipo_nido_estado: aprobar ? 'aprobado' : 'rechazado',
    }).eq('id', asesor.id)
    logAccion(aprobar ? 'Aprobó en Equipo NIDO' : 'Rechazó de Equipo NIDO', 'asesor', asesor.id, asesor.correo)

    // Si se aprueba, activar automaticamente plan Black (enterprise) gratis
    if (aprobar) {
      await supabase.from('suscripciones').upsert({
        correo: asesor.correo,
        plan: 'enterprise',
        activo: true,
        es_trial: false,
        trial_fin: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'correo' })
    }

    setAsesores(prev => prev.map((a: Perfil) => a.id===asesor.id ? {...a, equipo_nido_estado: aprobar?'aprobado':'rechazado'} : a))
    const { data: { session: ses3 } } = await supabase.auth.getSession()
    fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ses3?.access_token}, body: JSON.stringify({
      to: asesor.correo,
      tipo: aprobar ? 'equipo_nido_aprobado' : 'mensaje_admin',
      data: aprobar
        ? { nombre: asesor.nombre, asesor_telefono: asesor.telefono }
        : { nombre: asesor.nombre, asunto: 'Solicitud Equipo NIDO', mensaje: 'Gracias por tu interés en el Equipo NIDO. Por ahora no podemos avanzar con tu solicitud, pero podés seguir trabajando como asesor independiente en la plataforma.' }
    }) }).catch(() => {})
  }

  const suspenderCuenta = async (tabla: 'perfiles'|'propietarios', id: string, correo: string, suspender: boolean) => {
    await supabase.from(tabla).update({ suspendido: suspender }).eq('id', id)
    logAccion(suspender ? 'Suspendió cuenta' : 'Reactivó cuenta', tabla==='perfiles'?'asesor':'propietario', id, correo)
    if (tabla === 'perfiles') setAsesores(prev => prev.map((a: Perfil) => a.id===id ? {...a, suspendido: suspender} : a))
    else setPropietarios(prev => prev.map((p: Propietario) => p.id===id ? {...p, suspendido: suspender} : p))
    setSel((p: SelItem | null) => p ? {...p, suspendido: suspender} : null)
    setMsg(suspender ? '✓ Cuenta suspendida' : '✓ Cuenta reactivada')
    setTimeout(() => setMsg(''), 3000)
  }

  const aprobarKYCLote = async (ids: string[]) => {
    setAprobandoLote(true)
    for (const id of ids) {
      await aprobarKYC(id, true)
    }
    logAccion('Aprobó KYC en lote', 'asesor', undefined, ids.length + ' asesores')
    setKycSeleccionados([])
    setAprobandoLote(false)
    setMsg('✓ ' + ids.length + ' asesor' + (ids.length>1?'es':'') + ' aprobado' + (ids.length>1?'s':''))
    setTimeout(() => setMsg(''), 3000)
  }

  const editarPropiedad = async (id: string, patch: Partial<Propiedad>) => {
    await supabase.from('propiedades').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    logAccion('Editó propiedad', 'propiedad', id, Object.keys(patch).join(', '))
    loadAll()
    setSel((p: SelItem | null) => p ? {...p, ...patch} : null)
    setMsg('✓ Propiedad actualizada')
    setTimeout(() => setMsg(''), 3000)
  }

  const actualizarComision = async (id: string, patch: Partial<Comision>) => {
    await supabase.from('comisiones').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    logAccion('Actualizó comisión', 'comision', id, JSON.stringify(patch))
    loadAll()
    setSel((p: SelItem | null) => p ? {...p, ...patch} : null)
    setMsg('✓ Comisión actualizada')
    setTimeout(() => setMsg(''), 3000)
  }

  const actualizarReferido = async (id: string, estado: string, recompensaMonto?: number | null, notas?: string, recompensaTipo?: string, recompensaPct?: number | null, recompensaMesesMax?: number | null) => {
    const cambios = {
      estado,
      recompensa_monto: recompensaMonto ?? null,
      notas_admin: notas || null,
      recompensa_tipo: recompensaTipo || 'unico',
      recompensa_pct: recompensaTipo === 'recurrente_pct' ? (recompensaPct ?? null) : null,
      recompensa_meses_max: recompensaTipo === 'recurrente_pct' ? (recompensaMesesMax ?? null) : null,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('referidos').update(cambios).eq('id', id)
    logAccion('Actualizó referido', 'referido', id, 'Estado: ' + estado)
    loadAll()
    setSel((p: SelItem | null) => p ? {...p, ...cambios} : null)
    setMsg('✓ Referido actualizado')
    setTimeout(() => setMsg(''), 3000)
  }

  const marcarMesPagado = async (referidoId: string, mesesPagadosActuales: number) => {
    await supabase.from('referidos').update({ meses_pagados: mesesPagadosActuales + 1, updated_at: new Date().toISOString() }).eq('id', referidoId)
    logAccion('Registró pago mensual de referido', 'referido', referidoId, 'Mes ' + (mesesPagadosActuales + 1) + ' liquidado')
    setPagosMensuales(prev => prev.filter(p => p.referido_id !== referidoId))
    setMsg('✓ Pago del mes registrado')
    setTimeout(() => setMsg(''), 3000)
  }

  const crearOficina = async () => {
    if (!nuevaOficina.nombre.trim() || !nuevaOficina.contacto_email.trim()) return
    setCreandoOficina(true)
    const { data } = await supabase.from('oficinas').insert({
      nombre: nuevaOficina.nombre.trim(),
      contacto_nombre: nuevaOficina.contacto_nombre.trim() || null,
      contacto_email: nuevaOficina.contacto_email.trim(),
      telefono: nuevaOficina.telefono.trim() || null,
      asientos_contratados: Number(nuevaOficina.asientos_contratados) || 1,
    }).select().maybeSingle()
    if (data) {
      logAccion('Creó oficina afiliada', 'oficina', data.id, data.nombre)
      setOficinas(prev => [data as Oficina, ...prev])
      setNuevaOficina({ nombre:'', contacto_nombre:'', contacto_email:'', telefono:'', asientos_contratados:'1' })
      setMsg('✓ Oficina creada')
      setTimeout(() => setMsg(''), 3000)
      const { data: { session: sesOficina } } = await supabase.auth.getSession()
      fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+sesOficina?.access_token}, body: JSON.stringify({
        to: data.contacto_email,
        tipo: 'oficina_bienvenida',
        data: { nombre: data.nombre, contacto_nombre: data.contacto_nombre, contacto_email: data.contacto_email, asientos_contratados: data.asientos_contratados }
      }) }).catch(() => {})
    }
    setCreandoOficina(false)
  }

  const actualizarEstadoOficina = async (id: string, estado: string) => {
    await supabase.from('oficinas').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    logAccion('Actualizó estado de oficina', 'oficina', id, 'Estado: ' + estado)
    setOficinas(prev => prev.map(o => o.id === id ? {...o, estado} : o))
    setOficinaSel(prev => prev && prev.id === id ? {...prev, estado} : prev)
  }

  const asignarAsesorAOficina = async (oficinaId: string) => {
    if (!emailAsignar.trim()) return
    const { data: perfil } = await supabase.from('perfiles').select('id,correo').eq('correo', emailAsignar.trim()).maybeSingle()
    if (!perfil) { setMsg('No encontré un asesor con ese correo'); setTimeout(() => setMsg(''), 3000); return }
    await supabase.from('perfiles').update({ oficina_id: oficinaId }).eq('id', perfil.id)
    logAccion('Asignó asesor a oficina', 'oficina', oficinaId, perfil.correo)
    setAsesores(prev => prev.map(a => a.id === perfil.id ? {...a, oficina_id: oficinaId} : a))
    setEmailAsignar('')
    setMsg('✓ Asesor asignado a la oficina')
    setTimeout(() => setMsg(''), 3000)
  }

  const quitarAsesorDeOficina = async (asesorId: string, oficinaId: string) => {
    await supabase.from('perfiles').update({ oficina_id: null }).eq('id', asesorId)
    logAccion('Quitó asesor de oficina', 'oficina', oficinaId, asesorId)
    setAsesores(prev => prev.map(a => a.id === asesorId ? {...a, oficina_id: null} : a))
  }

  const actualizarCursoCompra = async (id: string, estado: string) => {
    await supabase.from('cursos_compras').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    logAccion('Actualizó compra de curso', 'curso_compra', id, 'Estado: ' + estado)
    setCursosCompras(prev => prev.map(c => c.id === id ? {...c, estado} : c))
    setMsg('✓ Solicitud actualizada')
    setTimeout(() => setMsg(''), 3000)
  }

  // Archivar en vez de borrar: los leads de formularios públicos anónimos no tenían
  // ninguna forma de limpiarse del sistema (spam, duplicados, pruebas) sin perder el
  // historial. Archivar solo los saca de la vista por defecto.
  const archivarLead = async (id: string, archivado: boolean) => {
    await supabase.from('leads').update({ archivado }).eq('id', id)
    logAccion(archivado ? 'Archivó lead' : 'Desarchivó lead', 'lead', id)
    setLeads(prev => prev.map(l => l.id === id ? {...l, archivado} : l))
    setMsg(archivado ? '✓ Lead archivado' : '✓ Lead restaurado')
    setTimeout(() => setMsg(''), 3000)
  }

  const ocultarResena = async (id: string, oculta: boolean) => {
    await supabase.from('calificaciones').update({ oculta }).eq('id', id)
    logAccion(oculta ? 'Ocultó reseña' : 'Restauró reseña', 'calificacion', id)
    setCalificaciones(prev => prev.map(c => c.id === id ? {...c, oculta} : c))
    setMsg(oculta ? '✓ Reseña oculta' : '✓ Reseña visible de nuevo')
    setTimeout(() => setMsg(''), 3000)
  }

  const actualizarNoticia = async (id: string, cambios: Partial<Noticia>) => {
    await supabase.from('noticias').update(cambios).eq('id', id)
    logAccion('Editó noticia', 'noticia', id, cambios.activa !== undefined ? (cambios.activa ? 'Publicada' : 'Despublicada') : 'Contenido editado')
    setNoticias(prev => prev.map(n => n.id === id ? {...n, ...cambios} : n))
    setMsg('✓ Noticia actualizada')
    setTimeout(() => setMsg(''), 3000)
  }

  // Reintento manual de un envio de WhatsApp fallido: la causa mas comun (token de Meta
  // vencido) ya se detecta y avisa por correo (ver Inteligencia de mercado), pero hasta ahora
  // la unica forma de reintentar el mensaje puntual era entrando a la base de datos a mano.
  const reintentarWhatsApp = async (id: string) => {
    setReintentandoWa(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/reintentar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session?.access_token },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setWaLogs(prev => prev.map(w => w.id === id ? { ...w, wa_send_error: json.error || 'No se pudo reenviar' } : w))
        setMsg('✗ ' + (json.error || 'No se pudo reenviar el mensaje'))
      } else {
        setWaLogs(prev => prev.map(w => w.id === id ? { ...w, wa_send_ok: true, wa_send_error: null } : w))
        logAccion('Reintentó envío de WhatsApp', 'whatsapp_logs', id)
        setMsg('✓ Mensaje reenviado')
      }
    } catch {
      setMsg('✗ No se pudo reenviar el mensaje')
    } finally {
      setReintentandoWa(null)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const enviarMensaje = async (correo: string, asunto: string, mensaje: string) => {
    const { data: { session: ses4 } } = await supabase.auth.getSession()
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ses4?.access_token },
      body: JSON.stringify({ to: correo, tipo: 'mensaje_admin', data: { asunto, mensaje } })
    })
    setMsg('✓ Mensaje enviado a ' + correo)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#060D08',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif'}}>Cargando backoffice...</div>

  const mrrPro = suscripciones.filter(s => s.activo && s.plan === 'pro' && s.periodo === 'mensual').length * getPlanConfig('pro').precioMensual
  const mrrEnterprise = suscripciones.filter(s => s.activo && s.plan === 'enterprise' && s.periodo === 'mensual').length * getPlanConfig('enterprise').precioMensual
  const mrr = mrrPro + mrrEnterprise

  const q = busquedaGlobal.trim().toLowerCase()
  const resultadosGlobal = q.length < 2 ? [] : [
    ...asesores.filter((a: Perfil) => (a.nombre||'').toLowerCase().includes(q) || (a.correo||'').toLowerCase().includes(q)).slice(0,5).map((a: Perfil) => ({ tipo:'Asesor', label:a.nombre||a.correo, sub:a.correo, onClick:() => { setModulo(a.equipo_nido_estado==='aprobado'?'equipo_nido':'asesores'); setSel({...a,_tipo:'asesor'}) } })),
    ...propietarios.filter((p: Propietario) => (p.nombre||'').toLowerCase().includes(q) || (p.correo||'').toLowerCase().includes(q)).slice(0,5).map((p: Propietario) => ({ tipo:'Propietario', label:p.nombre||p.correo, sub:p.correo, onClick:() => { setModulo('propietarios'); setSel({...p,_tipo:'propietario'}) } })),
    ...propiedades.filter((p: Propiedad) => (p.titulo||'').toLowerCase().includes(q) || (p.zona||'').toLowerCase().includes(q) || (p.asesor_email||'').toLowerCase().includes(q)).slice(0,5).map((p: Propiedad) => ({ tipo:'Propiedad', label:p.titulo, sub:p.zona, onClick:() => { setModulo('propiedades'); setSel({...p,_tipo:'propiedad'}) } })),
    ...tickets.filter((t: SoporteTicket) => (t.asunto||'').toLowerCase().includes(q) || (t.usuario_email||'').toLowerCase().includes(q) || (t.usuario_nombre||'').toLowerCase().includes(q)).slice(0,5).map((t: SoporteTicket) => ({ tipo:'Ticket', label:t.asunto||'Consulta de soporte', sub:t.usuario_email, onClick:() => { setModulo('soporte'); setSel({...t,_tipo:'ticket'}) } })),
  ]

  return (
    <main style={{ fontFamily:'var(--sans)', minHeight:'100vh', background:'var(--bg)', color:'var(--ink)', display:'flex' }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside className="sidebar" style={{ width:220, background:'var(--ink)', position:'fixed', top:0, left:0, bottom:0, display:'flex', flexDirection:'column', zIndex:50 }}>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', marginBottom:2 }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></div>
          <div style={{ fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Backoffice Admin</div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {MODULES.map(m => (
            <button key={m.id} className={'sidebar-link'+(modulo===m.id?' active':'')} onClick={() => { setModulo(m.id); setSel(null); setFiltro('todos'); setBusqueda('') }}>
              <span style={{ fontSize:14 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{adminUser?.email}</div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/admin/login')} style={{ fontSize:12, color:'rgba(255,255,255,0.3)', background:'none', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:999, cursor:'pointer', width:'100%' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ marginLeft:220, flex:1, padding:'32px', minHeight:'100vh' }}>

        {msg && <div style={{ position:'fixed', top:20, right:20, background:'var(--accent)', color:'white', padding:'10px 20px', borderRadius:999, fontSize:13, fontWeight:500, zIndex:300, boxShadow:'0 4px 20px rgba(27,94,59,0.3)' }}>{msg}</div>}

        {loadErrors.length > 0 && (
          <div style={{ background:'oklch(0.95 0.05 30)', border:'1px solid oklch(0.85 0.08 30)', borderRadius:12, padding:'12px 18px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, color:'oklch(0.42 0.1 30)' }}>⚠️ No se pudieron cargar algunas secciones ({loadErrors.join(', ')}) — el resto del panel sigue funcionando con lo que sí cargó.</span>
            <button onClick={() => { setLoading(true); loadAll() }} style={{ padding:'6px 14px', borderRadius:999, border:'1px solid oklch(0.7 0.1 30)', background:'white', fontSize:12, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>Reintentar</button>
          </div>
        )}

        {/* ── BÚSQUEDA GLOBAL ── */}
        <div style={{ position:'relative', maxWidth:420, marginBottom:24, marginLeft:'auto' }}>
          <input
            value={busquedaGlobal}
            onChange={e => setBusquedaGlobal(e.target.value)}
            placeholder="🔍 Buscar asesor, propietario, propiedad, ticket..."
            className="field"
          />
          {resultadosGlobal.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', border:'1px solid var(--rule)', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.1)', zIndex:250, overflow:'hidden' }}>
              {resultadosGlobal.map((r, i) => (
                <div key={i} className="row" style={{ padding:'10px 16px' }} onClick={() => { r.onClick(); setBusquedaGlobal('') }}>
                  <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', flexShrink:0 }}>{r.tipo}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.label}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {q.length >= 2 && resultadosGlobal.length === 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', border:'1px solid var(--rule)', borderRadius:10, padding:'14px 16px', fontSize:13, color:'var(--ink-3)', zIndex:250 }}>Sin resultados.</div>
          )}
        </div>

        {/* ── DASHBOARD ── */}
        {modulo === 'dashboard' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Resumen general</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(28px,3vw,40px)', fontWeight:400 }}>Dashboard <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
            </div>

            {/* MRR destacado */}
            <div style={{ background:'var(--ink)', borderRadius:16, padding:'28px 32px', marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
              {[
                { label:'MRR Total', val:'$'+mrr.toLocaleString(), sub:'Ingresos recurrentes mensuales', big:true },
                { label:'MRR '+getPlanConfig('pro').nombrePublico, val:'$'+mrrPro.toLocaleString(), sub:suscripciones.filter(s=>s.activo&&s.plan==='pro').length+' asesores '+getPlanConfig('pro').nombrePublico },
                { label:'MRR '+getPlanConfig('enterprise').nombrePublico, val:'$'+mrrEnterprise.toLocaleString(), sub:suscripciones.filter(s=>s.activo&&s.plan==='enterprise').length+' asesores '+getPlanConfig('enterprise').nombrePublico },
              ].map((s,i) => (
                <div key={i} style={{ borderLeft: i>0?'1px solid rgba(255,255,255,0.08)':'none', paddingLeft: i>0?24:0 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize: s.big?48:36, color:'white', lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Pendientes de atención */}
            {(() => {
              const hoy = new Date()
              const en15dias = new Date(hoy.getTime() + 15*24*60*60*1000)
              const contratosPorVencer = contratos.filter((c: Contrato) => c.estado === 'activo' && c.fecha_vencimiento && new Date(c.fecha_vencimiento) >= hoy && new Date(c.fecha_vencimiento) <= en15dias)
              const pendientes = [
                { n:asesores.filter((a: Perfil)=>!a.verificado && [a.cedula_frente_url,a.cedula_reverso_url,a.selfie_url].filter(Boolean).length>0).length, label:'KYC de asesores por revisar', modulo:'kyc' },
                { n:propietarios.filter((p: Propietario)=>!p.verificado && [p.cedula_frente_url,p.cedula_reverso_url,p.selfie_url].filter(Boolean).length>0).length, label:'KYC de propietarios por revisar', modulo:'kyc_propietarios' },
                { n:propiedades.filter((p: Propiedad)=>p.verificacion_estado==='pendiente_verificacion').length, label:'Propiedades por verificar', modulo:'propiedades', filtro:'pendiente_verificacion' },
                { n:tickets.filter((t: SoporteTicket)=>t.estado==='abierto').length, label:'Tickets de soporte abiertos', modulo:'soporte' },
                { n:asesores.filter((a: Perfil)=>a.solicita_equipo_nido && a.equipo_nido_estado!=='aprobado' && a.equipo_nido_estado!=='rechazado').length, label:'Solicitudes de Equipo NIDO', modulo:'equipo_nido' },
                { n:contratos.filter((c: Contrato)=>c.estado==='pendiente').length, label:'Contratos por contrafirmar', modulo:'contratos' },
                { n:contratosPorVencer.length, label:'Contratos por vencer (15 días)', modulo:'contratos' },
                { n:ofertas.filter((o: Oferta)=>o.estado==='pendiente').length, label:'Ofertas por revisar', modulo:'ofertas' },
                { n:valeriaBitacora.filter((v: ValeriaBitacora)=>v.requiere_aprobacion && v.aprobado===null).length, label:'Acciones de Valeria sin resolver', modulo:'valeria_actividad' },
              ].filter(p => p.n > 0)
              if (pendientes.length === 0) return (
                <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'18px 22px', marginBottom:20, fontSize:13, color:'var(--accent)', fontWeight:500 }}>
                  ✓ Todo al día — no hay nada pendiente de atención.
                </div>
              )
              return (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Pendientes de atención</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                    {pendientes.map(p => (
                      <button key={p.label} onClick={() => { setModulo(p.modulo); if (p.filtro) setFiltro(p.filtro) }} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'14px 16px', background:'oklch(0.97 0.03 50)', border:'1px solid oklch(0.88 0.05 50)', borderRadius:10, cursor:'pointer', textAlign:'left' }}>
                        <span style={{ fontSize:13, color:'oklch(0.40 0.06 50)', fontWeight:500 }}>{p.label}</span>
                        <span style={{ fontFamily:'var(--serif)', fontSize:22, color:'oklch(0.45 0.08 50)' }}>{p.n}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Asesores totales', val:metricas?.total_asesores||0, sub:'en la plataforma', color:'var(--ink)' },
                { label:'Propiedades activas', val:metricas?.propiedades_activas||0, sub:'publicadas hoy', color:'var(--accent)' },
                { label:'Asesores verificados', val:metricas?.asesores_verificados||0, sub:'KYC aprobado', color:'oklch(0.42 0.06 150)' },
                { label:'KYC pendientes', val:metricas?.kyc_pendientes||0, sub:'por revisar', color:'oklch(0.52 0.08 50)' },
              ].map((m,i) => (
                <div key={i} className="card card-pad" style={{ animation:'fadeUp 0.4s ease '+(i*0.08)+'s both' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:40, color:m.color, marginBottom:4 }}>{m.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Últimos asesores */}
              <div className="card">
                <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>Últimos asesores</span>
                  <button onClick={() => setModulo('asesores')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todos →</button>
                </div>
                {asesores.slice(0,5).map(a => (
                  <div key={a.id} className="row" onClick={() => { setModulo('asesores'); setSel(a) }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:14, color:'var(--accent)', flexShrink:0 }}>{(a.nombre||'?')[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{a.nombre||'Sin nombre'}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>{a.correo}</div>
                    </div>
                    <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':'var(--ink-3)' }}>{a.verificado?'✓ Verificado':'Pendiente'}</span>
                  </div>
                ))}
              </div>

              {/* Suscripciones activas */}
              <div className="card">
                <div className="card-pad" style={{ borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>Suscripciones activas</span>
                  <button onClick={() => setModulo('suscripciones')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todas →</button>
                </div>
                {suscripciones.filter(s=>s.activo).slice(0,5).map(s => (
                  <div key={s.id} className="row">
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{s.correo}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.periodo}</div>
                    </div>
                    <span className="badge" style={{ background:s.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:s.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{getPlanConfig(s.plan).nombrePublico}</span>
                    <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)', marginLeft:8 }}>${getPlanConfig(s.plan).precioMensual}/mes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ASESORES ── */}
        {modulo === 'asesores' && (() => {
          const asesoresFiltrados = asesores
            .filter(a => a.equipo_nido_estado !== 'aprobado')
            .filter(a => filtro==='todos' || (filtro==='verificado'?a.verificado:a.verificacion_estado===filtro||(!a.verificacion_estado&&filtro==='pendiente')))
            .filter(a => !busqueda || (a.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.correo||'').toLowerCase().includes(busqueda.toLowerCase()))
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Asesores <em style={{ fontStyle:'italic', color:'var(--accent)' }}>afiliados.</em></h1>
                <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>Asesores independientes. Los miembros de Equipo NIDO viven en su propio apartado →</p>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar asesor..." className="field" style={{ width:220 }}/>
                <BotonExportarCSV nombreArchivo="asesores.csv" filas={() => asesoresFiltrados.map(a => ({ nombre:a.nombre, correo:a.correo, telefono:a.telefono, plan:suscripciones.find(s=>s.correo===a.correo&&s.activo)?.plan||'', verificado:a.verificado, verificacion_estado:a.verificacion_estado, suspendido:a.suspendido, created_at:a.created_at }))}/>
                <button onClick={() => { setModalNuevoAsesor(true); setErrorNuevoAsesor(''); setLinkClaveNuevoAsesor(''); setNuevoAsesor({ nombre:'', correo:'', telefono:'', plan:'gratis', activarTrial:true, esFundador:false }) }} style={{ padding:'10px 18px', borderRadius:999, background:'var(--ink)', color:'white', border:'none', fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>
                  + Nuevo asesor
                </button>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','verificado','en_revision','pendiente'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>

            <div className="card">
              {asesoresFiltrados
                .map(a => {
                  const sus = suscripciones.find(s => s.correo === a.correo && s.activo)
                  return (
                    <div key={a.id} className="row" onClick={() => setSel({...a, _tipo:'asesor', _sus:sus})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', overflow:'hidden', display:'grid', placeItems:'center', flexShrink:0 }}>
                        {a.foto_url ? <img src={a.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <span style={{ fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)' }}>{(a.nombre||'?')[0]}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} {a.telefono?'· '+a.telefono:''}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                        {sus && <span className="badge" style={{ background:sus.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:sus.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{getPlanConfig(sus.plan).nombrePublico}</span>}
                        <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':'var(--ink-3)' }}>
                          {a.verificado?'✓ Verificado':a.verificacion_estado||'Pendiente'}
                        </span>
                        {a.suspendido && <span className="badge" style={{ background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }}>⛔</span>}
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
          )
        })()}

        {modalNuevoAsesor && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:24 }} onClick={() => setModalNuevoAsesor(false)}>
            <div className="card" style={{ maxWidth:440, width:'100%', padding:28 }} onClick={e => e.stopPropagation()}>
              {linkClaveNuevoAsesor ? (
                <>
                  <div style={{ fontSize:16, fontWeight:500, marginBottom:8 }}>✓ Asesor creado</div>
                  <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6, marginBottom:14 }}>
                    Enviale este link para que defina su propia contraseña e ingrese a NIDO:
                  </p>
                  <div style={{ background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:8, padding:'10px 12px', fontSize:12, wordBreak:'break-all', marginBottom:16 }}>
                    {linkClaveNuevoAsesor}
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => { navigator.clipboard.writeText(linkClaveNuevoAsesor) }} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--rule)', background:'var(--bg)', cursor:'pointer', fontSize:13 }}>Copiar link</button>
                    <button onClick={() => setModalNuevoAsesor(false)} style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'var(--ink)', color:'white', cursor:'pointer', fontSize:13 }}>Cerrar</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:16, fontWeight:500, marginBottom:16 }}>Crear nuevo asesor</div>
                  {errorNuevoAsesor && (
                    <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'oklch(0.45 0.08 20)', fontSize:13 }}>{errorNuevoAsesor}</div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
                    <input className="field" placeholder="Nombre completo" value={nuevoAsesor.nombre} onChange={e => setNuevoAsesor({...nuevoAsesor, nombre:e.target.value})}/>
                    <input className="field" type="email" placeholder="Correo electrónico" value={nuevoAsesor.correo} onChange={e => setNuevoAsesor({...nuevoAsesor, correo:e.target.value})}/>
                    <input className="field" placeholder="Teléfono (opcional)" value={nuevoAsesor.telefono} onChange={e => setNuevoAsesor({...nuevoAsesor, telefono:e.target.value})}/>
                    <select className="field" value={nuevoAsesor.plan} onChange={e => setNuevoAsesor({...nuevoAsesor, plan:e.target.value})}>
                      <option value="gratis">Despega</option>
                      <option value="pro">Elite</option>
                      <option value="enterprise">Black</option>
                    </select>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--ink-2)' }}>
                      <input type="checkbox" checked={nuevoAsesor.activarTrial} onChange={e => setNuevoAsesor({...nuevoAsesor, activarTrial:e.target.checked})}/>
                      Activar de inmediato con trial Black de {nuevoAsesor.esFundador ? '21' : '7'} días
                    </label>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--accent)', background:'var(--accent-tint)', padding:'8px 10px', borderRadius:8 }}>
                      <input type="checkbox" checked={nuevoAsesor.esFundador} onChange={e => setNuevoAsesor({...nuevoAsesor, esFundador:e.target.checked})}/>
                      ⭐ Asesor fundador (trial de 21 días + 20% de descuento permanente)
                    </label>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setModalNuevoAsesor(false)} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--rule)', background:'var(--bg)', cursor:'pointer', fontSize:13 }}>Cancelar</button>
                    <button onClick={crearAsesor} disabled={creandoAsesor || !nuevoAsesor.nombre.trim() || !nuevoAsesor.correo.trim()} style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'var(--accent)', color:'white', cursor:'pointer', fontSize:13, opacity: creandoAsesor?0.6:1 }}>
                      {creandoAsesor ? 'Creando...' : 'Crear asesor'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PROPIETARIOS ── */}
        {modulo === 'propietarios' && (() => {
          const propietariosFiltrados = propietarios
            .filter(p => filtro==='todos' || (filtro==='suspendido' ? p.suspendido : p.verificacion_estado===filtro||(!p.verificacion_estado&&filtro==='pendiente')))
            .filter(p => !busqueda || (p.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (p.correo||'').toLowerCase().includes(busqueda.toLowerCase()))
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Propietarios <em style={{ fontStyle:'italic', color:'var(--accent)' }}>afiliados.</em></h1>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar propietario..." className="field" style={{ width:220 }}/>
                <BotonExportarCSV nombreArchivo="propietarios.csv" filas={() => propietariosFiltrados.map(p => ({ nombre:p.nombre, correo:p.correo, telefono:p.telefono, cedula:p.cedula, verificado:p.verificado, verificacion_estado:p.verificacion_estado, suspendido:p.suspendido, created_at:p.created_at }))}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','verificado','en_revision','pendiente','suspendido'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div className="card">
              {propietariosFiltrados.map(p => (
                <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'propietario'})}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'oklch(0.93 0.03 240)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'oklch(0.35 0.08 240)', flexShrink:0 }}>{(p.nombre||'?')[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.correo} · {p.relacion||'Propietario'}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {p.suspendido && <span className="badge" style={{ background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }}>⛔</span>}
                    <span style={{ fontSize:12, color:'var(--ink-3)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('es-CR') : '—'}</span>
                    <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                  </div>
                </div>
              ))}
              {propietariosFiltrados.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay propietarios que coincidan.</div>}
            </div>
          </div>
          )
        })()}

        {/* ── PROPIEDADES ── */}
        {modulo === 'propiedades' && (() => {
          const propiedadesFiltradas = propiedades
            .filter(p => filtro==='todos' || p.verificacion_estado===filtro)
            .filter(p => !busqueda || (p.titulo||'').toLowerCase().includes(busqueda.toLowerCase()) || (p.zona||'').toLowerCase().includes(busqueda.toLowerCase()))
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Inventario</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Propiedades <em style={{ fontStyle:'italic', color:'var(--accent)' }}>totales.</em></h1>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar propiedad..." className="field" style={{ width:220 }}/>
                <BotonExportarCSV nombreArchivo="propiedades.csv" filas={() => propiedadesFiltradas.map(p => ({ titulo:p.titulo, ref_id:p.ref_id, zona:p.zona, tipo:p.tipo, precio:p.precio, asesor_email:p.asesor_email, disponible:p.disponible, verificacion_estado:p.verificacion_estado, created_at:p.created_at }))}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','pendiente_verificacion','aprobada','rechazada','borrador'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todas':f==='pendiente_verificacion'?'Por verificar':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?propiedades.length:propiedades.filter(p=>p.verificacion_estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {propiedadesFiltradas.map(p => (
                <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'propiedad'})}>
                  <div style={{ width:48, height:40, borderRadius:6, background:'var(--bg)', overflow:'hidden', flexShrink:0, display:'grid', placeItems:'center', fontSize:18 }}>🏠</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.zona} · {p.asesor_email} · {p.ref_id||'—'}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)' }}>${Number(p.precio||0).toLocaleString()}</span>
                    <span className="badge" style={{ background:p.disponible?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:p.disponible?'var(--accent)':'var(--ink-3)' }}>{p.disponible?'Activa':'Pausada'}</span>
                    <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                  </div>
                </div>
              ))}
              {propiedadesFiltradas.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay propiedades con ese filtro.</div>}
            </div>
          </div>
          )
        })()}

        {/* ── LEADS ── */}
        {modulo === 'leads' && (() => {
          const leadsFiltrados = leads
            .filter(l => filtro==='todos' ? !l.archivado : filtro==='archivados' ? l.archivado : (l.estado===filtro && !l.archivado))
            .filter(l => !busqueda || (l.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (l.email||'').toLowerCase().includes(busqueda.toLowerCase()) || (l.asesor_email||'').toLowerCase().includes(busqueda.toLowerCase()))
          const activos = leads.filter(l => !l.archivado)
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>CRM</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Leads <em style={{ fontStyle:'italic', color:'var(--accent)' }}>captados.</em></h1>
                <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>Todos los leads de formularios públicos, calculadoras y WhatsApp — antes solo visibles agregados en Atribución.</p>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar lead o asesor..." className="field" style={{ width:220 }}/>
                <BotonExportarCSV nombreArchivo="leads.csv" filas={() => leadsFiltrados.map(l => ({ nombre:l.nombre, email:l.email, telefono:l.telefono, zona_interes:l.zona_interes, presupuesto:l.presupuesto, fuente:l.fuente, estado:l.estado, asesor_email:l.asesor_email, created_at:l.created_at }))}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','nuevo','contactado','archivados'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Activos':f==='archivados'?'Archivados':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?activos.length:f==='archivados'?leads.filter(l=>l.archivado).length:activos.filter(l=>l.estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {leadsFiltrados.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay leads con ese filtro.</div>}
              {leadsFiltrados.map((l: Lead) => (
                <div key={l.id} className="row" style={{ cursor:'default' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(l.nombre||'?')[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{l.nombre||'Sin nombre'}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.email||l.telefono||'—'} · {l.zona_interes||'sin zona'} · {l.fuente||'sin fuente'} {l.asesor_email?'· asesor: '+l.asesor_email:''}</div>
                  </div>
                  <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', flexShrink:0 }}>{l.estado||'nuevo'}</span>
                  <span style={{ fontSize:11, color:'var(--ink-3)', flexShrink:0 }}>{l.created_at ? new Date(l.created_at).toLocaleDateString('es-CR') : '—'}</span>
                  <button onClick={() => archivarLead(l.id, !l.archivado)} style={{ fontSize:12, color: l.archivado ? 'var(--accent)' : 'oklch(0.5 0.1 20)', background:'none', border:'1px solid var(--rule)', borderRadius:999, padding:'5px 12px', cursor:'pointer', flexShrink:0 }}>
                    {l.archivado ? 'Restaurar' : 'Archivar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          )
        })()}

        {/* ── OFERTAS ── */}
        {modulo === 'ofertas' && (() => {
          const ESTADOS_OF: Record<string,{bg:string,color:string,label:string}> = {
            pendiente: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Pendiente' },
            aceptada: { bg:'var(--accent-tint)', color:'var(--accent)', label:'Aceptada' },
            rechazada: { bg:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)', label:'Rechazada' },
            contraoferta: { bg:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', label:'Contraoferta' },
          }
          const ofertasFiltradas = ofertas.filter(o => filtro==='todos' || o.estado===filtro)
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Pipeline de cierre</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Ofertas <em style={{ fontStyle:'italic', color:'var(--accent)' }}>recibidas.</em></h1>
                <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>Ofertas formales de compradores por una propiedad — antes sin ninguna visibilidad desde el backoffice.</p>
              </div>
              <BotonExportarCSV nombreArchivo="ofertas.csv" filas={() => ofertasFiltradas.map(o => ({ propiedad_id:o.propiedad_id, asesor:o.asesor_email, comprador:o.comprador_nombre, valor_oferta:o.valor_oferta, tipo_compra:o.tipo_compra, forma_pago:o.forma_pago, pre_aprobado:o.pre_aprobado, estado:o.estado, created_at:o.created_at }))}/>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','pendiente','contraoferta','aceptada','rechazada'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todas':ESTADOS_OF[f]?.label||f}
                  <span style={{ marginLeft:6, opacity:0.6 }}>({f==='todos'?ofertas.length:ofertas.filter(o=>o.estado===f).length})</span>
                </button>
              ))}
            </div>
            <div className="card">
              {ofertasFiltradas.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay ofertas con ese filtro.</div>}
              {ofertasFiltradas.map((o: Oferta) => {
                const prop = propiedades.find(p => p.id === o.propiedad_id)
                const est = ESTADOS_OF[o.estado||'pendiente'] || ESTADOS_OF.pendiente
                return (
                  <div key={o.id} className="row" style={{ cursor:'default' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{prop?.titulo || o.propiedad_id || 'Propiedad'}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{o.comprador_nombre} · {o.asesor_email} · {o.tipo_compra}{o.pre_aprobado ? ' · pre-aprobado' : ''}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:500, marginBottom:4 }}>${Number(o.valor_oferta||0).toLocaleString()}</div>
                      <span className="badge" style={{ background:est.bg, color:est.color }}>{est.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )
        })()}

        {/* ── SUSCRIPCIONES ── */}
        {modulo === 'suscripciones' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Facturación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Suscripciones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>activas.</em></h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'MRR Total', val:'$'+mrr.toLocaleString(), sub:'mensual recurrente' },
                { label:'Suscripciones activas', val:suscripciones.filter(s=>s.activo).length, sub:'asesores pagos' },
                { label:'ARR estimado', val:'$'+(mrr*12).toLocaleString(), sub:'ingresos anuales' },
              ].map((s,i) => (
                <div key={i} className="card card-pad">
                  <div style={{ fontFamily:'var(--serif)', fontSize:36, color:'var(--accent)', marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            {(() => {
              const pendientes = suscripciones.filter(s => !s.activo && !s.es_trial)
              const susFiltradas = filtroSus === 'pendientes' ? pendientes : filtroSus === 'activas' ? suscripciones.filter(s => s.activo) : suscripciones
              return (
                <>
                  <div style={{ display:'flex', gap:8, marginBottom:16, justifyContent:'space-between', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {['pendientes','activas','todas'].map(f => (
                        <button key={f} className={'tab'+(filtroSus===f?' active':'')} onClick={() => { setFiltroSus(f); setSusSeleccionadas([]) }}>
                          {f==='pendientes'?'Pendientes de activación':f==='activas'?'Activas':'Todas'}
                          <span style={{ marginLeft:6, opacity:0.6 }}>
                            ({f==='pendientes'?pendientes.length:f==='activas'?suscripciones.filter(s=>s.activo).length:suscripciones.length})
                          </span>
                        </button>
                      ))}
                    </div>
                    {susSeleccionadas.length > 0 && (
                      <button onClick={() => activarSuscripcionesLote(susSeleccionadas)} disabled={activandoLote} className="btn btn-primary" style={{ opacity:activandoLote?0.6:1 }}>
                        {activandoLote ? 'Activando...' : '✓ Activar ' + susSeleccionadas.length + ' seleccionada' + (susSeleccionadas.length>1?'s':'')}
                      </button>
                    )}
                  </div>
                  {filtroSus === 'pendientes' && pendientes.length > 0 && (
                    <div style={{ marginBottom:10 }}>
                      <label style={{ fontSize:12, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                        <input type="checkbox" checked={susSeleccionadas.length===pendientes.length} onChange={e => setSusSeleccionadas(e.target.checked ? pendientes.map(s=>s.correo) : [])}/>
                        Seleccionar todas las pendientes
                      </label>
                    </div>
                  )}
                  <div className="card">
                    {susFiltradas.map(s => (
                      <div key={s.id} className="row" onClick={() => setSel({...s, _tipo:'suscripcion'})}>
                        {filtroSus === 'pendientes' && (
                          <input type="checkbox" checked={susSeleccionadas.includes(s.correo)} onClick={e => e.stopPropagation()} onChange={e => setSusSeleccionadas(p => e.target.checked ? [...p, s.correo] : p.filter(c => c !== s.correo))} style={{ marginRight:12 }}/>
                        )}
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{s.correo}</div>
                          <div style={{ fontSize:12, color:'var(--ink-3)' }}>{s.periodo} · {s.created_at ? new Date(s.created_at).toLocaleDateString('es-CR') : '—'}</div>
                        </div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                          <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--accent)' }}>${getPlanConfig(s.plan).precioMensual}/mes</span>
                          <span className="badge" style={{ background:s.plan==='enterprise'?'oklch(0.93 0.03 240)':'var(--accent-tint)', color:s.plan==='enterprise'?'oklch(0.35 0.08 240)':'var(--accent)', textTransform:'uppercase' }}>{getPlanConfig(s.plan).nombrePublico}</span>
                          <span className="badge" style={{ background:s.activo?'var(--accent-tint)':'oklch(0.93 0.005 80)', color:s.activo?'var(--accent)':'var(--ink-3)' }}>{s.activo?'Activa':(s.es_trial?'Trial':'Pendiente')}</span>
                          {!s.activo && !s.es_trial && (
                            <button onClick={async e => { e.stopPropagation(); await activarSuscripcion(s.correo); loadAll(); setMsg('✓ Suscripción activada'); setTimeout(()=>setMsg(''),3000) }} className="btn btn-primary" style={{ padding:'4px 12px', fontSize:12 }}>Activar</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {susFiltradas.length === 0 && (
                      <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>No hay suscripciones en esta vista.</div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* ── KYC ── */}
        {modulo === 'kyc' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Identidad</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Verificaciones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>KYC.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, justifyContent:'space-between', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['todos','en_revision','pendiente','aprobado','rechazado'].map(f => (
                  <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => { setFiltro(f); setKycSeleccionados([]) }}>
                    {f==='todos'?'Todos':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                    <span style={{ marginLeft:6, opacity:0.6 }}>
                      ({f==='todos'?asesores.length:asesores.filter(a=>f==='en_revision'?a.verificacion_estado==='en_revision':f==='pendiente'?(!a.verificacion_estado||a.verificacion_estado==='pendiente'):a.verificacion_estado===f).length})
                    </span>
                  </button>
                ))}
              </div>
              {kycSeleccionados.length > 0 && (
                <button onClick={() => aprobarKYCLote(kycSeleccionados)} disabled={aprobandoLote} className="btn btn-primary" style={{ opacity:aprobandoLote?0.6:1 }}>
                  {aprobandoLote ? 'Aprobando...' : '✓ Aprobar ' + kycSeleccionados.length + ' seleccionado' + (kycSeleccionados.length>1?'s':'')}
                </button>
              )}
            </div>
            <div className="card">
              {asesores
                .filter(a => filtro==='todos'||(filtro==='en_revision'?a.verificacion_estado==='en_revision':filtro==='pendiente'?(!a.verificacion_estado||a.verificacion_estado==='pendiente'):a.verificacion_estado===filtro))
                .map(a => {
                  const docs = [a.cedula_frente_url,a.cedula_reverso_url,a.selfie_url].filter(Boolean).length
                  const completo = docs === 3 && !a.verificado
                  const marcado = kycSeleccionados.includes(a.id)
                  return (
                    <div key={a.id} className="row" onClick={() => setSel({...a, _tipo:'kyc'})}>
                      {completo && (
                        <input
                          type="checkbox"
                          checked={marcado}
                          onClick={e => e.stopPropagation()}
                          onChange={() => setKycSeleccionados(prev => marcado ? prev.filter(id => id!==a.id) : [...prev, a.id])}
                          style={{ width:16, height:16, flexShrink:0 }}
                        />
                      )}
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(a.nombre||'?')[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} · {docs}/3 documentos</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge" style={{ background:a.verificado?'var(--accent-tint)':a.verificacion_estado==='en_revision'?'oklch(0.93 0.05 80)':'oklch(0.93 0.005 80)', color:a.verificado?'var(--accent)':a.verificacion_estado==='en_revision'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                          {a.verificado?'✓ Aprobado':a.verificacion_estado==='en_revision'?'En revisión':a.verificacion_estado||'Pendiente'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── CONTRATOS ── */}
        {modulo === 'contratos' && (() => {
          const ESTADOS: Record<string,{bg:string,color:string,label:string}> = {
            pendiente: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Pendiente firma NIDO' },
            activo:    { bg:'var(--accent-tint)', color:'var(--accent)', label:'Activo' },
            vencido:   { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Vencido' },
            cancelado: { bg:'oklch(0.97 0.03 20)', color:'oklch(0.45 0.08 20)', label:'Cancelado' },
          }
          // El campo `estado` guardado nunca transiciona solo a 'vencido' -- no hay ningun cron
          // ni trigger que lo haga. Se calcula en el momento comparando fecha_vencimiento con
          // hoy, para que la columna "Estado" refleje la realidad aunque nadie la actualice a mano.
          const hoy = new Date()
          const estadoReal = (c: Contrato) => (c.estado === 'activo' && c.fecha_vencimiento && new Date(c.fecha_vencimiento) < hoy) ? 'vencido' : (c.estado || 'pendiente')
          const pendientes = contratos.filter(c => c.estado === 'pendiente')
          const en15dias = new Date(hoy.getTime() + 15*24*60*60*1000)
          const porVencer = contratos.filter(c => c.estado === 'activo' && c.fecha_vencimiento && new Date(c.fecha_vencimiento) >= hoy && new Date(c.fecha_vencimiento) <= en15dias)
          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, gap:12 }}>
                <div>
                  <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Gestión legal</div>
                  <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Contratos <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
                </div>
                <BotonExportarCSV nombreArchivo="contratos.csv" filas={() => contratos.map(c => ({ propietario:c.propietario_nombre||c.propietario_correo, correo:c.propietario_correo, tipo:c.tipo, estado:estadoReal(c), fecha_vencimiento:c.fecha_vencimiento, firma_tipo:c.firma_tipo, created_at:c.created_at }))}/>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                {[
                  { label:'Total contratos', val:contratos.length, color:'var(--ink)' },
                  { label:'Pendientes firma', val:pendientes.length, color:'oklch(0.45 0.08 80)' },
                  { label:'Activos', val:contratos.filter(c=>estadoReal(c)==='activo').length, color:'var(--accent)' },
                  { label:'Por vencer (15 días)', val:porVencer.length, color:'oklch(0.5 0.15 30)' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'18px' }}>
                    <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:32, color:s.color, lineHeight:1 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Pendientes urgentes */}
              {pendientes.length > 0 && (
                <div style={{ background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'oklch(0.40 0.08 80)', marginBottom:4 }}>⚠️ {pendientes.length} contrato{pendientes.length>1?'s':''} pendiente{pendientes.length>1?'s':''} de contrafirma</div>
                  <div style={{ fontSize:12, color:'oklch(0.45 0.06 80)' }}>Estos propietarios ya firmaron — necesitan tu contrafirma para activarse.</div>
                </div>
              )}

              {porVencer.length > 0 && (
                <div style={{ background:'oklch(0.95 0.06 30)', border:'1px solid oklch(0.85 0.09 30)', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'oklch(0.42 0.1 30)', marginBottom:4 }}>⏰ {porVencer.length} exclusividad{porVencer.length>1?'es':''} vence{porVencer.length>1?'n':''} en los próximos 15 días</div>
                  <div style={{ fontSize:12, color:'oklch(0.45 0.08 30)' }}>Coordiná renovación o paso a &ldquo;push de venta&rdquo; con el propietario antes de que se venza sola.</div>
                </div>
              )}

              {/* Lista */}
              <div className="card">
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--rule)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>
                  <span>Propietario</span><span>Tipo</span><span>Firma</span><span>Vence</span><span>Estado</span>
                </div>
                {contratos.map((c: Contrato) => {
                  const est = ESTADOS[estadoReal(c)] || ESTADOS.pendiente
                  return (
                    <div key={c.id} className="row" onClick={() => setSel({...c, _tipo:'contrato'})}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{c.propietario_nombre || c.propietario_correo}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{c.propietario_correo}</div>
                      </div>
                      <div style={{ fontSize:13, color:'var(--ink-2)' }}>{c.tipo === 'exclusividad' ? 'Exclusividad' : c.tipo === 'no_exclusivo' ? 'No exclusivo' : c.tipo === 'mensual' ? 'Mensual (legado)' : (c.tipo || '—')}</div>
                      <div style={{ fontSize:13, color:'var(--ink-2)' }}>{c.firma_tipo === 'digital' ? '🔐 GAUDI' : '📄 Física'}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-CR') : '—'}</div>
                      <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:est.bg, color:est.color }}>{est.label}</span>
                    </div>
                  )
                })}
                {contratos.length === 0 && <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay contratos registrados aún.</div>}
              </div>
            </div>
          )
        })()}

        {/* ── COMISIONES ── */}
        {modulo === 'comisiones' && (() => {
          const fmt = (n: number) => '$' + (n||0).toLocaleString('es-CR', { minimumFractionDigits:0, maximumFractionDigits:0 })
          const ESTADOS: Record<string,{bg:string,color:string,label:string}> = {
            proyectada: { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Proyectada' },
            en_proceso: { bg:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', label:'En proceso' },
            cobrada:    { bg:'var(--accent-tint)', color:'var(--accent)', label:'Cobrada' },
            cancelada:  { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Cancelada' },
          }
          const totalCobrado = comisiones.filter(c=>c.estado==='cobrada').reduce((a,c)=>a+(c.monto_comision||0),0)
          const totalPipeline = comisiones.filter(c=>c.estado!=='cancelada').reduce((a,c)=>a+(c.monto_comision||0),0)
          const totalProyectado = comisiones.filter(c=>c.estado==='proyectada'||c.estado==='en_proceso').reduce((a,c)=>a+(c.monto_comision||0),0)
          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Control financiero</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Comisiones <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
              </div>

              {/* Stats globales */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                {[
                  { label:'Total cobrado', val:fmt(totalCobrado), color:'var(--accent)', sub:comisiones.filter(c=>c.estado==='cobrada').length+' cierres' },
                  { label:'Pipeline activo', val:fmt(totalProyectado), color:'oklch(0.45 0.08 80)', sub:comisiones.filter(c=>c.estado==='proyectada'||c.estado==='en_proceso').length+' negocios' },
                  { label:'Pipeline total', val:fmt(totalPipeline), color:'var(--ink)', sub:'Cobrado + activo' },
                  { label:'Asesores activos', val:String(resumenComisiones.length), color:'oklch(0.42 0.06 230)', sub:'Con negocios registrados' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:12, padding:'18px' }}>
                    <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:26, color:s.color, marginBottom:4, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Resumen por asesor */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Ranking de asesores por pipeline</div>
                <div className="card">
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--rule)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>
                    <span>Asesor</span><span>Cobrado</span><span>Pipeline</span><span>Negocios</span><span>Cerrados</span>
                  </div>
                  {resumenComisiones.map((r: ResumenComisiones, i: number) => (
                    <div key={r.asesor_email} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:8, padding:'12px 20px', borderBottom:'1px solid var(--rule-soft)', fontSize:13, alignItems:'center' }} onClick={() => setFiltro(r.asesor_email||'')}>
                      <div>
                        <div style={{ fontWeight:500, marginBottom:2 }}>{r.asesor_nombre||r.asesor_email}</div>
                        <div style={{ fontSize:11, color:'var(--ink-3)' }}>{r.asesor_email}</div>
                      </div>
                      <div style={{ fontFamily:'var(--mono)', color:'var(--accent)', fontWeight:500 }}>{fmt(r.total_cobrado||0)}</div>
                      <div style={{ fontFamily:'var(--mono)', color:'oklch(0.45 0.08 80)' }}>{fmt(r.total_proyectado||0)}</div>
                      <div style={{ color:'var(--ink-2)' }}>{r.total_negocios}</div>
                      <div style={{ color:'var(--accent)' }}>{r.cerrados}</div>
                    </div>
                  ))}
                  {resumenComisiones.length === 0 && <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay comisiones registradas aún.</div>}
                </div>
              </div>

              {/* Todas las comisiones */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, gap:12 }}>
                  <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)' }}>Todos los negocios</div>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    {filtro && filtro !== 'todos' && <button onClick={() => setFiltro('todos')} style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Ver todos ×</button>}
                    <BotonExportarCSV nombreArchivo="comisiones.csv" filas={() => comisiones.filter(c => filtro==='todos'||c.estado===filtro||c.asesor_email===filtro).map(c => ({ propiedad:c.propiedad_titulo, asesor:c.asesor_nombre||c.asesor_email, monto:c.monto_comision, estado:c.estado, fecha_cierre_estimada:c.fecha_cierre_estimada, created_at:c.created_at }))}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                  {['todos','proyectada','en_proceso','cobrada','cancelada'].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} style={{ padding:'6px 14px', borderRadius:999, border:'1px solid var(--rule)', fontSize:11, cursor:'pointer', background:filtro===f?'var(--ink)':'transparent', color:filtro===f?'white':'var(--ink-2)' }}>
                      {f==='todos'?'Todos':ESTADOS[f]?.label}
                    </button>
                  ))}
                </div>
                <div className="card">
                  {comisiones
                    .filter(c => filtro==='todos'||c.estado===filtro||c.asesor_email===filtro)
                    .map((c: Comision) => {
                      const est = ESTADOS[c.estado||'proyectada']||ESTADOS.proyectada
                      return (
                        <div key={c.id} className="row" onClick={() => setSel({...c, _tipo:'comision'})}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{c.propiedad_titulo}</div>
                            <div style={{ fontSize:12, color:'var(--ink-3)', display:'flex', gap:10 }}>
                              <span>{c.asesor_nombre||c.asesor_email}</span>
                              {c.propiedad_zona && <span>· {c.propiedad_zona}</span>}
                              {c.fecha_cierre_estimada && <span>· Est. {new Date(c.fecha_cierre_estimada).toLocaleDateString('es-CR')}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:500, color:c.estado==='cobrada'?'var(--accent)':'var(--ink)', marginBottom:4 }}>{fmt(c.monto_comision||0)}</div>
                            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:est.bg, color:est.color }}>{est.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  {comisiones.filter(c => filtro==='todos'||c.estado===filtro||c.asesor_email===filtro).length === 0 && (
                    <div style={{ padding:'32px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay negocios con ese filtro.</div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── KYC PROPIETARIOS ── */}
        {modulo === 'kyc_propietarios' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Verificación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>KYC <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Propietarios.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','pendiente_docs','en_revision','aprobado','rechazado'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='pendiente_docs'?'Sin docs':f==='en_revision'?'En revisión':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?propietarios.length:propietarios.filter((p: Propietario)=>p.verificacion_estado===f||(f==='pendiente_docs'&&!p.verificacion_estado)).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {propietarios
                .filter((p: Propietario) => filtro==='todos'||p.verificacion_estado===filtro||(filtro==='pendiente_docs'&&!p.verificacion_estado))
                .map((p: Propietario) => {
                  const docs = [p.cedula_frente_url, p.cedula_reverso_url, p.selfie_url].filter(Boolean).length
                  return (
                    <div key={p.id} className="row" onClick={() => setSel({...p, _tipo:'kyc_propietario'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'oklch(0.93 0.03 240)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'oklch(0.35 0.08 240)', flexShrink:0 }}>{(p.nombre||'?')[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{p.nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{p.correo} · {docs}/3 docs · {p.relacion||'Propietario'}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge" style={{ background:p.verificacion_estado==='aprobado'?'var(--accent-tint)':p.verificacion_estado==='en_revision'?'oklch(0.93 0.05 80)':'oklch(0.93 0.005 80)', color:p.verificacion_estado==='aprobado'?'var(--accent)':p.verificacion_estado==='en_revision'?'oklch(0.45 0.08 80)':'var(--ink-3)' }}>
                          {p.verificacion_estado==='aprobado'?'✓ Aprobado':p.verificacion_estado==='en_revision'?'En revisión':p.verificacion_estado||'Sin docs'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
              {propietarios.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay propietarios registrados.</div>}
            </div>
          </div>
        )}

        {/* ── EQUIPO NIDO ── */}
        {modulo === 'equipo_nido' && (() => {
          const miembros = asesores.filter((a: Perfil) => a.equipo_nido_estado === 'aprobado')
          const pendientes = asesores.filter((a: Perfil) => a.solicita_equipo_nido && a.equipo_nido_estado !== 'aprobado' && a.equipo_nido_estado !== 'rechazado')
          const rechazados = asesores.filter((a: Perfil) => a.equipo_nido_estado === 'rechazado')
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Equipo interno</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Equipo <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
              <p style={{ fontSize:14, color:'var(--ink-3)', marginTop:6 }}>Asesores internos de NIDO, aparte de la red de afiliados independientes.</p>
            </div>

            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Miembros activos ({miembros.length})</div>
              <div className="card">
                {miembros.length === 0 ? (
                  <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>Todavía no hay asesores formalizados en Equipo NIDO.</div>
                ) : miembros.map((a: Perfil) => {
                  const sus = suscripciones.find((s: Suscripcion) => s.correo === a.correo && s.activo)
                  return (
                    <div key={a.id} className="row" onClick={() => setSel({...a, _tipo:'asesor', _sus:sus})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0, overflow:'hidden' }}>
                        {a.foto_url ? <img src={a.foto_url} alt={a.nombre||''} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (a.nombre||'?')[0]}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} {a.telefono?'· '+a.telefono:''}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                        {sus && <span className="badge" style={{ background:'oklch(0.93 0.03 240)', color:'oklch(0.35 0.08 240)', textTransform:'uppercase' }}>{getPlanConfig(sus.plan).nombrePublico}</span>}
                        <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>⭐ Equipo NIDO</span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Solicitudes pendientes ({pendientes.length})</div>
              <div className="card">
                {pendientes.length === 0 ? (
                  <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay solicitudes de Equipo NIDO por el momento.</div>
                ) : pendientes.map((a: Perfil) => (
                  <div key={a.id} className="row" style={{ alignItems:'center' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0, overflow:'hidden' }}>
                      {a.foto_url ? <img src={a.foto_url} alt={a.nombre||''} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (a.nombre||'?')[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo} · {a.telefono||'sin teléfono'}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => responderEquipoNido(a, true)} className="btn-dark" style={{ padding:'7px 16px', borderRadius:999, fontSize:12, border:'none', cursor:'pointer' }}>Aprobar</button>
                      <button onClick={() => responderEquipoNido(a, false)} className="btn-outline" style={{ padding:'7px 16px', borderRadius:999, fontSize:12, cursor:'pointer' }}>Rechazar</button>
                    </div>
                  </div>
                ))}
                {rechazados.length > 0 && (
                  <div style={{ padding:'12px 20px', fontSize:12, color:'var(--ink-3)' }}>{rechazados.length} solicitud{rechazados.length>1?'es':''} rechazada{rechazados.length>1?'s':''} anteriormente.</div>
                )}
              </div>
            </div>
          </div>
          )
        })()}

        {/* ── EQUIPOS DE ASESORES (equipos / equipo_miembros) ── */}
        {modulo === 'equipos_asesores' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Colaboración entre asesores</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Equipos de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>asesores.</em></h1>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6, maxWidth:640 }}>Sub-equipos que un asesor arma con colegas dentro de NIDO (distinto de &ldquo;Equipo NIDO&rdquo;, que son asesores internos de la empresa) — antes sin ninguna visibilidad desde el backoffice.</p>
            </div>
            <div className="card">
              {equipos.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay equipos creados todavía.</div>}
              {equipos.map((eq: Equipo) => {
                const miembros = equipoMiembros.filter(m => m.equipo_id === eq.id)
                return (
                  <div key={eq.id} style={{ padding:'16px 20px', borderBottom:'1px solid var(--rule-soft)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:500 }}>{eq.nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{eq.admin_email} · plan {eq.plan} · {miembros.length}/{eq.max_agentes} agentes</div>
                      </div>
                      <span style={{ fontSize:11, color:'var(--ink-3)' }}>{new Date(eq.created_at).toLocaleDateString('es-CR')}</span>
                    </div>
                    {miembros.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                        {miembros.map(m => (
                          <span key={m.id} className="badge" style={{ background: m.estado==='activo' ? 'var(--accent-tint)' : 'oklch(0.93 0.005 80)', color: m.estado==='activo' ? 'var(--accent)' : 'var(--ink-3)' }}>
                            {m.nombre || m.correo} · {m.rol} {m.estado!=='activo' ? '· '+m.estado : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── NOTICIAS ── */}
        {modulo === 'noticias' && (() => {
          const noticiasFiltradas = noticias.filter(n => filtro==='todos' || (filtro==='activas' ? n.activa !== false : n.activa === false))
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Contenido</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Noticias de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Valeria.</em></h1>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>El cron diario redacta y publica estos artículos automáticamente — antes nadie del equipo podía revisar o despublicar uno antes de que un visitante lo viera.</p>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','activas','inactivas'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todas':f==='activas'?'Publicadas':'Despublicadas'}
                  <span style={{ marginLeft:6, opacity:0.6 }}>({f==='todos'?noticias.length:f==='activas'?noticias.filter(n=>n.activa!==false).length:noticias.filter(n=>n.activa===false).length})</span>
                </button>
              ))}
            </div>
            <div className="card">
              {noticiasFiltradas.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay noticias con ese filtro.</div>}
              {noticiasFiltradas.map((n: Noticia) => (
                <div key={n.id} className="row" style={{ cursor:'default', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{n.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--ink-2)', marginBottom:4 }}>{n.resumen}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>{n.fuente_nombre} · {n.tag} · {n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString('es-CR') : '—'}</div>
                  </div>
                  <button onClick={() => actualizarNoticia(n.id, { activa: n.activa === false })} style={{ fontSize:12, color: n.activa===false ? 'var(--accent)' : 'oklch(0.5 0.1 20)', background:'none', border:'1px solid var(--rule)', borderRadius:999, padding:'5px 12px', cursor:'pointer', flexShrink:0 }}>
                    {n.activa === false ? 'Publicar' : 'Despublicar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          )
        })()}

        {/* ── ACTIVIDAD DE VALERIA (IA) — vista global, todos los asesores ── */}
        {modulo === 'valeria_actividad' && (() => {
          const TIPOS_VALERIA: Record<string, { icon: string; label: string }> = {
            buscar_propiedades: { icon:'🔍', label:'Búsqueda de propiedades' },
            consulta_mercado: { icon:'📊', label:'Consulta de mercado' },
            cma_propiedad: { icon:'📐', label:'CMA' },
            escalar_soporte: { icon:'🆘', label:'Soporte escalado' },
            consulta_legal: { icon:'⚖️', label:'Consulta legal' },
            conectar_asesor: { icon:'🤝', label:'Lead conectado' },
            mis_propiedades_propietario: { icon:'🏠', label:'Propietario consultó su propiedad' },
            redirigir_asesor_propietario: { icon:'↪️', label:'Propietario redirigido' },
            mis_propiedades: { icon:'📋', label:'Consultó su catálogo' },
            completar_visita: { icon:'📝', label:'Visita registrada' },
            agendar_visita: { icon:'📅', label:'Visita agendada' },
            notificar_visita_comprador: { icon:'📣', label:'Aviso de visita a comprador' },
            notificar_visita_partes: { icon:'📣', label:'Aviso de visita coordinado' },
            armar_propuesta: { icon:'📄', label:'Propuesta redactada' },
            enviar_mensaje_lead: { icon:'✉️', label:'Mensaje a lead' },
            actualizar_perfil_lead: { icon:'📇', label:'Perfil de lead actualizado' },
          }
          const infoTipo = (t: string) => TIPOS_VALERIA[t] || { icon:'✦', label:t }
          const pendientesAprobacion = valeriaBitacora.filter(v => v.requiere_aprobacion && v.aprobado === null)
          const estadoDe = (v: ValeriaBitacora) => !v.requiere_aprobacion ? 'informativa' : v.aprobado === null ? 'pendiente' : v.aprobado ? 'confirmada' : 'rechazada'
          const filtradas = valeriaBitacora
            .filter(v => filtro === 'todos' || estadoDe(v) === filtro)
            .filter(v => !busqueda || (v.asesor_email||'').toLowerCase().includes(busqueda.toLowerCase()))
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Directora de Operaciones IA</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Actividad de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Valeria.</em></h1>
                <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6, maxWidth:640 }}>Todo lo que Valeria hizo por WhatsApp en todos los asesores — antes solo visible asesor por asesor desde su propio dashboard. Vista de solo lectura; la aprobación de cada acción la sigue resolviendo el asesor por WhatsApp.</p>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por asesor..." className="field" style={{ width:200 }}/>
                <BotonExportarCSV nombreArchivo="actividad_valeria.csv" filas={() => filtradas.map(v => ({ fecha:v.created_at, asesor:v.asesor_email, tipo:infoTipo(v.tipo_accion).label, resumen:v.resumen, estado:estadoDe(v) }))}/>
              </div>
            </div>

            {pendientesAprobacion.length > 0 && (
              <div style={{ background:'oklch(0.93 0.05 80)', border:'1px solid oklch(0.88 0.05 80)', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'oklch(0.40 0.08 80)', marginBottom:4 }}>⚠️ {pendientesAprobacion.length} acción{pendientesAprobacion.length>1?'es':''} de Valeria sin resolver</div>
                <div style={{ fontSize:12, color:'oklch(0.45 0.06 80)' }}>Cada asesor confirma o rechaza sus propios borradores por WhatsApp — si uno lleva mucho tiempo pendiente, vale la pena escribirle directamente.</div>
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['todos','pendiente','confirmada','rechazada','informativa'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todas':f==='pendiente'?'Pendientes':f==='confirmada'?'Confirmadas':f==='rechazada'?'Rechazadas':'Informativas'}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?valeriaBitacora.length:valeriaBitacora.filter(v=>estadoDe(v)===f).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="card">
              {filtradas.length === 0 ? (
                <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay actividad de Valeria con ese filtro.</div>
              ) : filtradas.map((v: ValeriaBitacora) => {
                const est = estadoDe(v)
                const estStyle = est==='confirmada' ? { bg:'var(--accent-tint)', color:'var(--accent)', label:'Confirmada' }
                  : est==='rechazada' ? { bg:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)', label:'Rechazada' }
                  : est==='pendiente' ? { bg:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)', label:'Pendiente' }
                  : { bg:'oklch(0.93 0.005 80)', color:'var(--ink-3)', label:'Informativa' }
                const info = infoTipo(v.tipo_accion)
                return (
                  <div key={v.id} className="row" style={{ cursor:'default' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontSize:14, flexShrink:0 }}>{info.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{info.label}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.asesor_email} · {v.resumen}</div>
                    </div>
                    <span className="badge" style={{ background:estStyle.bg, color:estStyle.color, flexShrink:0 }}>{estStyle.label}</span>
                    <div style={{ fontSize:11, color:'var(--ink-3)', flexShrink:0, width:120, textAlign:'right' }}>{new Date(v.created_at).toLocaleString('es-CR')}</div>
                  </div>
                )
              })}
            </div>
          </div>
          )
        })()}

        {modulo === 'actividad' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Bitácora</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Actividad <em style={{ fontStyle:'italic', color:'var(--accent)' }}>de administradores.</em></h1>
              <p style={{ fontSize:14, color:'var(--ink-3)', marginTop:6 }}>Últimas {auditoria.length} acciones tomadas por administradores en el sistema. La actividad de Valeria vive en su propio apartado →</p>
            </div>
            <div className="card">
              {auditoria.length === 0 ? (
                <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>Todavía no hay actividad registrada.</div>
              ) : auditoria.map((a: AdminAuditLog) => (
                <div key={a.id} className="row" style={{ cursor:'default' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontSize:14, flexShrink:0 }}>🕐</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{a.accion}{a.entidad_tipo ? ' · ' + a.entidad_tipo : ''}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.admin_email} {a.detalle ? '· ' + a.detalle : ''}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--ink-3)', flexShrink:0 }}>{new Date(a.created_at).toLocaleString('es-CR')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMINISTRADORES ── */}
        {modulo === 'administradores' && (
          <AdministradoresPanel admins={admins} adminUser={adminUser} onReload={loadAll} onLog={logAccion} onMsg={setMsg}/>
        )}

        {/* ── MENSAJES ── */}
        {modulo === 'mensajes' && (
          <div style={{ animation:'fadeUp 0.4s ease', maxWidth:680 }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Comunicación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Mensajes <em style={{ fontStyle:'italic', color:'var(--accent)' }}>internos.</em></h1>
            </div>
            <MensajeForm asesores={asesores} propietarios={propietarios} onSend={enviarMensaje}/>
          </div>
        )}

        {/* ── SOPORTE (SAC) ── */}
        {modulo === 'soporte' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Atención al cliente</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Tickets de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>soporte.</em></h1>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','abierto','en_progreso','resuelto'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f==='en_progreso'?'En progreso':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?tickets.length:tickets.filter(t=>t.estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {tickets.filter(t => filtro==='todos'||t.estado===filtro).length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>No hay tickets en este estado.</div>
              )}
              {tickets
                .filter(t => filtro==='todos'||t.estado===filtro)
                .map(t => {
                  const badgeStyle = t.estado==='resuelto'
                    ? { background:'var(--accent-tint)', color:'var(--accent)' }
                    : t.estado==='en_progreso'
                    ? { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                    : { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }
                  return (
                    <div key={t.id} className="row" onClick={() => setSel({...t, _tipo:'ticket'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(t.usuario_nombre||t.usuario_email||'?')[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{t.categoria === 'legal' && '⚖️ '}{t.asunto || 'Consulta de soporte'}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{t.usuario_nombre || t.usuario_email} · {t.usuario_tipo} · {new Date(t.created_at).toLocaleDateString('es-CR')}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {t.categoria === 'legal' && (
                          <span className="badge" style={{ background:'oklch(0.93 0.05 280)', color:'oklch(0.42 0.1 280)' }}>Legal</span>
                        )}
                        <span className="badge" style={badgeStyle}>
                          {t.estado==='resuelto'?'✓ Resuelto':t.estado==='en_progreso'?'En progreso':'Abierto'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── RESEÑAS ── */}
        {modulo === 'resenas' && (() => {
          const resenasFiltradas = calificaciones.filter(c => filtro==='todos' ? !c.oculta : filtro==='ocultas' ? c.oculta : true)
          return (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Reputación</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Reseñas de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>asesores.</em></h1>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>Calificaciones que compradores dejan tras una visita. Ocultar una reseña de mala fe no la borra — solo la saca de los perfiles públicos.</p>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','ocultas'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Visibles':'Ocultas'}
                  <span style={{ marginLeft:6, opacity:0.6 }}>({f==='todos'?calificaciones.filter(c=>!c.oculta).length:calificaciones.filter(c=>c.oculta).length})</span>
                </button>
              ))}
            </div>
            <div className="card">
              {resenasFiltradas.length === 0 && <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay reseñas con ese filtro.</div>}
              {resenasFiltradas.map((c: Calificacion) => (
                <div key={c.id} className="row" style={{ cursor:'default', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{'★'.repeat(c.calificacion)}{'☆'.repeat(5-c.calificacion)} <span style={{ fontWeight:400, color:'var(--ink-3)', fontSize:12 }}>· para {c.asesor_email}</span></div>
                    {c.comentario && <div style={{ fontSize:13, color:'var(--ink-2)', marginBottom:4 }}>&ldquo;{c.comentario}&rdquo;</div>}
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>{c.calificador_nombre || 'Anónimo'} · {c.created_at ? new Date(c.created_at).toLocaleDateString('es-CR') : '—'}</div>
                  </div>
                  <button onClick={() => ocultarResena(c.id, !c.oculta)} style={{ fontSize:12, color: c.oculta ? 'var(--accent)' : 'oklch(0.5 0.1 20)', background:'none', border:'1px solid var(--rule)', borderRadius:999, padding:'5px 12px', cursor:'pointer', flexShrink:0 }}>
                    {c.oculta ? 'Mostrar' : 'Ocultar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          )
        })()}

        {modulo === 'referidos' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Crecimiento</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Programa de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>referidos.</em></h1>
            </div>

            {pagosMensuales.length > 0 && (
              <div className="card" style={{ marginBottom:24, borderColor:'oklch(0.75 0.06 150)' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--rule)' }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>💰 Pagos de recompensa recurrente pendientes este mes</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>Calculado sobre la suscripción activa del asesor referido · {pagosMensuales.length} pago{pagosMensuales.length!==1?'s':''} por liquidar</div>
                </div>
                {pagosMensuales.map(pm => (
                  <div key={pm.referido_id} className="row">
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{pm.referidor_email}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>
                        Por referir a {pm.referido_nombre || pm.referido_email} (plan {pm.plan_referido}) · {pm.recompensa_pct}% · mes {pm.meses_pagados+1}{pm.recompensa_meses_max ? ' de ' + pm.recompensa_meses_max : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <span style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--accent)' }}>${pm.monto_a_pagar_este_mes}</span>
                      <button className="btn" onClick={() => marcarMesPagado(pm.referido_id, pm.meses_pagados)} style={{ padding:'8px 14px', background:'var(--ink)', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer' }}>Marcar mes pagado</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {['todos','pendiente','aprobado','rechazado','pagado'].map(f => (
                <button key={f} className={'tab'+(filtro===f?' active':'')} onClick={() => setFiltro(f)}>
                  {f==='todos'?'Todos':f.charAt(0).toUpperCase()+f.slice(1)}
                  <span style={{ marginLeft:6, opacity:0.6 }}>
                    ({f==='todos'?referidos.length:referidos.filter(r=>r.estado===f).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="card">
              {referidos.filter(r => filtro==='todos'||r.estado===filtro).length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>No hay referidos en este estado.</div>
              )}
              {referidos
                .filter(r => filtro==='todos'||r.estado===filtro)
                .map(r => {
                  const badgeStyle = r.estado==='pagado' ? { background:'var(--accent-tint)', color:'var(--accent)' }
                    : r.estado==='aprobado' ? { background:'oklch(0.93 0.05 150)', color:'oklch(0.40 0.08 150)' }
                    : r.estado==='rechazado' ? { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }
                    : { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                  return (
                    <div key={r.id} className="row" onClick={() => setSel({...r, _tipo:'referido'})}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{(r.referido_nombre||r.referido_email||'?')[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{r.referido_nombre || r.referido_email} <span style={{ color:'var(--ink-3)', fontWeight:400 }}>· referido por {r.referidor_email}</span></div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{r.referido_tipo === 'asesor' ? 'Asesor' : 'Propietario'} · código {r.codigo_usado} · {new Date(r.created_at).toLocaleDateString('es-CR')}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {r.recompensa_monto ? <span style={{ fontSize:13, color:'var(--ink-2)', fontWeight:500 }}>${r.recompensa_monto}</span> : null}
                        <span className="badge" style={badgeStyle}>
                          {r.estado==='pagado'?'Pagado':r.estado==='aprobado'?'Aprobado':r.estado==='rechazado'?'Rechazado':'Pendiente'}
                        </span>
                        <span style={{ color:'var(--ink-3)', fontSize:16 }}>›</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {modulo === 'oficinas' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Crecimiento B2B</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Oficinas <em style={{ fontStyle:'italic', color:'var(--accent)' }}>afiliadas.</em></h1>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6, maxWidth:640 }}>Inmobiliarias o equipos externos que corren su operación sobre la tecnología de NIDO — el equivalente tecnológico de una franquicia. Sin cobro automático todavía: gestioná el acuerdo manualmente acá.</p>
            </div>

            <div className="card" style={{ padding:20, marginBottom:24 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Nueva oficina afiliada</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <input className="field" placeholder="Nombre de la inmobiliaria" value={nuevaOficina.nombre} onChange={e => setNuevaOficina({...nuevaOficina, nombre:e.target.value})}/>
                <input className="field" placeholder="Correo de contacto" value={nuevaOficina.contacto_email} onChange={e => setNuevaOficina({...nuevaOficina, contacto_email:e.target.value})}/>
                <input className="field" placeholder="Nombre de contacto (opcional)" value={nuevaOficina.contacto_nombre} onChange={e => setNuevaOficina({...nuevaOficina, contacto_nombre:e.target.value})}/>
                <input className="field" placeholder="Teléfono (opcional)" value={nuevaOficina.telefono} onChange={e => setNuevaOficina({...nuevaOficina, telefono:e.target.value})}/>
                <input className="field" type="number" placeholder="Asientos contratados" value={nuevaOficina.asientos_contratados} onChange={e => setNuevaOficina({...nuevaOficina, asientos_contratados:e.target.value})}/>
              </div>
              <button className="btn" disabled={creandoOficina} onClick={crearOficina} style={{ padding:'10px 20px', background:'var(--accent)', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>+ Crear oficina</button>
            </div>

            <div className="card">
              {oficinas.length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>Todavía no hay oficinas afiliadas.</div>
              )}
              {oficinas.map(o => {
                const asesoresDeOficina = asesores.filter(a => a.oficina_id === o.id)
                const estadoStyle = o.estado === 'activa' ? { background:'var(--accent-tint)', color:'var(--accent)' } : o.estado === 'pausada' ? { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' } : { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                const abierta = oficinaSel?.id === o.id
                return (
                  <div key={o.id}>
                    <div className="row" onClick={() => setOficinaSel(abierta ? null : o)}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:16, color:'var(--accent)', flexShrink:0 }}>{o.nombre[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{o.nombre}</div>
                        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{o.contacto_email} · {asesoresDeOficina.length} de {o.asientos_contratados} asientos usados</div>
                      </div>
                      <span className="badge" style={estadoStyle}>{o.estado==='activa'?'Activa':o.estado==='pausada'?'Pausada':'Pendiente'}</span>
                      <span style={{ color:'var(--ink-3)', fontSize:16, marginLeft:8 }}>{abierta ? '⌄' : '›'}</span>
                    </div>
                    {abierta && (
                      <div style={{ padding:'0 20px 20px', borderBottom:'1px solid var(--rule)' }}>
                        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                          {['pendiente','activa','pausada'].map(e => (
                            <button key={e} onClick={() => actualizarEstadoOficina(o.id, e)} style={{ padding:'6px 14px', borderRadius:999, border:'1px solid ' + (o.estado===e ? 'var(--accent)' : 'var(--rule)'), background: o.estado===e ? 'var(--accent-tint)' : 'transparent', color: o.estado===e ? 'var(--accent)' : 'var(--ink-2)', fontSize:12, cursor:'pointer' }}>{e==='activa'?'Activa':e==='pausada'?'Pausada':'Pendiente'}</button>
                          ))}
                        </div>
                        <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:10 }}>Asesores en esta oficina ({asesoresDeOficina.length}/{o.asientos_contratados})</div>
                        {asesoresDeOficina.length === 0 && <div style={{ fontSize:13, color:'var(--ink-3)', marginBottom:12 }}>Ningún asesor asignado todavía.</div>}
                        {asesoresDeOficina.map(a => (
                          <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)' }}>
                            <span style={{ fontSize:13 }}>{a.nombre || a.correo} <span style={{ color:'var(--ink-3)' }}>· {a.correo}</span></span>
                            <button onClick={() => quitarAsesorDeOficina(a.id, o.id)} style={{ fontSize:12, color:'oklch(0.45 0.08 20)', background:'none', border:'none', cursor:'pointer' }}>Quitar</button>
                          </div>
                        ))}
                        <div style={{ display:'flex', gap:8, marginTop:14 }}>
                          <input className="field" placeholder="correo@asesor.com" value={emailAsignar} onChange={e => setEmailAsignar(e.target.value)} style={{ flex:1 }}/>
                          <button onClick={() => asignarAsesorAOficina(o.id)} style={{ padding:'0 16px', background:'var(--ink)', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer' }}>Asignar</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {modulo === 'cursos_compras' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Academia</div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Compras de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>cursos individuales.</em></h1>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>Asesores en plan Despega o Elite que quieren un curso avanzado sin pagar el plan completo. Coordiná el cobro y aprobá para desbloquearlo.</p>
            </div>
            <div className="card">
              {cursosCompras.length === 0 && (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13 }}>No hay solicitudes todavía.</div>
              )}
              {cursosCompras.map(cc => {
                const estadoStyle = cc.estado === 'aprobado' ? { background:'var(--accent-tint)', color:'var(--accent)' } : cc.estado === 'rechazado' ? { background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' } : { background:'oklch(0.93 0.05 80)', color:'oklch(0.45 0.08 80)' }
                return (
                  <div key={cc.id} className="row">
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{cc.curso_titulo}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)' }}>{cc.correo} · {new Date(cc.created_at).toLocaleDateString('es-CR')}</div>
                    </div>
                    <span className="badge" style={estadoStyle}>{cc.estado==='aprobado'?'Aprobado':cc.estado==='rechazado'?'Rechazado':'Solicitado'}</span>
                    {cc.estado === 'solicitado' && (
                      <div style={{ display:'flex', gap:8, marginLeft:12 }}>
                        <button onClick={() => actualizarCursoCompra(cc.id, 'aprobado')} style={{ padding:'6px 14px', background:'var(--accent)', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer' }}>Aprobar</button>
                        <button onClick={() => actualizarCursoCompra(cc.id, 'rechazado')} style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--rule)', borderRadius:8, fontSize:12, cursor:'pointer' }}>Rechazar</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {modulo === 'atribucion' && (() => {
          const FUENTE_LABEL: Record<string,string> = { seo_zona:'SEO por zona', ficha_propiedad:'Ficha de propiedad', contacto_general:'Contacto general' }
          const porFuente: Record<string, number> = {}
          leads.forEach(l => { const f = l.fuente || 'sin_clasificar'; porFuente[f] = (porFuente[f]||0)+1 })
          const fuentesOrdenadas = Object.entries(porFuente).sort((a,b) => b[1]-a[1])
          const totalLeads = leads.length || 1

          const porZona: Record<string, number> = {}
          leads.forEach(l => { if (l.zona_interes) porZona[l.zona_interes] = (porZona[l.zona_interes]||0)+1 })
          const zonasOrdenadas = Object.entries(porZona).sort((a,b) => b[1]-a[1]).slice(0, 8)

          const asesoresReferidos = asesores.filter((a: Perfil) => a.referido_por).length
          const propietariosReferidos = propietarios.filter((p: Propietario) => p.referido_por).length
          const totalCuentas = asesores.length + propietarios.length || 1
          const totalReferidas = asesoresReferidos + propietariosReferidos

          const referidosPorEstado: Record<string, number> = {}
          referidos.forEach(r => { referidosPorEstado[r.estado] = (referidosPorEstado[r.estado]||0)+1 })

          // Funnel de conversión unificado: antes esta historia vivía repartida entre Atribución
          // (leads), Ofertas (recién agregado) y Comisiones (cierres), sin una sola vista que
          // mostrara el recorrido completo. No es un join por registro (una visita no guarda el
          // lead_id que la originó) sino el volumen agregado de cada etapa, igual que el embudo
          // de referidos de abajo.
          const totalVisitas = visitas.length
          const totalOfertasFunnel = ofertas.length
          const totalCierres = comisiones.filter(c => c.estado === 'cobrada').length
          const etapasFunnel = [
            { label: 'Leads', n: leads.length, color: 'var(--accent)' },
            { label: 'Visitas', n: totalVisitas, color: 'oklch(0.5 0.1 200)' },
            { label: 'Ofertas', n: totalOfertasFunnel, color: 'oklch(0.5 0.1 80)' },
            { label: 'Cierres', n: totalCierres, color: 'oklch(0.45 0.08 150)' },
          ]
          const baseFunnel = etapasFunnel[0].n || 1

          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>De dónde viene el crecimiento</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Panel de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>atribución.</em></h1>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Leads totales</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{leads.length}</div>
                </div>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Cuentas por referido</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{totalReferidas} <span style={{ fontSize:15, color:'var(--ink-3)' }}>/ {totalCuentas}</span></div>
                </div>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Recompensas pagadas</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{referidosPorEstado.pagado || 0}</div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Leads por fuente</div>
                  {fuentesOrdenadas.length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Todavía no hay leads registrados.</div>
                  ) : fuentesOrdenadas.map(([fuente, n]) => (
                    <div key={fuente} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span>{FUENTE_LABEL[fuente] || (fuente==='sin_clasificar'?'Sin clasificar':fuente)}</span>
                        <span style={{ color:'var(--ink-3)' }}>{n} ({Math.round(n/totalLeads*100)}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:'var(--rule-soft)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${n/totalLeads*100}%`, background:'var(--accent)', borderRadius:999 }}/>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Top zonas por interés</div>
                  {zonasOrdenadas.length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Todavía no hay leads con zona de interés.</div>
                  ) : zonasOrdenadas.map(([zona, n]) => (
                    <div key={zona} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                      <span>{zona}</span>
                      <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding:'24px 26px', marginTop:20 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Embudo de conversión</div>
                <p style={{ fontSize:12, color:'var(--ink-3)', marginBottom:16 }}>Lead → Visita → Oferta → Cierre, en volumen agregado (los datos ya existían repartidos entre Atribución, Ofertas y Comisiones — esta es la vista unificada).</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {etapasFunnel.map((e, i) => (
                    <div key={e.label} style={{ textAlign:'center', padding:'16px 10px', background:'var(--bg)', borderRadius:10 }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:28, color:e.color }}>{e.n}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{e.label}</div>
                      {i > 0 && <div style={{ fontSize:10, color:'var(--ink-3)', marginTop:2 }}>{Math.round(e.n / baseFunnel * 100)}% de leads</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding:'24px 26px', marginTop:20 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Embudo del programa de referidos</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {['pendiente','aprobado','pagado','rechazado'].map(estado => (
                    <div key={estado} style={{ textAlign:'center', padding:'16px 10px', background:'var(--bg)', borderRadius:10 }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:26 }}>{referidosPorEstado[estado] || 0}</div>
                      <div style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{estado}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {modulo === 'inteligencia' && (() => {
          const CALC_LABEL: Record<string,string> = {
            calculadora_capacidad: 'Capacidad de compra',
            calculadora_roi: 'ROI de alquiler',
            calculadora_impuesto: 'Impuesto de bienes inmuebles',
            calculadora_hipoteca: 'Cuota / gastos de cierre',
          }
          const leadsCalculadoras = leads.filter(l => (l.fuente || '').startsWith('calculadora_'))
          const porCalculadora: Record<string, number> = {}
          leadsCalculadoras.forEach(l => { const f = l.fuente || 'otra'; porCalculadora[f] = (porCalculadora[f]||0)+1 })
          const calculadorasOrdenadas = Object.entries(porCalculadora).sort((a,b) => b[1]-a[1])
          const totalCalc = leadsCalculadoras.length || 1

          const RANGOS = [
            { label:'< $100K', min:0, max:100000 },
            { label:'$100K – $250K', min:100000, max:250000 },
            { label:'$250K – $400K', min:250000, max:400000 },
            { label:'$400K – $700K', min:400000, max:700000 },
            { label:'> $700K', min:700000, max:Infinity },
          ]
          const porRango: Record<string, number> = {}
          leadsCalculadoras.forEach(l => {
            const val = Number(l.presupuesto)
            if (!val || isNaN(val)) return
            const r = RANGOS.find(r => val >= r.min && val < r.max)
            if (r) porRango[r.label] = (porRango[r.label]||0) + 1
          })
          const totalConPresupuesto = Object.values(porRango).reduce((a,b) => a+b, 0) || 1

          const porTipoBusqueda: Record<string, number> = {}
          leadsCalculadoras.forEach(l => { const t = l.tipo_busqueda || 'sin especificar'; porTipoBusqueda[t] = (porTipoBusqueda[t]||0)+1 })
          const tiposOrdenados = Object.entries(porTipoBusqueda).sort((a,b) => b[1]-a[1])

          const alertasActivas = alertasBusqueda.filter(a => a.activa !== false)
          const porZonaAlerta: Record<string, number> = {}
          alertasActivas.forEach(a => { if (a.zona) porZonaAlerta[a.zona] = (porZonaAlerta[a.zona]||0)+1 })
          const zonasAlertaOrdenadas = Object.entries(porZonaAlerta).sort((a,b) => b[1]-a[1]).slice(0, 8)

          const leadsPremium = leads.filter(l => l.asignado_automaticamente).length

          const leadsWhatsapp = leads.filter(l => l.fuente === 'whatsapp_ia').length
          // waLogs ya viene filtrado a los ultimos 7 dias desde la consulta en loadAll()
          const waConResultado = waLogs.filter(w => w.wa_send_ok !== null)
          const waTasaExito = waConResultado.length > 0 ? Math.round(waConResultado.filter(w => w.wa_send_ok).length / waConResultado.length * 100) : null
          const waPorTipo: Record<string, number> = {}
          waLogs.forEach(w => { const t = w.user_type || 'desconocido'; waPorTipo[t] = (waPorTipo[t]||0)+1 })

          return (
            <div style={{ animation:'fadeUp 0.4s ease' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Producto de datos</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Inteligencia de <em style={{ fontStyle:'italic', color:'var(--accent)' }}>mercado.</em></h1>
                <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:6, maxWidth:640 }}>Comportamiento agregado de compradores en calculadoras y alertas — base del reporte trimestral que ningún competidor local puede replicar.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Leads de calculadoras</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{leadsCalculadoras.length}</div>
                </div>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Alertas de búsqueda activas</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{alertasActivas.length}</div>
                </div>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Leads premium asignados</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{leadsPremium}</div>
                </div>
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Compras individuales de curso</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32 }}>{cursosCompras.length}</div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Leads por calculadora</div>
                  {calculadorasOrdenadas.length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Todavía no hay leads de calculadoras.</div>
                  ) : calculadorasOrdenadas.map(([fuente, n]) => (
                    <div key={fuente} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span>{CALC_LABEL[fuente] || fuente}</span>
                        <span style={{ color:'var(--ink-3)' }}>{n} ({Math.round(n/totalCalc*100)}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:'var(--rule-soft)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${n/totalCalc*100}%`, background:'var(--accent)', borderRadius:999 }}/>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Presupuesto calculado</div>
                  {totalConPresupuesto === 0 || Object.keys(porRango).length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Todavía no hay suficientes datos de presupuesto.</div>
                  ) : RANGOS.filter(r => porRango[r.label]).map(r => (
                    <div key={r.label} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span>{r.label}</span>
                        <span style={{ color:'var(--ink-3)' }}>{porRango[r.label]} ({Math.round(porRango[r.label]/totalConPresupuesto*100)}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:'var(--rule-soft)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${porRango[r.label]/totalConPresupuesto*100}%`, background:'oklch(0.55 0.07 150)', borderRadius:999 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Tipo de búsqueda</div>
                  {tiposOrdenados.length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Sin datos todavía.</div>
                  ) : tiposOrdenados.map(([tipo, n]) => (
                    <div key={tipo} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                      <span style={{ textTransform:'capitalize' }}>{tipo}</span>
                      <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{n}</span>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding:'24px 26px' }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Top zonas con alertas activas</div>
                  {zonasAlertaOrdenadas.length === 0 ? (
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>Todavía no hay alertas con zona definida.</div>
                  ) : zonasAlertaOrdenadas.map(([zona, n]) => (
                    <div key={zona} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                      <span>{zona}</span>
                      <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)' }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Valeria por WhatsApp <span style={{ fontSize:11, fontWeight:400, color:'var(--ink-3)' }}>· beneficio Black · últimos 7 días</span></div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                  <div className="card" style={{ padding:'18px 20px' }}>
                    <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Mensajes procesados</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:28 }}>{waLogs.length}</div>
                  </div>
                  <div className="card" style={{ padding:'18px 20px' }}>
                    <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Tasa de envío exitoso</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:28, color: waTasaExito !== null && waTasaExito < 90 ? 'oklch(0.55 0.15 30)' : 'var(--ink)' }}>{waTasaExito !== null ? waTasaExito + '%' : '—'}</div>
                  </div>
                  <div className="card" style={{ padding:'18px 20px' }}>
                    <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Leads generados vía WhatsApp</div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:28 }}>{leadsWhatsapp}</div>
                  </div>
                  <div className="card" style={{ padding:'18px 20px' }}>
                    <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Por perfil</div>
                    <div style={{ fontSize:12, color:'var(--ink-2)', lineHeight:1.8 }}>
                      {Object.entries(waPorTipo).length === 0 ? '—' : Object.entries(waPorTipo).map(([t,n]) => `${t}: ${n}`).join(' · ')}
                    </div>
                  </div>
                </div>
                {waTasaExito !== null && waTasaExito < 90 && (
                  <div style={{ marginTop:10, fontSize:12, color:'oklch(0.5 0.13 30)' }}>⚠️ Tasa de envío por debajo del 90% — revisá WHATSAPP_TOKEN en Vercel o el estado de la app en developers.facebook.com.</div>
                )}
              </div>

              {(() => {
                const fallidos = waLogs.filter(w => w.wa_send_ok === false)
                if (fallidos.length === 0) return null
                return (
                  <div style={{ marginTop:24 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Envíos fallidos <span style={{ fontSize:11, fontWeight:400, color:'var(--ink-3)' }}>· últimos 7 días · {fallidos.length}</span></div>
                    <p style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12 }}>Antes esto solo se detectaba por la alerta de correo cuando la tasa cae — ahora se puede reintentar el envío puntual desde acá una vez resuelta la causa (ej. token de Meta renovado).</p>
                    <div className="card">
                      {fallidos.slice(0, 50).map(w => (
                        <div key={w.id} className="row" style={{ cursor:'default' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{w.user_name || w.from_number || 'Destinatario desconocido'} <span style={{ fontWeight:400, color:'var(--ink-3)' }}>· {w.user_type || '—'}</span></div>
                            <div style={{ fontSize:11, color:'var(--ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{w.wa_send_error || 'Error desconocido'} · {new Date(w.created_at).toLocaleString('es-CR')}</div>
                          </div>
                          <button
                            onClick={() => reintentarWhatsApp(w.id)}
                            disabled={reintentandoWa === w.id}
                            style={{ fontSize:12, color:'var(--accent)', background:'none', border:'1px solid var(--rule)', borderRadius:999, padding:'5px 12px', cursor:'pointer', flexShrink:0, opacity:reintentandoWa===w.id?0.6:1 }}
                          >
                            {reintentandoWa === w.id ? 'Reintentando...' : 'Reintentar'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })()}

      </div>

      {/* ── DRAWER DETALLE ── */}
      {sel && (
        <>
          <div className="overlay" onClick={() => setSel(null)}/>
          <div className="drawer">
            <DrawerDetalle
              sel={sel}
              suscripciones={suscripciones}
              onClose={() => setSel(null)}
              onCambiarPlan={cambiarPlan}
              onMarcarFundador={marcarFundador}
              onAprobarKYC={aprobarKYC}
              onTogglePropiedad={togglePropiedad}
              onVerificarPropiedad={verificarPropiedad}
              onEnviarMensaje={enviarMensaje}
              onActualizarReferido={actualizarReferido}
              onResponderEquipoNido={responderEquipoNido}
              onSuspender={suspenderCuenta}
              onActualizarComision={actualizarComision}
              onEditarPropiedad={editarPropiedad}
              onLog={logAccion}
              onMsg={setMsg}
              onReload={loadAll}
            />
          </div>
        </>
      )}
    </main>
  )
}

// ── MENSAJE FORM ──
// ── ADMINISTRADORES ──
function AdministradoresPanel({ admins, adminUser, onReload, onLog, onMsg }: {
  admins: Admin[]
  adminUser: User | null
  onReload: () => void
  onLog: (accion: string, entidadTipo?: string, entidadId?: string, detalle?: string) => void
  onMsg: (msg: string) => void
}) {
  const [correo, setCorreo] = useState('')
  const [nombre, setNombre] = useState('')
  const [agregando, setAgregando] = useState(false)

  const agregar = async () => {
    if (!correo.trim()) return
    setAgregando(true)
    const { error } = await supabase.from('admins').insert({ correo: correo.trim().toLowerCase(), nombre: nombre.trim() || null })
    if (error) {
      onMsg('✗ No se pudo agregar (' + error.message + ')')
    } else {
      onLog && onLog('Agregó administrador', 'admin', correo.trim().toLowerCase())
      onMsg('✓ Administrador agregado')
      setCorreo(''); setNombre('')
      onReload()
    }
    setAgregando(false)
    setTimeout(() => onMsg(''), 3000)
  }

  const quitar = async (a: Admin) => {
    if (a.correo === adminUser?.email) { onMsg('✗ No podés quitarte a vos mismo'); setTimeout(() => onMsg(''), 3000); return }
    if (!window.confirm('¿Quitar acceso de admin a ' + a.correo + '?')) return
    await supabase.from('admins').delete().eq('id', a.id)
    onLog && onLog('Quitó administrador', 'admin', a.correo)
    onMsg('✓ Acceso removido')
    setTimeout(() => onMsg(''), 3000)
    onReload()
  }

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Acceso al backoffice</div>
        <h1 style={{ fontFamily:'var(--serif)', fontSize:32, fontWeight:400 }}>Administradores <em style={{ fontStyle:'italic', color:'var(--accent)' }}>NIDO.</em></h1>
        <p style={{ fontSize:14, color:'var(--ink-3)', marginTop:6 }}>Quienes tienen acceso completo a este panel. El correo debe tener ya una cuenta NIDO para poder iniciar sesión en /admin/login.</p>
      </div>

      <SeguridadCuentaPanel adminUser={adminUser} onMsg={onMsg}/>

      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Agregar administrador</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8 }}>
          <input value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" className="field"/>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (opcional)" className="field"/>
          <button onClick={agregar} disabled={agregando||!correo.trim()} className="btn btn-dark" style={{ opacity:agregando||!correo.trim()?0.5:1 }}>Agregar</button>
        </div>
      </div>

      <div className="card">
        {admins.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--ink-3)', fontSize:14 }}>No hay administradores registrados.</div>
        ) : admins.map((a: Admin) => (
          <div key={a.id} className="row" style={{ cursor:'default' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-tint)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontSize:15, color:'var(--accent)', flexShrink:0 }}>{(a.nombre||a.correo||'?')[0].toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{a.nombre||'Sin nombre'} {a.correo===adminUser?.email && <span style={{ fontSize:11, color:'var(--accent)' }}>(vos)</span>}</div>
              <div style={{ fontSize:12, color:'var(--ink-3)' }}>{a.correo}</div>
            </div>
            <button onClick={() => quitar(a)} disabled={a.correo===adminUser?.email} style={{ fontSize:12, color:a.correo===adminUser?.email?'var(--ink-3)':'oklch(0.45 0.08 20)', background:'none', border:'none', cursor:a.correo===adminUser?.email?'default':'pointer' }}>
              Quitar acceso
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Verificación en dos pasos (TOTP) para la propia cuenta del admin logueado — usa el
// soporte nativo de MFA de Supabase Auth (supabase.auth.mfa.*), sin tablas ni migraciones
// propias. Es opt-in por admin: nadie queda bloqueado del panel por no haberlo activado
// todavía. Una vez que un admin inscribe un factor, /admin/login le exige el código en
// cada inicio de sesión futuro (ver el paso de desafío ahí).
function SeguridadCuentaPanel({ adminUser, onMsg }: { adminUser: User | null; onMsg: (msg: string) => void }) {
  const [factores, setFactores] = useState<{ id: string; friendly_name?: string | null; status: string }[]>([])
  const [cargando, setCargando] = useState(true)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [qr, setQr] = useState('')
  const [secreto, setSecreto] = useState('')
  const [factorIdPendiente, setFactorIdPendiente] = useState('')
  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [error, setError] = useState('')

  const cargarFactores = async () => {
    setCargando(true)
    const { data } = await supabase.auth.mfa.listFactors()
    setFactores((data?.totp || []).filter(f => f.status === 'verified'))
    setCargando(false)
  }

  // No se llama cargarFactores() directo en el body del efecto (dispara setCargando(true)
  // de forma sincrona, lo cual React desaconseja) -- se envuelve la carga inicial en su
  // propia promesa para que el primer setState ocurra en el microtask, no en el render del efecto.
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setFactores((data?.totp || []).filter(f => f.status === 'verified'))
      setCargando(false)
    })
  }, [])

  const iniciarInscripcion = async () => {
    setError('')
    setInscribiendo(true)
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setInscribiendo(false)
    if (err || !data) { setError(err?.message || 'No se pudo iniciar la inscripción'); return }
    setQr(data.totp.qr_code)
    setSecreto(data.totp.secret)
    setFactorIdPendiente(data.id)
  }

  const confirmarInscripcion = async () => {
    if (codigo.trim().length !== 6) { setError('El código tiene 6 dígitos'); return }
    setError('')
    setVerificando(true)
    const { data: ch, error: errCh } = await supabase.auth.mfa.challenge({ factorId: factorIdPendiente })
    if (errCh || !ch) { setVerificando(false); setError(errCh?.message || 'Error generando el desafío'); return }
    const { error: errVer } = await supabase.auth.mfa.verify({ factorId: factorIdPendiente, challengeId: ch.id, code: codigo.trim() })
    setVerificando(false)
    if (errVer) { setError('Código incorrecto — probá de nuevo'); return }
    setQr(''); setSecreto(''); setFactorIdPendiente(''); setCodigo('')
    onMsg('✓ Verificación en dos pasos activada')
    setTimeout(() => onMsg(''), 3000)
    cargarFactores()
  }

  const desactivar = async (factorId: string) => {
    if (!window.confirm('¿Desactivar la verificación en dos pasos de tu cuenta?')) return
    await supabase.auth.mfa.unenroll({ factorId })
    onMsg('✓ Verificación en dos pasos desactivada')
    setTimeout(() => onMsg(''), 3000)
    cargarFactores()
  }

  return (
    <div className="card card-pad" style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Verificación en dos pasos — {adminUser?.email}</div>
      <p style={{ fontSize:12, color:'var(--ink-3)', marginBottom:14, lineHeight:1.6 }}>Agrega un código de una app autenticadora (Google Authenticator, Authy, 1Password) a tu propio inicio de sesión. Es opt-in — activarlo no afecta a otros administradores.</p>
      {cargando ? (
        <div style={{ fontSize:12, color:'var(--ink-3)' }}>Cargando...</div>
      ) : factores.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {factores.map(f => (
            <div key={f.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--accent-tint)', borderRadius:8 }}>
              <span style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>✓ Activa {f.friendly_name ? '· ' + f.friendly_name : ''}</span>
              <button onClick={() => desactivar(f.id)} style={{ fontSize:12, color:'oklch(0.45 0.08 20)', background:'none', border:'none', cursor:'pointer' }}>Desactivar</button>
            </div>
          ))}
        </div>
      ) : factorIdPendiente ? (
        <div>
          {error && <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, padding:'8px 12px', marginBottom:12, color:'oklch(0.45 0.08 20)', fontSize:12 }}>{error}</div>}
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', marginBottom:14 }}>
            {qr && <img src={qr} alt="Código QR" style={{ width:160, height:160, border:'1px solid var(--rule)', borderRadius:8 }}/>}
            <div style={{ fontSize:12, color:'var(--ink-3)', maxWidth:280 }}>
              <p style={{ marginBottom:8 }}>Escaneá el código con tu app autenticadora, o ingresá esta clave manualmente:</p>
              <code style={{ display:'block', background:'var(--bg)', padding:'8px 10px', borderRadius:6, wordBreak:'break-all', fontSize:11, marginBottom:12 }}>{secreto}</code>
              <p>Después, ingresá el código de 6 dígitos que te muestra la app para confirmar.</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, maxWidth:280 }}>
            <input value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="field" style={{ fontFamily:'var(--mono)', letterSpacing:'0.2em', textAlign:'center' }}/>
            <button onClick={confirmarInscripcion} disabled={verificando || codigo.length !== 6} className="btn btn-primary" style={{ opacity:verificando||codigo.length!==6?0.5:1, whiteSpace:'nowrap' }}>{verificando ? 'Verificando...' : 'Confirmar'}</button>
          </div>
        </div>
      ) : (
        <div>
          {error && <div style={{ background:'oklch(0.97 0.03 20)', border:'1px solid oklch(0.85 0.06 20)', borderRadius:8, padding:'8px 12px', marginBottom:12, color:'oklch(0.45 0.08 20)', fontSize:12 }}>{error}</div>}
          <button onClick={iniciarInscripcion} disabled={inscribiendo} className="btn btn-dark" style={{ opacity:inscribiendo?0.6:1 }}>{inscribiendo ? 'Generando...' : '+ Activar verificación en dos pasos'}</button>
        </div>
      )}
    </div>
  )
}

function MensajeForm({ asesores, propietarios, onSend }: {
  asesores: Perfil[]
  propietarios: Propietario[]
  onSend: (correo: string, asunto: string, mensaje: string) => Promise<void>
}) {
  const [destinatario, setDestinatario] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const todos = [
    ...asesores.map((a: Perfil) => ({ correo:a.correo, nombre:a.nombre||a.correo, tipo:'Asesor' })),
    ...propietarios.map((p: Propietario) => ({ correo:p.correo, nombre:p.nombre||p.correo, tipo:'Propietario' })),
  ]

  const enviar = async () => {
    if (!destinatario || !asunto || !mensaje) return
    setEnviando(true)
    await onSend(destinatario, asunto, mensaje)
    setExito(true); setAsunto(''); setMensaje(''); setDestinatario('')
    setTimeout(() => setExito(false), 3000)
    setEnviando(false)
  }

  return (
    <div className="card card-pad">
      <h3 style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:20 }}>Nuevo mensaje</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Destinatario</label>
          <select value={destinatario} onChange={e => setDestinatario(e.target.value)} className="field" style={{ appearance:'none' }}>
            <option value="">Seleccionar...</option>
            {todos.map(t => <option key={t.correo} value={t.correo}>[{t.tipo}] {t.nombre} — {t.correo}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Asunto</label>
          <input className="field" value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Asunto del mensaje"/>
        </div>
        <div>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Mensaje</label>
          <textarea className="field" value={mensaje} onChange={e => setMensaje(e.target.value)} rows={6} placeholder="Escribí tu mensaje aquí..." style={{ resize:'vertical' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={enviar} disabled={enviando||!destinatario||!asunto||!mensaje} className="btn btn-primary" style={{ opacity:enviando||!destinatario||!asunto||!mensaje?0.5:1 }}>
            {enviando ? 'Enviando...' : 'Enviar mensaje →'}
          </button>
        </div>
        {exito && <div style={{ padding:'10px', background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:8, fontSize:13, color:'var(--accent)', textAlign:'center' }}>✓ Mensaje enviado correctamente</div>}
      </div>
    </div>
  )
}

// ── DRAWER DETALLE ──
function DrawerDetalle({ sel, suscripciones, onClose, onCambiarPlan, onMarcarFundador, onAprobarKYC, onTogglePropiedad, onVerificarPropiedad, onEnviarMensaje, onActualizarReferido, onResponderEquipoNido, onSuspender, onActualizarComision, onEditarPropiedad, onLog, onMsg, onReload }: {
  sel: SelItem
  suscripciones: Suscripcion[]
  onClose: () => void
  onCambiarPlan: (correo: string, plan: string) => void
  onMarcarFundador: (correo: string) => void
  onAprobarKYC: (id: string, aprobar: boolean, notas?: string) => void
  onTogglePropiedad: (id: string, disponible: boolean) => void
  onVerificarPropiedad: (id: string, aprobar: boolean, notas?: string) => void
  onEnviarMensaje: (correo: string, asunto: string, mensaje: string) => void
  onActualizarReferido: (id: string, estado: string, recompensaMonto?: number | null, notas?: string, recompensaTipo?: string, recompensaPct?: number | null, recompensaMesesMax?: number | null) => void
  onResponderEquipoNido: (asesor: Perfil, aprobar: boolean) => void
  onSuspender: (tabla: 'perfiles'|'propietarios', id: string, correo: string, suspender: boolean) => void
  onActualizarComision: (id: string, patch: Partial<Comision>) => void
  onEditarPropiedad: (id: string, patch: Partial<Propiedad>) => void
  onLog: (accion: string, entidadTipo?: string, entidadId?: string, detalle?: string) => void
  onMsg: (msg: string) => void
  onReload: () => void
}) {
  const [nuevoPlan, setNuevoPlan] = useState('')
  const [notasKYC, setNotasKYC] = useState(sel?.verificacion_notas||'')
  const [msgInterno, setMsgInterno] = useState('')
  const [asuntoInterno, setAsuntoInterno] = useState('')
  const [updating, setUpdating] = useState(false)
  const [contratoLoadError, setContratoLoadError] = useState('')
  const [notasComision, setNotasComision] = useState(sel?.notas||'')
  const [editandoProp, setEditandoProp] = useState(false)
  const [propEdit, setPropEdit] = useState<Partial<Propiedad> | null>(null)

  const sus = suscripciones.find((s: Suscripcion) => s.correo === sel.correo && s.activo)

  if (sel._tipo === 'asesor' || sel._tipo === 'kyc') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Asesor afiliado</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.nombre||'Sin nombre'}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>

        {/* Foto y estado */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:'16px', background:'var(--bg)', borderRadius:10 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden', background:'var(--accent-tint)', display:'grid', placeItems:'center', flexShrink:0 }}>
            {sel.foto_url ? <img src={sel.foto_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <span style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--accent)' }}>{(sel.nombre||'?')[0]}</span>}
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{sel.nombre||'Sin nombre'}</div>
            <div style={{ display:'flex', gap:8 }}>
              {sel.verificado && <span className="badge" style={{ background:'var(--accent)', color:'white' }}>✓ Verificado</span>}
              {sus && <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', textTransform:'uppercase' }}>{getPlanConfig(sus.plan).nombrePublico}</span>}
              {sel.suspendido && <span className="badge" style={{ background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }}>⛔ Suspendido</span>}
            </div>
          </div>
        </div>

        {/* Gestión admin */}
        <div style={{ marginBottom:20, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>Gestión</div>
          <a
            href={'/dashboard/nueva-propiedad?admin=1&asesorEmail='+encodeURIComponent(sel.correo||'')+'&asesorNombre='+encodeURIComponent(sel.nombre||'')+'&asesorWhatsapp='+encodeURIComponent(sel.telefono||'')}
            className="btn btn-dark"
            style={{ textAlign:'center', textDecoration:'none' }}
          >
            🏠 Registrar propiedad para este asesor
          </a>
          {sel.equipo_nido_estado === 'aprobado' ? (
            <span className="badge" style={{ background:'var(--accent-tint)', color:'var(--accent)', textAlign:'center', padding:'8px 12px' }}>⭐ Ya está en Equipo NIDO</span>
          ) : (
            <button
              onClick={async () => { setUpdating(true); await onResponderEquipoNido(sel as Perfil, true); setUpdating(false); onMsg('✓ '+(sel.nombre||sel.correo)+' agregado a Equipo NIDO'); onClose() }}
              disabled={updating}
              className="btn btn-outline"
              style={{ opacity:updating?0.6:1 }}
            >
              ⭐ Agregar a Equipo NIDO
            </button>
          )}
          <button
            onClick={async () => { setUpdating(true); await onSuspender('perfiles', sel.id||'', sel.correo||'', !sel.suspendido); setUpdating(false) }}
            disabled={updating}
            className="btn"
            style={{ background:sel.suspendido?'var(--accent-tint)':'transparent', color:sel.suspendido?'var(--accent)':'oklch(0.45 0.08 20)', border:'1px solid '+(sel.suspendido?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), opacity:updating?0.6:1 }}
          >
            {sel.suspendido ? '↺ Reactivar cuenta' : '⛔ Suspender cuenta'}
          </button>
        </div>

        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Información</div>
          {[
            { l:'Correo', v:sel.correo },
            { l:'Teléfono', v:sel.telefono||'—' },
            { l:'Cédula', v:sel.cedula||'—' },
            { l:'Código corredor', v:sel.codigo_corredor||'—' },
            { l:'Estado KYC', v:sel.verificacion_estado||'pendiente' },
            { l:'Plan actual', v:sus?.plan||'gratis' },
            { l:'Registro', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Documentos KYC */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Documentos KYC</div>
          {[
            { label:'Cédula Frente', url:sel.cedula_frente_url },
            { label:'Cédula Reverso', url:sel.cedula_reverso_url },
            { label:'Selfie con cédula', url:sel.selfie_url },
          ].map(doc => (
            <div key={doc.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1px solid var(--rule)', borderRadius:8, marginBottom:6, background:doc.url?'var(--accent-tint)':'var(--bg)' }}>
              <span style={{ fontSize:13, color:doc.url?'var(--accent)':'var(--ink-3)', display:'flex', alignItems:'center', gap:8 }}>
                {doc.url?'✓':'○'} {doc.label}
              </span>
              {doc.url && <button onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch('/api/kyc-url', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+session?.access_token}, body: JSON.stringify({ path: doc.url }) })
                const json = await res.json()
                if (res.ok && json.signedUrl) window.open(json.signedUrl, '_blank')
              }} style={{ fontSize:12, color:'var(--accent)', fontWeight:500, background:'none', border:'none', padding:0, cursor:'pointer' }}>Ver →</button>}
            </div>
          ))}
        </div>

        {/* KYC acciones */}
        {!sel.verificado && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Notas para el asesor</div>
            <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Motivo de rechazo o instrucciones..." className="field" style={{ marginBottom:10, resize:'vertical' }}/>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={async () => { setUpdating(true); await onAprobarKYC(sel.id||'', true, notasKYC); setUpdating(false) }} disabled={updating||!sel.cedula_frente_url||!sel.cedula_reverso_url||!sel.selfie_url} className="btn btn-primary" style={{ flex:2, opacity:updating||!sel.cedula_frente_url?0.5:1 }}>
                ✓ Aprobar KYC
              </button>
              <button onClick={async () => { setUpdating(true); await onAprobarKYC(sel.id||'', false, notasKYC); setUpdating(false) }} disabled={updating} className="btn btn-danger" style={{ flex:1 }}>
                ✗ Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Cambiar plan */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Cambiar membresía</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
            <select value={nuevoPlan} onChange={e => setNuevoPlan(e.target.value)} className="field" style={{ appearance:'none' }}>
              <option value="">Seleccionar plan...</option>
              <option value="gratis">{getPlanConfig('gratis').nombrePublico} — Gratis</option>
              <option value="pro">{getPlanConfig('pro').nombrePublico} — ${getPlanConfig('pro').precioMensual}/mes</option>
              <option value="enterprise">{getPlanConfig('enterprise').nombrePublico} — ${getPlanConfig('enterprise').precioMensual}/mes</option>
            </select>
            <button onClick={async () => { if (!nuevoPlan) return; await onCambiarPlan(sel.correo||'', nuevoPlan); onMsg('✓ Plan cambiado a '+nuevoPlan) }} disabled={!nuevoPlan} className="btn btn-dark" style={{ opacity:!nuevoPlan?0.5:1 }}>
              Aplicar
            </button>
          </div>
        </div>

        {/* Mensaje interno */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Enviar mensaje</div>
          <input value={asuntoInterno} onChange={e => setAsuntoInterno(e.target.value)} placeholder="Asunto" className="field" style={{ marginBottom:8 }}/>
          <textarea value={msgInterno} onChange={e => setMsgInterno(e.target.value)} rows={3} placeholder="Mensaje para el asesor..." className="field" style={{ marginBottom:8, resize:'vertical' }}/>
          <button onClick={async () => { if (!msgInterno||!asuntoInterno) return; await onEnviarMensaje(sel.correo||'', asuntoInterno, msgInterno); setMsgInterno(''); setAsuntoInterno('') }} disabled={!msgInterno||!asuntoInterno} className="btn btn-dark" style={{ width:'100%', opacity:!msgInterno||!asuntoInterno?0.5:1 }}>
            ✉ Enviar mensaje al asesor
          </button>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'propietario') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.35 0.08 240)', marginBottom:4 }}>Propietario</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20, display:'flex', alignItems:'center', gap:8 }}>
            {sel.nombre}
            {sel.suspendido && <span className="badge" style={{ background:'oklch(0.93 0.05 20)', color:'oklch(0.45 0.08 20)' }}>⛔ Suspendido</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {[
          { l:'Nombre', v:sel.nombre },
          { l:'Correo', v:sel.correo },
          { l:'Teléfono', v:sel.telefono||'—' },
          { l:'Cédula', v:sel.cedula||'—' },
          { l:'Relación', v:sel.relacion||'—' },
          { l:'Registro', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
        ].map(f => (
          <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
            <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
            <span style={{ fontWeight:500 }}>{f.v}</span>
          </div>
        ))}
        <button
          onClick={async () => { setUpdating(true); await onSuspender('propietarios', sel.id||'', sel.correo||'', !sel.suspendido); setUpdating(false) }}
          disabled={updating}
          className="btn"
          style={{ width:'100%', marginTop:16, background:sel.suspendido?'var(--accent-tint)':'transparent', color:sel.suspendido?'var(--accent)':'oklch(0.45 0.08 20)', border:'1px solid '+(sel.suspendido?'oklch(0.85 0.04 150)':'oklch(0.85 0.06 20)'), opacity:updating?0.6:1 }}
        >
          {sel.suspendido ? '↺ Reactivar cuenta' : '⛔ Suspender cuenta'}
        </button>
        <div style={{ marginTop:16 }}>
          <input value={asuntoInterno} onChange={e => setAsuntoInterno(e.target.value)} placeholder="Asunto" className="field" style={{ marginBottom:8 }}/>
          <textarea value={msgInterno} onChange={e => setMsgInterno(e.target.value)} rows={3} placeholder="Mensaje para el propietario..." className="field" style={{ marginBottom:8, resize:'vertical' }}/>
          <button onClick={async () => { await onEnviarMensaje(sel.correo||'', asuntoInterno, msgInterno); setMsgInterno(''); setAsuntoInterno('') }} disabled={!msgInterno||!asuntoInterno} className="btn btn-dark" style={{ width:'100%', opacity:!msgInterno||!asuntoInterno?0.5:1 }}>
            ✉ Enviar mensaje
          </button>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'propiedad') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)', marginBottom:4 }}>{sel.ref_id}</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.titulo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>

        {/* Estado verificación */}
        <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:10, background:sel.verificacion_estado==='aprobada'?'var(--accent-tint)':sel.verificacion_estado==='rechazada'?'oklch(0.97 0.03 20)':'oklch(0.93 0.05 80)', border:'1px solid '+(sel.verificacion_estado==='aprobada'?'oklch(0.85 0.04 150)':sel.verificacion_estado==='rechazada'?'oklch(0.85 0.06 20)':'oklch(0.88 0.05 80)') }}>
          <span style={{ fontSize:13, fontWeight:500, color:sel.verificacion_estado==='aprobada'?'var(--accent)':sel.verificacion_estado==='rechazada'?'oklch(0.45 0.08 20)':'oklch(0.45 0.08 80)' }}>
            {sel.verificacion_estado==='aprobada'?'✓ Propiedad aprobada y publicada':sel.verificacion_estado==='rechazada'?'✗ Propiedad rechazada':sel.verificacion_estado==='pendiente_verificacion'?'⏳ Pendiente de verificación':'Borrador'}
          </span>
        </div>

        {/* Datos generales */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)' }}>Datos generales</div>
            <button
              onClick={() => { if (!editandoProp) setPropEdit({ titulo:sel.titulo||'', precio:sel.precio||0, descripcion:sel.descripcion||'', habitaciones:sel.habitaciones||0, banos:sel.banos||0, metros:sel.metros||0, estacionamientos:sel.estacionamientos||0 }); setEditandoProp(!editandoProp) }}
              style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}
            >
              {editandoProp ? 'Cancelar' : '✎ Editar'}
            </button>
          </div>

          {editandoProp && propEdit ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>Título</label>
                <input className="field" value={propEdit.titulo} onChange={e => setPropEdit({...propEdit, titulo:e.target.value})}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>Precio (USD)</label>
                <input type="number" className="field" value={propEdit.precio} onChange={e => setPropEdit({...propEdit, precio:parseInt(e.target.value)||0})}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div>
                  <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>Hab.</label>
                  <input type="number" className="field" value={propEdit?.habitaciones ?? ''} onChange={e => setPropEdit({...propEdit, habitaciones:parseInt(e.target.value)||0})}/>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>Baños</label>
                  <input type="number" className="field" value={propEdit?.banos ?? ''} onChange={e => setPropEdit({...propEdit, banos:parseInt(e.target.value)||0})}/>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>m²</label>
                  <input type="number" className="field" value={propEdit?.metros ?? ''} onChange={e => setPropEdit({...propEdit, metros:parseInt(e.target.value)||0})}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--ink-3)', display:'block', marginBottom:4 }}>Descripción</label>
                <textarea className="field" rows={4} style={{ resize:'vertical' }} value={propEdit?.descripcion ?? ''} onChange={e => setPropEdit({...propEdit, descripcion:e.target.value})}/>
              </div>
              <button
                onClick={async () => { setUpdating(true); await onEditarPropiedad(sel.id||'', propEdit||{}); setUpdating(false); setEditandoProp(false) }}
                disabled={updating}
                className="btn btn-primary"
                style={{ opacity:updating?0.5:1 }}
              >
                Guardar cambios
              </button>
            </div>
          ) : [
            { l:'Título', v:sel.titulo },
            { l:'Zona', v:sel.zona||'—' },
            { l:'Precio', v:'$'+Number(sel.precio||0).toLocaleString()+' USD'+(sel.precio_anterior?' (antes $'+Number(sel.precio_anterior).toLocaleString()+')':'') },
            { l:'Tipo', v:sel.tipo||'—' },
            { l:'Operación', v:sel.operacion||'—' },
            { l:'Hab. / Baños / m²', v:(sel.habitaciones??'—')+' / '+(sel.banos??'—')+' / '+(sel.metros||sel.lote_m2||'—') },
            { l:'Asesor/Propietario', v:sel.asesor_email||'—' },
            { l:'Colaboración 50/50', v:sel.acepta_colaboracion===false?'✗ No, el asesor la maneja solo':'✓ Abierta a otros asesores' },
            { l:'Publicada', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Datos registrales */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Datos registrales</div>
          {[
            { l:'Número de finca', v:sel.numero_finca||'—' },
            { l:'Número de plano', v:sel.numero_plano||'—' },
            { l:'Naturaleza', v:sel.naturaleza||'—' },
            { l:'Área registral', v:sel.area_registral?sel.area_registral+'m²':'—' },
            { l:'Colindancias', v:sel.colindancias||'—' },
            { l:'Gravámenes', v:sel.gravamenes||'—' },
            { l:'Anotaciones', v:sel.anotaciones||'—' },
            { l:'Libre de gravámenes', v:sel.libre_gravamenes?'✓ Confirmado':'✗ No confirmado' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)', flexShrink:0, marginRight:12 }}>{f.l}</span>
              <span style={{ fontWeight:500, textAlign:'right', color:f.l==='Libre de gravámenes'?(sel.libre_gravamenes?'var(--accent)':'oklch(0.45 0.08 20)'):'var(--ink)' }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Notas */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Notas para el propietario/asesor</label>
          <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Ej. Favor verificar el número de finca, no coincide con el plano..." className="field" style={{ resize:'vertical' }}/>
        </div>

        {/* Acciones verificación */}
        {sel.verificacion_estado !== 'aprobada' && (
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <button onClick={() => onVerificarPropiedad(sel.id||'', true, notasKYC)} disabled={!sel.libre_gravamenes} className="btn btn-primary" style={{ flex:2, opacity:!sel.libre_gravamenes?0.5:1 }}>
              ✓ Aprobar y publicar
            </button>
            <button onClick={() => onVerificarPropiedad(sel.id||'', false, notasKYC)} className="btn btn-danger" style={{ flex:1 }}>
              ✗ Rechazar
            </button>
          </div>
        )}
        {!sel.libre_gravamenes && (
          <p style={{ fontSize:11, color:'oklch(0.45 0.08 20)', marginBottom:12 }}>⚠️ El propietario no confirmó que la propiedad está libre de gravámenes.</p>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { onTogglePropiedad(sel.id||'', !!sel.disponible); onClose() }} className={'btn btn-outline'} style={{ flex:1 }}>
            {sel.disponible ? '⏸ Pausar' : '▶ Activar'}
          </button>
          <a href={'/propiedades/'+sel.id} target="_blank" className="btn btn-outline" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            Ver ficha →
          </a>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'suscripcion') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Suscripción</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.correo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {[
          { l:'Correo', v:sel.correo },
          { l:'Plan', v:sel.plan },
          { l:'Período', v:sel.periodo },
          { l:'Estado', v:sel.activo?'Activa':'Inactiva' },
          { l:'Inicio', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          { l:'Asesor fundador', v:sel.es_fundador?('⭐ Sí · '+(sel.descuento_pct||0)+'% descuento permanente'):'No' },
        ].map(f => (
          <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
            <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
            <span style={{ fontWeight:500 }}>{f.v}</span>
          </div>
        ))}
        {!sel.es_fundador && (
          <div style={{ marginTop:16 }}>
            <button onClick={() => onMarcarFundador(sel.correo||'')} className="btn btn-primary" style={{ width:'100%' }}>
              ⭐ Marcar como asesor fundador (trial 21 días + 20% descuento permanente)
            </button>
          </div>
        )}
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Cambiar plan manualmente</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
            <select value={nuevoPlan} onChange={e => setNuevoPlan(e.target.value)} className="field" style={{ appearance:'none' }}>
              <option value="">Seleccionar plan...</option>
              <option value="gratis">Gratis</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button onClick={async () => { if (!nuevoPlan) return; await onCambiarPlan(sel.correo||'', nuevoPlan); onMsg('✓ Plan actualizado') }} disabled={!nuevoPlan} className="btn btn-dark">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'contrato') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Contrato</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.propietario_nombre || sel.propietario_correo}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          {[
            { l:'Propietario', v:sel.propietario_nombre||'—' },
            { l:'Correo', v:sel.propietario_correo },
            { l:'Tipo', v:sel.tipo==='exclusividad'?'Exclusividad':sel.tipo==='no_exclusivo'?'No exclusivo (push de venta)':sel.tipo==='mensual'?'Mensual (legado)':sel.tipo },
            { l:'Estado', v:sel.estado },
            { l:'Firma', v:sel.firma_tipo==='digital'?'Digital GAUDI':'Física escaneada' },
            { l:'Inicio', v:sel.fecha_inicio?new Date(sel.fecha_inicio).toLocaleDateString('es-CR'):'—' },
            { l:'Vencimiento', v:sel.fecha_vencimiento?new Date(sel.fecha_vencimiento).toLocaleDateString('es-CR'):'—' },
            { l:'Comisión', v:sel.comision_porcentaje+'%' },
          ].map((f) => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Ver firma */}
        {sel.firma_url && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Documento firmado</div>
            {sel.firma_tipo === 'digital' && sel.firma_url.startsWith('data:') ? (
              <a href={sel.firma_url} target="_blank" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, textDecoration:'none', color:'var(--ink)', background:'var(--bg)' }}>
                <span style={{ fontSize:20 }}>{sel.firma_tipo==='digital'?'🔐':'📄'}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>Ver documento firmado</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>{sel.firma_tipo==='digital'?'PDF firmado con GAUDI':'Firma física escaneada'}</div>
                </div>
                <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
              </a>
            ) : (
              <button onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch('/api/kyc-url', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+session?.access_token}, body: JSON.stringify({ path: sel.firma_url }) })
                const json = await res.json()
                if (res.ok && json.signedUrl) window.open(json.signedUrl, '_blank')
              }} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, color:'var(--ink)', background:'var(--bg)', width:'100%', cursor:'pointer' }}>
                <span style={{ fontSize:20 }}>{sel.firma_tipo==='digital'?'🔐':'📄'}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>Ver documento firmado</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>{sel.firma_tipo==='digital'?'PDF firmado con GAUDI':'Firma física escaneada'}</div>
                </div>
                <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
              </button>
            )}
          </div>
        )}

        {/* Ver PDF contrato */}
        <div style={{ marginBottom:20 }}>
          {contratoLoadError && <p style={{ color:'oklch(0.45 0.08 20)', fontSize:12, margin:'0 0 8px', padding:'8px 12px', background:'oklch(0.97 0.02 20)', borderRadius:8, border:'1px solid oklch(0.88 0.04 20)' }}>{contratoLoadError}</p>}
          <button onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/contrato-pdf?correo='+sel.propietario_correo+'&tipo='+sel.tipo, { headers: { 'Authorization': 'Bearer ' + session?.access_token } })
            if (!res.ok) { setContratoLoadError('No se pudo cargar el contrato.'); return }
            setContratoLoadError('')
            const html = await res.text()
            const blob = new Blob([html], { type: 'text/html' })
            window.open(URL.createObjectURL(blob), '_blank')
          }} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid var(--rule)', borderRadius:10, background:'var(--bg)', cursor:'pointer', width:'100%', textAlign:'left' }}>
            <span style={{ fontSize:20 }}>📋</span>
            <div style={{ fontSize:13, fontWeight:500 }}>Ver contrato original</div>
            <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
          </button>
        </div>

        {/* Acciones */}
        {sel.estado === 'pendiente' && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Acciones</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={async () => {
                setUpdating(true)
                await supabase.from('contratos').update({ estado:'activo', firmado_nido:true, firmado_at: new Date().toISOString() }).eq('id', sel.id)
                // Notify propietario
                fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ to: sel.propietario_correo, tipo:'contrato_aprobado', data:{ nombre: sel.propietario_nombre, tipo: sel.tipo } }) }).catch(()=>{})
                onLog && onLog('Contrafirmó contrato', 'contrato', sel.id, sel.propietario_correo)
                onReload(); onMsg('✓ Contrato activado'); onClose()
                setUpdating(false)
              }} disabled={updating} className="btn btn-primary" style={{ opacity:updating?0.5:1 }}>
                ✓ Contrafirmar y activar contrato
              </button>
              <button onClick={async () => {
                setUpdating(true)
                await supabase.from('contratos').update({ estado:'cancelado' }).eq('id', sel.id)
                onLog && onLog('Canceló contrato', 'contrato', sel.id, sel.propietario_correo)
                onReload(); onMsg('Contrato cancelado'); onClose()
                setUpdating(false)
              }} disabled={updating} style={{ padding:'10px', borderRadius:999, border:'1px solid oklch(0.85 0.06 20)', color:'oklch(0.45 0.08 20)', background:'transparent', fontSize:13, cursor:'pointer' }}>
                ✗ Rechazar contrato
              </button>
            </div>
          </div>
        )}

        {sel.estado === 'activo' && (
          <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'var(--accent)' }}>
            ✓ Contrato activo y vigente. El propietario puede publicar propiedades.
          </div>
        )}

        {/* Contacto */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Contactar propietario</div>
          <div style={{ display:'flex', gap:8 }}>
            <a href={'mailto:'+sel.propietario_correo+'?subject=Contrato NIDO - '+sel.propietario_nombre} className="btn btn-outline" style={{ flex:1, textAlign:'center', textDecoration:'none', padding:'10px' }}>✉ Email</a>
            <a href="https://wa.me/50688226436" target="_blank" className="btn" style={{ flex:1, background:'#22c55e', color:'white', textAlign:'center', textDecoration:'none', padding:'10px', borderRadius:999, fontSize:13, fontWeight:500 }}>💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'kyc_propietario') return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.35 0.08 240)', marginBottom:4 }}>KYC Propietario</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.nombre}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {/* Datos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Información</div>
          {[
            { l:'Nombre', v:sel.nombre },
            { l:'Correo', v:sel.correo },
            { l:'Teléfono', v:sel.telefono||'—' },
            { l:'Cédula', v:sel.cedula||'—' },
            { l:'Relación', v:sel.relacion||'—' },
            { l:'Estado KYC', v:sel.verificacion_estado||'pendiente_docs' },
            { l:'Registro', v:sel.created_at?new Date(sel.created_at).toLocaleDateString('es-CR'):'—' },
          ].map(f => (
            <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>{f.l}</span>
              <span style={{ fontWeight:500 }}>{f.v}</span>
            </div>
          ))}
        </div>

        {/* Documentos */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Documentos KYC</div>
          {[
            { label:'Cédula Frente', url:sel.cedula_frente_url },
            { label:'Cédula Reverso', url:sel.cedula_reverso_url },
            { label:'Selfie con cédula', url:sel.selfie_url },
          ].map(doc => (
            <div key={doc.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1px solid var(--rule)', borderRadius:8, marginBottom:6, background:doc.url?'var(--accent-tint)':'var(--bg)' }}>
              <span style={{ fontSize:13, color:doc.url?'var(--accent)':'var(--ink-3)', display:'flex', alignItems:'center', gap:8 }}>
                {doc.url?'✓':'○'} {doc.label}
              </span>
              {doc.url && <button onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch('/api/kyc-url', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+session?.access_token}, body: JSON.stringify({ path: doc.url }) })
                const json = await res.json()
                if (res.ok && json.signedUrl) window.open(json.signedUrl, '_blank')
              }} style={{ fontSize:12, color:'var(--accent)', fontWeight:500, background:'none', border:'none', padding:0, cursor:'pointer' }}>Ver →</button>}
            </div>
          ))}
        </div>

        {/* Notas y acciones */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Notas para el propietario</label>
          <textarea value={notasKYC} onChange={e => setNotasKYC(e.target.value)} rows={3} placeholder="Ej. La foto de la cédula no es legible..." className="field" style={{ resize:'vertical', marginBottom:10 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={async () => {
              setUpdating(true)
              await supabase.from('propietarios').update({ verificado: true, verificacion_estado: 'aprobado', verificacion_notas: notasKYC||null, verificado_at: new Date().toISOString() }).eq('correo', sel.correo)
              onReload(); onMsg('✓ Propietario aprobado'); onClose()
              setUpdating(false)
            }} disabled={updating} className="btn btn-primary" style={{ flex:2, opacity:updating?0.5:1 }}>
              ✓ Aprobar propietario
            </button>
            <button onClick={async () => {
              if (!notasKYC) { onMsg('Agregá una nota de rechazo'); return }
              setUpdating(true)
              await supabase.from('propietarios').update({ verificado: false, verificacion_estado: 'rechazado', verificacion_notas: notasKYC }).eq('correo', sel.correo)
              onReload(); onMsg('Propietario rechazado'); onClose()
              setUpdating(false)
            }} disabled={updating} className="btn btn-danger" style={{ flex:1 }}>
              ✗ Rechazar
            </button>
          </div>
        </div>

        {/* Contacto directo */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Contacto directo</div>
          <div style={{ display:'flex', gap:8 }}>
            {sel.telefono && <a href={'https://wa.me/'+sel.telefono.replace(/[^0-9]/g,'')} target="_blank" className="btn" style={{ flex:1, background:'#22c55e', color:'white', textAlign:'center', textDecoration:'none', padding:'10px' }}>💬 WhatsApp</a>}
            <a href={'mailto:'+sel.correo+'?subject=Verificación NIDO - '+sel.nombre} className="btn btn-outline" style={{ flex:1, textAlign:'center', textDecoration:'none', padding:'10px' }}>✉ Email</a>
          </div>
        </div>
      </div>
    </div>
  )

  if (sel._tipo === 'ticket') return (
    <TicketDetalle ticket={sel} onClose={onClose} onReload={onReload} onMsg={onMsg}/>
  )

  if (sel._tipo === 'referido') return (
    <ReferidoDetalle referido={sel} onClose={onClose} onActualizar={onActualizarReferido}/>
  )

  if (sel._tipo === 'comision') {
    const fmt = (n: number) => '$' + (n||0).toLocaleString('es-CR', { minimumFractionDigits:0, maximumFractionDigits:0 })
    const ESTADOS = ['proyectada','en_proceso','cobrada','cancelada']
    const ESTADO_LABEL: Record<string,string> = { proyectada:'Proyectada', en_proceso:'En proceso', cobrada:'Cobrada', cancelada:'Cancelada' }
    return (
      <div>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Comisión · {sel.propiedad_ref||''}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{sel.propiedad_titulo||'Sin propiedad'}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>

          {/* Estado */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Estado del negocio</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {ESTADOS.map(e => (
                <button
                  key={e}
                  onClick={async () => { setUpdating(true); await onActualizarComision(sel.id||'', { estado: e, ...(e==='cobrada'?{fecha_cierre_real:new Date().toISOString().slice(0,10)}:{}) }); setUpdating(false) }}
                  disabled={updating || sel.estado===e}
                  className={sel.estado===e?'tab active':'tab'}
                  style={{ opacity:updating?0.6:1 }}
                >
                  {ESTADO_LABEL[e]}
                </button>
              ))}
            </div>
          </div>

          {/* Datos generales */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>Datos del negocio</div>
            {[
              { l:'Asesor principal', v:sel.asesor_nombre||sel.asesor_email||'—' },
              { l:'Zona', v:sel.propiedad_zona||'—' },
              { l:'Precio de venta', v:sel.precio_venta?fmt(sel.precio_venta):'—' },
              { l:'% Comisión', v:(sel.porcentaje_comision||0)+'%' },
              { l:'Monto total comisión', v:fmt(sel.monto_comision||0) },
              ...(sel.es_equipo_nido ? [
                { l:'Monto asesor (Equipo NIDO)', v:fmt(sel.monto_asesor||0) },
                { l:'Monto NIDO', v:fmt(sel.monto_nido||0) },
              ] : []),
              ...(sel.colaborador_email ? [
                { l:'Colaborador', v:sel.colaborador_nombre||sel.colaborador_email },
                { l:'Split principal / colaborador', v:(sel.porcentaje_principal||100)+'% / '+(sel.porcentaje_colaborador||0)+'%' },
                { l:'Monto principal', v:fmt(sel.monto_principal||0) },
                { l:'Monto colaborador', v:fmt(sel.monto_colaborador_split||0) },
                { l:'Split confirmado por colaborador', v:sel.split_confirmado_colaborador?'✓ Sí':'Pendiente' },
              ] : []),
              { l:'Cierre estimado', v:sel.fecha_cierre_estimada?new Date(sel.fecha_cierre_estimada).toLocaleDateString('es-CR'):'—' },
              { l:'Cierre real', v:sel.fecha_cierre_real?new Date(sel.fecha_cierre_real).toLocaleDateString('es-CR'):'—' },
              { l:'Registrado por', v:sel.creado_por||'—' },
            ].map((f) => (
              <div key={f.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule-soft)', fontSize:13 }}>
                <span style={{ color:'var(--ink-3)', flexShrink:0, marginRight:12 }}>{f.l}</span>
                <span style={{ fontWeight:500, textAlign:'right' }}>{f.v}</span>
              </div>
            ))}
          </div>

          {/* Pago al asesor */}
          {sel.estado === 'cobrada' && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Pago al asesor</div>
              <button
                onClick={async () => { setUpdating(true); await onActualizarComision(sel.id||'', { pagado_asesor: !sel.pagado_asesor, pagado_asesor_at: !sel.pagado_asesor ? new Date().toISOString() : null }); setUpdating(false) }}
                disabled={updating}
                className="btn"
                style={{ width:'100%', background:sel.pagado_asesor?'var(--accent-tint)':'transparent', color:sel.pagado_asesor?'var(--accent)':'var(--ink-2)', border:'1px solid '+(sel.pagado_asesor?'oklch(0.85 0.04 150)':'var(--rule)'), opacity:updating?0.6:1 }}
              >
                {sel.pagado_asesor ? '✓ Pagado al asesor' : 'Marcar como pagado al asesor'}
              </button>
            </div>
          )}

          {/* Notas */}
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Notas internas</div>
            <textarea value={notasComision} onChange={e => setNotasComision(e.target.value)} rows={3} placeholder="Notas sobre este negocio..." className="field" style={{ marginBottom:10, resize:'vertical' }}/>
            <button onClick={async () => { setUpdating(true); await onActualizarComision(sel.id||'', { notas: notasComision }); setUpdating(false) }} disabled={updating} className="btn btn-dark" style={{ width:'100%', opacity:updating?0.5:1 }}>
              Guardar notas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ── REFERIDO ──
function ReferidoDetalle({ referido, onClose, onActualizar }: {
  referido: SelItem
  onClose: () => void
  onActualizar: (id: string, estado: string, recompensaMonto?: number | null, notas?: string, recompensaTipo?: string, recompensaPct?: number | null, recompensaMesesMax?: number | null) => void
}) {
  const [monto, setMonto] = useState(referido.recompensa_monto ? String(referido.recompensa_monto) : '')
  const [notas, setNotas] = useState(referido.notas_admin || '')
  const [guardando, setGuardando] = useState(false)
  const [tipoRecompensa, setTipoRecompensa] = useState(referido.recompensa_tipo || 'unico')
  const [pct, setPct] = useState(referido.recompensa_pct ? String(referido.recompensa_pct) : '20')
  const [mesesMax, setMesesMax] = useState(referido.recompensa_meses_max ? String(referido.recompensa_meses_max) : '12')

  const cambiarEstado = async (estado: string) => {
    setGuardando(true)
    const montoNum = monto.trim() ? Number(monto) : null
    const pctNum = pct.trim() ? Number(pct) : null
    const mesesMaxNum = mesesMax.trim() ? Number(mesesMax) : null
    await onActualizar(referido.id||'', estado, montoNum, notas, tipoRecompensa, pctNum, mesesMaxNum)
    setGuardando(false)
  }

  return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Referido · {referido.referido_tipo === 'asesor' ? 'Asesor' : 'Propietario'}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{referido.referido_nombre || referido.referido_email}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer', flexShrink:0 }}>×</button>
        </div>
        <div style={{ fontSize:12, color:'var(--ink-3)' }}>{referido.referido_email}</div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20, fontSize:13, color:'var(--ink-2)' }}>
          <div><strong>Referido por:</strong> {referido.referidor_email} ({referido.referidor_tipo === 'asesor' ? 'Asesor' : 'Propietario'})</div>
          <div><strong>Código usado:</strong> {referido.codigo_usado}</div>
          <div><strong>Fecha:</strong> {referido.created_at?new Date(referido.created_at).toLocaleDateString('es-CR'):'—'}</div>
          <div><strong>Estado actual:</strong> {referido.estado}</div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Tipo de recompensa</label>
          <div style={{ display:'flex', gap:8 }}>
            <button type="button" onClick={() => setTipoRecompensa('unico')} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid ' + (tipoRecompensa==='unico' ? 'var(--accent)' : 'var(--rule)'), background: tipoRecompensa==='unico' ? 'var(--accent-tint)' : 'transparent', color: tipoRecompensa==='unico' ? 'var(--accent)' : 'var(--ink-2)', fontSize:12, fontWeight:500, cursor:'pointer' }}>Pago único</button>
            <button type="button" onClick={() => setTipoRecompensa('recurrente_pct')} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid ' + (tipoRecompensa==='recurrente_pct' ? 'var(--accent)' : 'var(--rule)'), background: tipoRecompensa==='recurrente_pct' ? 'var(--accent-tint)' : 'transparent', color: tipoRecompensa==='recurrente_pct' ? 'var(--accent)' : 'var(--ink-2)', fontSize:12, fontWeight:500, cursor:'pointer' }}>% recurrente</button>
          </div>
        </div>

        {tipoRecompensa === 'unico' ? (
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Monto de recompensa (opcional)</label>
            <input type="number" className="field" placeholder="Ej: 50" value={monto} onChange={e => setMonto(e.target.value)}/>
          </div>
        ) : (
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>% de la suscripción</label>
              <input type="number" className="field" placeholder="20" value={pct} onChange={e => setPct(e.target.value)}/>
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Meses tope</label>
              <input type="number" className="field" placeholder="12" value={mesesMax} onChange={e => setMesesMax(e.target.value)}/>
            </div>
          </div>
        )}
        {tipoRecompensa === 'recurrente_pct' && (
          <p style={{ fontSize:11, color:'var(--ink-3)', marginTop:-8, marginBottom:16, lineHeight:1.5 }}>
            Mientras el referido tenga una suscripción paga activa, va a aparecer en &quot;Pagos pendientes este mes&quot; con el {pct || '—'}% de su cuota, hasta {mesesMax || 'sin tope de'} meses.
          </p>
        )}

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:6 }}>Notas internas (opcional)</label>
          <textarea className="field" rows={3} placeholder="Notas para el equipo NIDO" value={notas} onChange={e => setNotas(e.target.value)}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button className="btn" disabled={guardando} onClick={() => cambiarEstado('aprobado')} style={{ padding:'10px', background:'var(--accent)', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>✓ Aprobar recompensa</button>
          <button className="btn" disabled={guardando} onClick={() => cambiarEstado('pagado')} style={{ padding:'10px', background:'var(--ink)', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>$ Marcar como pagado</button>
          <button className="btn btn-outline" disabled={guardando} onClick={() => cambiarEstado('rechazado')} style={{ padding:'10px', background:'transparent', border:'1px solid var(--rule)', borderRadius:8, fontSize:13, cursor:'pointer' }}>Rechazar</button>
        </div>
      </div>
    </div>
  )
}

// ── TICKET DE SOPORTE ──
function TicketDetalle({ ticket, onClose, onReload, onMsg }: {
  ticket: SelItem
  onClose: () => void
  onReload: () => void
  onMsg: (msg: string) => void
}) {
  const [mensajes, setMensajes] = useState<SoporteMensaje[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    supabase.from('soporte_mensajes').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true })
      .then(({ data }) => { setMensajes(data || []); setLoadingMsgs(false) })
  }, [ticket.id])

  const cambiarEstado = async (estado: string) => {
    await supabase.from('soporte_tickets').update({ estado, updated_at: new Date().toISOString() }).eq('id', ticket.id)
    onReload()
    onMsg('✓ Ticket marcado como ' + (estado==='en_progreso'?'en progreso':estado))
  }

  const responder = async () => {
    if (!respuesta.trim() || enviando) return
    setEnviando(true)
    await supabase.from('soporte_mensajes').insert({ ticket_id: ticket.id, remitente: 'admin', contenido: respuesta })
    await supabase.from('soporte_tickets').update({ estado: 'en_progreso', updated_at: new Date().toISOString() }).eq('id', ticket.id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session?.access_token },
      body: JSON.stringify({ to: ticket.usuario_email, tipo: 'mensaje_admin', data: { asunto: 'Re: ' + (ticket.asunto || 'Tu consulta con NIDO'), mensaje: respuesta } })
    }).catch(() => {})
    if (ticket.usuario_tipo === 'asesor') {
      fetch('/api/whatsapp-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session?.access_token },
        body: JSON.stringify({ correo: ticket.usuario_email, tipo: 'ticket_respondido', data: { mensaje: respuesta } })
      }).catch(() => {})
    }
    setMensajes(prev => [...prev, { id: 'temp-'+Date.now(), ticket_id: ticket.id||'', remitente: 'admin', contenido: respuesta, created_at: new Date().toISOString() }])
    setRespuesta('')
    onReload()
    setEnviando(false)
  }

  const remitenteLabel: Record<string,string> = { usuario:'Usuario', valeria:'Valeria IA', admin:'Equipo NIDO' }

  return (
    <div>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--rule)', position:'sticky', top:0, background:'white', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>Ticket de soporte · {ticket.usuario_tipo}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:20 }}>{ticket.asunto || 'Consulta de soporte'}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--rule)', background:'transparent', fontSize:16, display:'grid', placeItems:'center', cursor:'pointer', flexShrink:0 }}>×</button>
        </div>
        <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12 }}>{ticket.usuario_nombre} · {ticket.usuario_email}{ticket.usuario_telefono ? ' · '+ticket.usuario_telefono : ''}</div>
        <div style={{ display:'flex', gap:8 }}>
          {['abierto','en_progreso','resuelto'].map(e => (
            <button key={e} onClick={() => cambiarEstado(e)} className={'tab'+(ticket.estado===e?' active':'')} style={{ fontSize:11, padding:'5px 12px' }}>
              {e==='en_progreso'?'En progreso':e.charAt(0).toUpperCase()+e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'20px 24px' }}>
        <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Conversación</div>
        {loadingMsgs ? (
          <p style={{ fontSize:13, color:'var(--ink-3)' }}>Cargando...</p>
        ) : mensajes.length === 0 ? (
          <p style={{ fontSize:13, color:'var(--ink-3)' }}>Sin mensajes registrados para este ticket.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {mensajes.map((m, i) => (
              <div key={m.id || i} style={{ padding:'10px 14px', borderRadius:10, background: m.remitente==='admin' ? 'var(--accent-tint)' : m.remitente==='valeria' ? 'var(--bg)' : 'white', border:'1px solid var(--rule-soft)' }}>
                <div style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:4 }}>{remitenteLabel[m.remitente] || m.remitente}</div>
                <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{m.contenido}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)', display:'block', marginBottom:8 }}>Responder al usuario</label>
          <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} rows={4} placeholder="Escribí tu respuesta — se envía por correo al usuario..." className="field" style={{ resize:'vertical', marginBottom:10 }}/>
          <button onClick={responder} disabled={!respuesta.trim() || enviando} className="btn btn-primary" style={{ width:'100%', opacity:(!respuesta.trim()||enviando)?0.5:1 }}>
            {enviando ? 'Enviando...' : 'Responder por email →'}
          </button>
        </div>
      </div>
    </div>
  )
}
