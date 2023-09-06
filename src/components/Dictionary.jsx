import axios from 'axios'
import React, { useContext, useState } from 'react'
import {VscSearch} from 'react-icons/Vsc'
import {BsSun,BsMoon} from 'react-icons/Bs'
import '../App.css'
import { AppContext } from '../App'


const Dictionary = () => {
    const [entry, setentry] = useState('')
    const [entryresult, setentryresult] = useState(null)
    const [empty, setempty] = useState('')
    const { setTheme, theme} = useContext(AppContext)
    console.log(theme);
    let endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${entry}`
    
    const getResult = () => {
        if(entry == ""){
            setempty('Search Input empty')
            setentryresult("")
        }else {
            axios.get(endpoint)
        .then((result)=>{
            console.log(result.data)
            setentryresult(result.data)
            setentry("")
            setempty("")
        })
        .catch((error)=>{
            console.log(error);
            if(error.code=='ERR_NETWORK'){
                setempty('network error')
                setentryresult("")
            }else if(error.code=='ERR_BAD_REQUEST'){
                setempty(error.response.data.title);
                setentryresult("")
            }
        })
        }
    }
    let myDiv = {
    height: '200vh',
    overflowY: 'none'
    }
  return (
    <>
    <div style={myDiv} className='bg-slate-700 dark:bg-white'>
        <nav className='text-white p-4'>
            <ul className='flex justify-between'> 
                <li>logo</li>
                <li className='cursor-pointer'>
                    {
                        theme == "dark" ? <BsSun onClick={(e)=> setTheme("light")}/> :
                        <BsMoon onClick={(e)=> setTheme("dark")}/>
                    }
                    
                </li>
            </ul>
        </nav>
        <div>
            <div className="relative flex items-stretch sm:w-1/2 md:w-1/3 lg:w-1/3 mx-auto justify-center items-center ">
            <input
                type="text"
                placeholder="Enter Keyword"
                className="w-full bg-cyan-800 caret-white py-2 pl-10 pr-4 rounded-l-md border border-gray-300 focus:border-black-500  outline-none"
                onChange={(e)=>setentry(e.target.value)} value={entry}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pl-3">
                <button
                type="submit"
                className=" text-black font-semibold rounded-r-md px-4 py-2"
                onClick={getResult}>
                <VscSearch/>
                </button>
             </div>
            </div>
        </div>
            <small className='flex justify-center my-2 text-red-500'>{empty}</small>

        <section className={entryresult? 'border shadow-2xl': 'border shadow-2xl h-full'}>
            <div className='mx-auto m-10 py-5 sm:w-full lg:w-full text-center shadow-xl'>
        {
            entryresult &&
            <>
            <div><span className='font-bold first-letter:text-7xl'>{entryresult[0].word}</span> <span className='font-bold text-red-500'>({entryresult[0].phonetic})</span></div>

            {
                entryresult[0].meanings[0].definitions.map((item, index)=>(
                    <ul key={index}>
                        <li className='text-white'><span className="text-red-500 text-sm">{index+1}. </span>{item.definition}</li>
                    </ul>
                    
                ))
                
            }
            <div>
            {entryresult[0].meanings[0].synonyms.map((item, index)=>(
                    <span className='text-cyan-800 font-semibold' key={index}>
                    {item},
                    </span>
                ))
            }
            </div>
        </>
        }
            </div>
        </section>
    </div>
    </>
  )
}

export default Dictionary