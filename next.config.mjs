/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite probar `npm run dev` desde el celular por la IP de la red local.
  // Sin esto, el dev server responde 403 a los chunks de JS y la página no hidrata.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  async redirects() {
    return [
      // El equipo ahora es una sección de El proyecto.
      { source: "/el-equipo", destination: "/el-proyecto#equipo", permanent: true },
    ]
  },
}

export default nextConfig
