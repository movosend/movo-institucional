/**
 * Banco de preguntas de la trivia. Cada partida sortea del banco una pregunta por cada
 * lugar de `GAME_TEMPLATE` (config.ts), sin repetir. Para agregar una pregunta, sumala
 * a la lista con un `id` único y estable: las partidas guardan los ids en Supabase.
 *
 * - `mc`: cuatro opciones, `answer` es el índice de la correcta (0 = A).
 * - `tf`: una afirmación y si es verdadera.
 * - `price`: el precio justo. El precio es fijo por ruta (calculado con el motor de precios
 *   de Movo, ver abajo); `breakdown` es la línea "Cómo lo calcula Movo" de la revelación y es
 *   opcional.
 *   `from` y `to` tienen que estar en `localidades.ts` para dibujar la ruta en el mapa.
 *
 * `fact` es el "Dato Movo" que se muestra en la revelación (TV y celular).
 */

export interface ChoiceQuestion {
  id: string
  type: "mc"
  prompt: string
  options: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  fact: string
}

export interface TrueFalseQuestion {
  id: string
  type: "tf"
  prompt: string
  answer: boolean
  fact: string
}

export interface PriceQuestion {
  id: string
  type: "price"
  from: string
  to: string
  km: number
  parcel: string
  /** Precio real en pesos. */
  price: number
  breakdown?: string
  /** Rango del slider en el celular y en la recta de la revelación. */
  min: number
  max: number
}

export type Question = ChoiceQuestion | TrueFalseQuestion | PriceQuestion
export type QuestionType = Question["type"]

export const PRICE_PROMPT = "¿Cuánto sale mandarlo con Movo?"

