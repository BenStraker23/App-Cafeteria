import useSWR from 'swr'
import { useState } from 'react'
import clienteAxios from '../config/axios'
import Producto from '../components/Producto'
import useQuiosco from '../hooks/useQuiosco'

export default function Productos() {
  const [categoriaFiltro, setCategoriaFiltro] = useState(0) // 0 = todas las categorías
  const { categorias } = useQuiosco()

  const token = localStorage.getItem('AUTH_TOKEN')
  const fetcher = () => clienteAxios('/api/productos-admin', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(datos => datos.data)

  const { data, error, isLoading, mutate } = useSWR('/api/productos-admin', fetcher, {refreshInterval: 10000})
  
  if(isLoading) return 'Cargando...'

  // Filtrar productos por categoría
  const productosFiltrados = categoriaFiltro === 0 
    ? data.data // Mostrar todos los productos
    : data.data.filter(producto => producto.categoria_id === categoriaFiltro)

  // Función para contar productos por categoría
  const contarProductosPorCategoria = (categoriaId) => {
    return data.data.filter(producto => producto.categoria_id === categoriaId).length
  }

  return (
    <div>
        <h1 className='text-4xl font-black'>Gestión de Productos</h1>
        <p className='text-2xl my-10'>
          Administra la disponibilidad de productos desde aquí. Los productos agotados aparecen con fondo rojo.
        </p>

        {/* Filtro de categorías */}
        <div className='mb-8'>
          <h3 className='text-lg font-bold mb-4'>Filtrar por categoría:</h3>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => setCategoriaFiltro(0)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                categoriaFiltro === 0
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              Todas las categorías
              <span className={`px-2 py-1 rounded-full text-xs ${
                categoriaFiltro === 0 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {data.data.length}
              </span>
            </button>
            
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaFiltro(categoria.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  categoriaFiltro === categoria.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                {categoria.nombre}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  categoriaFiltro === categoria.id 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {contarProductosPorCategoria(categoria.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Información de productos mostrados */}
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-blue-800 font-medium'>
            {categoriaFiltro === 0 
              ? `Mostrando todos los productos (${productosFiltrados.length} productos)`
              : `Mostrando productos de "${categorias.find(cat => cat.id === categoriaFiltro)?.nombre}" (${productosFiltrados.length} productos)`
            }
          </p>
        </div>

        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
          {productosFiltrados.length === 0 ? (
            <div className='col-span-full text-center py-12'>
              <div className='text-gray-400 text-6xl mb-4'>📦</div>
              <p className='text-xl text-gray-500 font-medium'>
                {categoriaFiltro === 0 
                  ? 'No hay productos disponibles'
                  : `No hay productos en la categoría "${categorias.find(cat => cat.id === categoriaFiltro)?.nombre}"`
                }
              </p>
            </div>
          ) : (
            productosFiltrados.map(producto => (
                <Producto
                  key={producto.id}
                  producto={producto}
                  botonDisponible={true}
                  onToggleDisponibilidad={() => mutate()} // Refrescar datos cuando cambie disponibilidad
                />
            ))
          )}
        </div>
    </div>
  )
}