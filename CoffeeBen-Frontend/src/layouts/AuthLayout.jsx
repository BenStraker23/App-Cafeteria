import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function AuthLayout() {
    const { user, loading } = useAuth({})

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Cargando...</div>
            </div>
        )
    }

    if (user) {
        return <Navigate to="/" />
    }

    return (
        <main className="max-w-4xl m-auto mt-10 md:mt-28 flex flex-col md:flex-row items-center">
            <img 
                src="../img/Logo.jpg" 
                alt="Main Logo Image" 
                className="max-w-xs"
            />
            <div className="w-full p-10">
                <Outlet />
            </div>
        </main>
    )
}