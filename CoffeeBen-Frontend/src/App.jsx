import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='min-h-screen grid place-items-center bg-gray-100'>
        <button className='px-4 py-3 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700'>
          Hola, desde Programación Web 2 con Tailwind CSS
        </button>
      </div>
    </>
  )
}

export default App