export const QUESTIONS: Question[] = [
  // Multiple choice
  {
    id: "mc-que-es",
    type: "mc",
    prompt: "Movo conecta a quien quiere mandar un paquete con…",
    options: [
      "Una flota de motos propia",
      "Alguien que ya viaja a ese destino",
      "Una sucursal de correo",
      "Drones",
    ],
    answer: 1,
    fact: "El viaje ya iba a ocurrir. Movo aprovecha el espacio libre en el auto o la mochila.",
  },
  {
    id: "mc-que-mandar",
    type: "mc",
    prompt: "¿Cuál de estos envíos es ideal para Movo?",
    options: [
      "Una mudanza completa",
      "Una heladera",
      "Una llave de repuesto a otra ciudad",
      "Un auto",
    ],
    answer: 2,
    fact: "Movo está pensado para objetos chicos: documentos, llaves, cargadores, regalos.",
  },
  {
    id: "mc-kyc",
    type: "mc",
    prompt: "¿Qué te pide Movo para verificar tu identidad?",
    options: [
      "Solo tu mail",
      "DNI y una selfie",
      "Un recibo de sueldo",
      "Nada, es anónimo",
    ],
    answer: 1,
    fact: "Un sistema de detección de vida confirma que hay una persona real y no una foto.",
  },
  {
    id: "mc-handshake",
    type: "mc",
    prompt: "¿Cómo se confirma que un paquete cambió de manos?",
    options: [
      "Con un botón de confirmar",
      "Con una foto del paquete",
      "Con un QR firmado y el GPS de los dos celulares",
      "Llamando por teléfono",
    ],
    answer: 2,
    fact: "El Cryptographic Handshake exige que los dos teléfonos estén juntos en ese momento.",
  },
  {
    id: "mc-cobro",
    type: "mc",
    prompt: "¿Cuándo se le cobra el envío a quien lo manda?",
    options: [
      "Al publicarlo",
      "Cuando se entrega",
      "Cuando lo retiran",
      "A fin de mes",
    ],
    answer: 1,
    fact: "El monto queda reservado en la tarjeta y se cobra recién al confirmar la entrega.",
  },
  {
    id: "mc-comision",
    type: "mc",
    prompt: "¿De qué vive Movo?",
    options: [
      "De publicidad",
      "De una suscripción mensual",
      "De vender datos",
      "De una comisión por envío entregado",
    ],
    answer: 3,
    fact: "Movo gana solo cuando el envío llega. Así los incentivos quedan alineados.",
  },
  {
    id: "mc-ruta",
    type: "mc",
    prompt: "Si declarás un viaje, ¿qué hace el algoritmo de Movo?",
    options: [
      "Te cambia el destino",
      "Te suma paquetes con el menor desvío posible",
      "Te asigna un camión",
      "Te cobra el combustible",
    ],
    answer: 1,
    fact: "Un viaje de Córdoba a Luque puede sumar una parada en Villa del Rosario con solo 6 km de desvío.",
  },
  {
    id: "mc-calificaciones",
    type: "mc",
    prompt: "Después de cada entrega, ¿quiénes se califican?",
    options: [
      "Nadie",
      "Solo quien manda",
      "Quien manda, quien lleva y quien recibe",
      "Solo Movo",
    ],
    answer: 2,
    fact: "Las calificaciones arman una reputación pública hecha con envíos reales.",
  },
  {
    id: "mc-receptor",
    type: "mc",
    prompt: "¿Qué tiene que pasar antes de que un envío se publique?",
    options: [
      "Que lo apruebe un operador",
      "Que el receptor acepte recibirlo",
      "Que pagues por adelantado",
      "Nada, se publica al toque",
    ],
    answer: 1,
    fact: "Así nadie recibe un paquete que no pidió.",
  },
  {
    id: "mc-precio",
    type: "mc",
    prompt: "¿Qué NO usa el motor de precios para sugerir un valor?",
    options: ["La distancia", "El peso", "La urgencia", "El color del paquete"],
    answer: 3,
    fact: "Distancia, peso, urgencia y categoría. Después los transportistas pueden contraofertar.",
  },
  // Verdadero o falso
  {
    id: "tf-emisiones",
    type: "tf",
    prompt:
      "Si un viajero ya iba a Río Cuarto, llevar tu paquete prácticamente no agrega emisiones.",
    answer: true,
    fact: "El auto iba a hacer ese viaje igual. Un paquete más casi no cambia lo que consume.",
  },
  {
    id: "tf-dni",
    type: "tf",
    prompt: "Movo guarda las fotos de tu DNI en sus servidores.",
    answer: false,
    fact: "Las procesa un proveedor especializado. Movo solo recibe si la verificación salió bien.",
  },
  {
    id: "tf-efectivo",
    type: "tf",
    prompt: "Con Movo se puede pagar un envío en efectivo.",
    answer: true,
    fact: "El receptor le paga en mano al transportista al momento de la entrega.",
  },
  {
    id: "tf-blockchain",
    type: "tf",
    prompt: "Movo usa blockchain para confirmar las entregas.",
    answer: false,
    fact: "Alcanza con firmas digitales y un registro con hash criptográfico. Más simple e igual de seguro.",
  },
  {
    id: "tf-cancelar",
    type: "tf",
    prompt:
      "Podés cancelar un envío sin penalidad antes de que se asigne un transportista.",
    answer: true,
    fact: "La penalidad aparece recién cuando alguien ya se comprometió a llevarlo.",
  },
  {
    id: "tf-repartidores",
    type: "tf",
    prompt: "Movo tiene repartidores propios en cada ciudad.",
    answer: false,
    fact: "La red la forman los mismos usuarios que ya viajan.",
  },
  {
    id: "tf-licencia",
    type: "tf",
    prompt:
      "Para llevar paquetes con Movo hay que verificar la licencia de conducir.",
    answer: true,
    fact: "Además de la identidad, quien transporta verifica su licencia y carga una tarjeta.",
  },
  {
    id: "tf-qr",
    type: "tf",
    prompt: "El QR de la entrega dura solo unos segundos en pantalla.",
    answer: true,
    fact: "Un código de vida corta evita que alguien lo reutilice más tarde.",
  },
  // El precio justo. Precios del motor de Movo (demand_fuel_routes_v1, mismo código y
  // coeficientes que movo-svc-pricing-logistics) calculados el 3/10/2026: nafta súper a
  // $2.227/l (mediana nacional de Energía), distancia por ruta (OSRM) y sin recargo por
  // demanda. El slider tiene un rango distinto en cada ruta para que el precio no quede
  // siempre en el mismo lugar.
  {
    id: "price-cordoba-villa-carlos-paz-letter",
    type: "price",
    from: "Córdoba",
    to: "Villa Carlos Paz",
    km: 37,
    parcel: "Sobre · documentos",
    price: 7190,
    breakdown: "$1.503 base + 37 km × $151 + 0,5 kg × $301",
    min: 4500,
    max: 17500,
  },
  {
    id: "price-cordoba-villa-carlos-paz-small",
    type: "price",
    from: "Córdoba",
    to: "Villa Carlos Paz",
    km: 37,
    parcel: "Caja chica · 2 kg",
    price: 7640,
    breakdown: "$1.503 base + 37 km × $151 + 2 kg × $301",
    min: 500,
    max: 12000,
  },
  {
    id: "price-cordoba-jesus-maria-small",
    type: "price",
    from: "Córdoba",
    to: "Jesús María",
    km: 56,
    parcel: "Caja chica · 2 kg",
    price: 10640,
    breakdown: "$1.503 base + 56 km × $151 + 2 kg × $301",
    min: 4000,
    max: 21000,
  },
  {
    id: "price-cordoba-alta-gracia-fragile",
    type: "price",
    from: "Córdoba",
    to: "Alta Gracia",
    km: 38,
    parcel: "Frágil · 3 kg",
    price: 9780,
    breakdown: "($1.503 base + 38 km × $151 + 3 kg × $301) × 1,2 por frágil",
    min: 500,
    max: 13500,
  },
  {
    id: "price-cordoba-rio-ceballos-letter",
    type: "price",
    from: "Córdoba",
    to: "Río Ceballos",
    km: 35,
    parcel: "Sobre · documentos",
    price: 6910,
    breakdown: "$1.503 base + 35 km × $151 + 0,5 kg × $301",
    min: 500,
    max: 14000,
  },
  {
    id: "price-cordoba-villa-maria-small",
    type: "price",
    from: "Córdoba",
    to: "Villa María",
    km: 150,
    parcel: "Caja chica · 2 kg",
    price: 24800,
    breakdown: "$1.503 base + 150 km × $151 + 2 kg × $301",
    min: 12000,
    max: 57000,
  },
  {
    id: "price-cordoba-villa-maria-medium",
    type: "price",
    from: "Córdoba",
    to: "Villa María",
    km: 150,
    parcel: "Caja mediana · 8 kg",
    price: 26610,
    breakdown: "$1.503 base + 150 km × $151 + 8 kg × $301",
    min: 1000,
    max: 40000,
  },
  {
    id: "price-cordoba-rio-cuarto-letter",
    type: "price",
    from: "Córdoba",
    to: "Río Cuarto",
    km: 213,
    parcel: "Sobre · documentos",
    price: 33850,
    breakdown: "$1.503 base + 213 km × $151 + 0,5 kg × $301",
    min: 5000,
    max: 59000,
  },
  {
    id: "price-cordoba-rio-tercero-small",
    type: "price",
    from: "Córdoba",
    to: "Río Tercero",
    km: 108,
    parcel: "Caja chica · 2 kg",
    price: 18410,
    breakdown: "$1.503 base + 108 km × $151 + 2 kg × $301",
    min: 4000,
    max: 48000,
  },
  {
    id: "price-cordoba-san-francisco-fragile",
    type: "price",
    from: "Córdoba",
    to: "San Francisco",
    km: 217,
    parcel: "Frágil · 3 kg",
    price: 42370,
    breakdown: "($1.503 base + 217 km × $151 + 3 kg × $301) × 1,2 por frágil",
    min: 2500,
    max: 55000,
  },
  {
    id: "price-cordoba-cosquin-small",
    type: "price",
    from: "Córdoba",
    to: "Cosquín",
    km: 52,
    parcel: "Caja chica · 2 kg",
    price: 9980,
    breakdown: "$1.503 base + 52 km × $151 + 2 kg × $301",
    min: 2500,
    max: 20500,
  },
  {
    id: "price-cordoba-villa-general-belgrano-medium",
    type: "price",
    from: "Córdoba",
    to: "Villa General Belgrano",
    km: 87,
    parcel: "Caja mediana · 8 kg",
    price: 17130,
    breakdown: "$1.503 base + 87 km × $151 + 8 kg × $301",
    min: 1000,
    max: 29000,
  },
  {
    id: "price-cordoba-mina-clavero-small",
    type: "price",
    from: "Córdoba",
    to: "Mina Clavero",
    km: 142,
    parcel: "Caja chica · 2 kg",
    price: 23650,
    breakdown: "$1.503 base + 142 km × $151 + 2 kg × $301",
    min: 14000,
    max: 52000,
  },
  {
    id: "price-cordoba-rosario-small",
    type: "price",
    from: "Córdoba",
    to: "Rosario",
    km: 405,
    parcel: "Caja chica · 2 kg",
    price: 63410,
    breakdown: "$1.503 base + 405 km × $151 + 2 kg × $301",
    min: 2500,
    max: 90000,
  },
  {
    id: "price-cordoba-rosario-medium",
    type: "price",
    from: "Córdoba",
    to: "Rosario",
    km: 405,
    parcel: "Caja mediana · 8 kg",
    price: 65210,
    breakdown: "$1.503 base + 405 km × $151 + 8 kg × $301",
    min: 17500,
    max: 147500,
  },
  {
    id: "price-cordoba-buenos-aires-letter",
    type: "price",
    from: "Córdoba",
    to: "Buenos Aires",
    km: 696,
    parcel: "Sobre · documentos",
    price: 107020,
    breakdown: "$1.503 base + 696 km × $151 + 0,5 kg × $301",
    min: 65000,
    max: 257500,
  },
  {
    id: "price-cordoba-buenos-aires-fragile",
    type: "price",
    from: "Córdoba",
    to: "Buenos Aires",
    km: 696,
    parcel: "Frágil · 3 kg",
    price: 129320,
    breakdown: "($1.503 base + 696 km × $151 + 3 kg × $301) × 1,2 por frágil",
    min: 2500,
    max: 210000,
  },
  {
    id: "price-cordoba-mendoza-small",
    type: "price",
    from: "Córdoba",
    to: "Mendoza",
    km: 687,
    parcel: "Caja chica · 2 kg",
    price: 106120,
    breakdown: "$1.503 base + 687 km × $151 + 2 kg × $301",
    min: 42500,
    max: 212500,
  },
  {
    id: "price-cordoba-san-miguel-de-tucuman-small",
    type: "price",
    from: "Córdoba",
    to: "San Miguel de Tucumán",
    km: 562,
    parcel: "Caja chica · 2 kg",
    price: 87200,
    breakdown: "$1.503 base + 562 km × $151 + 2 kg × $301",
    min: 2500,
    max: 120000,
  },
  {
    id: "price-cordoba-santa-fe-letter",
    type: "price",
    from: "Córdoba",
    to: "Santa Fe",
    km: 364,
    parcel: "Sobre · documentos",
    price: 56790,
    breakdown: "$1.503 base + 364 km × $151 + 0,5 kg × $301",
    min: 5000,
    max: 117500,
  },
  {
    id: "price-cordoba-san-luis-medium",
    type: "price",
    from: "Córdoba",
    to: "San Luis",
    km: 428,
    parcel: "Caja mediana · 8 kg",
    price: 68700,
    breakdown: "$1.503 base + 428 km × $151 + 8 kg × $301",
    min: 35000,
    max: 157500,
  },
  {
    id: "price-cordoba-santiago-del-estero-small",
    type: "price",
    from: "Córdoba",
    to: "Santiago del Estero",
    km: 435,
    parcel: "Caja chica · 2 kg",
    price: 67940,
    breakdown: "$1.503 base + 435 km × $151 + 2 kg × $301",
    min: 2500,
    max: 102500,
  },
  {
    id: "price-rio-cuarto-villa-maria-letter",
    type: "price",
    from: "Río Cuarto",
    to: "Villa María",
    km: 136,
    parcel: "Sobre · documentos",
    price: 22250,
    breakdown: "$1.503 base + 136 km × $151 + 0,5 kg × $301",
    min: 3000,
    max: 39000,
  },
  {
    id: "price-villa-maria-bell-ville-small",
    type: "price",
    from: "Villa María",
    to: "Bell Ville",
    km: 63,
    parcel: "Caja chica · 2 kg",
    price: 11660,
    breakdown: "$1.503 base + 63 km × $151 + 2 kg × $301",
    min: 2500,
    max: 30500,
  },
  {
    id: "price-rosario-santa-fe-small",
    type: "price",
    from: "Rosario",
    to: "Santa Fe",
    km: 172,
    parcel: "Caja chica · 2 kg",
    price: 28090,
    breakdown: "$1.503 base + 172 km × $151 + 2 kg × $301",
    min: 1000,
    max: 37000,
  },
  {
    id: "price-buenos-aires-la-plata-letter",
    type: "price",
    from: "Buenos Aires",
    to: "La Plata",
    km: 58,
    parcel: "Sobre · documentos",
    price: 10410,
    breakdown: "$1.503 base + 58 km × $151 + 0,5 kg × $301",
    min: 2500,
    max: 21000,
  },
  {
    id: "price-buenos-aires-mar-del-plata-medium",
    type: "price",
    from: "Buenos Aires",
    to: "Mar del Plata",
    km: 414,
    parcel: "Caja mediana · 8 kg",
    price: 66540,
    breakdown: "$1.503 base + 414 km × $151 + 8 kg × $301",
    min: 2500,
    max: 112500,
  },
  {
    id: "price-mendoza-san-juan-small",
    type: "price",
    from: "Mendoza",
    to: "San Juan",
    km: 169,
    parcel: "Caja chica · 2 kg",
    price: 27650,
    breakdown: "$1.503 base + 169 km × $151 + 2 kg × $301",
    min: 17000,
    max: 61000,
  },
  {
    id: "price-san-miguel-de-tucuman-salta-fragile",
    type: "price",
    from: "San Miguel de Tucumán",
    to: "Salta",
    km: 304,
    parcel: "Frágil · 3 kg",
    price: 58060,
    breakdown: "($1.503 base + 304 km × $151 + 3 kg × $301) × 1,2 por frágil",
    min: 2500,
    max: 82500,
  },
  {
    id: "price-neuquen-bariloche-small",
    type: "price",
    from: "Neuquén",
    to: "Bariloche",
    km: 439,
    parcel: "Caja chica · 2 kg",
    price: 68520,
    breakdown: "$1.503 base + 439 km × $151 + 2 kg × $301",
    min: 20000,
    max: 157500,
  },
]

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]))
