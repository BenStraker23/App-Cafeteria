import {Link} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminSidebar() {

    const { logout } = useAuth({middleware: 'auth'});

    return (
        <aside className="md:w-72 h-screen">
            <div className="p-4">
                <img 
                    src="/img/Logo.jpg"
                    alt="imagen logotipo"
                    className="w-40"
                />
                
                {/* Tarjeta del botón Menú */}
                <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-amber-800 font-bold text-sm mb-2">Panel de Administración</p>
                    <Link 
                        to="/"
                        className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 shadow-sm w-full text-center"
                    >
                        Menú Principal
                    </Link>
                </div>
            </div>

            <nav className='flex flex-col p-4 space-y-3'>
                <Link 
                    to="/admin/ordenes" 
                    className='font-bold text-lg text-amber-800 hover:text-amber-600 hover:bg-amber-50 p-3 rounded-md transition-colors duration-200 border border-transparent hover:border-amber-200'
                >
                    Ordenes
                </Link>
                <Link 
                    to="/admin/productos" 
                    className='font-bold text-lg text-amber-800 hover:text-amber-600 hover:bg-amber-50 p-3 rounded-md transition-colors duration-200 border border-transparent hover:border-amber-200'
                >
                    Productos
                </Link>
            </nav>

            <div className='my-5 px-5'>
                <button
                    type="button"
                    className="text-center bg-red-500 w-full p-3 font-bold text-white truncate"
                    onClick={logout}
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}