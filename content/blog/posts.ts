export type StatItem = {
  value: string
  label: string
}

export type TableBlock = {
  headers: string[]
  rows: string[][]
  caption?: string
}

export type CalloutBlock = {
  tone: "info" | "success" | "warning"
  title: string
  body: string
}

export type BarItem = {
  label: string
  value: number
  suffix?: string
}

export type BarsBlock = {
  title?: string
  unit?: string
  items: BarItem[]
}

export type ChecklistItem = {
  text: string
  done: boolean
}

export type ChecklistBlock = {
  title?: string
  items: ChecklistItem[]
}

export type PostSection = {
  heading?: string
  paragraphs?: string[]
  stats?: StatItem[]
  table?: TableBlock
  callout?: CalloutBlock
  bars?: BarsBlock
  checklist?: ChecklistBlock
}

export type Post = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readMinutes: number
  sections: PostSection[]
  nextSlug?: string
}

export const posts: Post[] = [
  {
    slug: "logistica-colaborativa-p2p",
    title:
      "Qué es la logística colaborativa P2P (y por qué cambia todo en Argentina)",
    description:
      "La logística colaborativa P2P conecta a personas que necesitan enviar un paquete con personas que ya viajan hacia ese destino. Cómo funciona y qué ventajas tiene sobre el correo tradicional.",
    publishedAt: "2025-07-07",
    readMinutes: 5,
    sections: [
      {
        paragraphs: [
          "En Argentina, enviar un paquete a otra ciudad siempre implicó depender de empresas de correo, pagar tarifas fijas y aceptar tiempos de entrega que pocas veces se cumplen. La logística colaborativa P2P propone algo diferente: conectar directamente a quien necesita enviar con alguien que ya va hacia ese destino.",
        ],
      },
      {
        heading: "¿Qué significa P2P en logística?",
        paragraphs: [
          'P2P son las siglas de "peer-to-peer" o persona a persona. En el contexto de la logística, significa que el transporte de un paquete no lo hace una empresa con flota propia, sino una persona común que ya está haciendo ese viaje —en auto, colectivo, avión o tren— y tiene espacio disponible.',
          "El modelo no es nuevo: llevar un encargo a cambio de una colaboración económica es algo que ocurre de forma informal desde siempre. Lo que cambia hoy es la tecnología que lo hace escalable, seguro y confiable para cualquier persona.",
        ],
      },
      {
        heading: "Las ventajas respecto al correo tradicional",
        paragraphs: [
          "Los operadores de correo convencionales operan con infraestructura centralizada: depósitos, vehículos propios, rutas fijas. Eso genera costos que se trasladan al cliente y tiempos que dependen de la disponibilidad de esa red.",
          "La logística colaborativa distribuye esa estructura. Los transportistas son personas que ya realizan el viaje, por lo que el costo marginal de llevar un paquete es muy bajo. El resultado son tarifas más accesibles, tiempos de entrega que pueden ser más cortos que los del correo convencional, mayor cobertura en destinos donde el correo llega con demoras, e ingresos extra para el viajero sin que tenga que modificar su ruta.",
        ],
      },
      {
        heading: "El desafío de la confianza",
        paragraphs: [
          "El principal obstáculo de cualquier modelo P2P es la confianza entre desconocidos. ¿Cómo saber que el transportista va a cuidar el paquete? ¿Cómo asegurarse de que el pago llegue?",
          "Las plataformas de logística colaborativa resuelven este problema con capas de verificación: identidad biométrica de los usuarios, historial de reputación público, y sistemas de pago que retienen los fondos hasta confirmar la entrega. Sin esas garantías, el modelo no escala.",
        ],
      },
      {
        heading: "El modelo P2P en Argentina",
        paragraphs: [
          "Argentina tiene condiciones particulares que hacen atractivo al modelo P2P: un país con grandes distancias entre ciudades, un mercado de envíos con tarifas elevadas en comparación al salario promedio, y una cultura de ayuda mutua muy arraigada.",
          "La adopción de aplicaciones móviles creció de forma sostenida en los últimos años, y eso crea la infraestructura sobre la que puede operar la logística colaborativa: usuarios con smartphones, familiarizados con pagos digitales y con disposición a cambiar hábitos cuando la experiencia lo justifica.",
        ],
      },
      {
        heading: "¿Qué falta para que despegue?",
        paragraphs: [
          "Para que la logística P2P se consolide en Argentina hacen falta tres cosas: masa crítica de usuarios, confianza en el sistema de pagos, y un producto que haga la experiencia tan simple que cualquiera pueda usarlo desde el primer intento.",
          "Las plataformas que logren resolver esas tres variables tienen la oportunidad de cambiar la forma en que los argentinos envían paquetes.",
        ],
      },
    ],
  },
  {
    slug: "que-es-movo",
    title: "Movo: qué es, cómo funciona y cuánto cuesta",
    description:
      "Movo es una app argentina de logística colaborativa que conecta a quien necesita enviar un paquete con personas que ya viajan hacia ese destino. Pagos seguros con MercadoPago, verificación biométrica y seguimiento en tiempo real.",
    publishedAt: "2025-07-07",
    readMinutes: 4,
    sections: [
      {
        paragraphs: [
          "Movo es una plataforma de logística colaborativa P2P desarrollada en Argentina. Permite que cualquier persona pueda enviar un paquete a otra ciudad a través de alguien que ya está haciendo ese viaje, sin depender de una empresa de correo tradicional.",
        ],
      },
      {
        heading: "¿Cómo funciona?",
        paragraphs: [
          "El proceso tiene dos lados: el emisor (quien quiere enviar el paquete) y el transportista (quien ya viaja hacia el destino y tiene espacio disponible).",
          "El emisor publica en la app el paquete que quiere enviar: dimensiones, peso, origen y destino. Los transportistas que planifican ese viaje pueden ver la publicación y postularse. El emisor elige según reputación y precio, y el envío queda coordinado.",
          "Al momento del retiro, ambas partes se verifican mutuamente con un código QR firmado. El transportista recoge el paquete y comienza el viaje. Cuando llega al destino, una segunda verificación confirma la entrega y los fondos se liberan automáticamente.",
        ],
      },
      {
        heading: "Pagos seguros con MercadoPago",
        paragraphs: [
          "Movo usa el marketplace de MercadoPago para gestionar todos los pagos. Cuando el emisor reserva un viaje, el dinero no va directamente al transportista: queda retenido en un hold hasta que se confirma la entrega.",
          "En el momento en que el transportista retira el paquete, MercadoPago aplica un hold sobre los fondos en la tarjeta de crédito del emisor. Cuando la entrega se confirma, el hold se libera y el pago se divide automáticamente vía split payment: el transportista recibe su parte y Movo retiene su comisión.",
          "Si el pago se hace en efectivo al momento de la entrega, Movo cobra la comisión directamente en la tarjeta de crédito que el transportista tiene registrada en la app. En todos los casos, los fondos del emisor están protegidos hasta que la entrega quede confirmada.",
        ],
      },
      {
        heading: "Verificación de identidad",
        paragraphs: [
          "Para garantizar la confianza entre partes desconocidas, Movo implementa un proceso de KYC (Know Your Customer) biométrico para todos los usuarios. Antes de poder publicar o aceptar envíos, cada persona debe verificar su identidad con liveness detection y documento de identidad.",
          "Esto crea un entorno donde todos los participantes son personas reales con identidad verificada, lo que reduce significativamente el riesgo para ambas partes.",
        ],
      },
      {
        heading: "¿Cuánto cuesta usar Movo?",
        paragraphs: [
          "Movo cobra una comisión del 15% sobre el valor del envío en los viajes que se completan exitosamente. Si el envío no se concreta, no se cobra nada.",
          "El precio del envío lo define el mercado: cada transportista puede proponer su tarifa, y el emisor elige la opción que más le convenga. Eso hace que los precios sean competitivos y estén alineados a lo que cada viaje realmente vale.",
        ],
      },
      {
        heading: "Estado actual del proyecto",
        paragraphs: [
          "Movo es el Proyecto Final Integrador de Ingeniería en Sistemas de Información de la UTN Facultad Regional Córdoba. La app está en desarrollo activo y próxima a ser lanzada al mercado.",
          "Si querés recibir novedades sobre el lanzamiento, seguinos en Instagram o visitá la sección El Proyecto para conocer más sobre el equipo y la visión detrás de Movo.",
        ],
      },
    ],
  },
  {
    slug: "comparativa-envios-argentina",
    title:
      "Andreani, OCA y Correo Argentino vs envío P2P: ¿cuál conviene en 2025?",
    description:
      "Comparamos las principales opciones para enviar paquetes en Argentina: correos tradicionales como Andreani, OCA y Correo Argentino contra el modelo P2P colaborativo. Precios, tiempos de entrega y cobertura.",
    publishedAt: "2025-07-07",
    readMinutes: 6,
    sections: [
      {
        paragraphs: [
          "A la hora de enviar un paquete en Argentina, el camino más conocido es ir a una sucursal de Andreani, OCA o el Correo Argentino. Pero en los últimos años apareció una alternativa que, para ciertos envíos, puede ser más rápida, más barata y más conveniente: la logística colaborativa P2P. ¿Cuándo conviene cada opción?",
        ],
      },
      {
        heading:
          "Los correos tradicionales: infraestructura consolidada, tarifas fijas",
        paragraphs: [
          "Andreani, OCA y el Correo Argentino tienen algo que ninguna plataforma nueva puede replicar de un día para el otro: décadas de operación, redes de sucursales en todo el país y procesos estandarizados para manejar volumen.",
          "Eso les permite ofrecer certeza: el paquete va a ser procesado, tiene seguro en muchos casos, y se puede rastrear el estado del envío. El costo de esa infraestructura, sin embargo, se traslada directamente a las tarifas y a tiempos de entrega que dependen de la disponibilidad de la red central.",
          "El Correo Argentino suele ser la opción más económica de las tres, pero con tiempos de entrega más lentos y menor confiabilidad en los plazos. Andreani y OCA ofrecen servicios express que acortan esos tiempos, pero a un costo bastante mayor.",
        ],
      },
      {
        heading: "El modelo P2P: eficiencia del viaje ya hecho",
        paragraphs: [
          "La diferencia fundamental del modelo P2P es que el transportista ya está haciendo el viaje. Llevar un paquete no le agrega un costo significativo porque el viaje ya está cubierto. Eso se traduce en tarifas que pueden ser considerablemente menores a las de un correo tradicional.",
          "Además, como el viaje ya está planificado, los tiempos de entrega pueden ser muy predecibles: si alguien viaja mañana de Buenos Aires a Córdoba, el paquete puede estar ahí al día siguiente, sin depender de los tiempos de una red de distribución centralizada.",
        ],
      },
      {
        heading: "¿Cuándo conviene cada uno?",
        paragraphs: [
          "El correo tradicional conviene cuando necesitás enviar paquetes voluminosos o muy pesados para los que no hay espacio en un viaje personal, cuando el destino es un lugar pequeño con poca circulación de viajeros, cuando necesitás un seguro formal respaldado por una empresa, o cuando no hay urgencia y preferís delegar todo a una operación consolidada.",
          "El envío P2P conviene cuando necesitás que el paquete llegue rápido sin pagar tarifas express, cuando el presupuesto es ajustado, cuando querés hacer el envío desde el celular sin ir a una sucursal, o cuando el destino tiene un viajero disponible que ya va directo.",
        ],
      },
      {
        heading: "El factor confianza: ¿qué pasa si algo sale mal?",
        paragraphs: [
          "La principal objeción al modelo P2P es la confianza. ¿Qué pasa si el transportista no entrega? ¿Quién responde?",
          "Las plataformas serias resuelven esto con sistemas de pagos retenidos —el dinero no se libera hasta que la entrega se confirma—, verificación biométrica de identidad para todos los usuarios, y reputación acumulada que actúa como garantía social. En ese sentido, el riesgo P2P no es necesariamente mayor al de un correo tradicional, donde la compensación por un paquete perdido suele ser limitada y el proceso de reclamo, lento.",
        ],
      },
      {
        heading: "Conclusión: no es una pelea, es un complemento",
        paragraphs: [
          "Los correos tradicionales van a seguir siendo la opción por defecto para envíos masivos, paquetes grandes o destinos sin cobertura P2P. Pero para envíos urbanos o interurbanos de tamaño moderado, el modelo P2P ofrece una alternativa genuina que combina precio, velocidad y experiencia de usuario.",
          "A medida que crezca la masa crítica de viajeros activos en las apps P2P, esa ventaja se va a ampliar. El correo tradicional no desaparece, pero deja de ser la única opción razonable.",
        ],
      },
    ],
  },
  {
    slug: "sprint-identidad-y-confianza",
    title:
      "Devlog: cómo construimos el registro, el KYC y el login de Movo (y los 3 bugs que encontramos en el camino)",
    description:
      "Un repaso técnico de un sprint de desarrollo: registro con verificación de teléfono por Twilio, KYC biométrico con Didit.me, login con tokens seguros y un API Gateway que protege toda la plataforma. Con números y los bugs reales que aparecieron.",
    publishedAt: "2026-08-11",
    readMinutes: 7,
    nextSlug: "sprint-ejecucion-del-envio",
    sections: [
      {
        paragraphs: [
          "Trabajamos en sprints de dos semanas, con una demo al final de cada uno. Este es el resumen del sprint que le dedicamos a la parte que sostiene todo lo demás en una plataforma P2P: que dos desconocidos puedan confiar el uno en el otro para que uno le entregue un paquete al otro.",
          "Lo hicimos todo contra infraestructura real desde el primer día: base de datos, el proveedor de verificación de identidad y el envío de SMS de verdad, nada de mocks. Nos tomó más tiempo que simular esas piezas, pero fue justamente eso lo que nos hizo encontrar bugs que un entorno de pruebas simulado no iba a mostrarnos nunca.",
        ],
      },
      {
        heading: "El objetivo del sprint",
        paragraphs: [
          "Cerramos el módulo de Identidad y Confianza: una persona nueva se puede registrar, verificar su número de teléfono con un código por SMS (usamos Twilio), validar su identidad con documento y reconocimiento facial (eso lo tercerizamos con Didit.me, un proveedor especializado en KYC), iniciar sesión de forma segura y consultar o editar su perfil.",
          "No es la parte más vistosa del producto, pero es la que habilita todo lo demás. Sin identidad verificada no hay reputación, y sin reputación un modelo P2P de logística no cierra: nadie le da un paquete a un desconocido sin ninguna garantía de que existe y de que es quien dice ser.",
        ],
      },
      {
        stats: [
          { value: "249", label: "tests automatizados en verde" },
          { value: "37", label: "archivos de test" },
          { value: "0", label: "servicios simulados (mocks) en la demo" },
          { value: "1", label: "sprint para todo el módulo" },
        ],
      },
      {
        heading: "Qué puede hacer un usuario hoy",
        checklist: {
          items: [
            {
              text: "Registrarse con nombre, documento, dirección y teléfono",
              done: true,
            },
            {
              text: "Verificar el teléfono con un código SMS real (con reintento y cooldown anti-spam)",
              done: true,
            },
            {
              text: "Validar su identidad con documento + reconocimiento facial en vivo",
              done: true,
            },
            {
              text: "Iniciar sesión y mantener la sesión activa de forma segura",
              done: true,
            },
            {
              text: "Cerrar sesión revocando el acceso al instante",
              done: true,
            },
            {
              text: "Ver su perfil público y el de otros usuarios, con la información justa en cada caso",
              done: true,
            },
          ],
        },
      },
      {
        heading: "El gateway, o quién cuida la puerta",
        paragraphs: [
          "Toda la plataforma corre sobre microservicios: usuarios, envíos, precios y pagos viven cada uno en su propio servicio, aislado de los demás. Eso da flexibilidad para tocar uno sin romper otro, pero deja una pregunta abierta: ¿quién se fija que un pedido venga autenticado antes de que llegue a cualquiera de esos servicios?",
          "La resolvimos con un único punto de entrada, un API Gateway, que valida identidad, rol y un límite de pedidos por minuto por usuario antes de dejar pasar nada. Así ningún servicio interno tiene que reimplementar esa lógica, y no queda ningún endpoint expuesto sin protección por un descuido.",
        ],
      },
      {
        callout: {
          tone: "success",
          title: "Los 3 bugs reales que encontramos (y arreglamos en el mismo sprint)",
          body: "Probar contra proveedores externos reales, y no solo contra su documentación, cuesta más tiempo pero tiene un beneficio directo: aparecieron tres problemas que un mock jamás hubiera mostrado. El límite de pedidos por minuto del gateway se compartía por error entre /kyc/session y /auth/login, así que un usuario podía gastar su cupo autenticándose y quedarse sin margen para arrancar el KYC. Twilio dejó de aceptar nuestro método de autenticación (Account SID + Auth Token) y tuvimos que migrar en caliente a API Key + Secret. Y un número argentino con el prefijo +549 no lo reconocía como el mismo destinatario que +54, así que algunos SMS no llegaban. Los tres aparecieron probando contra el entorno real y se corrigieron en el mismo sprint.",
        },
      },
      {
        heading: "Por qué no alcanza con leer la documentación del proveedor",
        paragraphs: [
          "Didit.me documenta tres resultados posibles para una verificación de identidad: aprobado, rechazado o revisión manual. Cuando empezamos a integrar el flujo contra su sandbox real, los estados que efectivamente llegaban por webhook eran Approved, Declined e In Review —nombres distintos a los que habíamos usado para diseñar nuestra propia máquina de estados.",
          "Paramos, revisamos el comportamiento real del proveedor y ajustamos el modelo para reflejarlo: agregamos el estado manual_review, que se resuelve solo cuando llega el webhook con el resultado final, o que se puede consultar activamente contra la API de Didit si esa notificación nunca llega. Fue medio día de trabajo extra, pero mejor eso que lanzar con un caso sin contemplar.",
        ],
      },
      {
        heading: "Lo que aprendimos",
        paragraphs: [
          "Cuando algo depende del comportamiento de un tercero, conviene validarlo contra el entorno real del proveedor antes de darlo por cerrado. La documentación es un punto de partida, no la última palabra.",
          "Y cuando en el camino encontramos una decisión de seguridad que había quedado abierta —en este caso, dos rutas de verificación de identidad que no exigían estar autenticado y aceptaban un id de usuario adivinable en la URL— la cerramos en el mismo sprint, en vez de anotarla como deuda técnica para después.",
        ],
      },
      {
        heading: "Qué sigue",
        paragraphs: [
          "Con la identidad resuelta pasamos al módulo de Ejecución del Envío: que un emisor pueda publicar un envío y que quien lo recibe pueda confirmarlo.",
        ],
      },
    ],
  },
  {
    slug: "sprint-ejecucion-del-envio",
    title:
      "Devlog: ya se puede crear y gestionar un envío en Movo (transportarlo es otra historia)",
    description:
      "Este sprint construimos la publicación de un envío: creación con fotos y precio sugerido, confirmación del receptor, notificaciones, cancelación e historial. Todavía no hay matching de transportistas ni transporte real, y contamos por qué: un bloqueo con nuestro proveedor de pagos que seguimos sin resolver.",
    publishedAt: "2026-08-25",
    readMinutes: 8,
    sections: [
      {
        paragraphs: [
          "Segunda entrega de la serie. En la anterior contamos cómo construimos la identidad y la confianza entre usuarios. Esta vez tocaba la parte que le da sentido a todo lo demás: que un envío se pueda crear, publicar y gestionar.",
          "Aclaración antes de arrancar, porque el título de esta serie se presta a confusión: lo que cerramos es la publicación y gestión del envío, no el transporte en sí. Todavía no hay forma de que un transportista se postule a llevar un paquete, ni de coordinar el retiro, el viaje o la entrega. Eso viene después, y depende en parte de lo que contamos más abajo sobre pagos.",
        ],
      },
      {
        heading: "El objetivo del sprint",
        paragraphs: [
          "Un emisor puede crear un envío desde un wizard en el celular, con fotos del paquete y un precio sugerido automáticamente. Elige a quién se lo envía y la ruta, con autocompletado de direcciones. Esa persona —el receptor, quien va a recibir el paquete en destino— ve el envío, ve la reputación de quien se lo manda, y decide si lo acepta o lo rechaza. Ambas partes reciben notificaciones push en los pasos importantes. Si nadie confirma a tiempo, el envío vence solo. Se puede cancelar mientras todavía no tiene transportista asignado. Y el emisor puede repasar el historial completo con una línea de tiempo de estados.",
          "Ninguna de esas piezas asigna todavía un transportista real al envío ni mueve el paquete. Lo que queda armado es la parte de \"publicar y coordinar\", que es el prerrequisito para que ese matching tenga sentido.",
        ],
      },
      {
        paragraphs: [
          "En paralelo resolvimos dos investigaciones técnicas de riesgo alto que veníamos posponiendo: el algoritmo que va a calcular rutas óptimas para los transportistas (con OR-Tools, la librería de optimización de Google), y la integración de pagos con MercadoPago.",
        ],
      },
      {
        stats: [
          { value: "8", label: "funcionalidades de usuario cerradas" },
          { value: "2", label: "investigaciones técnicas de riesgo resueltas" },
          { value: "2", label: "bugs encontrados y corregidos en el camino" },
          { value: "1", label: "desafío de pagos todavía en curso" },
        ],
      },
      {
        heading: "Lo que ya se puede hacer",
        checklist: {
          title: "Publicación y gestión de un envío",
          items: [
            {
              text: "Crear un envío con fotos del paquete y un precio sugerido automáticamente",
              done: true,
            },
            {
              text: "Elegir receptor y ruta, con autocompletado de direcciones",
              done: true,
            },
            {
              text: "Recibir una notificación push cuando alguien te envía algo",
              done: true,
            },
            {
              text: "Aceptar o rechazar un envío viendo el perfil y la reputación de quien lo manda",
              done: true,
            },
            {
              text: "Que el envío venza solo si nadie confirma a tiempo, sin quedar en el limbo",
              done: true,
            },
            {
              text: "Cancelar un envío publicado antes de que se le asigne un transportista",
              done: true,
            },
            {
              text: "Repasar el historial completo con línea de tiempo de estados",
              done: true,
            },
            {
              text: "Verificar la licencia de conducir para obtener la insignia de transportista verificado",
              done: true,
            },
          ],
        },
      },
      {
        callout: {
          tone: "info",
          title: "Lo que todavía no existe",
          body: "No hay forma de que un transportista se postule a llevar un envío ni de que el emisor elija entre varias propuestas —esa parte del modelo (el matching P2P en sí) todavía es solo un schema en la base de datos, no un flujo usable. Tampoco existe el retiro del paquete, el seguimiento del viaje ni la confirmación de entrega. Lo de este sprint es la mitad \"publicar y coordinar\" del envío, no la mitad \"transportar\".",
        },
      },
      {
        heading: "Rutas: la parte que resultó más fácil de lo esperado",
        paragraphs: [
          "El precio sugerido que ve el emisor hoy es una implementación lineal provisoria, con un fallback si algo falla —no calcula todavía rutas óptimas de verdad. Pero antes de construir eso en serio necesitábamos saber si el problema real (calcular la mejor combinación de rutas para varios transportistas y envíos a la vez, lo que se conoce como VRPTW) se podía resolver en tiempos razonables. Es uno de los riesgos técnicos más altos del proyecto: si la librería no daba abasto, iba a haber que rediseñar buena parte del sistema de precios y matching.",
          "Le dedicamos dos días a probar OR-Tools, la librería de optimización de Google, contra volúmenes de datos representativos. Convergió en tiempos razonables. Es una buena noticia, aunque con una salvedad: falta validarlo con volumen real de producción, que es distinto a los datos de prueba que usamos.",
        ],
      },
      {
        bars: {
          title: "Tiempo que tardó cada investigación técnica",
          unit: "días",
          items: [
            { label: "Rutas óptimas (OR-Tools)", value: 2, suffix: " días" },
            {
              label: "Retención y reparto de pagos (MercadoPago)",
              value: 11,
              suffix: " días y sigue sin respuesta",
            },
          ],
        },
      },
      {
        heading: "El punto que todavía no cerramos: pagos",
        paragraphs: [
          "Parte del modelo de negocio de Movo depende de un mecanismo específico de MercadoPago: retener el dinero del emisor sin cobrarlo (un hold), y cuando se confirma la entrega, repartir automáticamente ese pago entre el transportista y la comisión de Movo en la misma operación (lo que MercadoPago llama split payment, vía application_fee).",
          "Probamos las dos piezas por separado en su entorno de pruebas y funcionan: el hold se puede crear sin cobrar (con capture:false) y se puede cancelar sin problema, y la cuenta del transportista se puede conectar a Movo por OAuth para operar pagos en su nombre. Lo que no funciona es combinarlas: pedir el hold con el reparto de comisión incluido devuelve un error genérico (\"usuarios inválidos\"), sin más detalle. Probamos nueve configuraciones distintas —otra cuenta de prueba, otra aplicación, otro desarrollador del equipo, el SDK oficial en vez de armar la request a mano— para descartar que fuera un problema nuestro. En todos los casos, mismo error.",
          "Abrimos un caso de soporte técnico con MercadoPago a mediados de agosto. Once días después, al cierre de este sprint, seguimos sin respuesta. No es un detalle menor: sin esto resuelto, Movo no tiene forma automática de cobrar su comisión, así que es el bloqueante más importante del proyecto en este momento, no un ítem más de la lista de pendientes.",
        ],
      },
      {
        heading: "Cuando algo no está listo, lo bloqueamos explícitamente",
        paragraphs: [
          "Este bloqueo de pagos ya tiene un impacto concreto en lo que construimos este sprint: cancelar un envío que ya tiene transportista asignado debería, en algunos casos, aplicar una penalización monetaria. Como todavía no hay un mecanismo de pagos real para cobrarla, no lo simulamos a medias. El sistema devuelve directamente un error explícito diciendo que esa combinación puntual no está soportada por ahora.",
          "Es la misma decisión que tomamos con el matching de transportistas: mejor una funcionalidad ausente y declarada así, que una a medio hacer que después genera comportamientos raros o deuda técnica escondida.",
        ],
      },
      {
        heading: "Dos bugs más, encontrados en el camino",
        paragraphs: [
          "Además del tema de pagos, aparecieron dos bugs durante el desarrollo del wizard de envío. Los dos quedaron cargados como bugs en nuestro tracker por primera vez de forma sistemática —hasta el sprint anterior los corregíamos sin dejar ese registro, así que la métrica de defectos que llevamos internamente no reflejaba la realidad. Ahora sí.",
        ],
      },
      {
        table: {
          headers: ["Dónde apareció", "Qué pasaba", "Cómo quedó"],
          rows: [
            [
              "Ubicación por GPS en el wizard",
              "La conversión de coordenadas a dirección legible (reverse geocoding) fallaba en algunos casos",
              "Corregido y con prueba automatizada dedicada",
            ],
            [
              "Creación de envío",
              "El sistema permitía cargar un envío con el mismo punto de retiro y de entrega",
              "Ahora se rechaza automáticamente al crear el envío",
            ],
          ],
        },
      },
      {
        heading: "Lo que aprendimos",
        paragraphs: [
          "Una investigación técnica puede validar la mayoría de lo que hacía falta y aun así dejar el punto más riesgoso sin resolver. Cuando pasa eso, conviene decirlo con esas palabras en vez de dar el tema por cerrado. Es la única forma de que el resto del equipo, y quien nos sigue desde afuera, tenga una foto real del estado del producto en vez de una versión optimista.",
          "Bloquear explícitamente, con un mensaje de error claro, una funcionalidad que depende de una pieza que no está lista es mejor que dejarla funcionando a medias. Se nota menos en lo inmediato —hay menos para mostrar en la demo— pero evita sorpresas después.",
        ],
      },
      {
        heading: "Qué sigue",
        paragraphs: [
          "Lo primero es destrabar el problema de pagos con MercadoPago, o encontrar un plan B si no hay forma de resolverlo del lado de ellos: es el bloqueante para que la comisión de Movo se cobre de forma automática, y sin eso no tiene mucho sentido avanzar en la persistencia y vinculación de métodos de pago del emisor y del transportista.",
          "Recién con eso resuelto vamos a poder construir la parte que realmente le falta al producto: que un transportista pueda ofertar para llevar un envío, y que ese envío se retire, viaje y se entregue de verdad. Todavía no hay fecha para eso.",
          "Gracias por seguir el progreso. Si querés enterarte apenas se resuelva el tema de pagos y de cuándo Movo esté disponible, seguinos en Instagram.",
        ],
      },
    ],
  },
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]
  return `${day} de ${months[month - 1]} de ${year}`
}
