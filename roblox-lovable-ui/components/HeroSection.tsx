export default function HeroSection() {
  return (
    <div className="text-center mb-12 max-w-4xl mx-auto">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
        <span className="text-gray-900 dark:text-white">Build </span>
        <span className="gradient-text">Roblox games</span>
        <br />
        <span className="text-gray-900 dark:text-white">with AI</span>
      </h1>
      
      <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
        Describe your game idea in plain English, and watch as AI generates 
        professional Roblox scripts instantly.
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Instant code generation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Type-safe Luau scripts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Rojo compatible</span>
        </div>
      </div>
    </div>
  );
}