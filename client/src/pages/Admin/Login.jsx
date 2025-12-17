import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import EyeShowIcon from '../../assets/icons/eye_show_icon.svg?react'
import EyeHideIcon from '../../assets/icons/eye_hide_icon.svg?react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
      e.preventDefault()
      
      setLoading(true)
      
    try {
        const response = await fetch('http://localhost:3000/auth/admin/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({username: username, password: password})
        })

        const data = await response.json()

        if (!response.ok) {
            setStatus(data.error)
            setLoading(false)
            return
        }

        console.log(data)

        setStatus(data.message)
        setLoading(data.message ? false : true)
        localStorage.setItem('token', data.token)
      if (data.admin.role == 'superadmin') navigate('/superadmin/home')
      else navigate('/admin')
        
    } 
    catch (error) {
        setStatus(error)
    }



  }

  return (
    <div className='min-h-screen w-full bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white border border-[#3A3A3A]/20 rounded-2xl shadow-md p-8 flex flex-col gap-6'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='font-goldman text-3xl text-[#3A3A3A]'>Welcome</h1>
          <p className='font-roboto text-sm text-[#3A3A3A]/80'>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='font-roboto text-sm text-[#3A3A3A]'>Username</label>
            <input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='w-full rounded-lg border border-[#3A3A3A]/30 px-3 py-2 font-roboto text-sm text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]/60 bg-white'
              placeholder='Enter username'
              required
            />
          </div>

          <div className='flex flex-col gap-2 relative' >
            <label className='font-roboto text-sm text-[#3A3A3A]'>Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className='w-full rounded-lg border border-[#3A3A3A]/30 px-3 py-2 font-roboto text-sm text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]/60 bg-white' placeholder='Enter password' required />
            <button type='button' className='absolute w-5 h-5 top-9 right-4 cursor-pointer ' onClick={() => setShowPassword(!showPassword)} > { showPassword? <EyeHideIcon fill='#A9A9A9' /> : <EyeShowIcon fill='#A9A9A9' /> } </button>

          </div>

        {
            status && <div className='min-h-[40px] flex justify-center items-center rounded-lg bg-white px-4 py-3 font-roboto text-md text-[#3A3A3A]'> {status} </div>    
       
         }         


          <button type='submit' className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] active:scale-[0.99] transition-all cursor-pointer'>
            {loading?
                <div className='flex gap-1' >
                    <div className='bg-white w-3 h-3 rounded-full animate-bounce' />
                    <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:100ms] ' />
                    <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:200ms] ' />
                </div>
                :
                'Login'
                
                          
            }
          </button>
        </form>


      </div>
    </div>
  )
}

export default Login

