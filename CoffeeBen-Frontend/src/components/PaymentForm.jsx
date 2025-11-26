import { useState } from 'react'

export default function PaymentForm({ total, onSubmit, onCancel, loading }) {
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: ''
    })

    const [errors, setErrors] = useState({})

    const formatCardNumber = (value) => {
        // Remover todo excepto numeros
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        // Agregar espacios cada 4 digitos
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        if (parts.length) {
            return parts.join(' ')
        } else {
            return v
        }
    }

    const formatExpiry = (value, field) => {
        const v = value.replace(/\D/g, '')
        if (field === 'month') {
            if (parseInt(v) > 12) return '12'
            if (parseInt(v) < 1 && v.length === 2) return '01'
        }
        return v
    }

    const validateCard = (number) => {
        // Algoritmo de Luhn para validacion
        const cleanNumber = number.replace(/\s+/g, '')
        if (!/^\d+$/.test(cleanNumber)) return false
        
        let sum = 0
        let alternate = false
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let n = parseInt(cleanNumber.charAt(i), 10)
            if (alternate) {
                n *= 2
                if (n > 9) n = (n % 10) + 1
            }
            sum += n
            alternate = !alternate
        }
        return (sum % 10) === 0
    }

    const validateForm = () => {
        const newErrors = {}
        const cleanCardNumber = paymentData.cardNumber.replace(/\s+/g, '')

        // Validar numero de tarjeta
        if (!paymentData.cardNumber) {
            newErrors.cardNumber = 'El numero de tarjeta es requerido'
        } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            newErrors.cardNumber = 'Numero de tarjeta invalido'
        } else if (!validateCard(paymentData.cardNumber)) {
            newErrors.cardNumber = 'Numero de tarjeta invalido'
        }

        // Validar fecha de expiracion
        if (!paymentData.expiryMonth || !paymentData.expiryYear) {
            newErrors.expiry = 'La fecha de expiracion es requerida'
        } else {
            const month = parseInt(paymentData.expiryMonth)
            const year = parseInt('20' + paymentData.expiryYear)
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth() + 1

            if (month < 1 || month > 12) {
                newErrors.expiry = 'Mes invalido'
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiry = '⏰ Su tarjeta ha expirado. Por favor, utilice una tarjeta vigente.'
            }
        }

        // Validar CVV
        if (!paymentData.cvv) {
            newErrors.cvv = 'El CVV es requerido'
        } else if (paymentData.cvv.length !== 3) {
            newErrors.cvv = 'CVV debe tener 3 digitos'
        }

        // Validar nombre del titular
        if (!paymentData.holderName) {
            newErrors.holderName = 'El nombre del titular es requerido'
        } else if (paymentData.holderName.length < 2) {
            newErrors.holderName = 'Nombre muy corto'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        let formattedValue = value

        switch (name) {
            case 'cardNumber':
                formattedValue = formatCardNumber(value)
                if (formattedValue.replace(/\s+/g, '').length > 19) return
                break
            case 'expiryMonth':
                formattedValue = formatExpiry(value, 'month')
                if (formattedValue.length > 2) return
                break
            case 'expiryYear':
                formattedValue = formatExpiry(value, 'year')
                if (formattedValue.length > 2) return
                break
            case 'cvv':
                formattedValue = value.replace(/\D/g, '')
                if (formattedValue.length > 3) return
                break
            case 'holderName':
                formattedValue = value.toUpperCase()
                break
        }

        setPaymentData({
            ...paymentData,
            [name]: formattedValue
        })

        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (validateForm()) {
            const cleanCardNumber = paymentData.cardNumber.replace(/\s+/g, '')
            const formattedData = {
                pan: cleanCardNumber,
                exp_mm: paymentData.expiryMonth.padStart(2, '0'),
                exp_yy: paymentData.expiryYear.padStart(2, '0'),
                cvv: paymentData.cvv,
                holder_name: paymentData.holderName,
                amount: total
            }
            onSubmit(formattedData)
        }
    }

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(amount)
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Pago con Tarjeta</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-amber-800 text-sm">
                        Total a pagar: <span className="font-bold text-lg">{formatAmount(total)}</span>
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Numero de tarjeta */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero de Tarjeta
                    </label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                    )}
                </div>

                {/* Fecha de expiracion y CVV */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mes
                        </label>
                        <input
                            type="text"
                            name="expiryMonth"
                            value={paymentData.expiryMonth}
                            onChange={handleInputChange}
                            placeholder="12"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors.expiry ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Año
                        </label>
                        <input
                            type="text"
                            name="expiryYear"
                            value={paymentData.expiryYear}
                            onChange={handleInputChange}
                            placeholder="28"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors.expiry ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            type="text"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors.cvv ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                    </div>
                </div>
                {errors.expiry && (
                    <p className="text-red-500 text-xs">{errors.expiry}</p>
                )}
                {errors.cvv && (
                    <p className="text-red-500 text-xs">{errors.cvv}</p>
                )}

                {/* Nombre del titular */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Titular
                    </label>
                    <input
                        type="text"
                        name="holderName"
                        value={paymentData.holderName}
                        onChange={handleInputChange}
                        placeholder="JUAN PEREZ"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors.holderName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.holderName && (
                        <p className="text-red-500 text-xs mt-1">{errors.holderName}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`flex-1 px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Pagar Ahora'}
                    </button>
                </div>
            </form>

            {/* Informacion de tarjetas de prueba */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Tarjetas de Prueba:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                    <div>• 4111 1111 1111 1111 (Exp: 12/28) - Aprobada</div>
                    <div>• 5555 5555 5555 4444 (Exp: 10/27) - Aprobada</div>
                    <div>• 4000 0000 0000 0002 (Exp: 06/26) - Fondos bajos</div>
                </div>
            </div>
        </div>
    )
}