/** Localidad del juego: [nombre, provincia, lat, lng] (mismo formato que el prototipo). */
export type City = [name: string, province: string, lat: number, lng: number]

/** Ciudades destacadas: puntos del mapa, sugerencias locales y pares del loop de atracción. */
export const CITIES: City[] = [
  ["Buenos Aires", "CABA", -34.60842, -58.37213],
  ["La Plata", "Buenos Aires", -34.92135, -57.9545],
  ["Quilmes", "Buenos Aires", -34.71886, -58.26037],
  ["Morón", "Buenos Aires", -34.65106, -58.62185],
  ["Tigre", "Buenos Aires", -34.42265, -58.58088],
  ["Pilar", "Buenos Aires", -34.4587, -58.91397],
  ["Luján", "Buenos Aires", -34.56336, -59.12112],
  ["Zárate", "Buenos Aires", -34.09581, -59.02432],
  ["San Nicolás", "Buenos Aires", -33.32758, -60.21706],
  ["Pergamino", "Buenos Aires", -33.89111, -60.57459],
  ["Junín", "Buenos Aires", -34.59394, -60.94643],
  ["Olavarría", "Buenos Aires", -36.89384, -60.32319],
  ["Tandil", "Buenos Aires", -37.3287, -59.1369],
  ["Mar del Plata", "Buenos Aires", -37.99761, -57.54816],
  ["Bahía Blanca", "Buenos Aires", -38.71761, -62.26545],
  ["Córdoba", "Córdoba", -31.4168, -64.18361],
  ["Villa Carlos Paz", "Córdoba", -31.41792, -64.49403],
  ["Villa María", "Córdoba", -32.4135, -63.24833],
  ["Río Cuarto", "Córdoba", -33.12384, -64.349],
  ["Rosario", "Santa Fe", -32.94721, -60.63318],
  ["Santa Fe", "Santa Fe", -31.65747, -60.71048],
  ["Rafaela", "Santa Fe", -31.25267, -61.49166],
  ["Venado Tuerto", "Santa Fe", -33.7455, -61.96873],
  ["Paraná", "Entre Ríos", -31.74016, -60.52743],
  ["Concordia", "Entre Ríos", -31.39196, -58.01701],
  ["Gualeguaychú", "Entre Ríos", -33.0078, -58.51077],
  ["Mendoza", "Mendoza", -32.88973, -68.84444],
  ["San Rafael", "Mendoza", -34.61286, -68.33042],
  ["San Juan", "San Juan", -31.53726, -68.52502],
  ["San Luis", "San Luis", -33.30209, -66.33685],
  ["San Miguel de Tucumán", "Tucumán", -26.83039, -65.20378],
  ["Salta", "Salta", -24.78927, -65.41029],
  ["San Salvador de Jujuy", "Jujuy", -24.18583, -65.29948],
  ["Santiago del Estero", "Santiago del Estero", -27.78768, -64.25967],
  ["Catamarca", "Catamarca", -28.46901, -65.77892],
  ["La Rioja", "La Rioja", -29.41288, -66.85583],
  ["Resistencia", "Chaco", -27.45108, -58.98648],
  ["Corrientes", "Corrientes", -27.46335, -58.83947],
  ["Posadas", "Misiones", -27.36643, -55.89398],
  ["Puerto Iguazú", "Misiones", -25.59721, -54.57722],
  ["Formosa", "Formosa", -26.18501, -58.1749],
  ["Santa Rosa", "La Pampa", -36.6204, -64.29063],
  ["Neuquén", "Neuquén", -38.95183, -68.05918],
  ["San Martín de los Andes", "Neuquén", -40.15694, -71.35271],
  ["General Roca", "Río Negro", -39.02682, -67.57484],
  ["Viedma", "Río Negro", -40.80837, -62.99493],
  ["Bariloche", "Río Negro", -41.1342, -71.31096],
  ["Puerto Madryn", "Chubut", -42.76728, -65.03668],
  ["Trelew", "Chubut", -43.25319, -65.30938],
  ["Esquel", "Chubut", -42.91732, -71.32157],
  ["Comodoro Rivadavia", "Chubut", -45.86542, -67.48216],
  ["Río Gallegos", "Santa Cruz", -51.62346, -69.21586],
  ["El Calafate", "Santa Cruz", -50.33803, -72.26067],
  ["Río Grande", "Tierra del Fuego", -53.78633, -67.69633],
  ["Ushuaia", "Tierra del Fuego", -54.8074, -68.30376],
];

export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-AR")

/** Distancia en línea recta (km). Solo para elegir pares y estimar antes de cotizar. */
export function haversineKm(a: City, b: City) {
  const R = 6371
  const r = Math.PI / 180
  const dLat = (b[2] - a[2]) * r
  const dLng = (b[3] - a[3]) * r
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[2] * r) * Math.cos(b[2] * r) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
