import os

# ─────────────────────────────────────────────
# FIX 1: Dashboard — separar asesor de propietario
# El dashboard actual mezcla ambos roles
# Solución: verificar el tipo de usuario al entrar
# ─────────────────────────────────────────────

dashboard = open('app/dashboard/page.tsx').read()

# Add role detection after supabase.auth.getUser()
old = "        supabase.from('propiedades').select('*').eq('asesor_email', user.email),"
new = """        supabase.from('propiedades').select('*').eq('asesor_email', user.email),"""
# Already correct, just need to add role check at top of useEffect

old2 = "      if (!user) { router.push('/login'); return }"
new2 = """      if (!user) { router.push('/login'); return }
      // Detectar si es propietario y redirigir
      const tipo = user.user_metadata?.tipo || 'asesor'
      if (tipo === 'propietario') { router.push('/dashboard/propietario'); return }"""

dashboard = dashboard.replace(old2, new2)
with open('app/dashboard/page.tsx', 'w') as f:
    f.write(dashboard)
print('Fix 1: dashboard role check ok')

# ─────────────────────────────────────────────
# FIX 2: Registro propietario — agregar login si ya tiene cuenta
# ─────────────────────────────────────────────

reg_prop = open('app/registro-propietario/page.tsx').read()

# Add tipo=propietario to metadata when registering
reg_prop = reg_prop.replace(
    "await supabase.from('propietarios').upsert({",
    "// Mark user as propietario in metadata\nawait supabase.auth.updateUser({ data: { tipo: 'propietario' } })\n      await supabase.from('propietarios').upsert({"
)

# Add login link at top of form
reg_prop = reg_prop.replace(
    "<h2 style={{ fontFamily:",
    """<div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:'var(--ink-2)' }}>¿Ya tenés cuenta?</span>
          <a href="/login" style={{ fontSize:13, color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>Ingresar al dashboard →</a>
        </div>
        <h2 style={{ fontFamily:"""
)

with open('app/registro-propietario/page.tsx', 'w') as f:
    f.write(reg_prop)
print('Fix 2: registro propietario login link ok')

# ─────────────────────────────────────────────
# FIX 3: Comprador — quitar botones de login/registro del nav
# ─────────────────────────────────────────────

comprador = open('app/comprador/page.tsx').read()

# Remove login/registro buttons from nav - replace with just portal link
comprador = comprador.replace(
    """<a href="/login" style={{ border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'8px 16px', borderRadius:999, fontSize:13 }}>Ingresar</a>
            <a href="/registro" style={{ background:'var(--accent)', color:'white', padding:'8px 16px', borderRadius:999, fontSize:13 }}>Crear cuenta</a>""",
    """<a href="/propiedades" style={{ background:'var(--accent)', color:'white', padding:'8px 18px', borderRadius:999, fontSize:13, fontWeight:500 }}>Ver propiedades →</a>"""
)

# Also try alternate format
comprador = comprador.replace(
    """<a href="/login" style={{border:'1px solid rgba(255,255,255,0.2)',color:'white',padding:'8px 16px',borderRadius:999,fontSize:13}}>Ingresar</a>
            <a href="/registro" style={{background:'var(--accent)',color:'white',padding:'8px 16px',borderRadius:999,fontSize:13}}>Crear cuenta</a>""",
    """<a href="/propiedades" style={{background:'var(--accent)',color:'white',padding:'8px 18px',borderRadius:999,fontSize:13,fontWeight:500}}>Ver propiedades →</a>"""
)

with open('app/comprador/page.tsx', 'w') as f:
    f.write(comprador)
print('Fix 3: comprador nav ok')

# ─────────────────────────────────────────────
# FIX 4: Ficha de propiedad — botón copiar link para asesor
# ─────────────────────────────────────────────

ficha = open('app/propiedades/[id]/page.tsx').read()

# Replace the share button with a better copy link functionality
old_share = """            <button onClick={() => navigator.share?.({title:propiedad.titulo,url:window.location.href})} style={{width:36,height:36,borderRadius:'50%',border:'1px solid var(--rule)',background:'white',cursor:'pointer',display:'grid',placeItems:'center',color:'var(--ink-3)'}}>
              <Icon name="share"/>
            </button>"""

new_share = """            <button
              onClick={() => {
                const url = window.location.href
                if (navigator.share) {
                  navigator.share({ title: propiedad.titulo, text: '¡Mirá esta propiedad en NIDO! ' + propiedad.titulo + ' - ' + propiedad.zona, url })
                } else {
                  navigator.clipboard.writeText(url)
                  alert('¡Enlace copiado! Compartilo con tu cliente.')
                }
              }}
              title="Compartir ficha con cliente"
              style={{width:36,height:36,borderRadius:'50%',border:'1px solid var(--rule)',background:'white',cursor:'pointer',display:'grid',placeItems:'center',color:'var(--ink-3)'}}>
              <Icon name="share"/>
            </button>"""

ficha = ficha.replace(old_share, new_share)

# Add a prominent share button in the asesor panel
old_panel = """                <a href={`/propiedades/${propiedad.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:999, border:'1px solid var(--rule)', color:'var(--ink)', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                    <span>✉</span> Enviar correo
                  </a>"""

new_panel = """                <a href={`/propiedades/${propiedad.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:999, border:'1px solid var(--rule)', color:'var(--ink)', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                    <span>✉</span> Enviar correo
                  </a>
                  <button
                    onClick={() => {
                      const url = window.location.href
                      navigator.clipboard.writeText(url).then(() => alert('¡Enlace copiado! Compartí esta ficha con tu cliente por WhatsApp o email.'))
                    }}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:999, border:'1px solid var(--rule)', background:'var(--bg-elev)', color:'var(--ink)', fontSize:13, fontWeight:500, width:'100%', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    <span>🔗</span> Copiar enlace para cliente
                  </button>"""

ficha = ficha.replace(old_panel, new_panel)
with open('app/propiedades/[id]/page.tsx', 'w') as f:
    f.write(ficha)
print('Fix 4: share link ok')

print('\n✅ Los 4 fixes aplicados')
