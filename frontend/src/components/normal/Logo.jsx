import React from 'react'
import ravenWhite from '../../assets/raven_white.png'
import { Link } from 'react-router-dom'
const logo = () => {
 
  return (
    <Link to="/">
      <img
              src={ravenWhite}
              alt="Raven logo"
              className="h-20"
            />
    </Link>
  )
}

export default logo
