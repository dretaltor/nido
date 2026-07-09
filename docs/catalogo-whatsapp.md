# Catálogo de WhatsApp (Meta Commerce Manager)

Esto permite mostrar propiedades como "productos" nativos de WhatsApp — con foto, precio y botón de detalle — en vez de solo texto o una imagen suelta. El feed con los datos ya está listo en el código; lo que falta es conectar ese feed dentro de Meta, algo que solo se puede hacer manualmente desde Business Manager (no tengo acceso a esa cuenta).

## Lo que ya existe en el código

`https://www.nido-cr.com/api/catalogo` — feed CSV público con todas las propiedades disponibles y aprobadas (id, título, descripción, precio, link, foto). Se actualiza solo: cada vez que Meta lo consulte, trae los datos más recientes de la base.

## Pasos a seguir en Meta (una sola vez)

1. Entrá a **business.facebook.com** → tu negocio → **Commerce Manager** → **Agregar catálogo**.
2. Tipo de catálogo: **Bienes raíces (Real Estate)** si aparece esa opción, o **Productos genéricos** si no.
3. Origen de datos: **Feed de datos** (Data feed), no carga manual.
4. URL del feed: `https://www.nido-cr.com/api/catalogo`
5. Frecuencia de actualización: diaria (o cada hora si querés precios más al día).
6. Una vez creado el catálogo, andá a **WhatsApp Manager** → tu cuenta de WhatsApp Business → **Catálogo** → conectá el catálogo que acabás de crear.
7. Activá **"Mensajes de productos"** (product messages) en la configuración de la cuenta.

## Verificar que quedó bien

En Commerce Manager, el catálogo debería mostrar la cantidad de propiedades activas (todas las que tienen `disponible = true` y `verificacion_estado = aprobada` con al menos una foto). Si el número no coincide con lo que hay en NIDO, revisá el feed directamente en el navegador — cada fila es una propiedad.

## Qué se puede hacer después de esto

Una vez conectado, Valeria puede mandar mensajes de tipo "producto" (referenciando el `id` de la propiedad en el catálogo) en vez de imagen + texto suelto — se ve más profesional y el usuario puede tocar el producto para ver precio y detalle sin salir del chat. Esa parte de código (mandar `type: "interactive"` con `action.type: "catalog_message"` o `"product"`) se puede agregar después, una vez el catálogo esté aprobado y conectado — normalmente Meta tarda unas horas en aprobar el catálogo la primera vez.
