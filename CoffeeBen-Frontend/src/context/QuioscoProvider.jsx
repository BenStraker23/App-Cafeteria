import { createContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import clienteAxios from '../config/axios'


const QuioscoContext = createContext();

const QuioscoProvider = ({children}) => {

    const [categorias, setCategorias] = useState([]);
    const [categoriaActual, setCategoriaActual] = useState({}); // Estado para la categoria actual
    const [modal, setModal] = useState(false); // Estado para el modal
    const [producto, setProducto] = useState({}); // Estado para el producto seleccionado
    const [pedido, setPedido] = useState([]); // Estado para el pedido
    const [total, setTotal] = useState(0); // Estado para el total del pedido
    const [modalPago, setModalPago] = useState(false); // Estado para el modal de pago

    useEffect(() => {
        obtenerCategorias()
    }, [])

    useEffect(() => {
        const nuevoTotal = pedido.reduce((total, producto) => (total + (producto.cantidad * producto.precio)), 0);
        setTotal(nuevoTotal);
    }, [pedido])

    const obtenerCategorias = async () => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            const {data} = await clienteAxios('/api/categorias', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setCategorias(data.data)
            setCategoriaActual(data.data[0])
        } catch (error) {
            console.log(error)
        }
    }

    // Función para verificar disponibilidad de productos en tiempo real
    const verificarDisponibilidadProductos = async (productos) => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            const {data} = await clienteAxios('/api/productos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            const productosDisponibles = data.data
            const productosAgotados = []
            const productosValidos = []
            
            productos.forEach(productoPedido => {
                const productoActual = productosDisponibles.find(p => p.id === productoPedido.id)
                
                if (!productoActual || !productoActual.disponible) {
                    productosAgotados.push(productoPedido)
                } else {
                    productosValidos.push(productoPedido)
                }
            })
            
            return {
                productosValidos,
                productosAgotados,
                todosDisponibles: productosAgotados.length === 0
            }
        } catch (error) {
            console.error('Error verificando disponibilidad:', error)
            throw new Error('Error al verificar disponibilidad de productos')
        }
    }

    // Función para limpiar productos agotados del carrito
    const limpiarProductosAgotados = (productosAgotados) => {
        const pedidoActualizado = pedido.filter(producto => 
            !productosAgotados.find(agotado => agotado.id === producto.id)
        )
        setPedido(pedidoActualizado)
        
        // Mostrar mensaje sobre productos eliminados
        if (productosAgotados.length > 0) {
            const nombresAgotados = productosAgotados.map(p => p.nombre).join(', ')
            toast.warning(`Productos agotados eliminados del carrito: ${nombresAgotados}`)
        }
    }

    
    // por convencion las funciones que manejan eventos comienzan con handle
    const handleClickCategoria = id => {
        const categoria = categorias.filter(cat => cat.id === id); // Filtramos la categoria por su id
        setCategoriaActual(categoria[0]); // Actualizamos la categoria actual con la categoria filtrada
    }

    const handleClickModal = () => {
        setModal(!modal) // Funcion para abrir y cerrar el modal
    }

    const handleClickModalPago = () => {
        setModalPago(!modalPago) // Funcion para abrir y cerrar el modal de pago
    }

    const handleSetProducto = producto => {
        setProducto(producto) // Funcion para guardar el producto seleccionado
    }

    const handleAgregarPedido = ({categoria_id, imagen, ...producto}) => {        

        if(pedido.some(pedidoState => pedidoState.id === producto.id)) {
            const pedidoActualizado = pedido.map(pedidoState => pedidoState.id === producto.id ? producto : pedidoState);
            setPedido(pedidoActualizado);
            toast.success('Guardado Correctamente');
        }else {
            setPedido([...pedido, producto]);
            toast.success('Agregado al Pedido');
        }
    }

    const handleEditarCantidad = id => {
        const productoActualizar = pedido.filter(producto => producto.id === id)[0];
        setProducto(productoActualizar);
        setModal(!modal);
    }

    const handleEliminarProductoPedido = id => {
        const pedidoActualizado = pedido.filter(producto => producto.id !== id);
        setPedido(pedidoActualizado);
        toast.success('Producto Eliminado del Pedido');
    }

    // Función para procesar pago con tarjeta
    const handleSubmitPagoConTarjeta = async (paymentData) => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            // Verificar disponibilidad de productos antes del pago
            const verificacion = await verificarDisponibilidadProductos(pedido)
            
            if (!verificacion.todosDisponibles) {
                // Limpiar productos agotados del carrito
                limpiarProductosAgotados(verificacion.productosAgotados)
                
                throw new Error(
                    `Algunos productos de su carrito ya no están disponibles. ` +
                    `Se han eliminado automáticamente. Por favor, revise su pedido e intente nuevamente.`
                )
            }

            const {data} = await clienteAxios.post('/api/payment/process', 
            {
                payment_data: paymentData,
                total,
                productos: verificacion.productosValidos.map(producto => {
                    return {
                        id: producto.id,
                        cantidad: producto.cantidad
                    }
                })
            }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                toast.success(data.message);
                setModalPago(false);
                setPedido([]); // Limpiar pedido después del pago exitoso
                return data;
            } else {
                throw new Error(data.message || 'Error al procesar el pago');
            }

        } catch (error) {
            console.error('Error al procesar pago:', error)
            let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al procesar el pago';
            
            // Personalizar mensajes para casos específicos
            if (errorMessage === 'Tarjeta bloqueada') {
                errorMessage = 'Su tarjeta ha sido bloqueada contacte a su banco. Contacte a su institución financiera para más información.';
            } else if (errorMessage === 'Fecha de expiracion invalida' || errorMessage.includes('expira')) {
                errorMessage = 'Su tarjeta ha expirado. Por favor, utilice una tarjeta vigente o contacte a su banco para renovarla.';
            } else if (errorMessage === 'Fondos insuficientes') {
                errorMessage = 'Fondos insuficientes en su tarjeta. Verifique su saldo o utilice otro método de pago.';
            } else if (errorMessage === 'Tarjeta no encontrada') {
                errorMessage = 'Tarjeta no válida. Verifique los datos ingresados e intente nuevamente.';
            } else if (errorMessage === 'Numero de tarjeta invalido') {
                errorMessage = 'El número de tarjeta ingresado no es válido. Revise los dígitos e intente nuevamente.';
            }
            
            toast.error(errorMessage);
            throw error;
        }
    }

    // Función para crear un nuevo pedido (sin pago - obsoleta, mantener para compatibilidad)
    const handleSubmitNuevaOrden = async () => {
        // Abrir modal de pago en lugar de crear orden directamente
        setModalPago(true);
    }

    const handleClickCompletarPedido = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            await clienteAxios.put(`/api/pedidos/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success('Pedido completado exitosamente')
        } catch (error) {
            console.log(error)
            toast.error('Error al completar el pedido')
        }
    }

    const handleClickCancelarPedido = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            await clienteAxios.put(`/api/pedidos/${id}/cancel`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success('Pedido cancelado exitosamente')
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.error || 'Error al cancelar el pedido'
            toast.error(errorMessage)
        }
    }

    const handleClickProductoAgotado = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            const {data} = await clienteAxios.put(`/api/productos/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            // Mostrar mensaje basado en la respuesta del backend
            if (data.message) {
                toast.success(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Error al cambiar disponibilidad del producto')
        }
    }

    return (
        <QuioscoContext.Provider
            value={{
                categorias,
                categoriaActual, // Pasamos la categoria actual al contexto,
                handleClickCategoria, // Pasamos la funcion para actualizar la categoria actual al contexto
                modal, // Pasamos el estado del modal al contexto
                handleClickModal, // Pasamos la funcion para actualizar el estado del modal al contexto
                producto, // Pasamos el estado del producto seleccionado al contexto
                handleSetProducto, // Pasamos la funcion para actualizar el estado del producto al contexto
                pedido, // Pasamos el estado del pedido al contexto
                handleAgregarPedido, // Pasamos la funcion para agregar productos al pedido al contexto
                handleEditarCantidad, // Pasamos la funcion para editar cantidad al contexto
                handleEliminarProductoPedido, // Pasamos la funcion para eliminar productos del pedido al contexto
                total, // Pasamos el total del pedido al contexto
                handleSubmitNuevaOrden, // Pasamos la funcion para crear nueva orden al contexto
                modalPago, // Pasamos el estado del modal de pago al contexto
                handleClickModalPago, // Pasamos la funcion para abrir/cerrar modal de pago al contexto
                handleSubmitPagoConTarjeta, // Pasamos la funcion para procesar pago con tarjeta al contexto
                handleClickCompletarPedido,
                handleClickCancelarPedido, // Nueva función para cancelar pedidos
                handleClickProductoAgotado,
                verificarDisponibilidadProductos, // Nueva función para verificar stock
                limpiarProductosAgotados // Nueva función para limpiar productos agotados
            }}
        >{children}</QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext