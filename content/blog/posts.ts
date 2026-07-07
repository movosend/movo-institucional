export type PostSection = {
  heading?: string
  paragraphs: string[]
}

export type Post = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readMinutes: number
  sections: PostSection[]
}

export const posts: Post[] = [
  {
    slug: "logistica-colaborativa-p2p",
    title: "Qué es la logística colaborativa P2P (y por qué cambia todo en Argentina)",
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
          "P2P son las siglas de \"peer-to-peer\" o persona a persona. En el contexto de la logística, significa que el transporte de un paquete no lo hace una empresa con flota propia, sino una persona común que ya está haciendo ese viaje —en auto, colectivo, avión o tren— y tiene espacio disponible.",
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
    title: "Andreani, OCA y Correo Argentino vs envío P2P: ¿cuál conviene en 2025?",
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
        heading: "Los correos tradicionales: infraestructura consolidada, tarifas fijas",
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
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ]
  return `${day} de ${months[month - 1]} de ${year}`
}
