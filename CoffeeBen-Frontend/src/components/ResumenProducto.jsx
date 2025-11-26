import useQuiosco from "../hooks/useQuiosco";
import { formatearDinero } from "../helpers";

export default function ResumenProducto({producto, disponible = true}) {

    const { handleEditarCantidad, handleEliminarProductoPedido } = useQuiosco()
    
    const { id, nombre, precio, cantidad } = producto

    return (
        <div className={`shadow space-y-1 p-4 border-b relative ${
            disponible ? 'bg-white' : 'bg-red-50 border-red-200'
        }`}>
            {!disponible && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    AGOTADO
                </div>
            )}
            
            <div className="space-y-2">
                <p className={`text-xl font-bold ${!disponible ? 'text-gray-500 line-through' : ''}`}>
                    {nombre}
                </p>
                <p className={`text-lg font-bold ${disponible ? 'text-amber-500' : 'text-gray-400'}`}>
                    Cantidad: {cantidad}
                </p>
                <p className={`text-lg font-bold ${disponible ? 'text-slate-600' : 'text-gray-400'}`}>
                    Precio: {formatearDinero(precio)}
                </p>
                <p className={`text-sm ${disponible ? 'text-gray-700' : 'text-gray-400'}`}>
                    Subtotal: {formatearDinero(precio * cantidad)}
                </p>
                
                {!disponible && (
                    <p className="text-sm text-red-600 font-medium bg-red-100 p-2 rounded">
                        ⚠️ Este producto ya no está disponible y será eliminado al procesar el pedido.
                    </p>
                )}
            </div>

            <div className={`flex gap-2 pb-4 ${!disponible ? 'opacity-50' : ''}`}>
                <button
                    type="button"
                    className={`bg-sky-700 hover:bg-sky-800 flex px-5 py-2 text-white rounded-md font-bold uppercase shadow-md text-center ${
                        !disponible ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => disponible && handleEditarCantidad(id)}
                    disabled={!disponible}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>

                    {disponible ? 'Editar' : 'No Disponible'}
                </button>

                <button
                    type="button"
                    className="bg-red-700 hover:bg-red-800 flex px-5 py-2 text-white rounded-md font-bold uppercase shadow-md text-center"
                    onClick={() => handleEliminarProductoPedido(id)}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>

                    Eliminar
                </button>
            </div>
        </div>
    )
}