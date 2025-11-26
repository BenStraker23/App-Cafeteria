import { useState } from 'react'
import Modal from 'react-modal'
import PaymentForm from './PaymentForm'
import { toast } from 'react-toastify'
import useQuiosco from '../hooks/useQuiosco'

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: 0,
        border: 'none',
        borderRadius: '8px'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000
    }
}

export default function PaymentModal({ isOpen, onClose, total, onPaymentSuccess, onPaymentError }) {
    const [loading, setLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(null) // 'processing', 'success', 'error'
    
    const { handleSubmitPagoConTarjeta } = useQuiosco()

    const handlePayment = async (paymentData) => {
        setLoading(true)
        setPaymentStatus('processing')

        try {
            // Usar la función del contexto que maneja la API de Laravel
            const result = await handleSubmitPagoConTarjeta(paymentData)
            
            setPaymentStatus('success')
            
            // Llamar callback de exito con los datos del pago
            onPaymentSuccess({
                transaction_id: result.transaction_id,
                card_last4: result.card_last4,
                amount: result.amount
            })
            
        } catch (error) {
            setPaymentStatus('error')
            let errorMessage = error.message || 'Error al procesar el pago'
            
            // Personalizar mensajes para el modal según el tipo de error
            if (errorMessage.includes('bloqueada')) {
                errorMessage = 'Su tarjeta ha sido bloqueada. Contacte a su banco.'
            } else if (errorMessage.includes('expirado') || errorMessage.includes('expira')) {
                errorMessage = 'Su tarjeta ha expirado. Utilice una tarjeta vigente.'
            } else if (errorMessage.includes('insuficientes')) {
                errorMessage = 'Fondos insuficientes en su tarjeta.'
            }
            
            onPaymentError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setPaymentStatus(null)
            onClose()
        }
    }

    const renderContent = () => {
        if (paymentStatus === 'processing') {
            return (
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Procesando Pago</h3>
                    <p className="text-gray-600">Por favor espere mientras validamos su tarjeta...</p>
                </div>
            )
        }

        if (paymentStatus === 'success') {
            return (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Pago Exitoso</h3>
                    <p className="text-gray-600 mb-4">Su pedido ha sido procesado correctamente.</p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Continuar
                    </button>
                </div>
            )
        }

        if (paymentStatus === 'error') {
            return (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-red-800 mb-2">Pago Rechazado</h3>
                    <p className="text-gray-600 mb-4">
                        Verifique los datos de su tarjeta e intente nuevamente.
                    </p>
                    <div className="space-x-3">
                        <button
                            onClick={() => setPaymentStatus(null)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                        >
                            Intentar de Nuevo
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )
        }

        // Formulario de pago por defecto
        return (
            <PaymentForm
                total={total}
                onSubmit={handlePayment}
                onCancel={handleClose}
                loading={loading}
            />
        )
    }

    return (
        <Modal 
            isOpen={isOpen} 
            style={customStyles}
            onRequestClose={handleClose}
            shouldCloseOnOverlayClick={!loading}
        >
            {renderContent()}
        </Modal>
    )
}