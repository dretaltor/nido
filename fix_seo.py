with open('app/propiedades/[id]/page.tsx', 'r') as f:
    content = f.read()

# Remove bad import
bad = "import { StructuredDataProperty } from '@/components/seo/StructuredData'"
good = "import { StructuredDataProperty } from '@/components/seo/StructuredData'"

# Remove ALL StructuredData imports first
lines = content.split('\n')
clean = []
added = False
for line in lines:
    if 'StructuredData' in line and 'import' in line:
        if not added:
            clean.append("import { StructuredDataProperty } from '@/components/seo/StructuredData'")
            added = True
    else:
        clean.append(line)

content = '\n'.join(clean)
with open('app/propiedades/[id]/page.tsx', 'w') as f:
    f.write(content)
print('ok')
