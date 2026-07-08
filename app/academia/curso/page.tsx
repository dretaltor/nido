'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getPlanConfig } from '../../../lib/planes'
import { useTrial } from '../../../lib/useTrial'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

interface CursoModuloRecurso { nombre: string; tipo: string }
interface CursoModuloQuizItem { pregunta: string; opciones: string[]; correcta: number }
interface CursoModulo {
  id: number
  titulo: string
  contenido: string
  recursos?: CursoModuloRecurso[]
  quiz: CursoModuloQuizItem[]
}
interface Curso {
  titulo: string
  cat: string
  nivel: string
  dur: string
  icon: string
  hue: number
  gratis?: boolean
  modulos: CursoModulo[]
}

const CURSOS: Record<number, Curso> = {
  1: {
    titulo: 'Fundamentos de ventas inmobiliarias',
    cat: 'Ventas', nivel: 'Basico', dur: '2 horas', icon: '🏠', hue: 150,
    modulos: [
      {
        id: 1, titulo: 'Que busca realmente un comprador',
        contenido: `Cuando alguien dice que busca una casa de 3 habitaciones, en realidad busca seguridad, estatus o una inversion.

EL ERROR MAS COMUN es responder a las necesidades declaradas en lugar de las reales.

LAS 5 NECESIDADES REALES:

1. Seguridad y estabilidad - El comprador quiere sentir que su familia esta protegida.

2. Estatus y pertenencia - Las zonas premium como Escazu no se venden solo por metros cuadrados, sino por el estilo de vida que representan.

3. Practicidad y tiempo - A que distancia trabaja? En el GAM esto puede ser determinante.

4. Inversion a largo plazo - Les interesa saber cuanto se ha revalorizado la zona en los ultimos 5 anos.

5. Sueno y emocion - La decision final siempre es emocional, aunque el proceso sea racional.

LA TECNICA DEL ICEBERG:
Lo que el cliente dice = la punta del iceberg.
Lo que el cliente quiere = lo que esta bajo el agua.

EJERCICIO PRACTICO: En tu proxima consulta, antes de mostrar propiedades, hace estas preguntas:
- Como imaginas tu vida ideal en 5 anos?
- Que es lo que mas te importa del lugar donde vivis?
- Has vivido en otra zona antes? Que te gusto o no te gusto?`,
        recursos: [
          { nombre: 'Guia: Las 20 preguntas clave para calificar compradores', tipo: 'PDF' },
          { nombre: 'Plantilla: Ficha de perfil del cliente', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cual es el error mas comun del asesor novato?', opciones: ['No mostrar suficientes propiedades', 'Responder a necesidades declaradas en lugar de reales', 'No conocer bien la zona', 'Cobrar comision muy alta'], correcta: 1 },
          { pregunta: 'Cuantas necesidades reales existen detras de cada compra?', opciones: ['3', '4', '5', '6'], correcta: 2 },
        ]
      },
      {
        id: 2, titulo: 'Como hacer una presentacion efectiva',
        contenido: `Una presentacion inmobiliaria no es un recorrido turistico. Es una experiencia disenada para que el cliente se imagine viviendo ahi.

LOS 3 ERRORES FATALES:

Error 1: Hablar demasiado - El 80% del tiempo deberias estar escuchando.

Error 2: Empezar por lo peor - Siempre empieza por el punto mas fuerte de la propiedad.

Error 3: Ignorar las senales - Cuando el cliente toca algo o hace una pregunta especifica, esta interesado.

LA ESTRUCTURA GANADORA:

Paso 1: Pre-visita - Manda un mensaje anticipando los puntos destacados. Crea expectativa.

Paso 2: La llegada - Los primeros 90 segundos son irreversibles. Luces encendidas, temperatura agradable.

Paso 3: El recorrido estrategico - Empieza por el punto mas fuerte, guarda el segundo para el final.

Paso 4: El silencio estrategico - Despues del punto culminante, callate. El primero que habla pierde.

Paso 5: El cierre de la visita - Nunca preguntes que te parecio. Pregunta: de todo lo que viste, que fue lo que mas te llamo la atencion?`,
        recursos: [
          { nombre: 'Checklist: Preparacion de propiedad para visita', tipo: 'PDF' },
          { nombre: 'Script: Guion de presentacion de alto impacto', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Con que parte de la propiedad deberias empezar la presentacion?', opciones: ['La mas economica', 'El punto mas fuerte', 'La entrada principal', 'La cocina'], correcta: 1 },
          { pregunta: 'Que pregunta deberias hacer al cerrar la visita?', opciones: ['Que te parecio?', 'Lo compras?', 'Que fue lo que mas te llamo la atencion?', 'Tenes el presupuesto?'], correcta: 2 },
        ]
      },
      {
        id: 3, titulo: 'Manejo de objeciones',
        contenido: `Una objecion no es un rechazo, es una peticion de mas informacion.

LAS 5 OBJECIONES MAS COMUNES:

1. Esta muy caro - Rara vez es sobre el dinero, es sobre el valor percibido.
Respuesta: Entiendo. Con que estas comparando? Quiero asegurarme de que la comparacion sea justa.

2. Necesito pensarlo - No me has convencido del todo o tengo miedo de decidir mal.
Respuesta: Por supuesto. Que informacion adicional te ayudaria a decidir con mas confianza?

3. Mi conyuge tiene que verla - No es una objecion, es una condicion. Nunca presiones aqui.
Respuesta: Absolutamente. Cuando podemos coordinar para que ambos la vean?

4. El vecindario no me convence - Pregunta que es especificamente lo que le preocupa.

5. Necesito vender primero - Ofreceles acompanamiento en el proceso de venta. Duplicas tu comision.

LA FORMULA AEA:
Acuerdo - Exploracion - Argumento

1. Acuerda con la emocion: Entiendo perfectamente tu preocupacion
2. Explora la raiz real: Que es especificamente lo que te genera esa duda?
3. Argumenta con datos y emocion combinados`,
        recursos: [
          { nombre: 'Guia: Las 30 objeciones mas comunes y como manejarlas', tipo: 'PDF' },
          { nombre: 'Tarjetas: Objeciones y respuestas para imprimir', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que significa realmente una objecion?', opciones: ['Un rechazo definitivo', 'Una peticion de mas informacion', 'Que el cliente no tiene dinero', 'Que la propiedad no es buena'], correcta: 1 },
          { pregunta: 'Cual es la formula AEA?', opciones: ['Analisis-Evaluacion-Accion', 'Acuerdo-Exploracion-Argumento', 'Atencion-Emocion-Acuerdo', 'Argumento-Evaluacion-Acuerdo'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'Tecnicas de cierre',
        contenido: `El cierre no es el final de la venta, es el inicio de una relacion.

SENALES DE QUE EL CLIENTE ESTA LISTO:
- Pregunta sobre gastos de cierre o notario
- Habla en posesivo: mi sala, mi cuarto
- Pregunta si pueden hacer algun cambio
- Pide ver la propiedad por segunda vez

LAS 4 TECNICAS MAS EFECTIVAS:

1. El cierre de la alternativa - No preguntes lo compras? sino prefieren escriturar en enero o en febrero?

2. El cierre del resumen - Entonces tenemos: 3 habitaciones, zona segura, dentro de tu presupuesto. Avanzamos?

3. El cierre de la urgencia genuina - Solo usala cuando sea real: hay otra familia evaluandola. No quiero que pierdas esta oportunidad.

4. El cierre del silencio - Hace la pregunta de cierre y callate. La primera persona que habla, pierde.

POST-CIERRE:
Inmediatamente despues de que el cliente dice si, cambia el tema. No sigas vendiendo, ya vendiste. Habla de la mudanza y los proximos pasos. El cliente necesita sentir que tomo la decision correcta.`,
        recursos: [
          { nombre: 'Guia: 15 tecnicas de cierre con scripts', tipo: 'PDF' },
          { nombre: 'Checklist: Pasos del proceso de cierre en CR', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Cual es una senal de que el cliente esta listo para cerrar?', opciones: ['Pide descuento', 'Habla en posesivo sobre la propiedad', 'Llega tarde a la visita', 'No hace preguntas'], correcta: 1 },
          { pregunta: 'Que es el cierre de la alternativa?', opciones: ['Ofrecer dos propiedades distintas', 'Preguntar entre dos fechas de escritura', 'Dar dos opciones de precio', 'Mostrar dos vecindarios'], correcta: 1 },
        ]
      },
    ]
  },
  2: {
    titulo: 'Como usar Valeria IA para multiplicar tus ventas',
    cat: 'IA', nivel: 'Basico', dur: '1.5 horas', icon: '✦', hue: 200,
    modulos: [
      {
        id: 1, titulo: 'Generar emails con IA',
        contenido: `Valeria puede redactar emails profesionales en segundos.

TIPOS DE EMAILS QUE VALERIA PUEDE ESCRIBIR:

Email de seguimiento a lead frio:
Pedile: Escribe un email de seguimiento para un lead que vio una casa en Santa Ana hace 2 semanas y no ha respondido. Tono calido, no invasivo.

Email de presentacion de propiedad:
Redacta un email presentando una casa de 3 habitaciones en Escazu, precio, con piscina y vista a la montana.

Email post-visita:
Escribe un email de seguimiento despues de una visita. El cliente mostro interes pero pidio tiempo para pensarlo.

COMO DARLE INSTRUCCIONES EFECTIVAS:
Incluye siempre:
- Contexto del cliente (que busca, que vio)
- Tono deseado (formal/casual)
- Objetivo del email (agendar visita, cerrar, informar)
- Informacion especifica de la propiedad

EJEMPLO:
MAL: Escribe un email para mi cliente.
BIEN: Escribe un email para Maria, quien visito el apartamento en Curridabat el martes. Le gusto mucho pero le preocupo el parqueo. El edificio tiene 2 espacios a 15,000 cada uno. Tono profesional pero calido.`,
        recursos: [
          { nombre: 'Plantilla: 20 prompts listos para usar con Valeria', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que informacion es esencial para darle a Valeria al pedir un email?', opciones: ['Solo el nombre del cliente', 'Contexto, tono, objetivo e informacion de la propiedad', 'Solo la direccion de la propiedad', 'El presupuesto del cliente'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Crear descripciones de propiedades que venden',
        contenido: `Una buena descripcion no lista caracteristicas, cuenta una historia.

EL PROBLEMA CON LAS DESCRIPCIONES TIPICAS:

Mala: Casa de 3 habitaciones, 2 banos, 200m2, cocina equipada, sala comedor, jardin, parqueo doble.

Buena con Valeria: Despertarse con luz natural que entra por los ventanales de la sala, tomar el cafe mirando el jardin privado, eso es lo que te espera en esta residencia contemporanea en Santa Ana.

COMO PEDIRLE LA DESCRIPCION A VALERIA:
Da los datos duros + el perfil del comprador ideal.

Ejemplo: Escribe una descripcion para una casa en Escazu: 3 hab, 2.5 banos, 280m2, jardin tropical, piscina, cuarto de servicio, doble parqueo, condominio cerrado con seguridad 24/7. El comprador ideal es una familia con hijos pequenos que valora la seguridad y el espacio.

PALABRAS QUE VENDEN EN CR:
- Residencia en lugar de casa
- Sala de estar en lugar de sala
- Jardin privado en lugar de jardin
- Vista panoramica en lugar de con vista
- Acabados de primera en lugar de bien terminada`,
        recursos: [
          { nombre: 'Guia: Vocabulario premium para descripciones inmobiliarias', tipo: 'PDF' },
          { nombre: 'Plantilla: Estructura de descripcion ganadora', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que hace una buena descripcion inmobiliaria?', opciones: ['Lista todas las caracteristicas tecnicas', 'Cuenta una historia y crea emocion', 'Menciona el precio en detalle', 'Compara con otras propiedades'], correcta: 1 },
        ]
      },
    ]
  },
  3: {
    titulo: 'Marketing digital para asesores inmobiliarios',
    cat: 'Marketing', nivel: 'Intermedio', dur: '3 horas', icon: '📱', hue: 280,
    modulos: [
      {
        id: 1, titulo: 'Estrategia en redes sociales',
        contenido: `La mayoria de asesores publica fotos de propiedades sin ninguna estrategia. El resultado: cero alcance, cero leads.

EL ERROR MAS COMUN es tratar tus redes como un catalogo en vez de un canal de confianza.

LOS 3 PILARES DE CONTENIDO QUE FUNCIONAN EN CR:

1. Autoridad de zona - Publica sobre la zona, no solo sobre la propiedad. "3 cosas que no sabias de Santa Ana" genera mas interaccion que "Casa en venta en Santa Ana".

2. Prueba social - Testimonios, cierres, antes/despues de negociaciones. La gente confia en gente, no en anuncios.

3. Educacion - Explica el proceso de compra, requisitos de credito, tramites notariales. Te posiciona como experto, no como vendedor.

FRECUENCIA IDEAL: 4-5 publicaciones por semana en Instagram, 1 reel por semana minimo. La consistencia importa mas que la perfeccion.

EL ALGORITMO PREMIA: tiempo de visualizacion en reels, guardados en posts educativos, respuestas a tus historias con preguntas.

EJERCICIO PRACTICO: Define tu zona de especializacion y escribi 10 titulos de contenido educativo sobre esa zona (no de propiedades especificas).`,
        recursos: [
          { nombre: 'Calendario de contenido 30 dias para asesores', tipo: 'Excel' },
          { nombre: 'Guia: 50 ideas de reels para inmobiliaria', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Cual es el error mas comun en redes sociales de asesores?', opciones: ['Publicar muy seguido', 'Tratar las redes como catalogo en vez de canal de confianza', 'Usar muchos hashtags', 'No usar fotos profesionales'], correcta: 1 },
          { pregunta: 'Cual es la frecuencia ideal de publicacion semanal?', opciones: ['1 vez', '4-5 veces', '10 veces', 'Una vez al mes'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Crear contenido que vende',
        contenido: `No se trata de vender la propiedad en el primer post. Se trata de generar suficiente confianza para que te escriban.

LA FORMULA AIDA ADAPTADA A INMOBILIARIA:

ATENCION: Un gancho fuerte en los primeros 3 segundos del video o primera linea del post. "Esto que voy a contarte le ahorro $15,000 a un cliente."

INTERES: Desarrolla el contexto. Por que importa esto para alguien que busca comprar o vender en Costa Rica.

DESEO: Conecta con la emocion real detras de la busqueda - seguridad familiar, inversion, estilo de vida.

ACCION: Cierre claro. "Escribime DM con la palabra ZONA y te mando el analisis completo gratis."

TIPOS DE CONTENIDO QUE CONVIERTEN MEJOR EN CR:
- Comparativas de precio por zona (m2 en Escazu vs Santa Ana vs Heredia)
- Mitos sobre comprar propiedad siendo extranjero
- Recorridos en video de la propiedad con storytelling, no solo camara fija
- Casos reales (con permiso) de clientes que cerraron

EVITA: textos largos sin formato, fotos oscuras o mal encuadradas, publicar sin CTA (llamado a accion) claro.`,
        recursos: [
          { nombre: 'Plantilla de guion para reels de 30 segundos', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que significa la A final en la formula AIDA?', opciones: ['Atencion', 'Analisis', 'Accion', 'Autoridad'], correcta: 2 },
          { pregunta: 'Que se recomienda evitar en el contenido?', opciones: ['Videos cortos', 'CTA claro', 'Texto largo sin formato y fotos oscuras', 'Casos reales'], correcta: 2 },
        ]
      },
      {
        id: 3, titulo: 'Facebook Ads para inmuebles',
        contenido: `La pauta paga bien usada puede generar 10-20 leads calificados al mes con un presupuesto de $150-300.

ESTRUCTURA BASICA DE UNA CAMPANA EFECTIVA:

1. Objetivo: Generacion de leads (no trafico, no reconocimiento) - el formulario nativo de Facebook reduce friccion.

2. Publico: Edad 28-55, ubicacion Costa Rica + expats interesados (podes segmentar por interes en "bienes raices" + "inversion"), excluir a quienes ya te siguen si buscas leads nuevos.

3. Creativo: Video de la propiedad o carrusel de 3-5 fotos con el precio visible (esto filtra curiosos).

4. Copy: Beneficio + urgencia + CTA. "Casa de 3 hab en Santa Ana, lista para mudanza. Agenda tu visita esta semana."

PRESUPUESTO Y EXPECTATIVAS EN CR:
- Costo por lead promedio: $5-15 dependiendo de la zona y tipo de propiedad
- Presupuesto minimo recomendado para probar: $10/dia por 7 dias
- Revisa resultados cada 3 dias, no cada hora - el algoritmo necesita tiempo para optimizar

ERROR FATAL: cambiar el anuncio o presupuesto constantemente. Esto reinicia el aprendizaje del algoritmo y dispara el costo por lead.`,
        recursos: [
          { nombre: 'Checklist de configuracion de campana de leads', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Cual objetivo de campana es mejor para generar leads?', opciones: ['Reconocimiento de marca', 'Trafico', 'Generacion de leads con formulario nativo', 'Interacciones'], correcta: 2 },
          { pregunta: 'Cual es el error fatal mas comun en pauta?', opciones: ['Usar fotos', 'Cambiar el anuncio o presupuesto constantemente', 'Segmentar por edad', 'Poner el precio'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'WhatsApp Business para conversion',
        contenido: `El 80% de las consultas inmobiliarias en Costa Rica terminan en WhatsApp. Si no respondes en los primeros minutos, perdes el lead.

CONFIGURACION ESENCIAL DE WHATSAPP BUSINESS:
- Mensaje de bienvenida automatico con tu nombre y especialidad
- Respuesta rapida para preguntas frecuentes (precio, ubicacion, disponibilidad de visita)
- Catalogo con tus propiedades activas, fotos y precios
- Etiquetas para organizar: nuevo, en seguimiento, visita agendada, cerrado

TIEMPOS DE RESPUESTA QUE IMPORTAN:
Estudios de conversion muestran que responder en menos de 5 minutos triplica la probabilidad de cierre comparado con responder despues de 1 hora.

GUION DE PRIMER CONTACTO QUE FUNCIONA:
1. Saludo personalizado con el nombre del lead
2. Confirmar que la propiedad sigue disponible
3. Pregunta calificadora: "Para ayudarte mejor, me confirmas si buscas para vivir o como inversion?"
4. Propuesta concreta: "Tengo disponibilidad este sabado a las 10am o 2pm, cual te queda mejor?"

CON VALERIA IA: NIDO automatiza el primer contacto 24/7, calificando leads mientras dormis. Tu solo entras a cerrar cuando el lead ya esta caliente.`,
        recursos: [
          { nombre: 'Guion de primer contacto en WhatsApp (editable)', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que porcentaje de consultas inmobiliarias en CR terminan en WhatsApp?', opciones: ['20%', '50%', '80%', '100%'], correcta: 2 },
          { pregunta: 'Que efecto tiene responder en menos de 5 minutos?', opciones: ['Ninguno', 'Duplica conversion', 'Triplica probabilidad de cierre', 'Reduce el precio'], correcta: 2 },
        ]
      },
    ]
  },
  4: {
    titulo: 'Aspectos legales en transacciones inmobiliarias',
    cat: 'Legal', nivel: 'Intermedio', dur: '2.5 horas', icon: '⚖️', hue: 50,
    modulos: [
      {
        id: 1, titulo: 'Tipos de contratos en bienes raices',
        contenido: `No todos los contratos son iguales y usar el incorrecto puede costarle la transaccion a tu cliente.

LOS CONTRATOS MAS COMUNES EN COSTA RICA:

1. Promesa de compraventa - Documento previo que fija precio, plazo y condiciones antes de la escritura final. No transfiere propiedad, pero obliga a ambas partes.

2. Contrato de corretaje - El que firma el propietario con el asesor o agencia, definiendo comision y exclusividad (o no).

3. Opcion de compra - Da al comprador el derecho (no la obligacion) de comprar en un plazo determinado, usualmente con un deposito.

4. Escritura de compraventa - El documento final ante notario que transfiere la propiedad, inscrito en el Registro Nacional.

CLAUSULAS QUE NUNCA DEBEN FALTAR:
- Identificacion completa de las partes y el inmueble (numero de finca, plano catastrado)
- Precio y forma de pago claramente definidos
- Plazo de cierre y consecuencias de incumplimiento
- Estado de gravamenes (hipotecas, embargos, anotaciones)

TU ROL COMO ASESOR: no eres abogado, pero debes saber identificar cuando un contrato necesita revision legal antes de que tu cliente firme algo que no entiende.`,
        recursos: [
          { nombre: 'Checklist de clausulas esenciales en promesa de compraventa', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que documento transfiere legalmente la propiedad?', opciones: ['Promesa de compraventa', 'Opcion de compra', 'Escritura de compraventa', 'Contrato de corretaje'], correcta: 2 },
          { pregunta: 'Que es una opcion de compra?', opciones: ['Obligacion de comprar', 'Derecho (no obligacion) de comprar en un plazo', 'El contrato del asesor', 'Un tipo de hipoteca'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Promesa de compraventa en profundidad',
        contenido: `La promesa de compraventa es el documento mas importante que vas a manejar regularmente, y el que mas problemas causa cuando esta mal redactado.

ELEMENTOS OBLIGATORIOS:
1. Datos completos de comprador y vendedor (nombre, cedula o pasaporte, domicilio)
2. Descripcion exacta del inmueble con numero de finca, plano catastrado y numero de folio real
3. Precio total y moneda (en CR es comun pactar en dolares)
4. Forma de pago: prima/deposito, saldo, financiamiento si aplica
5. Plazo para firmar la escritura final
6. Penalizaciones por incumplimiento de cualquiera de las partes

EL DEPOSITO O PRIMA:
Usualmente entre 5% y 10% del precio de venta. Debe especificarse claramente si es reembolsable y bajo que condiciones (ej: si el comprador no logra aprobar el credito).

CLAUSULA DE CONDICION SUSPENSIVA:
Muy comun cuando el comprador necesita financiamiento bancario. La promesa queda condicionada a la aprobacion del credito en un plazo determinado (tipicamente 30-45 dias).

ERROR COMUN: firmar una promesa sin definir que pasa con el deposito si la venta no se concreta por culpa de una de las partes. Esto genera disputas legales costosas.`,
        recursos: [
          { nombre: 'Modelo de promesa de compraventa (referencia)', tipo: 'PDF' },
          { nombre: 'Tabla de plazos tipicos por tipo de financiamiento', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cual es el rango tipico de deposito o prima?', opciones: ['1-2%', '5-10%', '25%', '50%'], correcta: 1 },
          { pregunta: 'Que es una clausula de condicion suspensiva?', opciones: ['Cancela el contrato siempre', 'Condiciona la promesa a un evento como aprobacion de credito', 'Define el precio final', 'Es obligatoria solo para extranjeros'], correcta: 1 },
        ]
      },
      {
        id: 3, titulo: 'Due diligence inmobiliario',
        contenido: `Antes de que tu cliente firme cualquier cosa, hay verificaciones que pueden evitarle perder su dinero.

LOS 5 CHEQUEOS OBLIGATORIOS:

1. Estudio registral - Verificar en el Registro Nacional que el vendedor es el propietario real y que la finca no tiene gravamenes ocultos (hipotecas, embargos, anotaciones judiciales).

2. Plano catastrado vigente - Confirmar que coincide con la descripcion fisica del terreno y que esta actualizado ante el Catastro Nacional.

3. Impuestos municipales al dia - Solicitar certificacion de que no hay deudas de impuesto de bienes inmuebles con la municipalidad correspondiente.

4. Uso de suelo - Verificar con la municipalidad que el uso actual o planeado es compatible con el plan regulador de la zona.

5. Servidumbres y restricciones - Revisar si existen servidumbres de paso, zona maritimo terrestre, o areas de proteccion (rios, manglares) que limiten el uso.

DOCUMENTOS QUE DEBES PEDIR SIEMPRE:
- Certificacion literal del Registro Nacional (no mas de 30 dias de emitida)
- Plano catastrado
- Recibo de impuestos municipales al dia
- Cedula de identidad o documento de identificacion del propietario

SENAL DE ALERTA: si el propietario se resiste a entregar estos documentos o tarda demasiado, es momento de profundizar antes de avanzar con la negociacion.`,
        recursos: [
          { nombre: 'Checklist de due diligence pre-negociacion', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que verifica el estudio registral?', opciones: ['El color de la casa', 'Propietario real y gravamenes ocultos', 'El precio de mercado', 'La cantidad de habitaciones'], correcta: 1 },
          { pregunta: 'Que se debe revisar respecto a servidumbres?', opciones: ['Nada, no aplica en CR', 'Si hay paso, zona maritima o areas de proteccion que limiten el uso', 'Solo aplica a fincas agricolas', 'Solo lo revisa el banco'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'Proceso notarial en Costa Rica',
        contenido: `Entender el proceso notarial te permite manejar expectativas realistas con tus clientes sobre tiempos y costos.

EL NOTARIO EN COSTA RICA tiene fe publica y es quien redacta e inscribe la escritura de traspaso ante el Registro Nacional. A diferencia de otros paises, el comprador y vendedor pueden elegir notario de comun acuerdo.

PASOS DEL CIERRE NOTARIAL:
1. Revision final de documentos (estudio registral actualizado, plano, identificaciones)
2. Redaccion de la escritura de traspaso por el notario
3. Firma de ambas partes ante el notario
4. Pago de impuestos de traspaso (1.5% del valor o el valor fiscal, lo que sea mayor) y timbres
5. Inscripcion en el Registro Nacional (toma entre 5 y 15 dias habiles)

COSTOS TIPICOS DE CIERRE EN CR:
- Honorarios notariales: usualmente 1% a 1.5% del valor de la transaccion (negociable)
- Impuesto de traspaso: 1.5% del valor de venta
- Timbres y derechos de registro: aproximadamente 0.8% adicional

QUIEN PAGA QUE: por costumbre en CR, el comprador suele asumir el impuesto de traspaso y los honorarios notariales, aunque esto es negociable y debe quedar claro desde la promesa de compraventa.

TU VALOR COMO ASESOR: coordinar que toda la documentacion llegue completa al notario ANTES del dia de la firma evita retrasos costosos para ambas partes.`,
        recursos: [
          { nombre: 'Tabla de costos de cierre notarial en CR', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cuanto es el impuesto de traspaso aproximado en CR?', opciones: ['0.5%', '1.5%', '5%', '10%'], correcta: 1 },
          { pregunta: 'Quien elige al notario en una transaccion en CR?', opciones: ['Solo el banco', 'Solo el vendedor', 'Comprador y vendedor de comun acuerdo', 'El gobierno lo asigna'], correcta: 2 },
        ]
      },
    ]
  },
  5: {
    titulo: 'Analisis de inversion inmobiliaria',
    cat: 'Inversion', nivel: 'Avanzado', dur: '4 horas', icon: '📈', hue: 80,
    modulos: [
      {
        id: 1, titulo: 'Cap rate y ROI explicados',
        contenido: `Si no sabes calcular estos dos numeros, no puedes asesorar a un inversionista serio.

CAP RATE (Tasa de capitalizacion):
Formula: (Ingreso Operativo Neto Anual / Precio de la propiedad) x 100

Ejemplo: una propiedad de $300,000 que genera $24,000 anuales en alquiler, con $6,000 de gastos operativos (mantenimiento, impuestos, administracion):
Ingreso Operativo Neto = $24,000 - $6,000 = $18,000
Cap Rate = ($18,000 / $300,000) x 100 = 6%

CAP RATES TIPICOS EN COSTA RICA POR ZONA:
- GAM (San Jose, Heredia, Cartago, Alajuela): 5-7%
- Guanacaste turistico (Tamarindo, Flamingo): 6-9% en alquiler vacacional
- Zonas premium (Escazu, Santa Ana): 4-6% (mayor plusvalia, menor flujo)

ROI (Retorno sobre inversion):
Formula: (Ganancia neta / Inversion total) x 100

A diferencia del cap rate, el ROI incluye TODO lo invertido (precio + cierre + remodelacion) y puede calcularse a futuro considerando la venta.

CUANDO USAR CADA UNO: el cap rate es mejor para comparar propiedades de alquiler entre si rapidamente. El ROI es mejor para evaluar el retorno total de una inversion especifica incluyendo plusvalia.

ERROR COMUN DE ASESORES: presentar solo el precio y la renta mensual sin calcular estos indicadores. Un inversionista serio los va a pedir, y si no los tenes listos, perdes credibilidad.`,
        recursos: [
          { nombre: 'Calculadora de Cap Rate y ROI (Excel)', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cual es la formula del cap rate?', opciones: ['Precio / Renta mensual', 'Ingreso Operativo Neto Anual / Precio', 'Ganancia / Inversion total', 'Renta anual x 12'], correcta: 1 },
          { pregunta: 'Cual es el rango tipico de cap rate en Guanacaste turistico?', opciones: ['1-2%', '6-9%', '15-20%', '25%+'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Analisis de mercado comparativo',
        contenido: `Antes de recomendar un precio de compra o venta, necesitas un Analisis de Mercado Comparativo (CMA) solido, no una corazonada.

COMO HACER UN CMA EFECTIVO:
1. Selecciona 4-6 propiedades comparables vendidas en los ultimos 6 meses en la misma zona
2. Ajusta por diferencias: tamano, antiguedad, amenidades, ubicacion exacta dentro de la zona
3. Calcula el precio por m2 promedio de los comparables
4. Aplica ese precio por m2 a la propiedad en analisis, ajustando por sus diferencias

FUENTES DE DATOS EN COSTA RICA:
- Registro Nacional (valores de transacciones registradas, aunque a veces reflejan valor fiscal no el real)
- Plataformas como NIDO, Encuentra24, OLX para precios de oferta actual
- Red de contactos con otros asesores para precios de cierre real (no solo de lista)

INDICADORES DE MERCADO A MONITOREAR:
- Dias promedio en mercado (DOM) por zona - indica si el mercado esta caliente o frio
- Ratio precio de venta / precio de lista - si las propiedades se venden por debajo del precio pedido consistentemente, el mercado favorece al comprador
- Inventario disponible - meses de inventario indican oferta vs demanda

PRESENTAR EL CMA AL CLIENTE: nunca le digas "tu casa vale X" sin mostrar los comparables. Mostrar el trabajo genera confianza y reduce objeciones sobre el precio.`,
        recursos: [
          { nombre: 'Plantilla de Analisis de Mercado Comparativo (CMA)', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Cuantos comparables se recomienda usar en un CMA?', opciones: ['1-2', '4-6', '15-20', '50+'], correcta: 1 },
          { pregunta: 'Que indica un alto numero de dias promedio en mercado (DOM)?', opciones: ['El mercado esta muy caliente', 'El mercado esta mas frio o sobrevaluado', 'No tiene relacion con el mercado', 'Que la propiedad es muy barata'], correcta: 1 },
        ]
      },
      {
        id: 3, titulo: 'Flujo de caja en propiedades de alquiler',
        contenido: `Un inversionista no compra metros cuadrados, compra flujo de caja. Necesitas saber proyectarlo correctamente.

ESTRUCTURA DE UN ANALISIS DE FLUJO DE CAJA:

INGRESOS:
+ Renta mensual x 12 meses
- Vacancia estimada (en CR, asumir 1-2 meses al ano es realista para alquiler tradicional; en vacacional puede variar mucho por temporada)
= Ingreso bruto efectivo anual

GASTOS OPERATIVOS:
- Mantenimiento (estimar 1% del valor de la propiedad anual)
- Impuesto de bienes inmuebles (0.25% del valor fiscal anual en la mayoria de municipalidades)
- Seguro de la propiedad
- Administracion (si aplica, 8-10% de la renta si usa empresa administradora)
- Cuota de condominio si aplica

= INGRESO OPERATIVO NETO (NOI)

SERVICIO DE DEUDA (si hay financiamiento):
- Pago mensual de hipoteca x 12

= FLUJO DE CAJA NETO ANUAL

EJEMPLO PRACTICO: propiedad de $200,000, renta $1,400/mes, financiada al 70% a 20 anos al 8%:
Ingreso bruto: $16,800 (con 1 mes vacancia: $15,400)
Gastos operativos estimados: $4,500
NOI: $10,900
Servicio de deuda anual aproximado: $11,700
Flujo de caja neto: -$800 (negativo - esta propiedad no es buena inversion apalancada en estas condiciones)

LECCION CLAVE: el precio de compra y la renta NO son suficiente. Sin este analisis completo, podrias recomendar una propiedad que da perdida mensual a tu cliente.`,
        recursos: [
          { nombre: 'Plantilla de proyeccion de flujo de caja a 12 meses', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Que se resta del ingreso bruto para llegar al NOI?', opciones: ['Solo los impuestos', 'Gastos operativos (mantenimiento, impuestos, seguro, administracion)', 'El servicio de deuda', 'Nada, son lo mismo'], correcta: 1 },
          { pregunta: 'En el ejemplo del modulo, por que la propiedad no es buena inversion apalancada?', opciones: ['El precio es muy alto', 'El flujo de caja neto resulta negativo despues del servicio de deuda', 'No tiene vacancia', 'La renta es muy alta'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'Estrategias de salida para inversionistas',
        contenido: `Todo inversionista serio pregunta: "y como salgo de esto si necesito liquidez?" Si no tenes respuesta, perdes la venta.

LAS 4 ESTRATEGIAS DE SALIDA MAS COMUNES:

1. Venta directa (Buy and sell) - Comprar, mejorar o esperar plusvalia, y vender. Funciona bien en zonas de alto crecimiento como Guanacaste costero o nuevas zonas del GAM en expansion.

2. Buy and hold - Mantener para renta a largo plazo, generando flujo de caja mientras la propiedad se aprecia. Ideal para quien busca ingreso pasivo, no liquidez rapida.

3. Refinanciamiento (cash-out refi) - Sacar capital de la propiedad via un nuevo prestamo sin venderla, manteniendo el activo y su flujo de renta.

4. 1031-like exchange (no existe formalmente en CR como en USA, pero estructuras similares via reinversion planificada) - Vender una propiedad y reinvertir las ganancias en otra de mayor valor, escalando el portafolio.

FACTORES QUE DETERMINAN LA MEJOR ESTRATEGIA:
- Horizonte de tiempo del inversionista (corto vs largo plazo)
- Necesidad de liquidez inmediata vs ingreso recurrente
- Apetito de riesgo y experiencia gestionando propiedades
- Condiciones fiscales (ganancias de capital en CR son generalmente menores que en otros paises para personas fisicas no habituales)

TU ROL: pregunta SIEMPRE cual es el horizonte y objetivo del inversionista antes de mostrarle propiedades. Recomendar un alquiler vacacional a alguien que necesita liquidez en 12 meses es un error de asesoria.`,
        recursos: [
          { nombre: 'Guia comparativa de estrategias de salida', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Cual estrategia es mejor para alguien que busca ingreso pasivo a largo plazo?', opciones: ['Venta directa inmediata', 'Buy and hold', 'Refinanciamiento sin mantener la propiedad', 'Ninguna de las anteriores'], correcta: 1 },
          { pregunta: 'Que pregunta es esencial antes de recomendar una propiedad de inversion?', opciones: ['El color preferido', 'El horizonte de tiempo y objetivo del inversionista', 'Si tiene piscina', 'El numero de habitaciones unicamente'], correcta: 1 },
        ]
      },
    ]
  },
  6: {
    titulo: 'Negociacion y cierre de alto valor',
    cat: 'Ventas', nivel: 'Avanzado', dur: '3 horas', icon: '🤝', hue: 130,
    modulos: [
      {
        id: 1, titulo: 'Psicologia del comprador premium',
        contenido: `El comprador de propiedades premium ($300K+) no se mueve por las mismas palancas que el comprador de vivienda primera. Entender esto cambia completamente tu enfoque.

QUE BUSCA REALMENTE EL COMPRADOR PREMIUM:
1. Exclusividad - No quiere sentir que esta viendo lo mismo que todos. Comunicacion personalizada, no mensajes masivos.

2. Eficiencia de tiempo - Su tiempo vale mucho. Llega preparado con informacion completa, no le hagas perder tiempo con datos que podrias haber enviado antes.

3. Validacion de la decision - Quiere sentir que esta tomando una decision inteligente, no solo emocional. Datos de plusvalia, comparables, proyeccion de zona le dan esa validacion.

4. Discrecion - Muchos compradores premium prefieren procesos privados, sin publicidad masiva de que estan comprando o cuanto pagaron.

ERRORES QUE ALEJAN A ESTE PERFIL:
- Presionar con urgencia falsa ("se va a vender ya")
- Enviar informacion generica sin personalizar al perfil del cliente
- No conocer a fondo la zona y sus comparables cuando te preguntan
- Vestimenta y comunicacion poco profesional en las visitas

COMO CONSTRUIR CONFIANZA RAPIDO: demuestra conocimiento especifico (no generico) de la zona, se puntual y preciso en cada comunicacion, y nunca minimices sus preguntas tecnicas sobre legal, financiero o construccion.`,
        recursos: [
          { nombre: 'Perfil psicologico del comprador de lujo en CR', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que valora mas el comprador premium segun el modulo?', opciones: ['Precio bajo unicamente', 'Exclusividad, eficiencia de tiempo y validacion de su decision', 'Publicidad masiva', 'Urgencia y presion'], correcta: 1 },
          { pregunta: 'Que error aleja a un comprador premium?', opciones: ['Conocer la zona a fondo', 'Presionar con urgencia falsa', 'Ser puntual', 'Personalizar la comunicacion'], correcta: 1 },
        ]
      },
      {
        id: 2, titulo: 'Tecnicas de negociacion de precio',
        contenido: `Negociar precio en propiedades de alto valor requiere mas estrategia que simplemente "subir o bajar el numero".

EL MARCO BATNA (Best Alternative To a Negotiated Agreement):
Antes de negociar, conoce cual es la mejor alternativa de cada parte si NO se llega a un acuerdo. Si tu vendedor tiene otras ofertas o puede esperar, su poder de negociacion es alto. Si el comprador tiene otras propiedades en mira, lo mismo aplica para el.

TECNICA DEL ANCLAJE:
La primera cifra mencionada en una negociacion influye fuertemente en el resultado final. Si representas al vendedor, justifica el precio de lista con datos (comparables, mejoras, ubicacion) ANTES de que el comprador ancle bajo con su primera oferta.

MANEJO DE OFERTAS BAJAS SIN OFENDER:
En vez de rechazar de inmediato, pregunta: "Ayudame a entender en que basaron ese numero" - esto revela informacion sobre su BATNA y te da material para contraofertar con argumentos, no solo con otro numero.

CONCESIONES ESTRATEGICAS:
No regales descuentos de precio sin obtener algo a cambio: plazo de cierre mas rapido, deposito mas alto, renuncia a ciertas contingencias. Cada concesion debe tener una contrapartida.

SILENCIO COMO HERRAMIENTA: despues de presentar una contraoferta, queda en silencio. La incomodidad del silencio frecuentemente hace que la otra parte ceda o explique mas de lo que planeaba.`,
        recursos: [
          { nombre: 'Guia de tacticas de negociacion para cierres de alto valor', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que significa BATNA?', opciones: ['El precio base de la propiedad', 'La mejor alternativa si no se llega a acuerdo', 'Un tipo de contrato', 'El banco que financia'], correcta: 1 },
          { pregunta: 'Que se recomienda hacer ante una oferta baja en vez de rechazarla de inmediato?', opciones: ['Aceptarla igual', 'Preguntar en que se basaron para ese numero', 'Ignorar al comprador', 'Subir el precio de lista'], correcta: 1 },
        ]
      },
      {
        id: 3, titulo: 'Manejo de multiples ofertas',
        contenido: `Cuando una propiedad recibe varias ofertas simultaneas, el proceso debe ser estructurado y transparente para maximizar el resultado del propietario sin generar conflictos legales.

PASOS PARA MANEJAR MULTIPLES OFERTAS:

1. Informa a todos los oferentes que existen otras ofertas (sin revelar montos especificos de las demas) - esto es tanto etico como estrategico, motiva mejores propuestas.

2. Establece una fecha y hora limite clara para "mejor y ultima oferta" si el propietario decide ir por esa via.

3. Evalua mas alla del precio: forma de pago (contado vs financiado), plazo de cierre, contingencias incluidas (inspeccion, financiamiento), y seriedad del deposito.

4. Presenta al propietario un cuadro comparativo de todas las ofertas, no solo una lista de numeros.

ERROR COMUN: dejar que el propietario elija solo por el precio mas alto sin considerar que una oferta de contado sin contingencias puede valer mas en la practica que una oferta mayor pero financiada con multiples condiciones.

ETICA EN EL PROCESO: nunca reveles el monto exacto de una oferta a otro oferente para inducirlo a subir artificialmente (esto se conoce como "auction shopping" y es una practica cuestionable). Mantener la confianza de todas las partes protege tu reputacion a largo plazo.

COMUNICACION CON LOS QUE NO GANAN: siempre agradece formalmente a los oferentes no seleccionados y mantenlos en tu base de datos - frecuentemente se convierten en compradores de otra propiedad que les presentes despues.`,
        recursos: [
          { nombre: 'Plantilla de cuadro comparativo de ofertas multiples', tipo: 'Excel' },
        ],
        quiz: [
          { pregunta: 'Que se debe evaluar en multiples ofertas ademas del precio?', opciones: ['Solo el precio importa', 'Forma de pago, plazo de cierre y contingencias', 'El color de la propuesta', 'Nada mas es necesario'], correcta: 1 },
          { pregunta: 'Que practica es eticamente cuestionable en el manejo de multiples ofertas?', opciones: ['Informar que hay otras ofertas', 'Revelar montos exactos a otros oferentes para inducirlos a subir', 'Dar fecha limite', 'Agradecer a los no seleccionados'], correcta: 1 },
        ]
      },
      {
        id: 4, titulo: 'Post-cierre y generacion de referidos',
        contenido: `El cierre no es el final de la relacion - es el inicio de tu mejor fuente de nuevos negocios: los referidos.

QUE HACER EN LAS PRIMERAS 48 HORAS POST-CIERRE:
1. Mensaje personalizado de felicitacion (no generico) mencionando algo especifico del proceso que vivieron juntos
2. Pequeno detalle de bienvenida a la nueva propiedad si el presupuesto lo permite
3. Recordatorio de que estas disponible para cualquier duda sobre la nueva propiedad (tramites, contactos de confianza para remodelacion, etc.)

EL SISTEMA DE SEGUIMIENTO A LARGO PLAZO:
- Mes 1: llamada o mensaje para ver como va la mudanza/adaptacion
- Mes 6: contacto de seguimiento, preguntar si necesitan recomendaciones de servicios
- Aniversario de compra: mensaje de felicitacion anual - mantiene tu nombre presente

COMO PEDIR REFERIDOS SIN SONAR DESESPERADO:
En vez de "conoces a alguien que quiera comprar?", usa: "Mi negocio crece principalmente por recomendaciones de clientes satisfechos como ustedes. Si en el futuro algun amigo o familiar menciona que esta buscando propiedad, me encantaria que pensaran en mi."

CONVERTIR CLIENTES EN PROMOTORES ACTIVOS:
- Pide testimonio en video o escrito poco despues del cierre, cuando la emocion esta fresca
- Ofrece un pequeno incentivo por referido exitoso (cuidando que sea legal y transparente)
- Mantenelos informados sobre la plusvalia de su zona periodicamente - les das valor sin pedir nada a cambio

DATO CLAVE: en bienes raices, un cliente satisfecho genera en promedio 2-3 referidos en los siguientes 24 meses si se le da seguimiento adecuado. Sin seguimiento, ese numero cae a casi cero.`,
        recursos: [
          { nombre: 'Calendario de seguimiento post-cierre a 12 meses', tipo: 'Excel' },
          { nombre: 'Plantillas de mensajes para pedir referidos', tipo: 'PDF' },
        ],
        quiz: [
          { pregunta: 'Que se recomienda hacer en las primeras 48 horas post-cierre?', opciones: ['No contactar al cliente', 'Mensaje personalizado de felicitacion', 'Pedir el referido de inmediato', 'Enviar la factura final unicamente'], correcta: 1 },
          { pregunta: 'Cuantos referidos genera en promedio un cliente satisfecho con seguimiento adecuado?', opciones: ['0', '2-3 en 24 meses', '10 inmediatos', '1 cada 10 anos'], correcta: 1 },
        ]
      },
    ]
  },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --bg:oklch(0.97 0.005 80);--bg-elev:oklch(0.985 0.004 80);--bg-card:oklch(0.99 0.003 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--rule-soft:oklch(0.93 0.005 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
  a{color:inherit;text-decoration:none} button{font:inherit;color:inherit;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .mod-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;border:none;background:transparent;text-align:left;cursor:pointer;width:100%;transition:background 0.15s;font-family:var(--sans)}
  .mod-btn:hover{background:var(--bg-elev)}
  .mod-btn.active{background:var(--accent-tint)}
  .mod-btn.locked{opacity:0.4;cursor:not-allowed}
  .quiz-opt{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;cursor:pointer;transition:all 0.15s;font-size:14px;background:white;text-align:left;font-family:var(--sans);width:100%}
  .quiz-opt:hover{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.selected{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.correct{border-color:var(--accent);background:var(--accent-tint)}
  .quiz-opt.wrong{border-color:oklch(0.45 0.08 20);background:oklch(0.97 0.03 20)}
  .recurso-btn{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--rule);border-radius:10px;background:white;cursor:pointer;transition:all 0.15s;font-family:var(--sans);width:100%}
  .recurso-btn:hover{border-color:var(--accent);background:var(--accent-tint)}
  @media(max-width:900px){.curso-grid{grid-template-columns:1fr!important}.sidebar-mod{display:none!important}}
`

function CursoInner() {
  const params = useSearchParams()
  const router = useRouter()
  const id = parseInt(params.get('id') || '1')
  const curso = CURSOS[id]

  const [modIdx, setModIdx] = useState(0)
  const [completados, setCompletados] = useState<number[]>([])
  const [quizActivo, setQuizActivo] = useState(false)
  const [respuestas, setRespuestas] = useState<Record<number,number>>({})
  const [enviado, setEnviado] = useState(false)
  const [aprobado, setAprobado] = useState(false)
  const [planActivo, setPlanActivo] = useState('gratis')
  const { bloqueado: trialBloqueado, checando: checandoTrial } = useTrial()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string } | null } }) => {
      if (!user) return
      supabase.from('suscripciones').select('plan').eq('correo', user.email).maybeSingle()
        .then(({ data }: { data: { plan: string } | null }) => { if (data?.plan) setPlanActivo(data.plan) })
    })
  }, [])

  if (!curso) return <div style={{padding:40,fontFamily:'sans-serif'}}>Curso no encontrado. <a href="/academia" style={{color:'green'}}>Volver</a></div>

  if (!checandoTrial && trialBloqueado) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f8f5' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        <p style={{ fontSize:16, marginBottom:16 }}>Tu prueba de NIDO Black terminó.</p>
        <a href="/precios" style={{ background:'#1a1a1a', color:'white', padding:'12px 24px', borderRadius:999, textDecoration:'none', fontSize:14 }}>Ver planes →</a>
      </div>
    </main>
  )

  if (!checandoTrial && curso && !curso.gratis && !getPlanConfig(planActivo).academiaCompleta) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f8f5' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
        <p style={{ fontSize:16, marginBottom:16 }}>Este curso requiere un plan Elite o Black.</p>
        <a href="/precios" style={{ background:'#1a1a1a', color:'white', padding:'12px 24px', borderRadius:999, textDecoration:'none', fontSize:14 }}>Ver planes →</a>
      </div>
    </main>
  )

  const mod = curso.modulos[modIdx]
  const isDone = completados.includes(mod.id)

  const enviar = () => {
    const ok = mod.quiz.filter((_, i: number) => respuestas[i] === mod.quiz[i].correcta).length
    const pass = ok >= Math.ceil(mod.quiz.length * 0.7)
    setAprobado(pass)
    setEnviado(true)
    if (pass) setCompletados((p:number[]) => [...p, mod.id])
  }

  const reset = () => { setRespuestas({}); setEnviado(false); setAprobado(false) }

  const irModulo = (i: number) => {
    const locked = i > 0 && !completados.includes(curso.modulos[i-1].id)
    if (locked) return
    setModIdx(i); setQuizActivo(false); reset()
  }

  return (
    <main style={{fontFamily:'var(--sans)',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)'}}>
      <style>{CSS}</style>
      <nav style={{borderBottom:'1px solid var(--rule)',background:'oklch(0.97 0.005 80/0.95)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 32px',maxWidth:1400,margin:'0 auto'}}>
          <Link href="/" style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)'}}>NIDO<span style={{color:'var(--accent)'}}>.</span></Link>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--ink-3)'}}>
            <a href="/academia">Academia</a><span>›</span><span style={{color:'var(--ink)'}}>{curso.titulo}</span>
          </div>
          <span style={{fontSize:12,color:'var(--ink-3)'}}>{completados.length} / {curso.modulos.length} completados</span>
        </div>
        <div style={{height:3,background:'var(--rule)',position:'relative'}}>
          <div style={{position:'absolute',top:0,left:0,height:'100%',background:'var(--accent)',width:(completados.length/curso.modulos.length*100)+'%',transition:'width 0.5s'}}/>
        </div>
      </nav>

      <div className="curso-grid" style={{display:'grid',gridTemplateColumns:'260px 1fr',maxWidth:1400,margin:'0 auto',minHeight:'calc(100vh - 57px)'}}>
        <aside className="sidebar-mod" style={{borderRight:'1px solid var(--rule)',background:'white',position:'sticky',top:57,height:'calc(100vh - 57px)',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'16px',borderBottom:'1px solid var(--rule)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:'oklch(0.88 0.03 '+curso.hue+')',display:'grid',placeItems:'center',fontSize:18}}>{curso.icon}</div>
              <div style={{fontSize:12,fontWeight:500,color:'var(--ink)',lineHeight:1.3}}>{curso.titulo}</div>
            </div>
          </div>
          <div style={{padding:'12px 8px',flex:1}}>
            <div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',padding:'0 8px',marginBottom:8}}>Modulos</div>
            {curso.modulos.map((m, i: number) => {
              const done = completados.includes(m.id)
              const active = modIdx === i
              const locked = i > 0 && !completados.includes(curso.modulos[i-1].id)
              return (
                <button key={m.id} className={'mod-btn'+(active?' active':'')+(locked?' locked':'')} onClick={() => irModulo(i)}>
                  <span style={{width:22,height:22,borderRadius:'50%',background:done?'var(--accent)':active?'var(--accent)':'var(--rule)',color:done||active?'white':'var(--ink-3)',display:'grid',placeItems:'center',fontSize:10,fontWeight:600,flexShrink:0}}>
                    {done ? '✓' : String(i+1).padStart(2,'0')}
                  </span>
                  <span style={{fontSize:12,lineHeight:1.35}}>{m.titulo}</span>
                  {locked && <span style={{marginLeft:'auto',fontSize:10}}>🔒</span>}
                </button>
              )
            })}
          </div>
          <div style={{padding:'12px 16px',borderTop:'1px solid var(--rule)'}}>
            <a href="/academia" style={{display:'block',textAlign:'center',fontSize:13,color:'var(--ink-3)',padding:'10px',borderRadius:8,border:'1px solid var(--rule)'}}>← Volver a Academia</a>
          </div>
        </aside>

        <div style={{padding:'32px 48px 80px',maxWidth:800}}>
          <div style={{marginBottom:24,animation:'fadeUp 0.4s ease'}}>
            <div style={{fontSize:11,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:8}}>Modulo {String(modIdx+1).padStart(2,'0')} de {String(curso.modulos.length).padStart(2,'0')}</div>
            <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(22px,3vw,34px)',fontWeight:400,lineHeight:1.1}}>{mod.titulo}</h1>
          </div>

          {!quizActivo ? (
            <>
              <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:12,padding:'28px 32px',marginBottom:20}}>
                {mod.contenido.split('\n').map((line:string, i:number) => {
                  if (line === '') return <br key={i}/>
                  if (line === line.toUpperCase() && line.length > 3) return <h3 key={i} style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:400,margin:'20px 0 8px',color:'var(--ink)'}}>{line}</h3>
                  if (line.startsWith('- ')) return <li key={i} style={{marginLeft:20,marginBottom:6,fontSize:14,color:'var(--ink-2)',lineHeight:1.65}}>{line.slice(2)}</li>
                  return <p key={i} style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.75,marginBottom:6}}>{line}</p>
                })}
              </div>

              {(mod.recursos?.length || 0) > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>Recursos descargables</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {mod.recursos?.map((r, i: number) => (
                      <button key={i} className="recurso-btn">
                        <span style={{width:36,height:36,borderRadius:8,background:r.tipo==='PDF'?'oklch(0.93 0.04 20)':'oklch(0.93 0.04 200)',display:'grid',placeItems:'center',fontSize:11,fontWeight:600,color:r.tipo==='PDF'?'oklch(0.45 0.08 20)':'oklch(0.35 0.06 200)',flexShrink:0}}>{r.tipo}</span>
                        <div style={{textAlign:'left'}}>
                          <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',marginBottom:2}}>{r.nombre}</div>
                          <div style={{fontSize:11,color:'var(--ink-3)'}}>Disponible para descarga</div>
                        </div>
                        <span style={{marginLeft:'auto',fontSize:16,color:'var(--ink-3)'}}>↓</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isDone && (
                <button onClick={() => setQuizActivo(true)} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--ink)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>
                  Hacer el cuestionario para continuar →
                </button>
              )}
              {isDone && modIdx < curso.modulos.length - 1 && (
                <button onClick={() => irModulo(modIdx + 1)} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--accent)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>
                  Siguiente modulo: {curso.modulos[modIdx+1].titulo} →
                </button>
              )}
              {isDone && modIdx === curso.modulos.length - 1 && (
                <div style={{background:'var(--accent-tint)',border:'1px solid oklch(0.85 0.04 150)',borderRadius:12,padding:'24px',textAlign:'center'}}>
                  <div style={{fontSize:36,marginBottom:8}}>🏆</div>
                  <div style={{fontFamily:'var(--serif)',fontSize:24,marginBottom:8}}>Curso completado!</div>
                  <p style={{fontSize:14,color:'var(--ink-2)',marginBottom:16}}>Completaste todos los modulos. Tu certificado estara disponible en tu perfil.</p>
                  <a href="/academia" style={{display:'inline-block',padding:'10px 24px',borderRadius:999,background:'var(--accent)',color:'white',fontSize:14,fontWeight:500}}>Ver mas cursos →</a>
                </div>
              )}
            </>
          ) : (
            <div style={{animation:'fadeUp 0.3s ease'}}>
              <div style={{background:'white',border:'1px solid var(--rule)',borderRadius:12,padding:'28px 32px'}}>
                <div style={{fontFamily:'var(--serif)',fontSize:22,marginBottom:24}}>Cuestionario del modulo</div>
                {mod.quiz.map((q, qi: number) => (
                  <div key={qi} style={{marginBottom:24}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>{qi+1}. {q.pregunta}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {q.opciones.map((op:string, oi:number) => {
                        let cls = 'quiz-opt'
                        if (enviado) {
                          if (oi === q.correcta) cls += ' correct'
                          else if (respuestas[qi] === oi) cls += ' wrong'
                        } else if (respuestas[qi] === oi) cls += ' selected'
                        return (
                          <button key={oi} className={cls} onClick={() => !enviado && setRespuestas(p => ({...p,[qi]:oi}))}>
                            <span style={{width:22,height:22,borderRadius:'50%',border:'1px solid currentColor',display:'grid',placeItems:'center',fontSize:11,flexShrink:0,opacity:0.6}}>{String.fromCharCode(65+oi)}</span>
                            {op}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!enviado ? (
                  <button onClick={enviar} disabled={Object.keys(respuestas).length < mod.quiz.length} style={{width:'100%',padding:'13px',borderRadius:999,background:'var(--ink)',color:'white',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',opacity:Object.keys(respuestas).length < mod.quiz.length?0.5:1}}>
                    Enviar respuestas
                  </button>
                ) : (
                  <div style={{textAlign:'center',padding:'16px 0'}}>
                    <div style={{fontSize:36,marginBottom:8}}>{aprobado?'✅':'❌'}</div>
                    <div style={{fontFamily:'var(--serif)',fontSize:20,marginBottom:8}}>{aprobado?'Aprobado!':'Intenta de nuevo'}</div>
                    <p style={{fontSize:14,color:'var(--ink-2)',marginBottom:16}}>{aprobado?'Completaste este modulo.':'Revisa el contenido y volve a intentarlo.'}</p>
                    <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                      {!aprobado && <button onClick={() => {reset();setQuizActivo(true)}} style={{padding:'10px 20px',borderRadius:999,border:'1px solid var(--rule)',fontSize:13,cursor:'pointer',background:'transparent'}}>Reintentar</button>}
                      <button onClick={() => setQuizActivo(false)} style={{padding:'10px 20px',borderRadius:999,background:aprobado?'var(--accent)':'var(--ink)',color:'white',border:'none',fontSize:13,cursor:'pointer'}}>
                        {aprobado?'Continuar →':'Volver al contenido'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CursoPage() {
  return (
    <Suspense fallback={<div style={{padding:40,fontFamily:'sans-serif',color:'#999'}}>Cargando...</div>}>
      <CursoInner/>
    </Suspense>
  )
}
