import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PublicMotivatorsWizard } from './pages/public/PublicMotivatorsWizard'

// Only two "routes" exist in the whole app (the authenticated app, and this
// one public, login-free wizard), so a full router is unwarranted — a
// single pathname check at the root is enough and keeps the public page
// free of the authenticated app's header/nav chrome entirely.
function Root() {
  if (window.location.pathname === '/motivadores') {
    return <PublicMotivatorsWizard />
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
