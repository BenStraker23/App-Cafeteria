import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import useQuiosco from './useQuiosco'

export const useStockValidation = () => {
    const [productosValidados, setProductosValidados] = useState([])
    const [validandoStock, setValidandoStock] = useState(false)
    const { 
        pedido, 
        verificarDisponibilidadProductos, 
        limpiarProductosAgotados 
    } = useQuiosco()

    // Función para validar stock cuando cambie el pedido
    const validarStockAutomatico = async () => {
        if (pedido.length === 0) {
            setProductosValidados([])
            return
        }

        try {
            setValidandoStock(true)
            const resultado = await verificarDisponibilidadProductos(pedido)
            
            // Agregar estado de disponibilidad a cada producto
            const productosConEstado = pedido.map(producto => ({
                ...producto,
                disponible: !resultado.productosAgotados.find(agotado => agotado.id === producto.id)
            }))
            
            setProductosValidados(productosConEstado)
        } catch (error) {
            console.error('Error validando stock:', error)
            // En caso de error, asumir que todos están disponibles
            setProductosValidados(pedido.map(p => ({...p, disponible: true})))
        } finally {
            setValidandoStock(false)
        }
    }

    // Función manual para limpiar productos agotados
    const limpiarAgotadosManualmente = async () => {
        try {
            setValidandoStock(true)
            const resultado = await verificarDisponibilidadProductos(pedido)
            
            if (!resultado.todosDisponibles) {
                limpiarProductosAgotados(resultado.productosAgotados)
                toast.success('Productos agotados eliminados del carrito')
                return true
            }
            return false
        } catch (error) {
            toast.error('Error al verificar disponibilidad')
            return false
        } finally {
            setValidandoStock(false)
        }
    }

    // Efecto para validar stock cuando cambie el pedido
    useEffect(() => {
        const timer = setTimeout(() => {
            validarStockAutomatico()
        }, 2000) // Validar después de 2 segundos de inactividad

        return () => clearTimeout(timer)
    }, [pedido])

    return {
        productosValidados,
        validandoStock,
        limpiarAgotadosManualmente,
        validarStockManual: validarStockAutomatico
    }
}