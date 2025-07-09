export default function GradientBackground() {
  return (
    <>
      {/* Mesh gradient background */}
      <div className="fixed inset-0 -z-20">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 27% 37%, hsla(25, 85%, 60%, 0.6) 0px, transparent 50%),
              radial-gradient(at 97% 21%, hsla(330, 65%, 55%, 0.5) 0px, transparent 50%),
              radial-gradient(at 52% 99%, hsla(210, 75%, 50%, 0.4) 0px, transparent 50%),
              radial-gradient(at 10% 29%, hsla(350, 70%, 60%, 0.35) 0px, transparent 50%),
              radial-gradient(at 97% 96%, hsla(200, 50%, 30%, 0.3) 0px, transparent 50%),
              radial-gradient(at 33% 50%, hsla(30, 80%, 65%, 0.3) 0px, transparent 50%),
              radial-gradient(at 79% 53%, hsla(270, 60%, 50%, 0.25) 0px, transparent 50%)
            `
          }}
        />
        
        {/* Animated orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/30 blur-3xl animate-float" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-pink-400/30 blur-3xl animate-float animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-blue-400/25 blur-3xl animate-float animation-delay-4000" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-gray-800/20 blur-3xl animate-float" />
        
        {/* Noise texture overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </>
  );
}