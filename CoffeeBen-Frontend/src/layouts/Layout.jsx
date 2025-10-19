import { Outlet, Navigate } from "react-router-dom"
import Modal from 'react-modal' // importamos la libreria react-modal
import Sidebar from "../components/Sidebar"
import Resumen from "../components/Resumen"
import ModalProducto from "../components/ModalProducto" // importamos el componente ModalProducto
import useQuiosco from "../hooks/useQuiosco" //importamos el custom hook
import { useAuth } from "../hooks/useAuth"


const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

Modal.setAppElement('#root'); // Indicamos el elemento raiz de la app para accesibilidad

export default function Layout() {

    const { modal, handleClickModal } = useQuiosco() // Accedemos al estado del modal desde el contexto
    const { user, loading } = useAuth({}) // Verificamos autenticación

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Cargando...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth/login" />
    }

  return (
    <>
        <div className="md:flex">
        <Sidebar />

        <main className="flex-1 h-screen overflow-y-scroll bg-gray-100 p-10">
            <Outlet />
        </main>

        <Resumen />
        </div>

        {/* Agregamos el modal */}
   
        <Modal isOpen={modal} style={customStyles}>
            <ModalProducto />                                    
        </Modal>
    </>
    
  )
}