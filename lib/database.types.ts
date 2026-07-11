// Tipos generados a mano a partir del esquema real de Supabase (proyecto ivbipiaagbcbasguumjh).
// No es la salida oficial de `supabase gen types` (ese comando no estaba disponible en este
// entorno), pero refleja columnas y nulabilidad reales verificadas contra information_schema.
// Objetivo: reemplazar los `any` sueltos del código por tipos con forma real, sin necesidad
// de generar el árbol completo `Database`. Actualizar aquí si cambia el esquema.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface AdminAuditLog {
  id: string
  admin_email: string
  accion: string
  entidad_tipo: string | null
  entidad_id: string | null
  detalle: string | null
  created_at: string
}

export interface AdminMetricas {
  total_usuarios: number | null
  total_asesores: number | null
  total_propietarios: number | null
  propiedades_activas: number | null
  propiedades_total: number | null
  ofertas_total: number | null
  ofertas_pendientes: number | null
  suscripciones_activas: number | null
  suscripciones_pro: number | null
  suscripciones_enterprise: number | null
  asesores_verificados: number | null
  kyc_pendientes: number | null
}

export interface Admin {
  id: string
  correo: string
  nombre: string | null
  created_at: string | null
}

export interface AlertaBusqueda {
  id: string
  email: string
  zona: string | null
  tipo: string | null
  operacion: string | null
  precio_max: number | null
  activa: boolean
  created_at: string
  ultima_notificacion_at: string | null
}

export interface Calificacion {
  id: string
  asesor_email: string
  calificador_email: string | null
  calificador_nombre: string | null
  calificacion: number
  comentario: string | null
  propiedad_id: string | null
  created_at: string | null
  visita_id: string | null
}

export interface Comision {
  id: string
  asesor_email: string
  asesor_nombre: string | null
  propiedad_id: string | null
  propiedad_ref: string | null
  propiedad_titulo: string | null
  propiedad_zona: string | null
  precio_venta: number | null
  porcentaje_comision: number | null
  monto_comision: number | null
  estado: string | null
  fecha_cierre_estimada: string | null
  fecha_cierre_real: string | null
  notas: string | null
  creado_por: string | null
  created_at: string | null
  updated_at: string | null
  es_equipo_nido: boolean | null
  monto_asesor: number | null
  monto_nido: number | null
  pagado_asesor: boolean | null
  pagado_asesor_at: string | null
  colaborador_email: string | null
  colaborador_nombre: string | null
  porcentaje_principal: number | null
  porcentaje_colaborador: number | null
  monto_principal: number | null
  monto_colaborador_split: number | null
  split_confirmado_colaborador: boolean | null
  split_registrado_at: string | null
}

export interface Contrato {
  id: string
  propietario_correo: string
  propietario_nombre: string | null
  propiedad_id: string | null
  tipo: string | null
  estado: string | null
  fecha_inicio: string | null
  fecha_vencimiento: string | null
  periodo_dias: number | null
  precio_mensual: number | null
  firma_tipo: string | null
  firma_url: string | null
  firmado_propietario: boolean | null
  firmado_nido: boolean | null
  firmado_at: string | null
  comision_porcentaje: number | null
  notas: string | null
  creado_por: string | null
  created_at: string | null
  incluye_administracion: boolean | null
  administracion_porcentaje: number | null
}

export interface EquipoMiembro {
  id: string
  equipo_id: string
  user_id: string | null
  correo: string
  nombre: string | null
  rol: string
  estado: string
  invitado_at: string
  aceptado_at: string | null
  created_at: string
}

export interface Equipo {
  id: string
  nombre: string
  admin_user_id: string
  admin_email: string
  plan: string
  max_agentes: number
  max_propiedades: number
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  nombre: string | null
  email: string | null
  telefono: string | null
  mensaje: string | null
  zona_interes: string | null
  presupuesto: string | null
  tipo_busqueda: string | null
  estado: string | null
  asesor_email: string | null
  propiedad_id: string | null
  created_at: string | null
  updated_at: string | null
  seguimiento_enviado: boolean
  fuente: string | null
  asignado_automaticamente: boolean
}

export interface Noticia {
  id: string
  titulo: string
  resumen: string
  contenido: string | null
  categoria: string | null
  fuente_nombre: string | null
  fuente_url: string | null
  fuente_rss: string | null
  redactado_por: string | null
  tag: string | null
  fecha_publicacion: string | null
  activa: boolean | null
  created_at: string | null
}

export interface Oferta {
  id: string
  propiedad_id: string | null
  asesor_email: string
  asesor_nombre: string | null
  comprador_nombre: string
  comprador_email: string | null
  comprador_telefono: string | null
  valor_oferta: number
  tipo_compra: string
  forma_pago: string | null
  banco: string | null
  pre_aprobado: boolean | null
  monto_prima: number | null
  condiciones: string | null
  estado: string | null
  created_at: string | null
  updated_at: string | null
  contraoferta_valor: number | null
}

export interface Perfil {
  id: string
  nombre: string | null
  correo: string
  telefono: string | null
  cedula: string | null
  codigo_corredor: string | null
  foto_url: string | null
  created_at: string | null
  updated_at: string | null
  cedula_frente_url: string | null
  cedula_reverso_url: string | null
  selfie_url: string | null
  verificado: boolean | null
  verificacion_estado: string | null
  verificacion_notas: string | null
  verificado_por: string | null
  verificado_at: string | null
  valeria_perfil: Json | null
  valeria_onboarding_completo: boolean | null
  contrato_asesor_aceptado: boolean | null
  contrato_asesor_aceptado_at: string | null
  compania: string | null
  solicita_equipo_nido: boolean | null
  equipo_nido_estado: string | null
  contrato_equipo_nido_aceptado: boolean | null
  contrato_equipo_nido_aceptado_at: string | null
  plan: string | null
  codigo_referido: string | null
  referido_por: string | null
  suspendido: boolean
  oficina_id: string | null
}

