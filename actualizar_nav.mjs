import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'

let code = readFileSync('app/page.tsx', 'utf8')

code = code.replace(
  `<a href="/propiedades" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propiedades</a>
          <a href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Asesores</a>
          <a href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propietarios</a>`,
  `<a href="/propiedades" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propiedades</a>
          <a href="/asesores" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Asesores</a>
          <a href="/propietario" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Propietarios</a>
          <a href="/academia" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>Academia</a>`
)

writeFileSync('app/page.tsx', code)
console.log('Navbar actualizado exitosamente')
