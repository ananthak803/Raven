const About = () => {
  return (
    <section className="relative min-h-screen bg-black text-white flex">
      
      <div className="w-full md:w-[40%] h-full flex items-center justify-center px-6 md:px-0">
        <div className="max-w-md space-y-6 py-15">
          
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Chat. Instantly. Securely.
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            A fast, lightweight group chat designed for real conversations.
            Built for speed, privacy, and simplicity — with end-to-end encryption
            by default, so your messages stay yours.
            <span className="block mt-4 font-semibold text-white">
              Always online. Always secure.
            </span>
          </p>

        </div>
      </div>

      <div className="hidden md:block w-[60%] h-full">
      </div>

    </section>
  )
}

export default About
