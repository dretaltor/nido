# Fix 1: registro-propietario — agregar link de login
content = open('app/registro-propietario/page.tsx').read()

# Find the form start and add login link before it
old = "        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.42 0.06 150/0.08) 0%, transparent 70%)' }}/>"

# Let's find a better anchor - the submit button area
print("=== REGISTRO PROPIETARIO - primeras 10 lineas del JSX ===")
lines = content.split('\n')
for i, l in enumerate(lines):
    if 'return' in l and 'main' in l.lower():
        for j in range(i, min(i+30, len(lines))):
            print(f"{j}: {lines[j]}")
        break

print("\n=== COMPRADOR - buscar nav buttons ===")
comp = open('app/comprador/page.tsx').read()
for i, l in enumerate(comp.split('\n')):
    if 'href' in l and ('login' in l.lower() or 'registro' in l.lower() or 'ingresar' in l.lower() or 'cuenta' in l.lower()):
        print(f"{i}: {l}")
