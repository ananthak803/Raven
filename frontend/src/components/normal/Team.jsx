import React from 'react'
import ChromaGrid from '../animated/ChromaGrid'
import ravenWhite from '../../assets/raven_white.png'


const Team = () => {
  const items = [
    {
      image: ravenWhite,
      title: "Anantha Krishnan",
      subtitle: "Frontend Developer",
      handle: "@ananthak803",
      borderColor: "#3B82F6",
      gradient: "linear-gradient(145deg, #3B82F6, #000)",
      url: "https://github.com/ananthak803",
    },
    {
      image: ravenWhite,
      title: "Rajneesh Rathore",
      subtitle: "Backend Engineer",
      handle: "@rajneesh",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://github.com/RajneeshRathore",
    },
    {
      image: ravenWhite,
      title: "Shivam Panwar",
      subtitle: "Backend Engineer",
      handle: "@shivam",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(160deg, #F59E0B, #000)",
      url: "https://github.com/raddishbunny",
    },
    {
      image: ravenWhite,
      title: "Akash Chaudhary",
      subtitle: "Database Engineer",
      handle: "@imakash",
      borderColor: "#EC4899",
      gradient: "linear-gradient(170deg, #EC4899, #000)",
      url: "https://github.com/akashchaudhary18",
    },
  ]

  return (
    <section className="h-screen bg-black flex flex-col items-center justify-center">
      
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-white">
          Meet the Team
        </h2>
        <p className="mt-3 text-white/60">
          The people building secure, private communication.
        </p>
      </div>

      <div style={{ height: '600px', position: 'relative', width: '100%' }}>
        <ChromaGrid
          items={items}
          radius={200}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
        />
      </div>

    </section>
  )
}

export default Team
