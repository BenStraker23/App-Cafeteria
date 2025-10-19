import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import clienteAxios from '../config/axios'

export const useAuth = ({middleware, url}) => {
    
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const token = localStorage.getItem('AUTH_TOKEN')
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const {data} = await clienteAxios('/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setUser(data)
            } catch (error) {
                localStorage.removeItem('AUTH_TOKEN')
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [])

    useEffect(() => {
        if (middleware === 'guest' && url && user) {
            navigate(url)
        }
        if (middleware === 'auth' && !user && !loading) {
            navigate('/auth/login')
        }
        if (middleware === 'admin' && user && !user.admin) {
            navigate('/')
        }
    }, [user, middleware, loading])
    
    const register = async (datos) => {
        try {
            const {data} = await clienteAxios.post('/api/registro', datos)
            localStorage.setItem('AUTH_TOKEN', data.token)
            setUser(data.user)
            toast.success('Cuenta creada correctamente')
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error) {
            if(error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(error => {
                    error.forEach(message => {
                        toast.error(message)
                    })
                })
            } else {
                toast.error('Error al crear la cuenta')
            }
        }
    }

    const login = async (datos) => {
        try {
            const {data} = await clienteAxios.post('/api/login', datos)
            localStorage.setItem('AUTH_TOKEN', data.token)
            setUser(data.user)
            toast.success('Iniciando sesión...')
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error) {
            if(error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(error => {
                    error.forEach(message => {
                        toast.error(message)
                    })
                })
            } else {
                toast.error(error.response?.data?.message || 'Credenciales incorrectas')
            }
        }
    }
    
    const logout = async () => {
        try {
            localStorage.removeItem('AUTH_TOKEN')
            setUser(null)
            navigate('/auth/login')
        } catch (error) {
            console.log(error)
        }
    }

    return {
        register,
        login,
        logout,
        user,
        loading
    }
}