export const formatearDinero = cantidad => {
    return cantidad.toLocaleString('es-GT', {
        style: 'currency',
        currency: 'GTQ'
    })
}