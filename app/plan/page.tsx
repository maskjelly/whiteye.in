import { useTheme } from "next-themes"
import { Waves } from "@/components/ui/waves-background"

function WavesDemo() {
  const { theme } = useTheme()
  
  return (
    <div className="relative w-full h-[400px] bg-background/80 rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        <Waves
          lineColor={theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"}
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>

      <div className="relative z-10 p-8">
        <h3 className="text-2xl font-bold">Interactive Waves</h3>
        <p className="text-muted-foreground">Move your mouse to interact with the waves</p>
      </div>
    </div>
  )
}

export { WavesDemo } 