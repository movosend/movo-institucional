/**
 * Configuración de la trivia de la feria (/trivia en el celular, /juegos/trivia en la TV).
 * Las preguntas están en `questions.ts`; acá van tiempos, puntajes y textos.
 */

/** Duraciones de cada fase, en segundos. El stand las puede cambiar (aplican a la próxima partida). */
export interface Timeline {
  lobby: number
  /** Pregunta de multiple choice. */
  mc: number
  /** Verdadero o falso. */
  tf: number
  /** El precio justo. */
  price: number
  /** Revelación de mc y tf. */
  reveal: number
  /** Revelación del precio justo. */
  priceReveal: number
  /** Top 5 parcial. */
  top5: number
  podium: number
}

export const DEFAULT_TIMELINE: Timeline = {
  lobby: 45,
  mc: 15,
  tf: 10,
  price: 20,
  reveal: 6,
  priceReveal: 8,
  top5: 5,
  podium: 15,
}

/**
 * El lobby espera a la gente: la cuenta (`lobby`) arranca con el primer jugador, y si
 * alguien entra con menos de LOBBY_EXTEND_S por delante, vuelve a LOBBY_EXTEND_S, hasta
 * LOBBY_EXTEND_MAX_S de más en total (supabase/migrations, `trivia_join`).
 */
export const LOBBY_EXTEND_S = 15
export const LOBBY_EXTEND_MAX_S = 30

/**
 * La trivia solo está abierta con la pantalla del stand encendida: la TV avisa cada
 * SCREEN_PING_S y, si pasan SCREEN_TIMEOUT_S sin aviso, se cierra
 * (supabase/migrations, `trivia_screen_live`; los dos valores tienen que coincidir).
 */
export const SCREEN_PING_S = 8
export const SCREEN_TIMEOUT_S = 25

/** Límites que acepta el modo stand para cada duración. */
export const TIMELINE_LIMITS: Record<keyof Timeline, [number, number]> = {
  lobby: [10, 180],
  mc: [5, 60],
  tf: [5, 60],
  price: [8, 60],
  reveal: [3, 30],
  priceReveal: [4, 30],
  top5: [3, 30],
  podium: [8, 60],
}

export const TIMELINE_LABELS: Record<keyof Timeline, string> = {
  lobby: "Lobby",
  mc: "Multiple choice",
  tf: "Verdadero o falso",
  price: "Precio justo",
  reveal: "Revelación",
  priceReveal: "Revelación del precio",
  top5: "Top 5",
  podium: "Podio",
}

/**
 * Orden de cada partida: los tipos de pregunta se sortean del banco y `top5` es la pausa
 * con el ranking parcial. El precio justo vale doble (PRICE_MULTIPLIER).
 */
export const GAME_TEMPLATE = [
  "mc",
  "tf",
  "mc",
  "tf",
  "top5",
  "mc",
  "price",
] as const

export const SCORING = {
  /** Respuesta correcta: base + hasta `speed` según lo rápido que respondió. */
  base: 500,
  speed: 500,
  /** Precio justo: `price` × (1 − error relativo) × multiplicador. */
  price: 1000,
  priceMultiplier: 2,
}

/**
 * Respuestas que llegan tarde por mala señal: se aceptan hasta estos segundos después del
 * cierre de la pregunta (la velocidad la mide el celular, no la llegada al server).
 */
export const ANSWER_GRACE_S = 4

/** Ciudad de la feria: centro del mapa de "La red de hoy". */
export const FAIR_CITY = "Córdoba"

/** Techo del cupo de la sala (lo que el server lee de una partida). */
export const MAX_PLAYERS_LIMIT = 500

export const NAME_MAX = 12

/** URL del QR. En desarrollo, si no está configurada, se usa el origen actual. */
export const PUBLIC_URL =
  process.env.NEXT_PUBLIC_TRIVIA_URL || "https://movosend.app/trivia"

export const COPY = {
  lobbyTitle: "Escaneá\ny jugá.",
  lobbyCall: "Sumate a la próxima",
  lobbyHint: "2 minutos, desde tu celular.",
  lobbyManualHint: "Arranca cuando el stand dé la salida.",
  lobbyPaused: "En pausa",
  lobbyPausedHint: "La próxima partida arranca en un ratito.",
  nameRules:
    "Poné tu nombre real, sin malas palabras ni mensajes raros: lo ve todo el stand. Le sumamos un emoji para que te encuentres en la pantalla.",
  lobbyWaiting: "Esperando jugadores",
  lobbyWaitingHint: "Arranca cuando entra el primero.",
  closedTitle: "La trivia no está habilitada ahora.",
  closedBody:
    "Se juega en el stand de Movo, con la pantalla encendida. Cuando esté lista, te sumamos solo.",
  dayTitle: "Los mejores de hoy.",
  dayEmpty: "Todavía nadie jugó hoy. Estrená el ranking.",
  podiumFooter:
    "Cuenta tu mejor partida del día. Volvé a jugar cuando quieras para subir en el ranking.",
  rejoinHint:
    "Podés jugar todas las veces que quieras. Cuenta tu mejor partida del día.",
  emailTitle: "¿Te avisamos cuando Movo llegue a tu ciudad?",
  emailBody:
    "Dejanos tu mail y te sumamos al newsletter de Movo. Te podés dar de baja cuando quieras.",
  emailPlaceholder: "tu@mail.com",
  emailSubmit: "Sumarme",
  emailInvalid: "Revisá el mail, parece que falta algo.",
  emailDone: (email: string) => `Listo, te escribimos a ${email}.`,
} as const

/**
 * Cuándo entra cada escalón del podio en la TV (3.º, 2.º, 1.º), en segundos desde que
 * aparece la escena. El sonido (`SFX.podium`) va sincronizado con esto.
 */
export const PODIUM_DELAYS = [0.3, 1.1, 2.6] as const
