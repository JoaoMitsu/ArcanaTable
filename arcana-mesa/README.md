# Arcana Mesa — workspace de RPG

Uma aplicação web de apoio a RPGs de mesa com visual escuro, acentos violeta e dourado, inspirada em mesas virtuais modernas sem copiar a interface de nenhuma plataforma específica.

## O que já funciona

- **7 perfis de acesso de demonstração:** Jogador 1 a Jogador 6 e Mestre.
- **Espaços separados:** cada conta possui seu próprio conjunto de campanhas, personagens, registros de mundo/lore, anotações, sessões e sistemas.
- **Campanhas:** criar, editar e remover campanhas; definir sistema, cenário, status, resumo e próxima sessão.
- **Fichas digitais:** criar personagens; editar nível, conceito, atributos, perícias, vida, mente/mana, inventário, biografia e anotações.
- **Rolador de dados:** d4, d6, d8, d10, d12, d20 e d100, múltiplos dados, modificadores, vantagem/desvantagem e histórico.
- **Mundo & Lore:** entradas categorizadas para locais, personagens, facções, lendas, relíquias e mistérios; campo de visibilidade.
- **Anotações:** caderno com busca e notas fixadas.
- **Sessões:** calendário, estado, resumo/recap e linha do tempo.
- **Sistemas editáveis:** modelos de D&D 5e, Ordem Paranormal e Terras Longínquas; campos para atributos, perícias, regras da casa e fórmula de teste.
- **Escudo do mestre:** painel para consultar os seis espaços de jogador e abrir/administrar fichas e conteúdo.
- **Layout responsivo:** funciona em desktop, tablet e celular.

## Rodar no VS Code

1. Instale uma versão atual do Node.js (LTS recomendado) e o VS Code.
2. Extraia a pasta `arcana-mesa` e abra essa pasta no VS Code.
3. Abra o terminal integrado (`Terminal > New Terminal`).
4. Execute:

```bash
npm install
npm run dev
```

5. Abra o endereço local que o Vite mostrar no terminal (normalmente `http://localhost:5173`).
6. Entre em uma das contas de demonstração listadas abaixo. Cada conta cria e mantém seus dados no `localStorage` desse navegador.

## Contas de demonstração

| Conta | Senha |
|---|---|
| Jogador 1 | `Aurora#101` |
| Jogador 2 | `Bardo#202` |
| Jogador 3 | `Corvo#303` |
| Jogador 4 | `Dragao#404` |
| Jogador 5 | `Eclipse#505` |
| Jogador 6 | `Fenix#606` |
| Mestre | `Mestre#990` |

**Importante:** o modo de demonstração não é autenticação segura. As credenciais estão no código do cliente e o armazenamento fica somente no navegador atual. Não use esse modo para dados privados nem conte com ele para compartilhar dados entre dispositivos. Antes de publicar um site para a mesa real, configure o modo de nuvem abaixo e substitua essas senhas por senhas exclusivas.

## Ativar login real e salvamento em nuvem com Supabase

A aplicação já suporta o fluxo de login/salvamento no Supabase, usando o esquema abaixo. No modo conectado, os endereços usados internamente para cada login são aliases fixos (`jogador1@arcana-rpg.com` etc.); não precisam receber e-mail. Crie os usuários no painel do Supabase e marque-os como confirmados, ou desative a confirmação de e-mail no ambiente de testes. **Para uso real, troque todas as senhas de exemplo por senhas fortes.**

1. Crie um projeto em [Supabase](https://supabase.com/).
2. No painel, abra **Authentication → Users** e crie sete usuários com estes e-mails:
   - `jogador1@arcana-rpg.com`
   - `jogador2@arcana-rpg.com`
   - `jogador3@arcana-rpg.com`
   - `jogador4@arcana-rpg.com`
   - `jogador5@arcana-rpg.com`
   - `jogador6@arcana-rpg.com`
   - `mestre@arcana-rpg.com`
3. Defina as senhas que quiser para cada usuário. Elas são cadastradas no Supabase; o código não compara senhas localmente quando o modo de nuvem está ativo.
4. No **SQL Editor** do Supabase, execute o arquivo `supabase/schema.sql` depois de criar os usuários. Ele cria as tabelas, associa cada perfil à respectiva conta e habilita políticas RLS: os jogadores só podem ler/escrever o próprio espaço; o mestre pode consultar e administrar os espaços da mesa.
5. Copie `.env.example` para `.env.local` e preencha as variáveis com a URL do projeto e a **publishable key** do Supabase:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

6. Reinicie o servidor `npm run dev` para carregar as variáveis. Faça login com as novas senhas do Supabase.
7. Antes de disponibilizar o site, teste com duas contas de jogador e a conta Mestre, verificando que um jogador não consegue ler outro espaço.

> O esquema de nuvem sincroniza o conteúdo JSON de cada workspace. A interface de lore com visibilidade “Mestre” funciona como etiqueta visual; se precisar esconder segredos de forma criptograficamente isolada dos jogadores, mova os segredos para uma tabela separada com políticas próprias antes de usar em uma campanha real.

## Publicar no GitHub e Vercel

### Opção A — GitHub + Vercel

1. Crie um repositório vazio no GitHub.
2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Primeira versão do Arcana Mesa"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/arcana-mesa.git
git push -u origin main
```

3. Entre em [Vercel](https://vercel.com/), importe o repositório do GitHub e publique.
4. Para modo local/demonstração, não precisa definir variáveis. Para modo conectado, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nas configurações de Environment Variables da Vercel e faça novo deploy.

O Vercel detecta Vite automaticamente; o comando de build é `npm run build` e a pasta gerada é `dist`.

### Opção B — testar o build antes de publicar

```bash
npm run build
npm run preview
```

## Organização do projeto

```text
arcana-mesa/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── supabase/
│   └── schema.sql
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    └── supabaseClient.js
```

## Como personalizar

- **Identidade visual:** `src/styles.css` — cores, tipografia, espaçamento, cartões e responsividade.
- **Contas de demonstração:** vetor `ACCOUNTS` em `src/App.jsx`. Em produção, use contas do Supabase; não dependa do vetor local.
- **Modelos de sistemas:** `SYSTEM_PRESETS` em `src/App.jsx`; o modelo de Terras Longínquas usa a base autoral informada no pedido.
- **Campos da ficha/editor:** componente `Editor` em `src/App.jsx`.
- **Tabelas e segurança da nuvem:** `supabase/schema.sql`.

## Observações

- A aplicação não é afiliada ao CRIS, à Jambô Editora ou à Wizards of the Coast; o design é uma interpretação original de uma mesa virtual de RPG.
- D&D 5e e Ordem Paranormal estão incluídos como **modelos editáveis de organização**. O projeto não distribui livros, textos completos ou conteúdo oficial desses jogos.
- Esta versão é uma base inicial extensa e executável; funcionalidades como mapa de batalha com tokens, upload de imagens, convites por e-mail, permissões granulares por campanha e colaboração em tempo real podem ser adicionadas em etapas futuras.
