import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('app/academia', { recursive: true })

const page = `'use client'
import { useState } from 'react'

const CURSOS = [
  {
    id: 1, categoria: 'Ventas', nivel: 'Básico', duracion: '2 horas',
    titulo: 'Fundamentos de ventas inmobiliarias',
    desc: 'Aprende las bases para cerrar tu primera venta. Técnicas de prospección, presentación y cierre.',
    temas: ['¿Qué busca un comprador?', 'Cómo hacer una presentación efectiva', 'Manejo de objeciones', 'Técnicas de cierre'],
    icon: '🏠', gratis: true
  },
  {
    id: 2, categoria: 'IA', nivel: 'Básico', duracion: '1.5 horas',
    titulo: 'Cómo usar NIDO Agent para multiplicar tus ventas',
    desc: 'Domina el asistente IA de NIDO para automatizar el 80% de tu trabajo y enfocarte en cerrar.',
    temas: ['Generar emails con IA', 'Analizar tu pipeline', 'Crear descripciones de propiedades', 'Seguimiento automático'],
    icon: '🤖', gratis: true
  },
  {
    id: 3, categoria: 'Marketing', nivel: 'Intermedio', duracion: '3 horas',
    titulo: 'Marketing digital para asesores inmobiliarios',
    desc: 'Aprende a generar leads desde Instagram, Facebook y WhatsApp de forma orgánica y pagada.',
    temas: ['Estrategia en redes sociales', 'Crear contenido que vende', 'Facebook Ads para inmuebles', 'WhatsApp Business'],
    icon: '📱', gratis: false
  },
  {
    id: 4, categoria: 'Legal', nivel: 'Intermedio', duracion: '2.5 horas',
    titulo: 'Aspectos legales en transacciones inmobiliarias',
    desc: 'Comprende contratos, escrituras, due diligence y todo lo legal que necesitas saber.',
    temas: ['Tipos de contratos', 'Promesa de compraventa', 'Due diligence', 'Proceso notarial en CR'],
    icon: '⚖️', gratis: false
  },
  {
    id: 5, categoria: 'Negociación', nivel: 'Avanzado', duracion: '2 horas',
    titulo: 'Negociación avanzada para cierres exitosos',
    desc: 'Técnicas de negociación usadas por los mejores asesores para cerrar en el primer intento.',
    temas: ['Psicología del comprador', 'Anclas de precio', 'Negociación win-win', 'Cómo manejar múltiples ofertas'],
    icon: '🤝', gratis: false
  },
  {
    id: 6, categoria: 'Inversión', nivel: 'Avanzado', duracion: '3 horas',
    titulo: 'Bienes raíces como inversión en Costa Rica',
    desc: 'Aprende a asesorar a inversionistas y entender el mercado inmobiliario costarricense.',
    temas: ['ROI en bienes raíces', 'Zonas de mayor plusvalía', 'Airbnb vs alquiler tradicional', 'Financiamiento bancario'],
    icon: '📈', gratis: false
  },
]

const CATEGORIAS = ['Todas', 'Ventas', 'IA', 'Marketing', 'Legal', 'Negociación', 'Inversión']

export default function Academia() {
  const [categoria, setCategoria] = useState('Todas')
  const [cursoAbierto, setCursoAbierto] = useState<number | null>(null)

  const filtrados = categoria === 'Todas' ? CURSOS : CURSOS.filter(c => c.categoria === categoria)
  const curso = CURSOS.find(c => c.id === cursoAbierto)

  if (curso) return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <button onClick={() => setCursoAbierto(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem' }}>← Volver a la Academia</button>
      </nav>
      <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ backgroundColor: '#14532d', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 0.5rem' }}>{curso.icon}</p>
            <h2 style={{ color: 'white', margin: '0 0 0.5rem', fontSize: '1.3rem' }}>{curso.titulo}</h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>{curso.nivel}</span>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>⏱ {curso.duracion}</span>
              <span style={{ backgroundColor: curso.gratis ? '#15803d' : '#f59e0b', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{curso.gratis ? 'GRATIS' : 'PRO'}</span>
            </div>
          </div>
          <div style={{ padding: '2rem' }}>
            <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>{curso.desc}</p>
            <h4 style={{ color: '#14532d', marginBottom: '1rem' }}>Lo que aprenderás:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
              {curso.temas.map(tema => (
                <div key={tema} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ color: '#15803d', fontSize: '1rem' }}>✓</span>
                  <p style={{ margin: 0, color: '#374151', fontSize: '0.95rem' }}>{tema}</p>
                </div>
              ))}
            </div>
            {curso.gratis ? (
              <button style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Comenzar curso gratis
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Este curso es exclusivo para miembros NIDO Pro</p>
                <a href="/registro" style={{ display: 'block', padding: '0.9rem', borderRadius: '10px', backgroundColor: '#15803d', color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>Unirme a NIDO Pro</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d', textDecoration: 'none' }}>NIDO</a>
        <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Mi dashboard</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.5rem' }}>🎓 Academia NIDO</h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>Aprende de los mejores y cierra más tratos</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setCategoria(c)} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', backgroundColor: categoria === c ? '#14532d' : '#e5e7eb', color: categoria === c ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtrados.map(curso => (
            <div key={curso.id} onClick={() => setCursoAbierto(curso.id)} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
              <div style={{ backgroundColor: '#f0fdf4', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
                {curso.icon}
              </div>
              <div style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{curso.categoria}</span>
                  <span style={{ backgroundColor: curso.gratis ? '#dcfce7' : '#fef3c7', color: curso.gratis ? '#15803d' : '#92400e', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{curso.gratis ? 'GRATIS' : 'PRO'}</span>
                </div>
                <h3 style={{ margin: '0.6rem 0 0.4rem', fontSize: '1rem', fontWeight: 'bold', color: '#14532d' }}>{curso.titulo}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: '1.5' }}>{curso.desc.substring(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                    <span>📊 {curso.nivel}</span>
                    <span>⏱ {curso.duracion}</span>
                  </div>
                  <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '0.85rem' }}>Ver curso →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}`

writeFileSync('app/academia/page.tsx', page)
console.log('Academia creada exitosamente')
