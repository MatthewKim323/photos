import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PhotoStack } from './components/PhotoStack'

const isolated = new URLSearchParams(location.search).get('clone') === 'photo-stack'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isolated ? (
      <div className="clone-stage">
        <PhotoStack />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
)
