/**
 * Preguntas frecuentes de Movo. Fuente: "movo - FAQ" v1.0 (2026).
 * La landing muestra FEATURED_FAQ; /faq muestra todas las secciones y el glosario.
 */

export type FaqItem = { id: string; q: string; a: string }

export type FaqSection = {
  id: string
  /** Nombre corto para el índice. */
  label: string
  eyebrow: string
  title: string
  items: FaqItem[]
}

export type GlossaryTerm = {
  id: string
  term: string
  def: string
  /** Formas en que aparece en las respuestas, para enlazarlo al glosario. */
  aliases: string[]
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "proyecto",
    label: "Proyecto",
    eyebrow: "El proyecto",
    title: "Qué es Movo y qué problema resuelve",
    items: [
      {
        id: "que-es-movo",
        q: "¿Qué es Movo?",
        a: "Una plataforma P2P (persona a persona) de logística: conecta a alguien que necesita mandar un paquete con alguien que ya va para ese lado y tiene lugar para llevarlo. No es una empresa de delivery con repartidores propios: la red la forman los mismos usuarios.",
      },
      {
        id: "que-problema-resuelve",
        q: "¿Cuál es el problema que están resolviendo?",
        a: "Cinco cosas a la vez: la logística formal (Correo Argentino, Andreani, OCA) no llega bien a localidades chicas; cuando llega, muchas veces sale más que el objeto que se manda; las soluciones informales que ya existen (grupos de WhatsApp, Facebook) no tienen forma de generar confianza real; no hay ningún mecanismo de pago seguro en esos acuerdos informales; y, mientras tanto, hay una enorme capacidad de transporte ya circulando en autos y camionetas que hacen viajes cotidianos, y que nadie está aprovechando.",
      },
      {
        id: "diferencia-rappi-correo",
        q: "¿En qué se diferencia de Rappi, PedidosYa o el Correo Argentino?",
        a: "Rappi y PedidosYa resuelven delivery urbano de distancias cortas con couriers que dependen de la app; no verifican identidad de forma fuerte ni usan viajes que la gente ya iba a hacer. El correo formal es centralizado, caro y no llega bien al interior. Movo apunta a algo distinto: viajes más largos, entre ciudades o pueblos, usando gente que de todas formas iba para allá, con un nivel de verificación de identidad más parecido al de un banco que al de una app de delivery.",
      },
      {
        id: "que-envios",
        q: "¿Para qué tipo de envíos sirve?",
        a: "Para objetos chicos: cartas y documentos, encomiendas estándar, ítems cotidianos (llaves, cargadores, auriculares), objetos frágiles con manejo especial y envíos urgentes. Pensá en algo como mandar una llave de repuesto a otra ciudad, un documento urgente o un regalo, no en mudanzas.",
      },
      {
        id: "se-puede-usar-ya",
        q: "¿Se puede descargar y usar Movo ya?",
        a: "Todavía no está publicada al público en general: es un Proyecto Final de Carrera pensado para mostrarse funcionando de punta a punta, desde el registro hasta la entrega, en un entorno de prueba.",
      },
    ],
  },
  {
    id: "identidad",
    label: "Identidad",
    eyebrow: "Identidad y confianza",
    title: "Cómo sabe Movo que sos quien decís ser",
    items: [
      {
        id: "verificacion-identidad",
        q: "¿Cómo funciona la verificación de identidad (KYC)?",
        a: "Se hace con Didit.me, un proveedor externo especializado: pedís tu DNI (frente y dorso) y una selfie, y un sistema de detección de vida confirma que hay una persona real del otro lado y no una foto o un video. Movo no procesa esos datos sensibles directamente: recibe de Didit.me solamente el resultado (aprobado, rechazado o en revisión).",
      },
      {
        id: "fotos-dni",
        q: "¿Movo guarda las fotos de mi DNI?",
        a: "No. Las imágenes del documento y los datos biométricos los procesa Didit.me; Movo nunca los almacena en sus propios servidores. Eso reduce la superficie de ataque en caso de un incidente de seguridad y evita cargar con las obligaciones regulatorias de guardar datos tan sensibles.",
      },
      {
        id: "quien-puede-transportar",
        q: "¿Cualquiera puede transportar paquetes?",
        a: "Hace falta más que el registro básico: además del KYC, un transportista tiene que verificar su licencia de conducir y tener cargada una tarjeta de crédito o débito, con la que se le cobra la comisión de Movo incluso si elige cobrar sus envíos en efectivo.",
      },
      {
        id: "reputacion",
        q: "¿Cómo se construye la reputación de un usuario?",
        a: "Después de cada entrega, emisor, transportista y receptor se califican mutuamente de 1 a 5 estrellas con un comentario libre. Esas calificaciones arman un score público y ponderado que se ve en el perfil de cualquier usuario, junto con la cantidad de envíos que hizo, recibió o transportó.",
      },
      {
        id: "por-que-confiar",
        q: "¿Por qué debería confiar en alguien que no conozco?",
        a: "Porque la confianza en Movo no depende de la buena onda de un desconocido: se construye en cuatro capas. Todos verificaron su identidad (KYC). Cada entrega queda confirmada con un protocolo criptográfico verificable, no con la palabra de nadie. La reputación es pública y se arma con transacciones reales, no con referencias de boca en boca. Y el dinero del emisor está reservado, no gastado, hasta que la entrega se confirma.",
      },
    ],
  },
  {
    id: "enviar",
    label: "Enviar",
    eyebrow: "Pestaña Enviar",
    title: "Cómo se arma y se publica un envío",
    items: [
      {
        id: "como-mandar",
        q: "¿Cómo hago para mandar algo?",
        a: "Elegís al receptor (tiene que estar registrado en Movo), describís el paquete y su categoría, decís cuándo se puede retirar y cargás las direcciones de retiro y entrega. El sistema calcula al toque un precio sugerido según esos datos.",
      },
      {
        id: "aceptacion-receptor",
        q: "¿Por qué el receptor tiene que aceptar antes de que se publique?",
        a: "Para que nadie reciba un paquete que no pidió y para cuidar su privacidad: recién cuando el receptor confirma que está de acuerdo, el envío pasa al tablero donde los transportistas pueden ofertar.",
      },
      {
        id: "precio-final",
        q: "¿Cómo se elige el precio final?",
        a: "El motor de precios calcula un valor sugerido a partir de la distancia, el peso, la urgencia declarada y la categoría del paquete. A partir de ahí, los transportistas pueden aceptar ese precio o mandar una contraoferta, y el emisor elige comparando precio, reputación, vehículo y tiempo estimado de cada oferta recibida.",
      },
      {
        id: "cancelar-envio",
        q: "¿Qué pasa si me arrepiento de un envío?",
        a: "Antes de que se asigne un transportista, se puede cancelar sin ninguna penalización. Una vez que hay uno confirmado, la cancelación contempla algún tipo de penalidad, pensada para cubrir el tiempo que el transportista ya destinó al envío.",
      },
    ],
  },
  {
    id: "transportar",
    label: "Transportar",
    eyebrow: "Pestaña Transportar",
    title: "Cómo encuentra un transportista sus paquetes",
    items: [
      {
        id: "como-elegir-que-llevar",
        q: "¿Cómo elige un transportista qué llevar?",
        a: "De dos formas, que se pueden combinar: mirando el tablero de paquetes disponibles en su ciudad o región, o “declarando un viaje” (origen, destino, fecha y hora de salida) para que el sistema le sugiera automáticamente los paquetes que le convienen sumar en el camino.",
      },
      {
        id: "como-sugiere-paquetes",
        q: "¿Cómo decide el sistema qué paquetes sugerirle?",
        a: "Con un algoritmo de optimización de rutas: una variante del clásico problema del viajante con ventanas de tiempo (conocido como VRPTW), resuelta con la librería OR-Tools. El sistema calcula qué paradas de retiro y entrega conviene sumar al viaje declarado minimizando el desvío total respecto de la ruta original. Por ejemplo: un viaje de Córdoba Capital a Luque puede sumar una parada en Villa del Rosario con solo 6 km de desvío, y otra en Jesús María con 12 km más.",
      },
      {
        id: "que-gana-transportista",
        q: "¿Qué gana un transportista con esto?",
        a: "Un ingreso extra por un viaje que de todas formas iba a hacer, sin gastar de más en combustible porque el algoritmo minimiza el desvío. Además, cobra automáticamente apenas se confirma la entrega, y cada envío bien hecho suma a su reputación pública.",
      },
    ],
  },
  {
    id: "handshake",
    label: "Handshake",
    eyebrow: "El diferencial técnico",
    title: "El Cryptographic Handshake",
    items: [
      {
        id: "que-es-handshake",
        q: "¿Qué es exactamente el “Cryptographic Handshake” del que tanto se habla?",
        a: "Es el protocolo que confirma, de forma verificable e inalterable, que un paquete cambió de manos entre dos personas físicamente presentes en el mismo lugar y momento. Se usa dos veces en cada envío: al retirar (emisor → transportista) y al entregar (transportista → receptor).",
      },
      {
        id: "handshake-en-la-practica",
        q: "¿Cómo funciona en la práctica?",
        a: "Quien entrega la custodia genera un código único (un “nonce”) y lo firma con la clave privada de su cuenta; ese código se muestra como un QR que solo dura unos segundos en pantalla. Quien recibe lo escanea, y el sistema valida dos cosas al mismo tiempo: que la firma digital sea auténtica (usando la clave pública de quien entregó) y que el GPS de ambos celulares esté a pocos metros de distancia. Si las dos verificaciones pasan, queda un registro inmutable con hora, coordenadas y las firmas de ambas partes.",
      },
      {
        id: "por-que-no-un-boton",
        q: "¿Por qué no alcanza con un botón de “confirmar entrega”?",
        a: "Porque un botón se puede tocar sin que la entrega haya pasado realmente. El handshake obliga a que las dos personas, y los dos teléfonos, estén físicamente juntos en ese momento, y a que la firma solo la pueda generar quien tiene la clave privada de esa cuenta específica. Así se cierra la discusión de “nunca me llegó” o “nunca lo entregué” con una prueba verificable, no con la palabra de alguien.",
      },
      {
        id: "blockchain",
        q: "¿Usan blockchain para esto?",
        a: "No hace falta. El resultado que se busca es un registro que no se pueda alterar sin que quede evidencia, y eso se logra con firmas de clave pública/privada sobre una base de datos centralizada con hash criptográfico. Sumar una blockchain pública agregaría costo y complejidad sin sumar seguridad real a esta escala, así que quedó fuera de alcance a propósito.",
      },
      {
        id: "gps-falla",
        q: "¿Y si el GPS falla o da una ubicación imprecisa?",
        a: "El radio de proximidad que exige el sistema es configurable (pensado alrededor de 50 a 100 metros) y el QR además funciona como una segunda barrera con vida corta. A futuro, en dispositivos compatibles, el mismo protocolo se puede resolver acercando los teléfonos por NFC en lugar de escanear un código.",
      },
    ],
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    eyebrow: "Seguimiento y avisos",
    title: "Saber qué está pasando con el envío",
    items: [
      {
        id: "donde-esta-mi-paquete",
        q: "¿Puedo ver dónde está mi paquete en el momento?",
        a: "Esa es la idea: un mapa en vivo con la ubicación del transportista, visible para emisor y receptor, con hora estimada de retiro y de entrega.",
      },
      {
        id: "notificaciones",
        q: "¿Cómo me entero de que algo pasó con mi envío?",
        a: "Con notificaciones push automáticas en cada evento clave: cuando el paquete se retira, cuando está en camino y cuando se entrega.",
      },
      {
        id: "chat",
        q: "¿Se va a poder chatear con la otra parte dentro de la app?",
        a: "Esa es la idea, para coordinar los detalles del envío sin tener que salir a WhatsApp.",
      },
    ],
  },
  {
    id: "dinero",
    label: "Dinero",
    eyebrow: "El dinero",
    title: "Cómo se paga y se cobra un envío",
    items: [
      {
        id: "cuando-se-cobra",
        q: "¿Cuándo se cobra el envío?",
        a: "Nunca antes de que se entregue. El diseño contempla que, apenas el emisor confirma un transportista, se reserve el monto en su tarjeta (un “hold” vía Mercado Pago) sin debitarlo todavía. Recién cuando se completa el Cryptographic Handshake de la entrega se libera esa reserva y se reparte automáticamente: una comisión para Movo y el resto para el transportista.",
      },
      {
        id: "cancelar-antes-del-retiro",
        q: "¿Y si cancelo antes de que retiren el paquete?",
        a: "Se libera la reserva de fondos del emisor sin ningún cargo.",
      },
      {
        id: "pago-efectivo",
        q: "¿Se puede pagar en efectivo?",
        a: "Sí, está pensado: el receptor le paga en mano al transportista al momento de la entrega. Para poder ofrecer esa modalidad, el transportista igual tiene que tener una tarjeta precargada, de la que Movo cobra automáticamente su comisión apenas se confirma la entrega.",
      },
      {
        id: "de-que-vive-movo",
        q: "¿De qué vive Movo?",
        a: "De una comisión sobre cada envío completado con éxito, pensada en el orden del 15%. No hay suscripción fija ni publicidad: la idea es que Movo solo gane cuando el usuario efectivamente manda algo, así los incentivos quedan alineados.",
      },
    ],
  },
  {
    id: "privacidad",
    label: "Privacidad",
    eyebrow: "Privacidad",
    title: "Qué pasa con los datos de cada usuario",
    items: [
      {
        id: "normativa-datos",
        q: "¿Cumplen alguna normativa de protección de datos?",
        a: "Sí, se trabajó en línea con la Ley 25.326 de Argentina: hay términos y condiciones, política de privacidad, y un derecho de baja de cuenta que incluye la supresión de datos personales.",
      },
      {
        id: "retencion-datos",
        q: "¿Por cuánto tiempo se guardan mis datos?",
        a: "Con plazos de retención definidos según el tipo de dato: los resultados de verificación de identidad (KYC) se conservan 2 años, y el historial de envíos, 5 años. Pasado ese plazo está previsto un proceso automático de limpieza o anonimización.",
      },
    ],
  },
  {
    id: "equipo",
    label: "Equipo",
    eyebrow: "Sobre el proyecto",
    title: "Quiénes lo hacen y cómo",
    items: [
      {
        id: "quienes-integran-el-equipo",
        q: "¿Quiénes integran el equipo?",
        a: "Cinco personas: Tomás Vergara, Alena Ariza, Pedro Yorlano, Lucas Dalmagro y Juan Cruz Bordino Blanche. El proyecto está supervisado por la Ing. Cecilia Trettel y el Ing. Sergio Quinteros.",
      },
      {
        id: "como-trabajan",
        q: "¿Cómo trabajan?",
        a: "Con Scrum, en sprints de dos semanas: planning, refinamiento semanal, daily standups, sprint review con el equipo docente y retrospectiva. El backlog se gestiona en Linear, el código vive en un monorepo de GitHub con CI/CD, y la documentación no técnica en Google Drive.",
      },
      {
        id: "que-sigue",
        q: "¿Qué sigue de acá en adelante?",
        a: "El plan a mediano plazo apunta a una experiencia con pagos digitales integrados de punta a punta, seguimiento en vivo del envío y comunicación entre las partes dentro de la misma app, evaluando más adelante una eventual expansión regional más allá de Argentina.",
      },
    ],
  },
  {
    id: "tecnologia",
    label: "Tecnología",
    eyebrow: "Para los curiosos técnicos",
    title: "Cómo está construido por dentro",
    items: [
      {
        id: "con-que-tecnologia",
        q: "¿Con qué tecnología está hecho Movo?",
        a: "Una arquitectura de microservicios: identidad (movo-svc-users), administración, envíos, pagos y un servicio aparte de precios y logística. La mayoría está en Node.js con Fastify y TypeScript; el servicio de precios y logística está en Python con FastAPI porque se apoya en librerías de optimización combinatoria. La app es React Native con Expo, y el panel web es Next.js. Cada servicio tiene su propio schema en PostgreSQL, con Redis para caché y sesiones.",
      },
      {
        id: "por-que-microservicios",
        q: "¿Por qué microservicios en un proyecto de facultad?",
        a: "Para separar identidad, envíos, pagos y logística en dominios independientes, cada uno con su propia base de datos y sin llaves foráneas cruzadas entre servicios. Así, un cambio en Pagos no puede romper Envíos por accidente. Cada decisión de arquitectura importante quedó documentada en un ADR propio, buscando que sea defendible ante el tribunal sin sobre-diseñar para un equipo de cinco personas.",
      },
    ],
  },
]

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "kyc",
    term: "KYC (Know Your Customer)",
    def: "Verificación de identidad de un usuario mediante documento y, en este caso, biometría.",
    aliases: ["KYC"],
  },
  {
    id: "cryptographic-handshake",
    term: "Cryptographic Handshake",
    def: "Protocolo que confirma que dos personas estuvieron físicamente presentes en el mismo lugar y momento para transferir un paquete.",
    aliases: ["Cryptographic Handshake"],
  },
  {
    id: "hold",
    term: "Hold / Auth & Capture",
    def: "Reserva de fondos en una tarjeta: se autoriza el monto pero no se debita hasta la captura explícita.",
    aliases: ["hold"],
  },
  {
    id: "split-payment",
    term: "Split Payment",
    def: "Reparto automático de un pago entre varios destinatarios. En Movo, comisión para Movo y el resto para el transportista.",
    aliases: ["split payment"],
  },
  {
    id: "nonce",
    term: "Nonce",
    def: "Código de un solo uso, generado al azar, que evita que alguien reutilice una firma o una transacción ya hecha.",
    aliases: ["nonce"],
  },
  {
    id: "geofencing",
    term: "Geofencing",
    def: "Chequeo de que un dispositivo esté dentro de un radio determinado alrededor de un punto de referencia.",
    aliases: ["radio de proximidad"],
  },
  {
    id: "vrptw",
    term: "VRPTW",
    def: "Vehicle Routing Problem with Time Windows: problema de optimización que busca la mejor ruta respetando ventanas horarias.",
    aliases: ["VRPTW"],
  },
  {
    id: "p2p",
    term: "P2P (Peer-to-Peer)",
    def: "Los participantes interactúan directamente entre sí, sin un intermediario central que preste el servicio.",
    aliases: ["P2P"],
  },
  {
    id: "liveness-detection",
    term: "Liveness detection",
    def: "Técnica biométrica que confirma que hay una persona real frente a la cámara, no una foto o un video.",
    aliases: ["detección de vida"],
  },
  {
    id: "tfg",
    term: "TFG",
    def: "Trabajo Final de Grado: proyecto integrador para obtener el título de Ingeniería.",
    aliases: ["Proyecto Final de Carrera"],
  },
]

const FEATURED_IDS = [
  "que-es-movo",
  "que-envios",
  "por-que-confiar",
  "que-es-handshake",
  "cuando-se-cobra",
  "se-puede-usar-ya",
]

const ALL_ITEMS = FAQ_SECTIONS.flatMap((s) => s.items)

export const FEATURED_FAQ: FaqItem[] = FEATURED_IDS.map(
  (id) => ALL_ITEMS.find((item) => item.id === id)!
)
