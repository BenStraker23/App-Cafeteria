import { formatearDinero } from "../helpers";
import useQuiosco from "../hooks/useQuiosco"
import { useStockValidation } from "../hooks/useStockValidation";
import ResumenProducto from "./ResumenProducto";


export default function Resumen() {
    const {pedido, total, handleSubmitNuevaOrden} = useQuiosco();
    const { 
        productosValidados, 
        validandoStock, 
        limpiarAgotadosManualmente 
    } = useStockValidation();

    const comprobarPedido = () => pedido.length === 0;
    
    // Verificar si hay productos agotados en el carrito
    const hayProductosAgotados = productosValidados.some(producto => !producto.disponible);
    
    // Calcular total excluyendo productos agotados
    const totalDisponible = productosValidados
        .filter(producto => producto.disponible)
        .reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

    const handleSubmit = e => {
        e.preventDefault();
        handleSubmitNuevaOrden();
    }
    
    const handleLimpiarAgotados = async () => {
        await limpiarAgotadosManualmente();
    }

    return (
        <aside className="w-72 h-screen overflow-y-scroll p-5">
            <h1 className="text-4xl font-black">
                Mi Pedido
            </h1>
            <p className="text-lg my-5">
                Aquí podrás ver el resumen y totales de tu pedido.
            </p>

            <div className="py-10">
                {pedido.length === 0 ? (
                    <p className="text-center text-2xl">
                        No hay elementos en tu pedido aún
                    </p>
                ) : (
                    <>
                        {validandoStock && (
                            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md text-sm">
                                🔄 Verificando disponibilidad de productos...
                            </div>
                        )}
                        
                        {hayProductosAgotados && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                                <p className="text-red-800 font-medium mb-2">
                                    ⚠️ Algunos productos están agotados
                                </p>
                                <button
                                    type="button"
                                    onClick={handleLimpiarAgotados}
                                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                                    disabled={validandoStock}
                                >
                                    Eliminar productos agotados
                                </button>
                            </div>
                        )}
                        
                        {(productosValidados.length > 0 ? productosValidados : pedido).map(producto => (
                            <ResumenProducto 
                                key={producto.id}
                                producto={producto}
                                disponible={producto.disponible !== false}
                            />
                        ))}
                    </>
                )}
            </div>

            <div className="text-xl mt-10 space-y-2">
                {hayProductosAgotados && (
                    <>
                        <p className="text-gray-500 line-through">
                            Total con agotados: {formatearDinero(total)}
                        </p>
                        <p className="text-green-600 font-bold">
                            Total disponible: {formatearDinero(totalDisponible)}
                        </p>
                    </>
                )}
                {!hayProductosAgotados && (
                    <p>
                        Total: {formatearDinero(total)}
                    </p>
                )}
            </div>

            <form 
                className="w-full"
                onSubmit={handleSubmit}
            >
                <div className="mt-5">
                    <input 
                        type="submit"
                        className={`${comprobarPedido() || hayProductosAgotados ? 
                            'bg-indigo-100 cursor-not-allowed' : 
                            'bg-indigo-600 hover:bg-indigo-800 cursor-pointer'
                        } px-5 py-2 rounded uppercase font-bold text-white text-center w-full transition-colors`}
                        value={
                            hayProductosAgotados 
                                ? "Elimine productos agotados" 
                                : "Confirmar Pedido"
                        }
                        disabled={comprobarPedido() || hayProductosAgotados || validandoStock}
                    />
                    
                    {hayProductosAgotados && (
                        <p className="text-red-600 text-sm mt-2 text-center">
                            No se puede procesar el pedido con productos agotados
                        </p>
                    )}
                </div>
            </form>
        </aside>
    )
}
