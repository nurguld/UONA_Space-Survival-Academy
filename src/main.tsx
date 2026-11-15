import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { GameProvider } from './context/GameContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </LanguageProvider>
    </HashRouter>
  </StrictMode>,
)