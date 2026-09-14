export function AnimatedGrid() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 animate-grid-pan"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--foreground) 4.5%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 4.5%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(198,242,74,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, color-mix(in srgb, var(--background) 92%, transparent) 100%)
          `,
        }}
      />
    </div>
  )
}
