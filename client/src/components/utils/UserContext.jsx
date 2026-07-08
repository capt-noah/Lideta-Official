import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user,       setUser]       = useState(null)
  const [userToken,  setUserToken]  = useState(() => localStorage.getItem('userToken') || null)
  const [loadingUser,setLoadingUser]= useState(true)

  useEffect(() => {
    if (!userToken) { setLoadingUser(false); return }
    fetch('/api/user/me', { headers: { authorization: `Bearer ${userToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); else logout() })
      .catch(() => logout())
      .finally(() => setLoadingUser(false))
  }, [userToken])

  const login = (userData, token) => {
    localStorage.setItem('userToken', token)
    setUserToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    setUserToken(null)
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, userToken, loadingUser, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
