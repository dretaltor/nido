import { COSTA_RICA } from './costaRicaData'

export interface ZonaInfo {
  nombre: string
  slug: string
  provincia: string
}

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Catalogo completo de cantones de Costa Rica (= "zona" en la tabla propiedades),
// usado para generar las paginas SEO programaticas /propiedades/zona/[zona].
export const ZONAS: ZonaInfo[] = COSTA_RICA.flatMap(provincia =>
  provincia.cantones.map(canton => ({
    nombre: canton.nombre,
    slug: slugify(canton.nombre),
    provincia: provincia.nombre,
  }))
)

export function getZonaBySlug(slug: string): ZonaInfo | undefined {
  return ZONAS.find(z => z.slug === slug)
}

export function zonaSlug(nombre: string): string {
  return slugify(nombre)
}
