import { createContext, useEffect, useState } from 'react'
import './App.css'
import Dictionary from './components/Dictionary'



export const AppContext = createContext("")

function App() {
    const [theme, setTheme] = useState("light")
    const [font, setFont] = useState("serif")

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
    <AppContext.Provider value={{theme, setTheme, font, setFont}}>
      <div className={`${font==='serif'? 'font-[serif]': font === "Poppins" ? 'font-[Poppins]': font === 'Caprasimo' ? 'font-[caprasimo]' : font === 'Calistoga' ? 'font-[Calistoga]' : font === 'Montserrat' ? 'font-[Montserrat]' : 'font-[Quicksand]' }`}>
      <Dictionary/>
      </div>
    </AppContext.Provider>

    </>
  )
}

export default App
