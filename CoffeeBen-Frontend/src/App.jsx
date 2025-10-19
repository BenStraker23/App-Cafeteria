import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <h1 className='text-3x1 font-bold'>HOLA MUNDO DESDE EL CURSO DE PROGRAMACIÓN WEB 2</h1>
     <div className='min-h-screen grid place-item-center bg-slate-600'>
      <button className='px-6 py-3 text-white font-semibold rouded-lg bg-indigo-800 hover:bg-indigo-700'> Probando Tailwindcss </button>
     </div>
    </>
  )
}

export default App