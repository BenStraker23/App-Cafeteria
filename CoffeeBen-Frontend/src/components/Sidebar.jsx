import useQuiosco from "../hooks/useQuiosco" // Importamos el custom hook
import { useAuth } from "../hooks/useAuth"
import Categoria from "./Categoria"

export default function Sidebar() {

  const { categorias } = useQuiosco() // Accedemos a las categorias desde el contexto
  const { user, logout } = useAuth({}) // Accedemos al usuario autenticado
  
  return (
    <aside className="md:w-72">
        <div className="p-4">
                <img 
                    className="w-40"
                    src="img/Logo.jpg"
                    alt="Imagen Logo"
                />
                
                {/* Mensaje de bienvenida */}
                {user && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                        <p className="text-amber-800 font-bold text-lg">¡Bienvenido!</p>
                        <p className="text-amber-700 text-sm">{user.name}</p>
                    </div>
                )}
            </div>

            <div className="mt-10">
                {categorias.map(categoria => (
                    <Categoria 
                        key={categoria.id}
                        categoria={categoria}                        
                    />
                ))}
            </div>

            <div className="my-5 px-5">
                {user ? (
                    <button 
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white w-full p-3 font-bold cursor-pointer text-center"
                        onClick={logout}
                    >
                        Cerrar Sesión
                    </button>
                ) : (
                    <button 
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white w-full p-3 font-bold cursor-pointer text-center"
                    >
                        Cancelar Orden
                    </button>
                )}
            </div>
    </aside>
  )
}