/** Localidad del juego: [nombre, provincia, lat, lng] (mismo formato que el prototipo). */
export type City = [name: string, province: string, lat: number, lng: number]

/** Ciudades destacadas: puntos del mapa, sugerencias locales y pares del loop de atracción. */
export const CITIES: City[] = [
  ["Buenos Aires", "CABA", -34.6037, -58.3816],
  ["La Plata", "Buenos Aires", -34.9214, -57.9544],
  ["Quilmes", "Buenos Aires", -34.7206, -58.2546],
  ["Morón", "Buenos Aires", -34.6534, -58.6198],
  ["Tigre", "Buenos Aires", -34.426, -58.5796],
  ["Pilar", "Buenos Aires", -34.4587, -58.9142],
  ["Luján", "Buenos Aires", -34.5703, -59.105],
  ["Zárate", "Buenos Aires", -34.0981, -59.0286],
  ["San Nicolás", "Buenos Aires", -33.3342, -60.2108],
  ["Pergamino", "Buenos Aires", -33.8895, -60.5736],
  ["Junín", "Buenos Aires", -34.5856, -60.9589],
  ["Olavarría", "Buenos Aires", -36.8927, -60.3225],
  ["Tandil", "Buenos Aires", -37.3217, -59.1332],
  ["Mar del Plata", "Buenos Aires", -38.0055, -57.5426],
  ["Bahía Blanca", "Buenos Aires", -38.7196, -62.2724],
  ["Córdoba", "Córdoba", -31.4201, -64.1888],
  ["Villa Carlos Paz", "Córdoba", -31.4241, -64.4978],
  ["Villa María", "Córdoba", -32.4075, -63.2402],
  ["Río Cuarto", "Córdoba", -33.1232, -64.3493],
  ["Rosario", "Santa Fe", -32.9442, -60.6505],
  ["Santa Fe", "Santa Fe", -31.6107, -60.6973],
  ["Rafaela", "Santa Fe", -31.2503, -61.4867],
  ["Venado Tuerto", "Santa Fe", -33.7456, -61.9688],
  ["Paraná", "Entre Ríos", -31.7333, -60.5297],
  ["Concordia", "Entre Ríos", -31.3929, -58.0209],
  ["Gualeguaychú", "Entre Ríos", -33.0094, -58.5172],
  ["Mendoza", "Mendoza", -32.8895, -68.8458],
  ["San Rafael", "Mendoza", -34.6177, -68.3301],
  ["San Juan", "San Juan", -31.5375, -68.5364],
  ["San Luis", "San Luis", -33.295, -66.3356],
  ["San Miguel de Tucumán", "Tucumán", -26.8083, -65.2176],
  ["Salta", "Salta", -24.7821, -65.4232],
  ["San Salvador de Jujuy", "Jujuy", -24.1858, -65.2995],
  ["Santiago del Estero", "Santiago del Estero", -27.7951, -64.2615],
  ["Catamarca", "Catamarca", -28.4696, -65.7795],
  ["La Rioja", "La Rioja", -29.4131, -66.8558],
  ["Resistencia", "Chaco", -27.4606, -58.9839],
  ["Corrientes", "Corrientes", -27.4692, -58.8306],
  ["Posadas", "Misiones", -27.3621, -55.9009],
  ["Puerto Iguazú", "Misiones", -25.5972, -54.5786],
  ["Formosa", "Formosa", -26.1775, -58.1781],
  ["Santa Rosa", "La Pampa", -36.6167, -64.2833],
  ["Neuquén", "Neuquén", -38.9516, -68.0591],
  ["San Martín de los Andes", "Neuquén", -40.1579, -71.3534],
  ["General Roca", "Río Negro", -39.0333, -67.5833],
  ["Viedma", "Río Negro", -40.8135, -62.9967],
  ["Bariloche", "Río Negro", -41.1335, -71.3103],
  ["Puerto Madryn", "Chubut", -42.7692, -65.0385],
  ["Trelew", "Chubut", -43.2489, -65.3051],
  ["Esquel", "Chubut", -42.9115, -71.3195],
  ["Comodoro Rivadavia", "Chubut", -45.8641, -67.4966],
  ["Río Gallegos", "Santa Cruz", -51.623, -69.2168],
  ["El Calafate", "Santa Cruz", -50.3379, -72.2648],
  ["Río Grande", "Tierra del Fuego", -53.7877, -67.7095],
  ["Ushuaia", "Tierra del Fuego", -54.8019, -68.303],
]

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
