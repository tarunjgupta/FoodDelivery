import React from 'react'
import './Header.css'
import { useState } from 'react'
const Header = () => {
  const [menu,setMenu] = useState("home");
  return (


    <div className='header'>
      <div className='header-contents'>
        <h2>Order your favourite food here</h2>
        <p>Choose from a diverse menu featuring a delictable array of dishes crafted with the finest taste to satisfy your cravings and elevate your dining experience</p>
        <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>View Menu</a>
      </div>
    </div>
  )
}

export default Header
