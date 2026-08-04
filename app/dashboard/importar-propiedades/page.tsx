'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getPlanConfig } from '../../../lib/planes'
import { COSTA_RICA } from '../../../lib/costaRicaData'
import { crcAUsd, obtenerTipoCambioActual, TIPO_CAMBIO_USD_CRC } from '../../../lib/exchangeRate'

// Carga masiva de propiedades vía CSV -- pensada para asesores que se suman
// a NIDO con una cartera existente y necesitan subir muchas propiedades de
// una sola vez, en vez de repetir el wizard de 9 pasos una por una.
//
// Cada propiedad importada entra exactamente igual que si viniera del
// wizard: verificacion_estado='pendiente_verificacion', disponible=false,
// sujeta al mismo chequeo de finca duplicada. No hay atajos de calidad --
// solo se ahorra la repetición manual.

const TIPOS_VALIDOS = ['casa', 'apt', 'villa', 'loft', 'cabana', 'lote']
const OPERACIONES_VALIDAS: Record<string, string> = { venta: 'venta', alquiler: 'alquiler', ambos: 'venta' }

const COLUMNAS = [
  'titulo', 'operacion', 'tipo', 'precio', 'moneda', 'habitaciones', 'banos', 'estacionamientos',
  'metros', 'lote_m2', 'provincia', 'canton', 'distrito', 'direccion', 'amenidades', 'descripcion',
  'whatsapp', 'numero_finca', 'numero_plano', 'naturaleza', 'area_registral', 'colindancias',
  'gravamenes', 'anotaciones', 'fotos',
]

const REQUERIDAS = ['titulo', 'operacion', 'tipo', 'precio', 'provincia', 'canton', 'numero_finca']

interface FilaImportada {
  fila: number
  titulo: string
  operacion: string
  tipo: string
  precio: number
  moneda: 'USD' | 'CRC'
  habitaciones: number
  banos: number
  estacionamientos: number
  metros: number
  lote_m2: number
  provincia: string
  canton: string
  distrito: string
  direccion: string
  amenidades: string[]
  descripcion: string
  whatsapp: string
  numero_finca: string
  numero_plano: string
  naturaleza: string
  area_registral: number | null
  colindancias: string
  gravamenes: string
  anotaciones: string
  fotos: string[]
  fincaNormalizada: string
  errores: string[]
  duplicadaDB: boolean
  duplicadaAsesorNombre: string | null
  duplicadaEnArchivo: boolean
}

// Parser CSV simple (sin dependencias externas, igual filosofía que
// lib/csvExport.ts): soporta campos entre comillas con comas y comillas
// escapadas ("") adentro. No soporta saltos de línea dentro de una celda.
function parseCSV(text: string): string[][] {
  const limpio = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const filas: string[][] = []
  for (const linea of limpio.split('\n')) {
    if (linea.trim() === '') continue
    const celdas: string[] = []
    let actual = ''
    let entreComillas = false
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i]
      if (entreComillas) {
        if (c === '"' && linea[i + 1] === '"') { actual += '"'; i++ }
        else if (c === '"') { entreComillas = false }
        else { actual += c }
      } else {
        if (c === '"') entreComillas = true
        else if (c === ',') { celdas.push(actual); actual = '' }
        else actual += c
      }
    }
    celdas.push(actual)
    filas.push(celdas.map(c => c.trim()))
  }
  return filas
}

