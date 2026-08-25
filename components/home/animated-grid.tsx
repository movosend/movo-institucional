export function AnimatedGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="animate-grid-pan absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(198,242,74,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(10,10,11,0.92) 100%)
          `,
        }}
      />
    </div>
  )
}
