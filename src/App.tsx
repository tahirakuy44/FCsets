import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, RefreshCw, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { auth, loginWithEmail, logOut } from './lib/firebase';

function CookieCard({ server }: { server: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (server.cookies) {
      navigator.clipboard.writeText(JSON.stringify(server.cookies, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="font-medium text-lg truncate pr-2">{server.label || `Server ${server.id}`}</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
          {copied ? <span className="text-green-600">Copied!</span> : <span>Copy</span>}
        </button>
      </div>
      <div className="p-0 relative bg-gray-50">
        <pre className="p-4 text-xs font-mono text-gray-800 overflow-y-auto whitespace-pre-wrap break-all h-[200px]">
          {JSON.stringify(server.cookies, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await loginWithEmail(email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        setAuthError('Email atau password salah.');
      } else if (error.code === 'auth/user-not-found') {
        setAuthError('Pengguna tidak ditemukan.');
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Password salah.');
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email sudah terdaftar (digunakan).');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password terlalu lemah (minimal 6 karakter).');
      } else if (error.code === 'auth/configuration-not-found') {
        setAuthError('Email/Password Sign-In belum diaktifkan di Firebase Console Anda.');
      } else {
        setAuthError(error.message || 'Gagal melakukan autentikasi.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-light tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Sign in to access FLOW Cookie Sets</p>
          
          {authError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-sm text-left">
              <h2 className="font-semibold mb-1">Error</h2>
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-sans text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-sans text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-light tracking-tight">FLOW Cookie Sets</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{user.email}</span>
            </div>
            <button
              onClick={logOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline-block">Update Cookies</span>
            </button>
          </div>
        </div>
        
        {loading && !data && (
          <div className="flex items-center gap-3 text-gray-500 mb-6">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fetching data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
            <h2 className="font-medium mb-1">Error</h2>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {data && Array.isArray(data) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((server: any, index: number) => (
              <CookieCard key={server.id || index} server={server} />
            ))}
          </div>
        )}

        {data && !Array.isArray(data) && (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl border border-yellow-100">
            Data format is not as expected. Expected an array of servers.
          </div>
        )}
      </div>
    </div>
  );
}
