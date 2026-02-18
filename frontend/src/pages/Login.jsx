import React, { useState } from "react";
import Particles from "../components/animated/ParticleSpread";
import Logo from "../components/normal/Logo";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { useDmStore } from "../store/useDmStore";


const Login = () => {
  const setCurrentUser=useDmStore((state)=>state.setCurrentUser);
  const[email,setEmail]=useState("")
  const[password,setPassword]=useState("")
  const navigate=useNavigate();

  const loginHandler = async () => {
  if (!email|| !password) {
    alert("All fields are required");
    return;
  }
  const url=import.meta.env.VITE_BACKEND_URL
  try {
    // console.log(url);
    const res = await axios.post(
      `${url}/auth/login`,
      {
        email,
        password,
      },
      {withCredentials:true}
    );

    console.log("Login success:", res.data);
    alert("Logged in successfully!");
    // console.log(res.data.data._id)
    console.log(res.data.data)
    setCurrentUser(res.data.data)
    navigate('/home',{replace:true})
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Login failed");
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
      <div className="h-full w-[100vw] fixed top-0 left-0 flex items-center justify-center  text-white p-10">
  <div className="h-full w-[50%] min-w-[320px] max-w-md rounded-2xl 
                  bg-white/5 backdrop-blur-xl border border-white/10 
                  flex flex-col justify-center px-8">
    
    <h1 className="text-3xl font-bold text-center">
      Welcome back
    </h1>
    <p className="mt-2 text-center text-white/60">
      We’re excited to see you again
    </p>

    <input
      type="text"
      placeholder="Email or Username"
      className="mt-6 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3
                 text-white placeholder-white/40 focus:outline-none focus:ring-2
                 focus:ring-white/20"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
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

    <p className="mt-3 text-right text-sm text-white/60 hover:text-white cursor-pointer">
      Forgot your password?
    </p>

    <button
      className="mt-6 w-full rounded-lg bg-white py-3 font-semibold text-black
                 hover:bg-white/90 active:scale-95 transition"
                 onClick={loginHandler}
    >
      Log In
    </button>

    <p className="mt-5 text-center text-sm text-white/60">
      Need an account?{" "}
      <Link to={'/register'}>
      <span className="text-white hover:underline cursor-pointer">
        Register
      </span>
      </Link>
    </p>

  </div>
</div>


    </div>
   
  );
};

export default Login;
