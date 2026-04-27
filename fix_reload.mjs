import { readFileSync, writeFileSync } from 'fs'
let code = readFileSync('app/propiedades/page.tsx', 'utf8')

// Force reload on page focus (when coming back from detail)
code = code.replace(
  `  useEffect(() => {
    supabase.from('propiedades').select('*').eq('disponible', true).then(({ data }) => {
      setPropiedades(data || [])
      setLoading(false)
    })
  }, [])`,
  `  const cargar = () => {
    setLoading(true)
    supabase.from('propiedades').select('*').eq('disponible', true).then(({ data }) => {
      setPropiedades(data || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])`
)

writeFileSync('app/propiedades/page.tsx', code)
console.log('Fix aplicado')
