import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import './index.css'

import core from './core'

core.firebase.initialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
