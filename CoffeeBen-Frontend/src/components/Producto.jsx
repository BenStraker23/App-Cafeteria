import { formatearDinero } from "../helpers"
import useQuiosco from "../hooks/useQuiosco" //importamos el custom hook

export default function Producto({ producto, botonAgregar = false, botonDisponible = false, onToggleDisponibilidad }) {

    const { handleClickModal, handleSetProducto, handleClickProductoAgotado  } = useQuiosco() // Accedemos a la funcion para actualizar el estado del modal desde el contexto

    const { nombre, precio, imagen, disponible, cantidad } = producto

    const manejarToggleDisponibilidad = async () => {
        await handleClickProductoAgotado(producto.id)
        // Llamar callback para refrescar datos si existe
        if (onToggleDisponibilidad) {
            onToggleDisponibilidad()
        }
    }

    return (
        <div className={`border p-3 shadow relative ${
            botonDisponible && !disponible ? 'bg-red-50 border-red-300' : 'bg-white'
        }`}>
            {botonDisponible && !disponible && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                    AGOTADO
                </div>
            )}
            
            <img
                alt={`imagen ${nombre}`}
                className={`w-full ${!disponible && botonDisponible ? 'opacity-50 filter grayscale' : ''}`}
                src={`/img/${imagen}.jpg`}
            />
            <div className="p-5">
                <h3 className={`text-2xl font-bold ${
                    botonDisponible && !disponible ? 'text-gray-500' : ''
                }`}>
                    {nombre}
                </h3>
                {cantidad && (
                    <p className={`text-sm mt-2 font-medium ${
                        botonDisponible && !disponible ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Cantidad: {cantidad}
                    </p>
                )}
                <p className={`mt-5 font-black text-4xl ${
                    botonDisponible && !disponible ? 'text-gray-400' : 'text-amber-500'
                }`}>
                    {formatearDinero(precio)}
                </p>

                {botonAgregar && disponible !== false && (
                    <button
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold"
                        onClick={() => {
                            handleClickModal();
                            handleSetProducto(producto);
                        }}
                    >
                        Agregar
                    </button>
                )}

                {botonAgregar && disponible === false && (
                    <button
                        type="button"
                        className="bg-gray-400 text-white w-full mt-5 p-3 uppercase font-bold cursor-not-allowed"
                        disabled
                    >
                        No Disponible
                    </button>
                )}

                {botonDisponible && (
                    <button
                        type="button"
                        className={`w-full mt-5 p-3 uppercase font-bold transition-colors ${
                            disponible 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        onClick={manejarToggleDisponibilidad}
                    >
                        {disponible ? 'Marcar Agotado' : 'Marcar Disponible'}
                    </button>
                )}

            </div>

        </div>
    )
}