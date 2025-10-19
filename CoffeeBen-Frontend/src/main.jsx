import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider} from 'react-router-dom'
import { QuioscoProvider } from './context/QuioscoProvider.jsx'
import router from './Router.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuioscoProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </QuioscoProvider>  
  </StrictMode>,
)