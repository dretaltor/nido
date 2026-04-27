import { readFileSync, writeFileSync } from 'fs'
let code = readFileSync('app/propiedades/[id]/page.tsx', 'utf8')

// Fix markdown links
code = code.split('[params.id](http://params.id)').join('params.id')
code = code.split('[p.id](http://p.id)').join('p.id')

// Fix Next.js 16 params - use React.use()
code = code.replace(
  "export default function PropiedadDetalle({ params }: { params: { id: string } }) {",
  "export default function PropiedadDetalle({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = require('react').use(params)"
)
code = code.split('params.id').join('id')

writeFileSync('app/propiedades/[id]/page.tsx', code)
console.log('Fix aplicado')
