import React from 'react'
import Silk from '../animated/Silk'

const Hero = () => {
  return (
    <section className="sticky top-0 w-screen h-screen bg-black text-white overflow-hidden">
      
      <div className="absolute inset-0">
        <Silk
          speed={4}
          scale={1}
          color="#1b1a1a"
          noiseIntensity={0}
          rotation={0}
        />
      </div>

      <h1
        className="absolute bottom-8 left-1/2 -translate-x-1/2 
                   w-full text-center z-10
                   text-white text-6xl md:text-8xl 
                   font-extrabold tracking-tight"
      >
        SIMPLE<span className="opacity-60">.</span>
        FAST<span className="opacity-60">.</span>
        SECURE
      </h1>

    </section>
  )
}

export default Hero
