import { useState } from 'react';
import { Bot, Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { translateSupabaseError } from '@/lib/supabaseErrors';
import { toast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(translateSupabaseError(error));
        }
      } else {
        if (!name.trim()) {
          setError('Informe seu nome.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(translateSupabaseError(error));
        } else {
          toast({
            title: 'Cadastro realizado!',
            description: 'Verifique seu e-mail para confirmar a conta.',
          });
          setMode('login');
        }
      }
    } catch (err) {
      setError(translateSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3">
            <Bot size={28} className="text-accent-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">PMbOt INPASA</h1>
          <p className="text-xs text-muted-foreground mt-1">Assessor de Planejamento</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-foreground">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          {mode === 'signup' && (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            {mode === 'login' ? (
              <>Não tem conta? <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-accent hover:underline">Cadastre-se</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-accent hover:underline">Entrar</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
