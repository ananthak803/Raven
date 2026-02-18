import React from 'react'

const Nameplate = ({item,openDm}) => {
  return (
    <div className='text-white h-[8%] rounded-xl my-3 px-3 flex items-center justify-between hover:bg-[#1a1918]' onClick={openDm}>
      <h1>{item.username}</h1>
      <img src={item.avatarUrl} className='h-[80%] rounded-4xl '/>
    </div>
  )
}

export default Nameplate
