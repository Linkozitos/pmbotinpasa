import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Settings2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SetupPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || '');

  const handleSave = () => {
    if (!url.trim() || !key.trim()) {
      toast({
        title: "Erro",
        description: "Preencha ambos os campos.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('SUPABASE_URL', url.trim());
    localStorage.setItem('SUPABASE_ANON_KEY', key.trim());

    toast({
      title: "Configuração salva!",
      description: "Recarregando o aplicativo...",
    });

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleClear = () => {
    localStorage.removeItem('SUPABASE_URL');
    localStorage.removeItem('SUPABASE_ANON_KEY');
    setUrl('');
    setKey('');
    toast({
      title: "Configuração limpa",
      description: "Os dados locais foram removidos.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Settings2 size={20} />
            </div>
            <CardTitle className="text-xl">Configuração Necessária</CardTitle>
          </div>
          <CardDescription>
            As variáveis de ambiente do Supabase não foram detectadas. Configure-as manualmente para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL do Supabase</Label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                id="url" 
                placeholder="https://xxxx.supabase.co" 
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Publishable Key (anon/public)</Label>
            <Input 
              id="key" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full gap-2" onClick={handleSave}>
            <RefreshCw size={16} /> Salvar e Recarregar
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleClear}>
            Limpar configuração local
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
