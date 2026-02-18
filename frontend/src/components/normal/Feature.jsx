import React from "react";
import BlogCard from "./BlogCard";
const Feature = () => {
  return (
    <div className="w-[100vw] bg-black">
      <div className="h-screen ">
        <section className="relative min-h-screen  text-white flex">
          <div className="hidden md:block w-[60%] h-full"></div>

          <div className="w-full md:w-[40%] h-full flex items-center justify-center px-6 md:px-0">
            <div className="max-w-md space-y-6 py-15">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Ultra-Fast Messaging
              </h1>

              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                Built on persistent WebSocket connections for true real-time delivery. Messages are transmitted and acknowledged in under 100ms, even during peak traffic. Optimized for low-bandwidth environments and unstable networks to ensure consistent performance everywhere.
                <span className="block mt-4 font-semibold text-white">
                 Feels instant. Because it is.
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="h-screen ">
        <section className="relative min-h-screen  text-white flex">
          

          <div className="w-full md:w-[40%] h-full flex items-center justify-center px-6 md:px-0">
            <div className="max-w-md space-y-6 py-15">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                End-to-End Encryption
              </h1>

              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                Your conversations stay private by design. Messages are encrypted on your device before they’re sent, so only you and the people you chat with can read them. Our servers never see message content, private DMs and rooms are fully encrypted.
                <span className="block mt-4 font-semibold text-white">
                 Even we can’t read your messages.
                </span>
              </p>
            </div>
          </div>
          <div className="hidden md:block w-[60%] h-full"></div>
        </section>
      </div>
      <div className="h-screen flex flex-col items-center justify-center gap-12 bg-black">
  
  <div className="text-center">
    <h2 className="text-4xl font-bold text-white">
      Built for What Matters
    </h2>
    <p className="mt-3 text-white/60">
      Privacy, performance, and communities without compromises.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    
    <BlogCard
      title="Privacy First"
      description="No data selling. No tracking pixels. No AI training on user chats. Delete your account and all data is removed."
    />

    <BlogCard
      title="Voice & Media"
      description="Crystal-clear low-latency voice, noise suppression, push-to-talk, and smooth performance on low-end devices."
    />

    <BlogCard
      title="Community & Servers"
      description="Smart servers with role-based permissions, auto-delete channels, expiring invites, and announcement-only rooms."
    />

  </div>
</div>

    </div>
  );
};

export default Feature;
