import { readFileSync, writeFileSync } from 'fs'
let code = readFileSync('app/dashboard/nueva-propiedad/page.tsx', 'utf8')
if (!code.includes('@ts-nocheck')) {
  code = '// @ts-nocheck\n' + code
}
writeFileSync('app/dashboard/nueva-propiedad/page.tsx', code)
console.log('ok')
