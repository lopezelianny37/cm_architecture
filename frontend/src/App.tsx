import { useEffect, useState } from 'react';
import { AUTH_EXPIRED_EVENT, getToken } from './lib/apiClient';
import { login, signup, logout } from './lib/authSession';
import { exportAllRecords, importBackupFile } from './lib/exportImport';
import { useToast } from './hooks/useToast';
import { Home } from './pages/Home';
import { FormView } from './pages/FormView';
import { ImportModal } from './components/ImportModal';
import { Toast } from './components/Toast';

// TODO Fase 7/9: reemplazar por el flujo de login/registro real del SPEC.
function LoginBridge({
  onAuthenticated,
  sessionExpired,
}: {
  onAuthenticated: () => void;
  sessionExpired: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[360px] mx-auto mt-20 p-6 bg-white border border-[var(--line)] rounded-2xl">
      <h2 className="text-[19px] mb-4">Gemba Arquitectura IB</h2>
      {sessionExpired && (
        <p className="text-[var(--amber)] text-sm mb-3 bg-[#fff4dc] p-2 rounded-lg">
          Tu sesión expiró. Volvé a iniciar sesión para continuar.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border border-[var(--line)] rounded-lg p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border border-[var(--line)] rounded-lg p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-[var(--red)] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border-0 rounded-lg px-[13px] py-2 font-extrabold bg-[var(--navy)] text-white"
        >
          {mode === 'login' ? 'Entrar' : 'Registrarse'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-[var(--mut)] underline"
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Entrá'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => getToken() != null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [homeKey, setHomeKey] = useState(0);
  const toast = useToast();

  async function handleExportAll() {
    try {
      await exportAllRecords();
      toast.show('Respaldo descargado');
    } catch {
      toast.show('No se pudo descargar la información');
    }
  }

  async function handleImport(file: File) {
    try {
      await importBackupFile(file);
      toast.show('Información cargada');
      setImportModalOpen(false);
      setSelectedRecordId(null);
      setHomeKey((k) => k + 1);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'El archivo no es un respaldo válido');
    }
  }

  useEffect(() => {
    function handleAuthExpired() {
      setAuthenticated(false);
      setSelectedRecordId(null);
      setSessionExpired(true);
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  if (!authenticated) {
    return (
      <LoginBridge
        sessionExpired={sessionExpired}
        onAuthenticated={() => {
          setSessionExpired(false);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--line)]">
        <div className="max-w-[1280px] mx-auto px-[18px] py-[10px] flex items-center gap-[14px]">
          <div className="font-extrabold text-[var(--navy)] text-[16px]">
            Experimento Gemba · Arquitectura IB
            <small className="block text-[var(--mut)] text-[11px] font-medium">
              Observación y seguimiento de la aplicación real del nuevo rol
            </small>
          </div>
          <nav className="ml-auto flex gap-[6px] flex-wrap">
            <button
              className="border border-[var(--line)] rounded-lg px-3 py-1 bg-white font-bold text-[#44516a]"
              onClick={handleExportAll}
            >
              Descargar información
            </button>
            <button
              className="border border-[var(--line)] rounded-lg px-3 py-1 bg-white font-bold text-[#44516a]"
              onClick={() => setImportModalOpen(true)}
            >
              Cargar información
            </button>
            <button
              className="border border-[var(--line)] rounded-lg px-3 py-1"
              onClick={() => {
                logout();
                setAuthenticated(false);
              }}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      {selectedRecordId ? (
        <FormView recordId={selectedRecordId} onBack={() => setSelectedRecordId(null)} />
      ) : (
        <Home key={homeKey} onOpenRecord={setSelectedRecordId} />
      )}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
      <Toast message={toast.message} />
    </>
  );
}

export default App;
