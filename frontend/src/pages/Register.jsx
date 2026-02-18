import React, { useState} from 'react'
import Logo from '../components/normal/Logo'
import Particles from '../components/animated/ParticleSpread'
import { Link,replace,useNavigate } from 'react-router-dom'
import axios from 'axios'
const Register = () => {
  const [email,setEmail]=useState("");
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [dob,setDob]=useState("");
  const navigate=useNavigate();

  const registerHandler = async () => {
  if (!email || !username || !password || !dob) {
    alert("All fields are required");
    return;
  }
  const url=import.meta.env.VITE_BACKEND_URL
  try {
    console.log(url);
    const res = await axios.post(
      `${url}/auth/register`,
      {
        email,
        username,
        password,
        dob,
      }
    );

    console.log("Register success:", res.data);
    alert("Account created successfully!");
    navigate('/login',{replace:true})
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Registration failed");
  }
};


   return (
    <div className="h-screen bg-black">
      <div
        className="fixed top-0 left-0 w-full z-50 
                          flex items-center justify-between
                           py-2
                          "
      >
        <Logo />
      </div>
      <Particles
        particleColors={["#ffffff"]}
        particleCount={400}
        particleSpread={20}
        speed={0.1}
        particleBaseSize={150}
        moveParticlesOnHover
        alphaParticles={false}
        disableRotation={false}
        pixelRatio={1}
      />
      <div className="h-full w-[100vw]  fixed top-0 left-0 flex items-center justify-center text-white py-10">
  <div
    className="h-full w-[50%] min-w-[320px] max-w-md rounded-2xl 
               bg-white/5 backdrop-blur-md border border-white/10 
               flex flex-col justify-center px-8"
  >
    <h1 className="text-3xl font-bold text-center">
      Create an account
    </h1>
    <p className="mt-2 text-center text-white/60">
      Join Raven and start chatting securely
    </p>

    <input
      type="email"
      placeholder="Email"
      className="mt-6 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3
                 text-white placeholder-white/40 focus:outline-none focus:ring-2
                 focus:ring-white/20"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
    />

    <input
      type="text"
      placeholder="Username"
      className="mt-4 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3
                 text-white placeholder-white/40 focus:outline-none focus:ring-2
                 focus:ring-white/20"
      value={username}
      onChange={(e)=>setUsername(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      className="mt-4 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3
                 text-white placeholder-white/40 focus:outline-none focus:ring-2
                 focus:ring-white/20"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
    />

    <input
      type="date"
      className="mt-4 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3
                 text-white placeholder-white/40 focus:outline-none focus:ring-2
                 focus:ring-white/20"
      value={dob}
      onChange={(e)=>setDob(e.target.value)}
    />

    <button
      className="mt-6 w-full rounded-lg bg-white py-3 font-semibold text-black
                 hover:bg-white/90 active:scale-95 transition"
      onClick={registerHandler}
    >
      Create Account
    </button>

    <p className="mt-5 text-center text-sm text-white/60">
      Already have an account?{" "}
      <Link to="/login" >
      <span className="text-white hover:underline cursor-pointer">
        Log in
      </span>
      </Link>
    </p>
  </div>
</div>

    </div>
  );
}

export default Register
