# Plantillas de WhatsApp para Valeria (NIDO Black)

WhatsApp solo permite texto libre dentro de las 24 horas después de que el usuario le escribió a Valeria. Fuera de esa ventana, cualquier mensaje que **NIDO inicia** (no una respuesta) tiene que mandarse como una **plantilla pre-aprobada por Meta** — si no, el envío se rechaza.

El código ya intenta primero texto libre (gratis, funciona si el asesor escribió recientemente) y solo usa la plantilla como respaldo automático cuando Meta rechaza el texto libre por estar fuera de ventana. Para que ese respaldo funcione, hay que crear estas 10 plantillas una sola vez.

Nota: `nido_tarea_vencida` y `nido_match_propiedad` (Fase 2) llegan a **cualquier asesor**, no solo plan Black — las tareas y el CRM ya son parte de todos los planes. El resto sigue siendo exclusivo de Black.

## Cómo crear una plantilla

1. Entrá a **business.facebook.com** → tu negocio → **WhatsApp Manager** → **Plantillas de mensajes** (Message Templates).
2. Click en **Crear plantilla**.
3. Categoría: **Utility** (utilidad) para todas — no son mensajes de marketing, son notificaciones operativas de una cuenta ya existente.
4. Idioma: **Español**.
5. Pegá el nombre y el cuerpo exactos de cada tabla de abajo (los `{{1}}`, `{{2}}`, etc. son variables — Meta te va a pedir un ejemplo de cada una para la revisión, podés usar cualquier valor de muestra razonable).
6. Enviá para revisión. Meta suele aprobar en minutos a 2 días.

## Plantillas a crear

### nido_nuevo_lead
```
🔔 Nuevo lead — NIDO Black

👤 {{1}}
📞 {{2}}
📍 {{3}}

Es un lead premium — respondele cuanto antes.
```

### nido_kyc_aprobado
```
✅ Tu verificación de identidad en NIDO fue aprobada. Ya podés publicar propiedades sin restricciones.
```
(sin variables)

### nido_kyc_rechazado
```
⚠️ Tu verificación KYC en NIDO fue rechazada.

Motivo: {{1}}

Podés volver a subir tus documentos desde tu perfil en NIDO.
```

### nido_nueva_comision
```
💰 Comisión registrada

{{1}}
Monto: ${{2}}
Estado: {{3}}
```

### nido_ticket_respondido
```
💬 El equipo NIDO respondió tu ticket:

"{{1}}"

Revisá la conversación completa en nido-cr.com/soporte
```

### nido_lead_sin_seguimiento
```
⏰ Tenés un lead sin contactar hace {{1}} días

{{2}}
📍 {{3}}

Dale seguimiento antes de que se enfríe.
```

### nido_escalamiento_confirmado
```
🆘 Tu ticket urgente ya fue recibido por el equipo NIDO con prioridad alta. Te van a responder pronto.
```
(sin variables)

### nido_tarea_vencida
```
⏰ Tarea vence hoy — NIDO

{{1}}

Revisala en tu dashboard antes de que se te pase.
```

### nido_match_propiedad
```
🎯 Valeria encontró coincidencias

Para tu lead {{1}} hay {{2}} propiedad(es) nueva(s) en el catálogo de NIDO que podrían encajar con su presupuesto y zona.

Revisalas en tu CRM y decidí si le avisás.
```

### nido_briefing_diario
```
☀️ Buenos días {{1}} — tu resumen NIDO Black de hoy:

🔔 Leads nuevos: {{2}}
📅 Visitas hoy: {{3}}
🎫 Tickets abiertos: {{4}}

Escribime si necesitás algo.
```

## Verificar que quedaron bien

Una vez aprobadas, no hace falta tocar código — el nombre de cada plantilla ya está referenciado en `lib/whatsappNotify.ts` y `app/api/whatsapp-briefing/route.ts`. Si el nombre en Meta no coincide exactamente con el de esta lista, el envío por plantilla va a fallar (quedará registrado en `wa_send_error` dentro de `whatsapp_logs`, o disparará la alerta automática si pasa 3+ veces en 24h).
