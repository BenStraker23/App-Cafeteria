import useQuiosco from "../hooks/useQuiosco" //importamos el custom hook

export default function Categoria({ categoria }) {

    const { handleClickCategoria, categoriaActual } = useQuiosco() // agregamos categoriaActual

  const { icono, id, nombre } = categoria
  
  // funcion para resaltar la categoria actual
  const resaltarCategoriaActual = () => categoriaActual.id === id ? 'bg-amber-400' : 'bg-white'
  
  // función para obtener la imagen correcta según la categoría
  const obtenerImagenCategoria = (nombre) => {
    const mapeoImagenes = {
      'Café': 'coffee.jpg',
      'Hamburguesas': 'hamburguesas_01.jpg', 
      'Pizzas': 'pizzas_01.jpg',
      'Donas': 'donas_01.jpg',
      'Pasteles': 'pastel_01.jpg',
      'Galletas': 'galletas_01.jpg'
    }
    return mapeoImagenes[nombre] || 'coffee.jpg'
  }

  return (
    //Ahora vamos a agregar una clase condicional para resaltar la categoria actual
    //convertimos el string en un template string usando las comillas invertidas ``
    //y agregamos la clase condicional usando el operador ternario
    <div className={`${resaltarCategoriaActual()} flex items-center gap-4 border w-full p-3 hover:bg-amber-400 cursor-pointer`}>
      <img 
            alt="Imagen Icono"
            src={`/img/${obtenerImagenCategoria(nombre)}`}
            className="w-12 h-12 object-cover rounded"
        />
        <button 
            className="text-lg font-bold cursor-pointer truncate"
            type="button"
            onClick={() => handleClickCategoria(id)} // Actualizamos la categoria actual al hacer click en una categoria
            >
            {nombre}
        </button>
    </div>
  )
}