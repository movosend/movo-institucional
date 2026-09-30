/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // El equipo ahora es una sección de El proyecto.
      { source: "/el-equipo", destination: "/el-proyecto#equipo", permanent: true },
    ]
  },
}

export default nextConfig