export interface CursoCompra {
  id: string
  correo: string
  curso_id: number
  curso_titulo: string
  estado: string
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export interface Oficina {
  id: string
  nombre: string
  contacto_nombre: string | null
  contacto_email: string
  telefono: string | null
  estado: string
  asientos_contratados: number
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export interface Propiedad {
  id: string
  titulo: string
  descripcion: string | null
  precio: number
  tipo: string
  operacion: string
  habitaciones: number | null
  banos: number | null
  metros: number | null
  zona: string
  direccion: string | null
  imagen_url: string | null
  asesor_nombre: string | null
  asesor_email: string
  disponible: boolean | null
  created_at: string | null
  asesor_whatsapp: string | null
  ref_id: string | null
  verificacion_estado: string | null
  verificacion_notas: string | null
  verificado_por: string | null
  verificado_at: string | null
  numero_finca: string | null
  numero_plano: string | null
  provincia: string | null
  canton: string | null
  distrito: string | null
  naturaleza: string | null
  area_registral: number | null
  colindancias: string | null
  gravamenes: string | null
  anotaciones: string | null
  libre_gravamenes: boolean | null
  fotos: Json | null
  topografia: string | null
  uso_suelo: string | null
  terreno_tipo: string | null
  cuota_condominal: number | null
  estacionamientos: number | null
  lote_m2: number | null
  amenidades: Json | null
  updated_at: string | null
  propietario_email: string | null
  precio_anterior: number | null
  acepta_colaboracion: boolean
}

export interface Propietario {
  id: string
  user_id: string
  nombre: string
  cedula: string
  telefono: string
  correo: string
  relacion: string
  created_at: string | null
  whatsapp: string | null
  cedula_frente_url: string | null
  cedula_reverso_url: string | null
  selfie_url: string | null
  verificado: boolean | null
  verificacion_estado: string | null
  verificacion_notas: string | null
  verificado_por: string | null
  verificado_at: string | null
  visita_agendada: boolean | null
  visita_fecha: string | null
  visita_tipo: string | null
  foto_url: string | null
  codigo_referido: string | null
  referido_por: string | null
  suspendido: boolean
}

export interface Referido {
  id: string
  codigo_usado: string
  referidor_email: string
  referidor_tipo: string
  referido_email: string
  referido_tipo: string
  referido_nombre: string | null
  estado: string
  recompensa_monto: number | null
  recompensa_tipo: string
  recompensa_pct: number | null
  recompensa_meses_max: number | null
  meses_pagados: number
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export interface ReferidoPagoMensual {
  referido_id: string
  referidor_email: string
  referido_email: string
  referido_nombre: string | null
  recompensa_pct: number | null
  recompensa_meses_max: number | null
  meses_pagados: number
  plan_referido: string | null
  precio_mensual_referido: number | null
  monto_a_pagar_este_mes: number | null
}

export interface ResumenComisiones {
  asesor_email: string | null
  asesor_nombre: string | null
  total_negocios: number | null
  cerrados: number | null
  proyectados: number | null
  en_proceso: number | null
  total_cobrado: number | null
  total_proyectado: number | null
  total_pipeline: number | null
}

export interface SoporteMensaje {
  id: string
  ticket_id: string
  remitente: string
  contenido: string
  created_at: string
}

export interface SoporteTicket {
  id: string
  usuario_email: string
  usuario_nombre: string | null
  usuario_telefono: string | null
  usuario_tipo: string
  canal: string
  asunto: string | null
  estado: string
  prioridad: string
  created_at: string
  updated_at: string
}

export interface Suscripcion {
  id: string
  correo: string
  user_id: string | null
  plan: string
  periodo: string | null
  activo: boolean | null
  created_at: string | null
  updated_at: string | null
  es_trial: boolean | null
  trial_fin: string | null
}

export interface Tarea {
  id: string
  asesor_email: string
  lead_id: string | null
  propiedad_id: string | null
  titulo: string
  descripcion: string | null
  estado: string | null
  prioridad: string | null
  fecha_vencimiento: string | null
  recordatorio_enviado: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface Visita {
  id: string
  propiedad_id: string | null
  propiedad_titulo: string | null
  asesor_email: string | null
  asesor_whatsapp: string | null
  comprador_nombre: string | null
  comprador_telefono: string | null
  comprador_email: string | null
  fecha: string
  hora: string
  tipo: string | null
  estado: string | null
  notas: string | null
  recordatorio_enviado: boolean | null
  created_at: string | null
  resena_solicitada: boolean
}

// Vistas públicas / agregadas
export interface AsesorPublico {
  id: string | null
  nombre: string | null
  correo: string | null
  foto_url: string | null
  valeria_perfil: Json | null
  equipo_nido_estado: string | null
}

export interface AsesorCalificaciones {
  asesor_email: string | null
  promedio: number | null
  total: number | null
}

export interface CalificacionPublica {
  id: string | null
  asesor_email: string | null
  calificador_nombre: string | null
  calificacion: number | null
  comentario: string | null
  propiedad_id: string | null
  created_at: string | null
}
