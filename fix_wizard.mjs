import { readFileSync, writeFileSync } from 'fs'
let code = readFileSync('app/dashboard/nueva-propiedad/page.tsx', 'utf8')
code = code.split('[data.photos](http://data.photos)').join('data.photos')
code = code.split('[photos.map](http://photos.map)').join('photos.map')
code = code.split('[p.id](http://p.id)').join('p.id')
writeFileSync('app/dashboard/nueva-propiedad/page.tsx', code)
console.log('Links corregidos')