function normalizarFinca(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function descargarPlantilla() {
  const ejemplo = [
    'Casa Sereno en Escazú', 'venta', 'casa', '350000', 'USD', '3', '2.5', '2', '240', '420',
    'San José', 'Escazú', 'San Rafael', '200m sur del parque central', 'Piscina;Jardín privado;Aire acondicionado',
    'Residencia contemporánea con vista a la montaña.', '88888888', '123456-000', 'SJ-12345-2020',
    'Finca filial', '250', 'Norte: calle pública, Sur: lote 45, Este: lote 47, Oeste: quebrada',
    'Libre de gravámenes', 'Sin anotaciones', '',
  ]
  const lineas = [COLUMNAS.join(','), ejemplo.map(v => /[",]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')]
  const csv = '﻿' + lineas.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla-propiedades-nido.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ImportarPropiedades() {
  const [user, setUser] = useState<{ email: string, nombre: string, telefono: string } | null>(null)
  const [esIndependiente, setEsIndependiente] = useState(false)
  const [planActual, setPlanActual] = useState('gratis')
  const [propiedadesActuales, setPropiedadesActuales] = useState(0)
  const [contratoAceptado, setContratoAceptado] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)

  const [tipoCambio, setTipoCambio] = useState(TIPO_CAMBIO_USD_CRC)
  useEffect(() => { obtenerTipoCambioActual().then(setTipoCambio) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { window.location.href = '/login'; return }
      const { data } = await supabase.from('perfiles').select('nombre,telefono,contrato_asesor_aceptado,equipo_nido_estado').eq('id', u.id).maybeSingle()
      setUser({ email: u.email || '', nombre: data?.nombre || '', telefono: data?.telefono || '' })
      setContratoAceptado(!!data?.contrato_asesor_aceptado)
      setEsIndependiente(data?.equipo_nido_estado !== 'aprobado')
      const { data: sus } = await supabase.from('suscripciones').select('plan').eq('correo', u.email).maybeSingle()
      const plan = sus?.plan || 'gratis'
      setPlanActual(plan)
      const { count } = await supabase.from('propiedades').select('id', { count: 'exact', head: true }).eq('asesor_email', u.email)
      setPropiedadesActuales(count || 0)
      setChecked(true)
    })
  }, [])

  const [nombreArchivo, setNombreArchivo] = useState('')
  const [filas, setFilas] = useState<FilaImportada[]>([])
  const [errorGlobal, setErrorGlobal] = useState('')
  const [checando, setChecando] = useState(false)
  const [colaboracion, setColaboracion] = useState(true)
  const [declaraGravamenes, setDeclaraGravamenes] = useState(false)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{ importadas: number, omitidas: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const procesarArchivo = async (file: File) => {
    setErrorGlobal('')
    setResultado(null)
    setNombreArchivo(file.name)
    const texto = await file.text()
    const tabla = parseCSV(texto)
    if (tabla.length < 2) { setErrorGlobal('El archivo está vacío o no tiene filas de datos.'); setFilas([]); return }

    const encabezado = tabla[0].map(h => h.toLowerCase().trim())
    const faltantes = REQUERIDAS.filter(c => !encabezado.includes(c))
    if (faltantes.length > 0) {
      setErrorGlobal('Faltan columnas obligatorias: ' + faltantes.join(', ') + '. Descargá la plantilla para ver el formato exacto.')
      setFilas([])
      return
    }
    const idx = (col: string) => encabezado.indexOf(col)
    const get = (row: string[], col: string) => { const i = idx(col); return i === -1 ? '' : (row[i] || '').trim() }

    const parseadas: FilaImportada[] = tabla.slice(1).map((row, i) => {
      const errores: string[] = []
      const titulo = get(row, 'titulo')
      if (!titulo) errores.push('Falta título')

      const operacionRaw = get(row, 'operacion').toLowerCase()
      const operacion = OPERACIONES_VALIDAS[operacionRaw]
      if (!operacion) errores.push('Operación inválida (usar: venta, alquiler o ambos)')

      const tipoRaw = get(row, 'tipo').toLowerCase()
      const tipo = TIPOS_VALIDOS.includes(tipoRaw) ? tipoRaw : ''
      if (!tipo) errores.push('Tipo inválido (usar: ' + TIPOS_VALIDOS.join(', ') + ')')

      const precio = parseFloat(get(row, 'precio').replace(/[^0-9.]/g, ''))
      if (!precio || precio <= 0) errores.push('Precio inválido')

      const monedaRaw = get(row, 'moneda').toUpperCase()
      const moneda: 'USD' | 'CRC' = monedaRaw === 'CRC' ? 'CRC' : 'USD'

      const provinciaRaw = get(row, 'provincia')
      const provinciaMatch = COSTA_RICA.find(p => p.nombre.toLowerCase() === provinciaRaw.toLowerCase())
      if (!provinciaMatch) errores.push('Provincia no reconocida (' + COSTA_RICA.map(p => p.nombre).join(', ') + ')')

      const cantonRaw = get(row, 'canton')
      const cantonMatch = provinciaMatch?.cantones.find(c => c.nombre.toLowerCase() === cantonRaw.toLowerCase())
      if (provinciaMatch && !cantonMatch) errores.push('Cantón "' + cantonRaw + '" no pertenece a ' + provinciaMatch.nombre)

      const numeroFinca = get(row, 'numero_finca')
      if (!numeroFinca) errores.push('Falta número de finca')
      const fincaNormalizada = normalizarFinca(numeroFinca)

      const areaRegistralTxt = get(row, 'area_registral')

      return {
        fila: i + 2, // +1 por header, +1 por 1-index
        titulo,
        operacion: operacion || 'venta',
        tipo: tipo || 'casa',
        precio: precio || 0,
        moneda,
        habitaciones: parseInt(get(row, 'habitaciones')) || 0,
        banos: parseFloat(get(row, 'banos')) || 0,
        estacionamientos: parseInt(get(row, 'estacionamientos')) || 0,
        metros: parseInt(get(row, 'metros')) || 0,
        lote_m2: parseInt(get(row, 'lote_m2')) || 0,
        provincia: provinciaMatch?.nombre || provinciaRaw,
        canton: cantonMatch?.nombre || cantonRaw,
        distrito: get(row, 'distrito'),
        direccion: get(row, 'direccion'),
        amenidades: get(row, 'amenidades').split(';').map(a => a.trim()).filter(Boolean),
        descripcion: get(row, 'descripcion'),
        whatsapp: get(row, 'whatsapp') || user?.telefono || '',
        numero_finca: numeroFinca,
        numero_plano: get(row, 'numero_plano'),
        naturaleza: get(row, 'naturaleza'),
        area_registral: areaRegistralTxt ? parseFloat(areaRegistralTxt) : null,
        colindancias: get(row, 'colindancias'),
        gravamenes: get(row, 'gravamenes'),
        anotaciones: get(row, 'anotaciones'),
        fotos: get(row, 'fotos').split(';').map(f => f.trim()).filter(Boolean),
        fincaNormalizada,
        errores,
        duplicadaDB: false,
        duplicadaAsesorNombre: null,
        duplicadaEnArchivo: false,
      }
    })

    // Duplicados dentro del mismo archivo
    const conteoFincas: Record<string, number> = {}
    parseadas.forEach(f => { if (f.fincaNormalizada) conteoFincas[f.fincaNormalizada] = (conteoFincas[f.fincaNormalizada] || 0) + 1 })
    parseadas.forEach(f => { f.duplicadaEnArchivo = !!f.fincaNormalizada && conteoFincas[f.fincaNormalizada] > 1 })

    // Duplicados contra la base de datos (una sola llamada para todo el archivo)
    setChecando(true)
    const fincasAChequear = Array.from(new Set(parseadas.map(f => f.numero_finca).filter(Boolean)))
    if (fincasAChequear.length > 0) {
      const { data: chequeo, error } = await supabase.rpc('verificar_fincas_duplicadas_bulk', { p_numero_fincas: fincasAChequear })
      if (!error && chequeo) {
        const mapa: Record<string, { existe: boolean, asesor_nombre: string | null }> = {}
        for (const c of chequeo as { finca_normalizada: string, existe: boolean, asesor_nombre: string | null }[]) {
          mapa[c.finca_normalizada] = { existe: c.existe, asesor_nombre: c.asesor_nombre }
        }
        parseadas.forEach(f => {
          const match = mapa[f.fincaNormalizada]
          if (match) { f.duplicadaDB = match.existe; f.duplicadaAsesorNombre = match.asesor_nombre }
        })
      }
    }
    setChecando(false)
    setFilas(parseadas)
  }

  const limite = getPlanConfig(planActual).maxPropiedades
  const cuposDisponibles = Math.max(0, limite === Infinity ? Infinity : limite - propiedadesActuales)
  const validas = filas.filter(f => f.errores.length === 0 && !f.duplicadaDB && !f.duplicadaEnArchivo)
  const importables = cuposDisponibles === Infinity ? validas : validas.slice(0, cuposDisponibles)
  const excluidasPorLimite = validas.length - importables.length

  const importar = async () => {
    if (!user || importables.length === 0) return
    setImportando(true)
    const payload = importables.map(f => {
      const esCrc = f.moneda === 'CRC'
      const precioUsd = esCrc ? crcAUsd(f.precio, tipoCambio) : f.precio
      return {
        titulo: f.titulo,
        descripcion: f.descripcion,
        precio: Math.round(precioUsd),
        moneda: f.moneda,
        precio_moneda_original: esCrc ? f.precio : null,
        tipo: f.tipo,
        operacion: f.operacion,
        habitaciones: f.habitaciones,
        banos: f.banos,
        estacionamientos: f.estacionamientos,
        metros: f.metros,
        lote_m2: f.lote_m2,
        amenidades: f.amenidades,
        zona: f.canton || f.provincia,
        provincia: f.provincia,
        distrito: f.distrito,
        direccion: f.direccion,
        disponible: false,
        verificacion_estado: 'pendiente_verificacion',
        asesor_email: user.email,
        asesor_nombre: user.nombre,
        asesor_whatsapp: f.whatsapp,
        numero_finca: f.numero_finca,
        numero_plano: f.numero_plano,
        naturaleza: f.naturaleza,
        area_registral: f.area_registral,
        colindancias: f.colindancias,
        gravamenes: f.gravamenes,
        anotaciones: f.anotaciones,
        libre_gravamenes: declaraGravamenes,
        acepta_colaboracion: esIndependiente ? colaboracion : true,
        fotos: f.fotos,
      }
    })
    const { error, data } = await supabase.from('propiedades').insert(payload).select('id')
    setImportando(false)
    if (error) { setErrorGlobal('Error al importar: ' + error.message); return }
    setResultado({ importadas: data?.length || 0, omitidas: (filas.length - (data?.length || 0)) })
    setFilas([])
    setNombreArchivo('')
    setPropiedadesActuales(p => p + (data?.length || 0))
  }

  if (!checked) return <main style={s.page}><p style={{ padding: 40 }}>Cargando...</p></main>

  if (contratoAceptado === false) return (
    <main style={s.page}>
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <h1 style={s.h1}>Falta aceptar tu contrato</h1>
        <p style={{ color: 'var(--ink-3)', marginBottom: 20 }}>Antes de importar propiedades necesitás aceptar el Contrato de Afiliación de Asesor NIDO.</p>
        <a href="/dashboard/contrato-asesor" style={s.btnPrimary}>Ver y aceptar contrato →</a>
      </div>
    </main>
  )

  return (
    <main style={s.page}>
      <style>{CSS}</style>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>NIDO<span style={{ color: 'var(--accent)' }}>.</span></Link>
        <a href="/dashboard" style={s.btnGhost}>Mi panel</a>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 100px' }}>
        <div style={s.eyebrow}>Herramientas · Carga masiva</div>
        <h1 style={s.h1}>Importá tu cartera <em>de una vez</em>.</h1>
        <p style={{ color: 'var(--ink-2)', maxWidth: 640, lineHeight: 1.6, marginBottom: 32 }}>
          Subí un CSV con varias propiedades en lugar de repetir el formulario una por una. Cada propiedad importada queda <strong>pendiente de verificación</strong> igual que si la hubieras publicado con el wizard -- un admin de NIDO la revisa antes de que aparezca en el portal.
        </p>

        <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          🔒 La información registral (número de finca, gravámenes, colindancias, etc.) es de uso interno de NIDO, no se publica ni se muestra a compradores. No se contactará al propietario -- solo se usa para verificar que la propiedad puede venderse. Un mismo número de finca no puede registrarse dos veces; si el archivo trae una finca ya existente, esa fila se marca como duplicada y no se importa.
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={descargarPlantilla} style={s.btnGhost}>⬇ Descargar plantilla CSV</button>
          <button onClick={() => inputRef.current?.click()} style={s.btnPrimary}>Elegir archivo CSV</button>
          <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && procesarArchivo(e.target.files[0])} />
          {nombreArchivo && <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{nombreArchivo}</span>}
        </div>

        {errorGlobal && <div style={s.errorBox}>{errorGlobal}</div>}

        {resultado && (
          <div style={{ background: 'var(--accent-tint)', border: '1px solid oklch(0.85 0.04 150)', borderRadius: 10, padding: '18px 20px', marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, marginBottom: 4 }}>✓ {resultado.importadas} propiedades importadas</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Quedaron pendientes de verificación. Podés revisarlas y completarlas desde <Link href="/dashboard" style={{ color: 'var(--accent)' }}>tu panel</Link>.</p>
          </div>
        )}

        {checando && <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Verificando duplicados...</p>}

        {filas.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20, fontSize: 13 }}>
              <span>{filas.length} filas leídas</span>
              <span style={{ color: 'var(--accent)' }}>{validas.length} listas para importar</span>
              {filas.length - validas.length > 0 && <span style={{ color: 'oklch(0.5 0.15 30)' }}>{filas.length - validas.length} con problemas</span>}
            </div>

            {excluidasPorLimite > 0 && (
              <div style={s.errorBox}>
                Tu plan {getPlanConfig(planActual).nombrePublico} permite hasta {limite === Infinity ? 'propiedades ilimitadas' : limite}. Con tus {propiedadesActuales} propiedades actuales, solo se pueden importar {importables.length} de las {validas.length} filas válidas. <a href="/precios" style={{ color: 'inherit', textDecoration: 'underline' }}>Subí de plan</a> para importar el resto.
              </div>
            )}

            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Título</th>
                    <th style={s.th}>Finca</th>
                    <th style={s.th}>Precio</th>
                    <th style={s.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(f => {
                    const problema = f.duplicadaDB ? 'Finca ya registrada' + (f.duplicadaAsesorNombre ? ' por ' + f.duplicadaAsesorNombre : '')
                      : f.duplicadaEnArchivo ? 'Finca repetida en el archivo'
                      : f.errores.length > 0 ? f.errores.join('; ')
                      : null
                    return (
                      <tr key={f.fila}>
                        <td style={s.td}>{f.fila}</td>
                        <td style={s.td}>{f.titulo || '—'}</td>
                        <td style={s.td}>{f.numero_finca || '—'}</td>
                        <td style={s.td}>{f.precio ? f.moneda + ' ' + f.precio.toLocaleString('en-US') : '—'}</td>
                        <td style={{ ...s.td, color: problema ? 'oklch(0.5 0.15 30)' : 'var(--accent)' }}>{problema || '✓ Ok'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {esIndependiente && (
              <div style={{ marginBottom: 20 }}>
                <label style={s.fieldLabel}>Colaboración entre asesores (aplica a todas las propiedades de este archivo)</label>
                <div className="toggle-group">
                  {[[true, 'Sí, acepto colaborar'], [false, 'No, las manejo solo']].map(([v, l]) => (
                    <button key={String(v)} className={colaboracion === v ? 'active' : ''} onClick={() => setColaboracion(v as boolean)}>{l as string}</button>
                  ))}
                </div>
              </div>
            )}

            <div onClick={() => setDeclaraGravamenes(!declaraGravamenes)} style={{ display: 'flex', gap: 12, padding: '14px 16px', border: '2px solid ' + (declaraGravamenes ? 'var(--accent)' : 'var(--rule)'), borderRadius: 10, cursor: 'pointer', background: declaraGravamenes ? 'var(--accent-tint)' : 'white', marginBottom: 24 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid ' + (declaraGravamenes ? 'var(--accent)' : 'var(--rule)'), background: declaraGravamenes ? 'var(--accent)' : 'white', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
                {declaraGravamenes && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Confirmo que las propiedades de este archivo están libres de gravámenes y anotaciones que impidan su venta, salvo lo indicado explícitamente en la columna &quot;gravamenes&quot; de cada fila. NIDO verificará esta información en el Registro Nacional antes de publicar cada propiedad.
              </div>
            </div>

            <button onClick={importar} disabled={importando || importables.length === 0 || !declaraGravamenes} style={{ ...s.btnPrimary, opacity: (importando || importables.length === 0 || !declaraGravamenes) ? 0.5 : 1, cursor: (importando || importables.length === 0 || !declaraGravamenes) ? 'default' : 'pointer' }}>
              {importando ? 'Importando...' : 'Importar ' + importables.length + ' propiedad' + (importables.length === 1 ? '' : 'es') + ' →'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'DM Sans',sans-serif", minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--rule)' },
  logo: { fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: 'var(--ink)', textDecoration: 'none' },
  btnGhost: { border: '1px solid var(--rule)', color: 'var(--ink)', padding: '8px 16px', borderRadius: 999, fontSize: 13, textDecoration: 'none', background: 'none', cursor: 'pointer' },
  btnPrimary: { background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '10px 22px', borderRadius: 999, fontSize: 14, textDecoration: 'none', display: 'inline-block', cursor: 'pointer' },
  eyebrow: { fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 },
  h1: { fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 400, marginBottom: 12 },
  errorBox: { background: 'oklch(0.97 0.03 30)', border: '1px solid oklch(0.85 0.06 30)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'oklch(0.45 0.1 30)', lineHeight: 1.6 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--rule)', color: 'var(--ink-3)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' },
  td: { padding: '8px 10px', borderBottom: '1px solid var(--rule-soft)' },
  fieldLabel: { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12, display: 'block' },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  a{color:inherit} button{font:inherit}
  :root{--bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150)}
  .wiz-h1 em{font-style:italic;color:var(--accent)}
  .toggle-group{display:inline-flex;border:1px solid var(--rule);border-radius:999px;padding:4px;background:white}
  .toggle-group button{padding:8px 20px;border-radius:999px;border:none;background:transparent;color:var(--ink-2);font-size:13px;cursor:pointer}
  .toggle-group button.active{background:var(--ink);color:var(--bg)}
`
