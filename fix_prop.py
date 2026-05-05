with open('app/propiedades/[id]/page.tsx', 'r') as f:
    content = f.read()

# Remove all StructuredData references
lines = content.split('\n')
clean = []
for line in lines:
    if 'StructuredData' in line:
        continue
    clean.append(line)

content = '\n'.join(clean)
with open('app/propiedades/[id]/page.tsx', 'w') as f:
    f.write(content)
print('ok - removed all StructuredData refs')
