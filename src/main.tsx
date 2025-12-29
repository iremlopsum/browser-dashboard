import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import core from './core'

import './index.css'

core.firebase.initialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
