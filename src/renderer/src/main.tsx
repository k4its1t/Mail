import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './apple-theme.css'
import './native-mail-theme.css'

document.documentElement.dataset.platform = navigator.userAgent.includes('Windows') ? 'windows' : 'macos'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
