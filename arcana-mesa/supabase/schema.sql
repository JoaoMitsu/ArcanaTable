-- ARCANA MESA — esquema para autenticação e salvamento na nuvem.
-- 1) Crie os 7 usuários pelo painel Authentication > Users do Supabase.
-- 2) Depois execute este arquivo no SQL Editor para criar perfis e permissões.
-- 3) Usuários usam e-mail-alias interno; não é necessário usá-lo para receber mensagens.

create table if not exists public.rpg_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login_name text not null unique,
  role text not null check (role in ('player', 'master')),
  created_at timestamptz not null default now()
);

create table if not exists public.rpg_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_rpg_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rpg_profiles
    where id = auth.uid() and role = 'master'
  );
$$;

alter table public.rpg_profiles enable row level security;
alter table public.rpg_workspaces enable row level security;

-- Cada jogador só consulta o próprio perfil. O mestre pode consultar os perfis da mesa.
drop policy if exists "profile owner or master can read" on public.rpg_profiles;
create policy "profile owner or master can read"
on public.rpg_profiles for select to authenticated
using (id = auth.uid() or public.is_rpg_master());

-- O jogador acessa o próprio espaço; o mestre pode administrar os espaços da mesa.
drop policy if exists "workspace owner or master can read" on public.rpg_workspaces;
create policy "workspace owner or master can read"
on public.rpg_workspaces for select to authenticated
using (user_id = auth.uid() or public.is_rpg_master());

drop policy if exists "workspace owner or master can insert" on public.rpg_workspaces;
create policy "workspace owner or master can insert"
on public.rpg_workspaces for insert to authenticated
with check (user_id = auth.uid() or public.is_rpg_master());

drop policy if exists "workspace owner or master can update" on public.rpg_workspaces;
create policy "workspace owner or master can update"
on public.rpg_workspaces for update to authenticated
using (user_id = auth.uid() or public.is_rpg_master())
with check (user_id = auth.uid() or public.is_rpg_master());

drop policy if exists "workspace owner or master can delete" on public.rpg_workspaces;
create policy "workspace owner or master can delete"
on public.rpg_workspaces for delete to authenticated
using (user_id = auth.uid() or public.is_rpg_master());

-- Rode este bloco novamente se adicionar ou recriar contas no Supabase.
-- As contas precisam existir em Authentication > Users antes deste INSERT.
insert into public.rpg_profiles (id, login_name, role)
select
  id,
  case email
    when 'jogador1@arcana-rpg.com' then 'Jogador 1'
    when 'jogador2@arcana-rpg.com' then 'Jogador 2'
    when 'jogador3@arcana-rpg.com' then 'Jogador 3'
    when 'jogador4@arcana-rpg.com' then 'Jogador 4'
    when 'jogador5@arcana-rpg.com' then 'Jogador 5'
    when 'jogador6@arcana-rpg.com' then 'Jogador 6'
    when 'mestre@arcana-rpg.com' then 'Mestre'
  end,
  case when email = 'mestre@arcana-rpg.com' then 'master' else 'player' end
from auth.users
where email in (
  'jogador1@arcana-rpg.com', 'jogador2@arcana-rpg.com',
  'jogador3@arcana-rpg.com', 'jogador4@arcana-rpg.com',
  'jogador5@arcana-rpg.com', 'jogador6@arcana-rpg.com',
  'mestre@arcana-rpg.com'
)
on conflict (id) do update
set login_name = excluded.login_name, role = excluded.role;

-- A função e as tabelas não são públicas: clientes não autenticados não recebem acesso.
revoke all on public.rpg_profiles from anon;
revoke all on public.rpg_workspaces from anon;
grant select on public.rpg_profiles to authenticated;
grant select, insert, update, delete on public.rpg_workspaces to authenticated;
