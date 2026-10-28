import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const cloudEnabled = Boolean(url && key);
export const supabase = cloudEnabled ? createClient(url, key) : null;

// Em modo cloud, cada nome de conta corresponde a um usuário criado no Supabase.
// Os endereços são aliases internos: não precisam ser usados para receber e-mails.
export const accountEmail = (loginName) => {
  const slug = loginName.toLowerCase().replaceAll(' ', '').replace('jogador', 'jogador');
  return `${slug}@arcana-rpg.com`;
};
