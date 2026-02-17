// Tradução de erros Supabase para PT-BR
const errorMap: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha inválidos.',
  'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
  'new row violates row-level security policy': 'Você não tem permissão para realizar esta ação.',
  'JWT expired': 'Sua sessão expirou. Faça login novamente.',
  'Auth session missing!': 'Sessão não encontrada. Faça login.',
  'duplicate key value violates unique constraint': 'Registro duplicado. Já existe um item com estes dados.',
  'foreign key violation': 'Este registro está vinculado a outros dados e não pode ser alterado.',
  'check constraint': 'Dados inválidos. Verifique os campos e tente novamente.',
  'relation "public.': 'Tabela não encontrada no banco de dados.',
  'Could not find the': 'Recurso não encontrado.',
  'Bucket not found': 'Armazenamento não encontrado.',
  'The object was not found': 'Arquivo não encontrado.',
  'Payload too large': 'Arquivo muito grande. Limite máximo excedido.',
  'permission denied': 'Permissão negada. Você não tem acesso a este recurso.',
  'rate limit': 'Muitas tentativas. Aguarde alguns minutos.',
  'Failed to fetch': 'Falha de conexão. Verifique sua internet.',
  'NetworkError': 'Erro de rede. Verifique sua conexão.',
};

export function translateSupabaseError(error: unknown): string {
  if (!error) return 'Erro desconhecido.';

  const message = typeof error === 'string'
    ? error
    : (error as any)?.message || (error as any)?.error_description || String(error);

  for (const [key, translation] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Generic fallback
  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Não autorizado. Faça login novamente.';
  }
  if (message.includes('403') || message.includes('Forbidden')) {
    return 'Acesso negado.';
  }
  if (message.includes('404')) {
    return 'Recurso não encontrado.';
  }
  if (message.includes('500')) {
    return 'Erro interno do servidor. Tente novamente.';
  }

  return `Erro: ${message}`;
}
