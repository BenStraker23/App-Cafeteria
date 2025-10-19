import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

export default function Login() {

    const [datos, setDatos] = useState({
        email: '',
        password: ''
    })

    const { login } = useAuth({
        middleware: 'guest',
        url: '/'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if(Object.values(datos).includes('')) {
            return
        }

        await login(datos)
    }

    return (
        <>
            <h1 className="text-4xl font-black">Iniciar Sesión</h1>
            <p>Para crear un pedido debes iniciar sesión.</p>

            <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
                <form                    
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <div className="mb-4">
                        <label
                            className="text-slate-800"
                            htmlFor="email"
                        >Email:</label>
                        <input 
                            type="email" 
                            id="email"
                            className="mt-2 w-full p-3 bg-gray-50"
                            name="email"
                            placeholder="Tu Email"
                            value={datos.email}
                            onChange={e => setDatos({...datos, [e.target.name]: e.target.value})}
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="text-slate-800"
                            htmlFor="password"
                        >Password:</label>
                        <input 
                            type="password" 
                            id="password"
                            className="mt-2 w-full p-3 bg-gray-50"
                            name="password"
                            placeholder="Tu Password"
                            value={datos.password}
                            onChange={e => setDatos({...datos, [e.target.name]: e.target.value})}
                        />
                    </div>

                    <input
                        type="submit"
                        value="Iniciar Sesión"
                        className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
                    />
                </form>
            </div>

            <nav className="mt-8">
              <Link to="/auth/registro">
                ¿No tienes una cuenta? REGISTRATE
              </Link>
            </nav>

            
        </>
    )
}