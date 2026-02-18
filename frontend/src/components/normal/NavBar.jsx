import React from 'react'
import { Outlet } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import Logo from "./Logo"
const NavBar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 
                      flex items-center justify-between
                      pr-6 py-2
                      ">

        <Logo/>

        <button
          className="px-5 py-2 rounded-lg 
                     font-semibold text-lg
                     bg-white text-black
                     hover:bg-white/90 transition"
                     onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>

    </>
  )
}

export default NavBar
