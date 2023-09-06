
import { createContext, useEffect, useState } from 'react'
import './App.css'
import Dictionary from './components/Dictionary'



export const AppContext = createContext("")

function App() {
    const [theme, setTheme] = useState("light")

    useEffect(() => {
        if (theme === "dark"){
          document.documentElement.classList.add("dark")
        }
        else{
          document.documentElement.classList.remove("dark")
        }
    }, [theme])
    

  return (
    <>
    <AppContext.Provider value={{theme, setTheme}}>
      <Dictionary/>
    </AppContext.Provider>
    </>
  )
}

export default App
