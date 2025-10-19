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

    
    // por convencion las funciones que manejan eventos comienzan con handle
    const handleClickCategoria = id => {
        const categoria = categorias.filter(cat => cat.id === id); // Filtramos la categoria por su id
        setCategoriaActual(categoria[0]); // Actualizamos la categoria actual con la categoria filtrada
    }

    const handleClickModal = () => {
        setModal(!modal) // Funcion para abrir y cerrar el modal
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

    // Función para crear un nuevo pedido
    const handleSubmitNuevaOrden = async () => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            const {data} = await clienteAxios.post('/api/pedidos', 
            {
                total,
                productos: pedido.map(producto => {
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

            toast.success(data.message);
            setTimeout(() => {
                setPedido([])
            }, 1000);

        } catch (error) {
            console.log(error)
        }
    }

    const handleClickCompletarPedido = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            await clienteAxios.put(`/api/pedidos/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const handleClickProductoAgotado = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')
        try {
            await clienteAxios.put(`/api/productos/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch (error) {
            console.log(error)
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
                handleClickCompletarPedido,
                handleClickProductoAgotado
            }}
        >{children}</QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext