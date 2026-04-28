'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pausarPropiedad, reactivarPropiedad, marcarNotificacionesLeidas } from '@/lib/queries/propietario'
async function getAuthUser() {
  const supabase = await createClient()
  const { data:{ user }, error } = await supabase.auth.getUser()
  if(error||!user) redirect('/login')
  return user
}
export async function actionPausarPropiedad(propiedadId: string) {
  const user = await getAuthUser()
  const { error } = await pausarPropiedad(propiedadId, user.id)
  if(error) throw new Error(error.message)
  revalidatePath('/dashboard/propietario')
}
export async function actionReactivarPropiedad(propiedadId: string) {
  const user = await getAuthUser()
  const { error } = await reactivarPropiedad(propiedadId, user.id)
  if(error) throw new Error(error.message)
  revalidatePath('/dashboard/propietario')
}
export async function actionMarcarLeidas() {
  const user = await getAuthUser()
  await marcarNotificacionesLeidas(user.id)
  revalidatePath('/dashboard/propietario')
}