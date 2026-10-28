import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Archive, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, BookMarked,
  CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Cloud,
  Compass, Copy, Crown, Dice5, Download, Eye, FileText, Flame, Globe2, Heart,
  KeyRound, LayoutDashboard, LogOut, Menu, Minus, MoreHorizontal, Plus, ScrollText,
  Search, Settings2, Shield, ShieldCheck, Sparkles, Target, Trash2, Users,
  WandSparkles, X, Zap, Save, Scroll, Pencil, CircleUserRound, SlidersHorizontal,
  RotateCcw, UserRound,
} from 'lucide-react';
import { cloudEnabled, supabase, accountEmail } from './supabaseClient';

const ACCOUNTS = [
  { name: 'Jogador 1', role: 'player', password: 'Aurora#101' },
  { name: 'Jogador 2', role: 'player', password: 'Bardo#202' },
  { name: 'Jogador 3', role: 'player', password: 'Corvo#303' },
  { name: 'Jogador 4', role: 'player', password: 'Dragao#404' },
  { name: 'Jogador 5', role: 'player', password: 'Eclipse#505' },
  { name: 'Jogador 6', role: 'player', password: 'Fenix#606' },
  { name: 'Mestre', role: 'master', password: 'Mestre#990' },
];
const SYSTEM_PRESETS = [
  { name: 'D&D 5e', summary: 'Fantasia heroica, exploração e aventuras por níveis.', attributes: 'Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma', skills: 'Acrobacia, Arcanismo, Atletismo, Atuação, Enganação, Furtividade, História, Intimidação, Intuição, Investigação, Lidar com Animais, Medicina, Natureza, Percepção, Persuasão, Prestidigitação, Religião, Sobrevivência', rules: 'Use esta área para registrar as regras adotadas na sua mesa, referências de página e exceções da campanha. Conteúdo oficial não incluído.', dice: 'd20 + modificador' },
  { name: 'Ordem Paranormal', summary: 'Investigação, horror e mistérios além da realidade.', attributes: 'Agilidade, Intelecto, Presença, Força, Vigor', skills: 'Adicione aqui as perícias e treinamentos da sua mesa', rules: 'Registre a regra da casa, condições, pistas, rituais permitidos e decisões do mestre. Conteúdo oficial não incluído.', dice: 'd20 + treinamento' },
  { name: 'Terras Longínquas', summary: 'Sistema autoral: atributos, recursos, perícias e escolhas livres.', attributes: 'Força, Agilidade, Resistência, Carisma, Inteligência', skills: 'Mira, Combate, Diplomacia, Roubo, Reflexo, Sobrevivência, Fortitude, Atletismo, Medicina, Intimidar, História/Religião, Saúde, Furtividade, Mente, Profissão', rules: 'Vida: 15 + 4 por ponto em Resistência. Mente/Mana: 15 + 4 por ponto em Carisma. Distribua 5 pontos; máximo de 3 em um atributo. Comece com 2 perícias e 3 itens: 1 de dano e 2 utensílios.', dice: 'd20 + atributo/perícia' },
];
const TERRAS_SKILLS = [
  ['Mira', 'Agilidade'], ['Combate', 'Força / Agilidade'], ['Diplomacia', 'Carisma / Inteligência'],
  ['Roubo', 'Inteligência / Agilidade'], ['Reflexo', 'Agilidade'], ['Sobrevivência', 'Inteligência'],
  ['Fortitude', 'Resistência / Força'], ['Atletismo', 'Força / Resistência / Agilidade'], ['Medicina', 'Inteligência'],
  ['Intimidar', 'Carisma / Força'], ['História/Religião', 'Inteligência'], ['Saúde', 'Resistência'],
  ['Furtividade', 'Agilidade'], ['Mente', 'Carisma'], ['Profissão', 'Livre'],
];
const uuid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const deepCopy = (v) => JSON.parse(JSON.stringify(v));

function seedWorkspace(loginName = 'Jogador 1') {
  const isMaster = loginName === 'Mestre';
  const n = Math.max(1, Number(loginName.match(/\d+/)?.[0] || 1));
  const personas = ['Aelys Vesper', 'Darian Vale', 'Íria Noctis', 'Kael Ardent', 'Nym Valora', 'Orin Bell'];
  const person = personas[n - 1] || 'Aventureiro';
  return {
    campaigns: isMaster ? [
      { id: uuid(), title: 'A Coroa de Cinzas', system: 'Terras Longínquas', setting: 'Reinos de Vhaloren', status: 'Em andamento', description: 'Uma coroa esquecida reapareceu nas ruínas de um reino que ninguém se lembra de ter existido.', nextSession: 'Sábado · 19:00', sessions: 4, accent: 'violet' },
      { id: uuid(), title: 'Ecos sob a Névoa', system: 'Ordem Paranormal', setting: 'Santa Bruma, 1998', status: 'Preparação', description: 'Desaparecimentos, fitas danificadas e uma estação de rádio que transmite vozes do futuro.', nextSession: 'A definir', sessions: 1, accent: 'blue' },
    ] : [
      { id: uuid(), title: 'A Coroa de Cinzas', system: 'Terras Longínquas', setting: 'Reinos de Vhaloren', status: 'Em andamento', description: 'Uma coroa esquecida reapareceu nas ruínas de um reino que ninguém se lembra de ter existido.', nextSession: 'Sábado · 19:00', sessions: 4, accent: 'violet' },
    ],
    characters: isMaster ? [] : [{
      id: uuid(), name: person, concept: ['Cartógrafa das estrelas', 'Espadachim errante', 'Oráculo das marés', 'Guardião exilado', 'Alquimista de campo', 'Batedor das fronteiras'][n - 1],
      system: n % 2 === 0 ? 'D&D 5e' : 'Terras Longínquas', level: 1, player: loginName,
      biography: 'Há páginas em branco na história deste personagem. Preencha-as durante a aventura.',
      attributes: { Força: 1, Agilidade: 1, Resistência: 1, Carisma: 1, Inteligência: 1 },
      hp: 19, maxHp: 19, mana: 19, maxMana: 19, inventory: ['Arma de treino', 'Kit de viagem', 'Caderno de campo'], skills: ['Percepção', 'Sobrevivência'], notes: '',
    }],
    lore: [
      { id: uuid(), title: 'Vhaloren, o reino dividido', category: 'Local', body: 'Um território de fortalezas antigas, estradas quebradas e cidades que disputam a memória de um mesmo passado.', visibility: 'Mesa' },
      { id: uuid(), title: 'A lenda das sete brasas', category: 'Lenda', body: 'Dizem que sete brasas foram escondidas para impedir que uma guerra antiga voltasse a nascer.', visibility: 'Mesa' },
    ],
    notes: [
      { id: uuid(), title: 'Perguntar sobre a torre', category: 'Sessão', content: 'O mercador evitou falar da torre no horizonte. Descobrir por quê.', pinned: true },
      { id: uuid(), title: 'Ideia de personagem', category: 'Ideia', content: 'Uma promessa que custa mais do que ouro.', pinned: false },
    ],
    systems: deepCopy(SYSTEM_PRESETS).map((s) => ({ ...s, id: uuid() })),
    sessions: [
      { id: uuid(), title: 'Capítulo I — Cinzas no caminho', date: '2026-11-01', status: 'Concluída', recap: 'O grupo encontrou marcas estranhas na estrada e um símbolo gravado em pedra.' },
      { id: uuid(), title: 'Capítulo II — A porta sem chave', date: '2026-11-08', status: 'Planejada', recap: 'Explorar a ruína e descobrir o que os viajantes escondem.' },
    ],
    createdAt: new Date().toISOString(),
  };
}
function readLocalWorkspace(loginName) {
  const key = `arcana_workspace_${loginName}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.warn('Não foi possível ler o espaço local.', e); }
  const workspace = seedWorkspace(loginName);
  try { localStorage.setItem(key, JSON.stringify(workspace)); } catch (e) { console.warn(e); }
  return workspace;
}
function parsePairs(value) {
  return Object.fromEntries(String(value || '').split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
    const [k, ...rest] = part.split(':');
    const parsed = Number(rest.join(':').trim());
    return [k.trim(), rest.length && Number.isFinite(parsed) ? parsed : (rest.join(':').trim() || 1)];
  }));
}
const pairsToText = (obj) => Object.entries(obj || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
const arrayToText = (obj) => (obj || []).join(', ');
const byType = { campaign: 'campaigns', character: 'characters', lore: 'lore', note: 'notes', system: 'systems', session: 'sessions' };

function Modal({ title, subtitle, onClose, children, footer }) {
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal-panel" role="dialog" aria-modal="true">
      <div className="modal-heading"><div><div className="eyebrow">EDITOR DE CONTEÚDO</div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={18}/></button></div>
      <div className="modal-content">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </section>
  </div>;
}
function Field({ field, value, onChange }) {
  const common = { value: value ?? '', onChange: (e) => onChange(field.name, e.target.value), placeholder: field.placeholder || '', required: field.required || false };
  return <label className={`field ${field.wide ? 'wide' : ''}`}><span>{field.label}{field.required && <i> *</i>}</span>
    {field.type === 'textarea' ? <textarea {...common} rows={field.rows || 4} /> : field.type === 'select' ? <select {...common}>{(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select> : <input {...common} type={field.type || 'text'} min={field.min} max={field.max} />}
    {field.help && <small>{field.help}</small>}
  </label>;
}
function Editor({ modal, onClose, onSave }) {
  const type = modal.type;
  const isEdit = Boolean(modal.item?.id);
  const getInitial = () => {
    const item = modal.item || {};
    const base = {
      campaign: { title: '', system: 'Terras Longínquas', setting: '', status: 'Em andamento', description: '', nextSession: '' },
      character: { name: '', concept: '', system: 'Terras Longínquas', level: '1', player: 'Jogador 1', biography: '', attributesText: 'Força: 1, Agilidade: 1, Resistência: 1, Carisma: 1, Inteligência: 1', hp: '19', maxHp: '19', mana: '19', maxMana: '19', inventoryText: 'Item de dano, Utensílio, Utensílio', skillsText: 'Percepção, Sobrevivência', notes: '' },
      lore: { title: '', category: 'Local', body: '', visibility: 'Mesa' },
      note: { title: '', category: 'Ideia', content: '', pinned: 'Não' },
      system: { name: '', summary: '', attributesText: '', skillsText: '', rules: '', dice: 'd20 + modificador' },
      session: { title: '', date: '2026-11-01', status: 'Planejada', recap: '' },
    }[type];
    const values = { ...base, ...item };
    if (type === 'character') Object.assign(values, { attributesText: pairsToText(item.attributes || parsePairs(base.attributesText)), inventoryText: arrayToText(item.inventory || base.inventoryText.split(', ')), skillsText: arrayToText(item.skills || base.skillsText.split(', ')) });
    if (type === 'system') Object.assign(values, { attributesText: item.attributesText ?? item.attributes ?? '', skillsText: item.skillsText ?? (Array.isArray(item.skills) ? item.skills.join(', ') : item.skills ?? '') });
    if (type === 'note') values.pinned = item.pinned ? 'Sim' : 'Não';
    return values;
  };
  const [values, setValues] = useState(getInitial);
  const fields = {
    campaign: [
      { name: 'title', label: 'Nome da campanha', required: true }, { name: 'system', label: 'Sistema', type: 'select', options: ['Terras Longínquas', 'D&D 5e', 'Ordem Paranormal', 'Sistema próprio', 'Outro'] },
      { name: 'setting', label: 'Mundo / cenário' }, { name: 'status', label: 'Status', type: 'select', options: ['Em andamento', 'Preparação', 'Pausada', 'Concluída'] },
      { name: 'nextSession', label: 'Próxima sessão', placeholder: 'Ex.: sábado às 19h' }, { name: 'description', label: 'Premissa / resumo', type: 'textarea', wide: true },
    ],
    character: [
      { name: 'name', label: 'Nome do personagem', required: true }, { name: 'concept', label: 'Conceito / arquétipo' },
      { name: 'system', label: 'Sistema', type: 'select', options: ['Terras Longínquas', 'D&D 5e', 'Ordem Paranormal', 'Sistema próprio', 'Outro'] },
      { name: 'level', label: 'Nível', type: 'number', min: 1, max: 100 }, { name: 'player', label: 'Jogador' },
      { name: 'hp', label: 'Vida atual', type: 'number', min: 0 }, { name: 'maxHp', label: 'Vida máxima', type: 'number', min: 1 },
      { name: 'mana', label: 'Mente / mana atual', type: 'number', min: 0 }, { name: 'maxMana', label: 'Mente / mana máxima', type: 'number', min: 1 },
      { name: 'attributesText', label: 'Atributos', placeholder: 'Força: 1, Agilidade: 2...', wide: true, help: 'Separe por vírgulas e use o formato atributo: valor.' },
      { name: 'skillsText', label: 'Perícias', placeholder: 'Mira, Atletismo, História', wide: true },
      { name: 'inventoryText', label: 'Inventário', placeholder: 'Item de dano, Utensílio, Utensílio', wide: true },
      { name: 'biography', label: 'História / biografia', type: 'textarea', wide: true, rows: 5 },
      { name: 'notes', label: 'Anotações privadas da ficha', type: 'textarea', wide: true },
    ],
    lore: [
      { name: 'title', label: 'Título', required: true }, { name: 'category', label: 'Categoria', type: 'select', options: ['Local', 'Personagem', 'Facção', 'Lenda', 'Relíquia', 'Mistério', 'Outro'] },
      { name: 'visibility', label: 'Visibilidade', type: 'select', options: ['Mesa', 'Mestre'] }, { name: 'body', label: 'Texto / descrição', type: 'textarea', wide: true, rows: 7 },
    ],
    note: [
      { name: 'title', label: 'Título', required: true }, { name: 'category', label: 'Tipo', type: 'select', options: ['Ideia', 'Sessão', 'NPC', 'Pista', 'Regra', 'Lembrete'] },
      { name: 'pinned', label: 'Fixar no topo?', type: 'select', options: ['Não', 'Sim'] }, { name: 'content', label: 'Anotação', type: 'textarea', wide: true, rows: 6 },
    ],
    system: [
      { name: 'name', label: 'Nome do sistema', required: true }, { name: 'dice', label: 'Fórmula comum de teste', placeholder: 'd20 + atributo' },
      { name: 'summary', label: 'Resumo', type: 'textarea', wide: true }, { name: 'attributesText', label: 'Atributos', type: 'textarea', wide: true, rows: 2 },
      { name: 'skillsText', label: 'Perícias / proficiências', type: 'textarea', wide: true, rows: 3 }, { name: 'rules', label: 'Regras, adaptações e regras da casa', type: 'textarea', wide: true, rows: 6 },
    ],
    session: [
      { name: 'title', label: 'Nome da sessão', required: true }, { name: 'date', label: 'Data', type: 'date' },
      { name: 'status', label: 'Estado', type: 'select', options: ['Planejada', 'Concluída', 'Adiada'] }, { name: 'recap', label: 'Resumo, cenas e ganchos', type: 'textarea', wide: true, rows: 6 },
    ],
  }[type] || [];
  const submit = (e) => {
    e.preventDefault();
    const out = { ...values };
    if (type === 'character') {
      out.level = Number(out.level) || 1; out.hp = Number(out.hp) || 0; out.maxHp = Number(out.maxHp) || 1;
      out.mana = Number(out.mana) || 0; out.maxMana = Number(out.maxMana) || 1;
      out.attributes = parsePairs(out.attributesText); out.inventory = out.inventoryText.split(',').map((v) => v.trim()).filter(Boolean); out.skills = out.skillsText.split(',').map((v) => v.trim()).filter(Boolean);
      delete out.attributesText; delete out.inventoryText; delete out.skillsText;
    }
    if (type === 'note') out.pinned = out.pinned === 'Sim';
    delete out.id;
    onSave(type, { ...out, id: modal.item?.id || uuid() });
  };
  const titleMap = { campaign: 'campanha', character: 'personagem', lore: 'entrada de mundo', note: 'anotação', system: 'sistema', session: 'sessão' };
  return <Modal title={`${isEdit ? 'Editar' : 'Criar'} ${titleMap[type] || 'conteúdo'}`} subtitle="As alterações são salvas no espaço da conta ativa." onClose={onClose} footer={<><button className="button secondary" type="button" onClick={onClose}>Cancelar</button><button className="button primary" form="editor-form" type="submit"><Save size={15}/> Salvar alterações</button></>}>
    <form id="editor-form" className="form-grid" onSubmit={submit}>{fields.map((f) => <Field key={f.name} field={f} value={values[f.name]} onChange={(k, v) => setValues((old) => ({ ...old, [k]: v }))} />)}</form>
  </Modal>;
}

function LoginScreen({ onLogin, error, loading }) {
  const [selected, setSelected] = useState('Jogador 1');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const chosen = ACCOUNTS.find((a) => a.name === selected);
  return <main className="login-page">
    <div className="login-ambient ambient-one"/><div className="login-ambient ambient-two"/>
    <div className="login-top"><div className="brand-mark"><Sparkles size={20}/></div><span>ARCANA <small>MESA</small></span><span className="login-beta">ACESSO À MESA</span></div>
    <section className="login-layout">
      <div className="login-story">
        <div className="eyebrow"><span className="live-dot"/> UM UNIVERSO INTEIRO À SUA ESPERA</div>
        <h1>Grandes histórias<br/>começam <em>à mesa.</em></h1>
        <p>Crie mundos, construa personagens e transforme cada sessão em uma lenda. Todas as ferramentas da sua campanha, em um só lugar.</p>
        <div className="login-feature-row"><span><BookOpen size={16}/> Lore editável</span><span><Dice5 size={16}/> Rolagem de dados</span><span><Shield size={16}/> Escudo do mestre</span></div>
        <div className="fantasy-art" aria-hidden="true"><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-sigil"><Crown size={54} strokeWidth={1}/><span>✦</span></div><div className="art-rune rune-a">ᚨ</div><div className="art-rune rune-b">ᚱ</div><div className="art-rune rune-c">ᛟ</div><div className="art-bottom-line"/></div>
        <div className="login-quote"><span>“</span><div><p>O mundo não está pronto para a sua história.</p><small>Então, escreva-o.</small></div></div>
      </div>
      <div className="login-card">
        <div className="login-card-symbol"><KeyRound size={19}/></div>
        <h2>Entre na sua mesa</h2><p className="muted">Acesse seu espaço de criação.</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(selected, password); }}>
          <label className="field"><span>Conta</span><div className="select-with-icon"><UserRound size={16}/><select value={selected} onChange={(e) => setSelected(e.target.value)}>{ACCOUNTS.map((a) => <option key={a.name}>{a.name}{a.role === 'master' ? ' · Mestre' : ''}</option>)}</select><ChevronDown size={15}/></div></label>
          <label className="field"><span>Senha</span><div className="password-wrap"><input type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" className="show-password" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha"><Eye size={16}/></button></div></label>
          {error && <div className="error-message"><CircleHelp size={15}/>{error}</div>}
          <button className="button primary login-submit" type="submit" disabled={loading}>{loading ? 'Entrando...' : <>Entrar na mesa <ArrowRight size={17}/></>}</button>
        </form>
        {!cloudEnabled && <div className="demo-notice"><span className="notice-dot"/><div><strong>Modo demonstração</strong><small>Dados salvos neste navegador. Veja as credenciais no README do projeto.</small></div></div>}
        <div className="login-card-footer"><span><ShieldCheck size={13}/> Espaços separados por conta</span><span>v1.0</span></div>
      </div>
    </section>
    <footer className="login-footer"><span>ARCANA MESA © 2026</span><span>FEITO PARA QUEM CONTA HISTÓRIAS</span><span>MEDIEVAL FANTÁSTICO · EDIÇÃO LIVRE</span></footer>
  </main>;
}

const navItems = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard, group: 'MESA' },
  { id: 'campaigns', label: 'Campanhas', icon: Compass },
  { id: 'characters', label: 'Personagens', icon: Users },
  { id: 'world', label: 'Mundo & Lore', icon: Globe2 },
  { id: 'notes', label: 'Anotações', icon: BookMarked },
  { id: 'systems', label: 'Sistemas', icon: Settings2, group: 'FERRAMENTAS' },
  { id: 'dice', label: 'Rolagem de dados', icon: Dice5 },
  { id: 'sessions', label: 'Sessões', icon: CalendarDays },
];
const pageTitles = { overview: ['Visão geral', 'O seu próximo capítulo começa aqui.'], campaigns: ['Campanhas', 'Organize narrativas, mundos e jornadas.'], characters: ['Personagens', 'Heróis, antagonistas e tudo entre eles.'], world: ['Mundo & Lore', 'Construa um universo com suas próprias regras.'], notes: ['Anotações', 'Guarde pistas, ideias e segredos.'], systems: ['Sistemas', 'Adapte regras ou construa seu próprio sistema.'], dice: ['Rolagem de dados', 'Deixe a sorte decidir o próximo capítulo.'], sessions: ['Sessões', 'Planeje encontros e registre o que aconteceu.'], master: ['Escudo do mestre', 'Visão geral da mesa e ferramentas de administração.'] };

function Sidebar({ page, setPage, user, onLogout, counts, mobileOpen, setMobileOpen }) {
  const item = (entry) => <button key={entry.id} className={`nav-item ${page === entry.id ? 'active' : ''}`} onClick={() => { setPage(entry.id); setMobileOpen(false); }}><entry.icon size={17}/><span>{entry.label}</span>{entry.id === 'characters' && counts.characters > 0 && <small>{counts.characters}</small>}</button>;
  return <>
    {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"/>}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><Sparkles size={19}/></div><div><strong>ARCANA <span>MESA</span></strong><small>WORKSPACE DE RPG</small></div><button className="sidebar-close icon-button" onClick={() => setMobileOpen(false)}><X size={17}/></button></div>
      <div className="workspace-chip"><div className="workspace-orb"><Sparkles size={15}/></div><div><strong>Mesa principal</strong><small>Espaço de campanha</small></div><ChevronDown size={14}/></div>
      <div className="nav-scroll"><div className="nav-section-title">MESA</div>{navItems.filter((i) => ['overview', 'campaigns', 'characters', 'world', 'notes'].includes(i.id)).map(item)}
        <div className="nav-section-title second-title">FERRAMENTAS</div>{navItems.filter((i) => ['systems', 'dice', 'sessions'].includes(i.id)).map(item)}
        {user.role === 'master' && <><div className="nav-section-title second-title">NARRAÇÃO</div><button className={`nav-item master-link ${page === 'master' ? 'active' : ''}`} onClick={() => { setPage('master'); setMobileOpen(false); }}><ShieldCheck size={17}/><span>Escudo do mestre</span><span className="master-tag">GM</span></button></>}
      </div>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><WandSparkles size={17}/></div><div><strong>Ideia para a sessão?</strong><p>Registre antes que escape.</p><button onClick={() => { setPage('notes'); setMobileOpen(false); }}>Criar anotação <ArrowRight size={13}/></button></div></div>
        <div className="sidebar-user"><div className={`avatar ${user.role === 'master' ? 'avatar-gold' : ''}`}>{user.role === 'master' ? <Crown size={17}/> : user.name.split(' ').map((v) => v[0]).join('').slice(0, 2)}</div><div className="user-meta"><strong>{user.name}</strong><small>{user.role === 'master' ? 'MESTRE DA MESA' : 'JOGADOR'}</small></div><button className="icon-button logout-button" title="Sair" onClick={onLogout}><LogOut size={16}/></button></div>
      </div>
    </aside>
  </>;
}

function SectionHeading({ eyebrow, title, subtitle, action, actionText }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="button primary" onClick={action}><Plus size={16}/>{actionText || 'Criar novo'}</button>}</div>;
}
function EmptyState({ icon: Icon = Archive, title, message, action, actionText }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={24}/></div><h3>{title}</h3><p>{message}</p>{action && <button className="button secondary" onClick={action}><Plus size={15}/>{actionText || 'Criar primeiro item'}</button>}</div>;
}
function TinyStat({ label, value, icon: Icon, change, tone = '' }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong>{change && <small>{change}</small>}</div><div className="stat-glow"/></div>;
}
function ResourceBar({ label, value, max, color, onMinus, onPlus }) {
  const percent = Math.max(0, Math.min(100, Number(max) ? (Number(value) / Number(max)) * 100 : 0));
  return <div className="resource-row"><div className="resource-head"><span>{label}</span><strong>{value}<i> / {max}</i></strong></div><div className="resource-track"><div className={`resource-fill ${color}`} style={{ width: `${percent}%` }}/></div><div className="resource-controls"><button onClick={onMinus} title="Diminuir"><Minus size={12}/></button><button onClick={onPlus} title="Aumentar"><Plus size={12}/></button></div></div>;
}
function formatDate(value) { if (!value) return 'Sem data'; const d = new Date(`${value}T12:00:00`); if (Number.isNaN(d.getTime())) return value; return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }

function Overview({ workspace, user, setPage, openEditor, quickRoll, onQuickEdit }) {
  const mainCampaign = workspace.campaigns[0];
  const nextSession = workspace.sessions.find((s) => s.status === 'Planejada') || workspace.sessions[0];
  const recentNotes = [...workspace.notes].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))).slice(0, 3);
  return <div className="page-content overview-page">
    <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> SEU ESPAÇO DE CRIAÇÃO</div><h1>Boa noite, {user.name === 'Mestre' ? 'Mestre' : user.name.split(' ')[0]} <span className="wave">✦</span></h1><p>Uma boa aventura começa com uma ideia. Qual será a de hoje?</p></div><div className="date-chip"><CalendarDays size={15}/>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
    <section className="hero-campaign">
      <div className="hero-background"><div className="hero-moon"/><div className="hero-mountain mountain-one"/><div className="hero-mountain mountain-two"/><div className="hero-sigil">✧</div><div className="hero-grid"/></div>
      <div className="hero-copy"><div className="hero-badge"><span className="live-dot"/>{mainCampaign?.status || 'NOVO CAPÍTULO'}</div><div className="eyebrow">CAMPANHA EM DESTAQUE</div><h2>{mainCampaign?.title || 'Sua próxima grande história'}</h2><p>{mainCampaign?.description || 'Crie uma campanha para começar a escrever seu mundo.'}</p><div className="hero-meta"><span><BookOpen size={14}/>{mainCampaign?.system || 'Sistema livre'}</span><span><Globe2 size={14}/>{mainCampaign?.setting || 'Mundo ainda sem nome'}</span></div><div className="hero-actions"><button className="button primary" onClick={() => setPage('campaigns')}>Abrir campanha <ArrowRight size={16}/></button><button className="button glass" onClick={() => openEditor('campaign', mainCampaign || null)}><Pencil size={15}/> Editar</button></div></div>
      <div className="hero-side-mark"><span>VOL.</span><strong>01</strong><i>✦</i></div>
    </section>
    <div className="stats-grid"><TinyStat label="Campanhas" value={workspace.campaigns.length} icon={Compass} change="Mundos em construção" tone="purple"/><TinyStat label="Personagens" value={workspace.characters.length} icon={Users} change="Histórias com rosto" tone="blue"/><TinyStat label="Registros de lore" value={workspace.lore.length} icon={Globe2} change="Detalhes do universo" tone="gold"/><TinyStat label="Sessões planejadas" value={workspace.sessions.filter((s) => s.status === 'Planejada').length} icon={CalendarDays} change="Próximos encontros" tone="green"/></div>
    <div className="dashboard-grid">
      <section className="panel upcoming-panel"><div className="panel-heading"><div><div className="eyebrow">AGENDA DA MESA</div><h3>Próxima sessão</h3></div><button className="text-button" onClick={() => setPage('sessions')}>Ver todas <ArrowRight size={14}/></button></div>
        {nextSession ? <div className="upcoming-event"><div className="event-date"><strong>{formatDate(nextSession.date).split(' ')[0]}</strong><small>{formatDate(nextSession.date).split(' ').slice(1).join(' ')}</small></div><div className="event-description"><strong>{nextSession.title}</strong><p>{nextSession.recap || 'Adicione um resumo, cenas e ganchos.'}</p><span><Clock3 size={13}/>{nextSession.status}</span></div><button className="icon-button" onClick={() => openEditor('session', nextSession)}><Pencil size={15}/></button></div> : <EmptyState icon={CalendarDays} title="Calendário em branco" message="Crie a primeira sessão da sua campanha." action={() => openEditor('session')} actionText="Planejar sessão"/>}
        <button className="add-event" onClick={() => openEditor('session')}><Plus size={15}/> Planejar nova sessão</button>
      </section>
      <section className="panel quick-panel"><div className="panel-heading"><div><div className="eyebrow">ATALHOS</div><h3>O que vamos criar?</h3></div><Sparkles size={18} className="panel-sparkle"/></div><div className="quick-actions">
        <button onClick={() => openEditor('character')}><span className="quick-icon violet"><Users size={18}/></span><span><strong>Personagem</strong><small>Dar vida a uma ideia</small></span><ChevronRight size={16}/></button>
        <button onClick={() => openEditor('lore')}><span className="quick-icon blue"><Globe2 size={18}/></span><span><strong>Entrada de lore</strong><small>Expandir seu universo</small></span><ChevronRight size={16}/></button>
        <button onClick={() => quickRoll(20)}><span className="quick-icon gold"><Dice5 size={18}/></span><span><strong>Rolar 1d20</strong><small>Testar a sorte agora</small></span><ChevronRight size={16}/></button>
        <button onClick={() => openEditor('note')}><span className="quick-icon green"><FileText size={18}/></span><span><strong>Anotação rápida</strong><small>Guardar uma ideia</small></span><ChevronRight size={16}/></button>
      </div></section>
      <section className="panel notes-panel"><div className="panel-heading"><div><div className="eyebrow">CADERNO DE BORDO</div><h3>Notas recentes</h3></div><button className="text-button" onClick={() => setPage('notes')}>Abrir caderno <ArrowRight size={14}/></button></div>
        {recentNotes.length ? <div className="recent-notes">{recentNotes.map((note) => <button className="recent-note" key={note.id} onClick={() => openEditor('note', note)}><span className={`note-pin ${note.pinned ? 'pinned' : ''}`}>{note.pinned ? <Flame size={14}/> : <FileText size={14}/>}</span><span><strong>{note.title}</strong><small>{note.category} · {(note.content || '').slice(0, 70)}{note.content?.length > 70 ? '…' : ''}</small></span><ChevronRight size={15}/></button>)}</div> : <EmptyState icon={BookMarked} title="Seu caderno espera" message="Registre pistas, ideias e detalhes importantes." action={() => openEditor('note')}/>}
      </section>
      <section className="quote-panel"><div className="quote-ornament">❝</div><p>“Toda lenda começa como uma história que alguém se recusou a esquecer.”</p><span>— ANOTAÇÃO SEM AUTOR</span><div className="quote-star star-a">✦</div><div className="quote-star star-b">✧</div></section>
    </div>
  </div>;
}

function CampaignsPage({ workspace, setPage, openEditor, onDelete }) {
  return <div className="page-content"><SectionHeading eyebrow="SEUS UNIVERSOS" title="Campanhas" subtitle="Cada campanha é um mundo. Organize suas aventuras do seu jeito." action={() => openEditor('campaign')} actionText="Nova campanha"/>
    {workspace.campaigns.length ? <div className="campaign-grid">{workspace.campaigns.map((c, i) => <article className={`campaign-card campaign-${i % 3}`} key={c.id}><div className="campaign-art"><div className="campaign-planet"/><div className="campaign-art-rune">{['✧', 'ᚨ', '✦'][i % 3]}</div><div className="campaign-status"><span className={`status-dot ${c.status === 'Concluída' ? 'done' : c.status === 'Pausada' ? 'paused' : ''}`}/>{c.status}</div><button className="card-more" title="Editar campanha" onClick={() => openEditor('campaign', c)}><MoreHorizontal size={18}/></button></div><div className="campaign-card-body"><div className="eyebrow">{c.system}</div><h3>{c.title}</h3><p>{c.description || 'Esta história ainda está sendo escrita.'}</p><div className="campaign-card-meta"><span><Globe2 size={14}/>{c.setting || 'Cenário livre'}</span><span><ScrollText size={14}/>{c.sessions || 0} sessões</span></div><div className="campaign-card-footer"><button className="button secondary small" onClick={() => setPage('sessions')}>Ver sessões <ArrowRight size={14}/></button><button className="icon-button danger-soft" title="Excluir" onClick={() => onDelete('campaign', c)}><Trash2 size={15}/></button></div></div></article>)}</div> : <EmptyState icon={Compass} title="Seu primeiro mundo está esperando" message="Crie uma campanha para organizar cenário, sessões e personagens." action={() => openEditor('campaign')} actionText="Criar campanha"/>}
  </div>;
}

function CharactersPage({ workspace, openEditor, onDelete, rollDice }) {
  const [selectedId, setSelectedId] = useState(workspace.characters[0]?.id || null);
  useEffect(() => { if (!workspace.characters.some((c) => c.id === selectedId)) setSelectedId(workspace.characters[0]?.id || null); }, [workspace.characters, selectedId]);
  const character = workspace.characters.find((c) => c.id === selectedId) || workspace.characters[0];
  return <div className="page-content"><SectionHeading eyebrow="FICHAS DIGITAIS" title="Personagens" subtitle="Crie, ajuste e acompanhe cada detalhe dos seus protagonistas." action={() => openEditor('character')} actionText="Nova ficha"/>
    {workspace.characters.length ? <><div className="character-layout"><div className="character-list">{workspace.characters.map((c) => <button key={c.id} className={`character-list-item ${character?.id === c.id ? 'selected' : ''}`} onClick={() => setSelectedId(c.id)}><div className="character-avatar">{(c.name || '?').split(' ').slice(0, 2).map((n) => n[0]).join('')}</div><div><strong>{c.name}</strong><small>{c.concept || 'Aventureiro'} · Nv. {c.level}</small><em>{c.system}</em></div><ChevronRight size={15}/></button>)}<button className="create-character-line" onClick={() => openEditor('character')}><Plus size={16}/> Criar outro personagem</button></div>
      {character && <section className="character-sheet"><div className="sheet-banner"><div className="sheet-stars">✦ <span>✧</span> ✦</div><div className="sheet-banner-top"><span className="sheet-system">{character.system}</span><button className="button glass small" onClick={() => openEditor('character', character)}><Pencil size={14}/> Editar ficha</button></div><div className="character-big-avatar">{(character.name || '?').split(' ').slice(0, 2).map((n) => n[0]).join('')}</div><h2>{character.name}</h2><p>{character.concept || 'Aventureiro sem título'}</p><div className="sheet-level"><span>NÍVEL</span><strong>{character.level}</strong></div></div>
        <div className="sheet-body"><div className="sheet-resource-grid"><ResourceBar label="VIDA" value={character.hp} max={character.maxHp} color="hp" onMinus={() => rollResource(character, 'hp', -1)} onPlus={() => rollResource(character, 'hp', 1)}/><ResourceBar label="MENTE / MANA" value={character.mana} max={character.maxMana} color="mana" onMinus={() => rollResource(character, 'mana', -1)} onPlus={() => rollResource(character, 'mana', 1)}/></div>
          <div className="sheet-section-title"><span>ATRIBUTOS</span><i/><button onClick={() => openEditor('character', character)}>Editar <Pencil size={12}/></button></div><div className="attributes-grid">{Object.entries(character.attributes || {}).map(([name, val]) => <button key={name} className="attribute-card" onClick={() => rollDice(20, Number(val) || 0, `${name} · ${character.name}`)}><span>{name}</span><strong>{Number(val) > 0 ? `+${val}` : val}</strong><small><Dice5 size={12}/> Rolar teste</small></button>)}</div>
          <div className="sheet-section-title"><span>PERÍCIAS</span><i/></div><div className="skill-chips">{(character.skills || []).map((skill) => <button key={skill} onClick={() => rollDice(20, 0, `${skill} · ${character.name}`)}>{skill}<Dice5 size={12}/></button>)}{!character.skills?.length && <span className="muted">Nenhuma perícia cadastrada.</span>}</div>
          <div className="sheet-section-title"><span>INVENTÁRIO</span><i/></div><div className="inventory-list">{(character.inventory || []).map((item, i) => <div key={`${item}-${i}`}><span className="inventory-icon"><Archive size={14}/></span><span>{item}</span><small>#{String(i + 1).padStart(2, '0')}</small></div>)}</div>
          {character.biography && <div className="sheet-bio"><div className="sheet-section-title"><span>HISTÓRIA</span><i/></div><p>{character.biography}</p></div>}
          <div className="sheet-footer"><span><CircleUserRound size={14}/> Jogador: {character.player || 'Não atribuído'}</span><button className="text-button danger-text" onClick={() => onDelete('character', character)}><Trash2 size={14}/> Excluir ficha</button></div>
        </div></section>}</div></> : <EmptyState icon={Users} title="Nenhum personagem por enquanto" message="Monte sua primeira ficha e comece a dar forma ao herói." action={() => openEditor('character')} actionText="Criar personagem"/>}
  </div>;
  function rollResource(c, key, delta) { const maxKey = key === 'hp' ? 'maxHp' : 'maxMana'; const event = new CustomEvent('arcana-resource-change', { detail: { id: c.id, key, value: Math.max(0, Math.min(Number(c[maxKey]) || 1, (Number(c[key]) || 0) + delta)) } }); window.dispatchEvent(event); }
}

function WorldPage({ workspace, openEditor, onDelete }) {
  const [filter, setFilter] = useState('Todas');
  const cats = ['Todas', ...new Set(workspace.lore.map((l) => l.category))];
  const visible = workspace.lore.filter((l) => filter === 'Todas' || l.category === filter);
  const icons = { Local: Globe2, Personagem: Users, Facção: Shield, Lenda: Sparkles, Relíquia: Crown, Mistério: Eye, Outro: BookOpen };
  return <div className="page-content"><SectionHeading eyebrow="ENCICLOPÉDIA DA CAMPANHA" title="Mundo & Lore" subtitle="Locais, lendas, facções e segredos — documente tudo o que torna seu mundo único." action={() => openEditor('lore')} actionText="Nova entrada"/>
    <div className="filter-row"><div className="filter-caption"><SlidersHorizontal size={15}/> Filtrar por categoria</div><div className="filter-chips">{cats.map((c) => <button key={c} className={filter === c ? 'selected' : ''} onClick={() => setFilter(c)}>{c}</button>)}</div><span className="filter-count">{visible.length} registros</span></div>
    {visible.length ? <div className="lore-grid">{visible.map((l, i) => { const Icon = icons[l.category] || BookOpen; return <article className="lore-card" key={l.id}><div className={`lore-card-symbol lore-symbol-${i % 4}`}><Icon size={22}/><span>{String(i + 1).padStart(2, '0')}</span></div><div className="lore-card-content"><div className="lore-card-meta"><span>{l.category}</span>{l.visibility === 'Mestre' && <span className="secret-tag"><Eye size={11}/> Mestre</span>}</div><h3>{l.title}</h3><p>{l.body || 'Sem descrição. Edite esta entrada para adicionar detalhes.'}</p><div className="lore-card-actions"><button className="text-button" onClick={() => openEditor('lore', l)}>Editar entrada <ArrowRight size={13}/></button><button className="icon-button danger-soft" title="Excluir" onClick={() => onDelete('lore', l)}><Trash2 size={14}/></button></div></div></article>; })}</div> : <EmptyState icon={Globe2} title="Ainda há páginas em branco" message="Adicione seu primeiro local, lenda ou personagem importante." action={() => openEditor('lore')} actionText="Criar entrada"/>}
  </div>;
}

function NotesPage({ workspace, openEditor, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = workspace.notes.filter((n) => `${n.title} ${n.content} ${n.category}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  return <div className="page-content"><SectionHeading eyebrow="CADERNO DE BORDO" title="Anotações" subtitle="Pistas, ideias repentinas, nomes de NPCs e segredos para lembrar na hora certa." action={() => openEditor('note')} actionText="Nova anotação"/>
    <div className="notes-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no caderno..."/><kbd>⌕</kbd></div><span>{filtered.length} notas</span></div>
    {filtered.length ? <div className="notes-grid">{filtered.map((n, i) => <article className={`note-card note-color-${i % 4}`} key={n.id}><div className="note-card-top"><span className="note-type"><FileText size={13}/>{n.category}</span><div>{n.pinned && <span className="pinned-label"><Flame size={12}/> FIXADA</span>}<button className="icon-button" onClick={() => openEditor('note', n)} aria-label="Editar"><Pencil size={14}/></button></div></div><h3>{n.title}</h3><p>{n.content || 'Anotação sem conteúdo.'}</p><div className="note-card-bottom"><span>ARCANA · CADERNO</span><button className="icon-button danger-soft" title="Excluir" onClick={() => onDelete('note', n)}><Trash2 size={14}/></button></div></article>)}</div> : <EmptyState icon={BookMarked} title="Nada encontrado" message={search ? 'Tente outra palavra ou limpe a busca.' : 'Crie uma anotação para guardar a primeira ideia.'} action={search ? () => setSearch('') : () => openEditor('note')} actionText={search ? 'Limpar busca' : 'Criar anotação'}/>}
  </div>;
}

function SystemsPage({ workspace, openEditor, onDelete }) {
  const [active, setActive] = useState(workspace.systems[0]?.id || null);
  useEffect(() => { if (!workspace.systems.some((s) => s.id === active)) setActive(workspace.systems[0]?.id || null); }, [workspace.systems, active]);
  const system = workspace.systems.find((s) => s.id === active) || workspace.systems[0];
  return <div className="page-content"><SectionHeading eyebrow="LABORATÓRIO DE REGRAS" title="Sistemas" subtitle="Use um ponto de partida ou crie as regras que combinam com a sua mesa." action={() => openEditor('system')} actionText="Novo sistema"/>
    <div className="systems-layout"><aside className="systems-sidebar"><div className="systems-sidebar-head"><strong>MEUS SISTEMAS</strong><span>{workspace.systems.length}</span></div>{workspace.systems.map((s, i) => <button key={s.id} className={`system-choice ${s.id === system?.id ? 'selected' : ''}`} onClick={() => setActive(s.id)}><div className={`system-choice-icon sys-icon-${i % 3}`}><Settings2 size={17}/></div><div><strong>{s.name}</strong><small>{(s.attributesText || s.attributes || '').split(',').slice(0, 2).join(', ') || 'Personalizado'}</small></div><ChevronRight size={15}/></button>)}<button className="system-add" onClick={() => openEditor('system')}><Plus size={15}/> Adicionar sistema</button></aside>
      {system ? <section className="system-detail"><div className="system-detail-banner"><div className="system-wheel"><div/><div/><span>✦</span></div><div className="system-detail-head"><span className="eyebrow">SISTEMA SELECIONADO</span><h2>{system.name}</h2><p>{system.summary || 'Um sistema pronto para receber suas regras.'}</p><button className="button glass small" onClick={() => openEditor('system', system)}><Pencil size={14}/> Editar sistema</button></div><button className="icon-button system-delete" title="Excluir sistema" onClick={() => onDelete('system', system)}><Trash2 size={15}/></button></div>
        <div className="system-detail-content"><div className="system-rule-card"><div className="system-section-title"><span className="section-symbol"><Activity size={15}/></span><div><strong>Atributos</strong><small>Características principais</small></div></div><div className="system-text-block">{system.attributesText || system.attributes || 'Ainda não foram definidos atributos.'}</div></div>
        <div className="system-rule-card"><div className="system-section-title"><span className="section-symbol blue"><Target size={15}/></span><div><strong>Perícias e proficiências</strong><small>O que seus personagens sabem fazer</small></div></div><div className="system-skill-list">{(system.skillsText || system.skills || '').split(',').map((t) => t.trim()).filter(Boolean).map((t) => <span key={t}>{t}</span>)}{!(system.skillsText || system.skills) && <span className="muted">Adicione perícias ao editar o sistema.</span>}</div></div>
        <div className="system-rule-card"><div className="system-section-title"><span className="section-symbol gold"><ScrollText size={15}/></span><div><strong>Regras da mesa</strong><small>Seu manual de referência editável</small></div></div><p className="system-rules-copy">{system.rules || 'Ainda não há regras registradas. Clique em “Editar sistema” para escrever suas regras, exceções e acordos da mesa.'}</p><div className="dice-formula"><Dice5 size={17}/><div><small>FÓRMULA DE TESTE SUGERIDA</small><strong>{system.dice || 'd20 + modificador'}</strong></div><button className="icon-button" onClick={() => { navigator.clipboard?.writeText(system.dice || 'd20 + modificador'); }} title="Copiar fórmula"><Copy size={15}/></button></div></div>
        {system.name === 'Terras Longínquas' && <div className="system-rule-card terras-skills-card"><div className="system-section-title"><span className="section-symbol"><Scroll size={15}/></span><div><strong>Perícias de Terras Longínquas</strong><small>Referência rápida da versão autoral</small></div></div><div className="terras-skills-table">{TERRAS_SKILLS.map(([skill, attr]) => <div key={skill}><span>{skill}</span><small>{attr}</small></div>)}</div><div className="terras-rule-footer"><Heart size={15}/><span>Vida base: 15 + 4 por Resistência</span><Zap size={15}/><span>Mente base: 15 + 4 por Carisma</span></div></div>}
        <div className="system-copyright-note"><CircleHelp size={14}/> Os modelos D&D 5e e Ordem Paranormal são pontos de partida editáveis; as regras e os materiais oficiais devem ser adicionados por você conforme o que sua mesa utiliza.</div></div>
      </section> : <EmptyState icon={Settings2} title="Nenhum sistema criado" message="Crie um sistema ou adicione os presets iniciais." action={() => openEditor('system')} />}
    </div>
  </div>;
}

function DicePage({ onRoll, history, clearHistory }) {
  const [amount, setAmount] = useState(1); const [sides, setSides] = useState(20); const [modifier, setModifier] = useState(0); const [reason, setReason] = useState(''); const [mode, setMode] = useState('normal');
  const quick = [4, 6, 8, 10, 12, 20, 100];
  const roll = () => onRoll(sides, Number(modifier) || 0, reason || `${amount}d${sides}`, Number(amount) || 1, mode);
  return <div className="page-content"><SectionHeading eyebrow="SORTE & DESTINO" title="Rolagem de dados" subtitle="Configure uma rolagem, adicione modificadores e acompanhe o histórico da mesa."/>
    <div className="dice-layout"><section className="dice-main-card"><div className="dice-glow"/><div className="dice-main-heading"><div><div className="eyebrow">ROLADOR POLIÉDRICO</div><h2>O destino está lançado.</h2><p>Escolha o dado e defina o seu teste.</p></div><div className="dice-emblem"><Dice5 size={34} strokeWidth={1.2}/></div></div>
      <div className="die-selector"><span>ESCOLHA O DADO</span><div className="die-options">{quick.map((d) => <button key={d} className={sides === d ? 'selected' : ''} onClick={() => setSides(d)}><span>d{d}</span>{sides === d && <i>✓</i>}</button>)}</div></div>
      <div className="dice-fields"><label className="field"><span>Quantidade</span><div className="number-stepper"><button onClick={() => setAmount((v) => Math.max(1, v - 1))}><Minus size={14}/></button><strong>{amount}</strong><button onClick={() => setAmount((v) => Math.min(50, v + 1))}><Plus size={14}/></button></div></label><label className="field"><span>Modificador</span><div className="number-stepper"><button onClick={() => setModifier((v) => v - 1)}><Minus size={14}/></button><strong>{modifier > 0 ? `+${modifier}` : modifier}</strong><button onClick={() => setModifier((v) => v + 1)}><Plus size={14}/></button></div></label><label className="field"><span>Nome do teste</span><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Percepção, ataque..."/></label></div>
      <div className="roll-mode"><span>VANTAGEM / DESVANTAGEM</span><div>{[['normal', 'Normal'], ['advantage', 'Vantagem'], ['disadvantage', 'Desvantagem']].map(([v, label]) => <button className={mode === v ? 'selected' : ''} key={v} onClick={() => setMode(v)}>{label}</button>)}</div></div>
      <button className="roll-button" onClick={roll}><Dice5 size={20}/> ROLAR {amount}D{sides}{Number(modifier) ? ` ${Number(modifier) > 0 ? '+' : ''}${modifier}` : ''}<ArrowRight size={17}/></button>
      <p className="dice-footnote"><ShieldCheck size={13}/> Rolagens geradas localmente no navegador.</p>
    </section>
    <aside className="dice-history-panel"><div className="panel-heading"><div><div className="eyebrow">REGISTRO DE ROLAGENS</div><h3>Histórico recente</h3></div><button className="icon-button" title="Limpar histórico" onClick={clearHistory}><RotateCcw size={15}/></button></div>
      {history.length ? <div className="roll-history-list">{history.map((r) => <div className="roll-history-item" key={r.id}><div className="history-die">d{r.sides}</div><div className="roll-history-info"><strong>{r.reason}</strong><small>{r.formula} · {r.mode === 'advantage' ? 'Vantagem' : r.mode === 'disadvantage' ? 'Desvantagem' : 'Normal'}</small><span>{r.results.join(' · ')}{r.modifier ? ` ${r.modifier > 0 ? '+' : '−'} ${Math.abs(r.modifier)}` : ''}</span></div><div className="history-total">{r.total}</div></div>)}</div> : <div className="history-empty"><div><Dice5 size={25}/></div><strong>Nenhuma rolagem ainda</strong><p>Seu histórico aparecerá aqui. Role um dado para começar.</p></div>}
      <div className="history-bottom"><span><span className="status-dot"/> SISTEMA ATIVO</span><small>{history.length} resultados</small></div>
    </aside></div>
  </div>;
}

function SessionsPage({ workspace, openEditor, onDelete, setPage }) {
  const sessions = [...workspace.sessions].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return <div className="page-content"><SectionHeading eyebrow="DIÁRIO DE CAMPANHA" title="Sessões" subtitle="Cada encontro deixa marcas. Planeje o próximo e registre o que mudou." action={() => openEditor('session')} actionText="Nova sessão"/>
    <div className="session-summary-strip"><div><CalendarDays size={18}/><span><strong>{workspace.sessions.length}</strong><small>sessões registradas</small></span></div><div><Check size={18}/><span><strong>{workspace.sessions.filter((s) => s.status === 'Concluída').length}</strong><small>concluídas</small></span></div><div><Clock3 size={18}/><span><strong>{workspace.sessions.filter((s) => s.status === 'Planejada').length}</strong><small>planejadas</small></span></div></div>
    {sessions.length ? <div className="session-timeline">{sessions.map((s, i) => <article className="session-entry" key={s.id}><div className="session-line"><div className={`session-marker ${s.status === 'Concluída' ? 'done' : ''}`}>{s.status === 'Concluída' ? <Check size={14}/> : <CalendarDays size={14}/>}</div>{i < sessions.length - 1 && <div className="timeline-line"/>}</div><div className="session-card"><div className="session-card-top"><span className={`session-status session-${s.status.toLowerCase()}`}>{s.status}</span><div className="session-actions"><button className="icon-button" onClick={() => openEditor('session', s)} title="Editar"><Pencil size={14}/></button><button className="icon-button danger-soft" onClick={() => onDelete('session', s)} title="Excluir"><Trash2 size={14}/></button></div></div><div className="session-card-date">{formatDate(s.date)}</div><h3>{s.title}</h3><p>{s.recap || 'Nenhum registro adicionado a esta sessão ainda.'}</p><button className="text-button" onClick={() => openEditor('session', s)}>Editar registro <ArrowRight size={14}/></button></div></article>)}</div> : <EmptyState icon={CalendarDays} title="A primeira sessão ainda não tem data" message="Planeje um encontro e use o registro para guardar cenas, decisões e consequências." action={() => openEditor('session')} actionText="Planejar sessão"/>}
    <div className="session-idea-banner"><div className="idea-banner-icon"><Sparkles size={20}/></div><div><strong>Uma boa dica de mestre</strong><p>Ao final de cada sessão, registre uma pergunta que ficou sem resposta. Ela pode se tornar o gancho da próxima aventura.</p></div><button className="button secondary small" onClick={() => setPage('notes')}>Abrir anotações <ArrowRight size={14}/></button></div>
  </div>;
}

function MasterPage({ user, workspace, activeOwner, onOpenPlayer, onReturnMine, openEditor, profiles, cloudWorkspaces, onManageProfile, onDelete, isCloud }) {
  const [playerSearch, setPlayerSearch] = useState('');
  const playerNames = ACCOUNTS.filter((a) => a.role === 'player');
  const cards = playerNames.filter((p) => p.name.toLowerCase().includes(playerSearch.toLowerCase())).map((p, i) => {
    const profile = profiles?.find((v) => v.login_name === p.name);
    const ownerWorkspace = cloudWorkspaces?.[p.name] || (isCloud ? null : readLocalWorkspace(p.name));
    return { ...p, index: i, profile, ownerWorkspace };
  });
  return <div className="page-content master-page"><SectionHeading eyebrow="CONTROLE DA NARRAÇÃO" title="Escudo do mestre" subtitle="Gerencie a mesa, revise fichas e mantenha o universo sob controle."/>
    <section className="master-hero"><div className="master-hero-symbol"><ShieldCheck size={32}/></div><div><span className="eyebrow">PAINEL DE CONTROLE</span><h2>O mundo é seu para conduzir.</h2><p>Crie o cenário, revise os personagens e prepare o próximo capítulo.</p></div><div className="master-hero-stats"><div><strong>{cards.length}</strong><span>JOGADORES</span></div><div><strong>{workspace.campaigns.length}</strong><span>CAMPANHAS NESTE ESPAÇO</span></div></div></section>
    <div className="master-tools-grid"><button className="master-tool" onClick={() => openEditor('campaign')}><span className="master-tool-icon violet"><Compass size={19}/></span><span><strong>Administrar campanhas</strong><small>Criar mundos e premissas</small></span><ArrowUpRight size={16}/></button><button className="master-tool" onClick={() => openEditor('system')}><span className="master-tool-icon blue"><Settings2 size={19}/></span><span><strong>Editor de sistemas</strong><small>Regras da casa e atributos</small></span><ArrowUpRight size={16}/></button><button className="master-tool" onClick={() => openEditor('session')}><span className="master-tool-icon gold"><CalendarDays size={19}/></span><span><strong>Planejar sessão</strong><small>Cenas, data e recap</small></span><ArrowUpRight size={16}/></button></div>
    <div className="player-management panel"><div className="panel-heading"><div><div className="eyebrow">JOGADORES DA MESA</div><h3>Fichas e espaços individuais</h3></div><div className="player-head-actions"><div className="search-box compact"><Search size={14}/><input value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} placeholder="Buscar jogador..."/></div><button className="button secondary small" onClick={onReturnMine}><UserRound size={14}/> Meu espaço</button></div></div>
      {isCloud && <div className="cloud-sync-note"><Cloud size={14}/> Modo conectado: espaços lidos do banco de dados conforme as permissões configuradas.</div>}
      <div className="player-table"><div className="player-table-head"><span>JOGADOR</span><span>PERSONAGENS</span><span>ANOTAÇÕES</span><span>STATUS</span><span>AÇÕES</span></div>{cards.map((p) => { const w = p.ownerWorkspace; return <div className={`player-table-row ${activeOwner === p.name ? 'current' : ''}`} key={p.name}><div className="player-table-name"><div className={`avatar avatar-small avatar-${p.index % 4}`}>{p.name.split(' ')[1]}</div><div><strong>{p.name}</strong><small>{p.name === activeOwner ? 'Espaço selecionado' : 'Conta de jogador'}</small></div></div><span className="table-count">{w ? w.characters.length : '—'}</span><span className="table-count">{w ? w.notes.length : '—'}</span><span><span className={`status-pill ${w ? 'connected' : 'waiting'}`}><i/>{w ? 'Disponível' : 'Sem dados'}</span></span><span className="table-actions"><button className="button secondary small" disabled={!w && isCloud} onClick={() => onOpenPlayer(p.name)}><Eye size={13}/> Abrir espaço</button><button className="icon-button" title="Nova ficha para este jogador" onClick={() => { onOpenPlayer(p.name); setTimeout(() => onManageProfile(p.name), 0); }}><UserRound size={15}/></button></span></div>; })}</div>
      <div className="player-table-footer"><span><ShieldCheck size={14}/> Os espaços de demonstração são separados por conta neste navegador.</span><span>{cards.length} de 6 contas</span></div>
    </div>
    <div className="master-bottom-grid"><section className="panel"><div className="panel-heading"><div><div className="eyebrow">RECURSOS DE MESTRE</div><h3>Ferramentas da sessão</h3></div><Crown size={17} className="gold-text"/></div><div className="gm-resource-list"><button onClick={() => openEditor('lore')}><span className="gm-resource-icon"><BookOpen size={16}/></span><span><strong>Adicionar segredo ao mundo</strong><small>Visibilidade e registros da lore</small></span><Plus size={15}/></button><button onClick={() => openEditor('note')}><span className="gm-resource-icon"><FileText size={16}/></span><span><strong>Nova nota de preparação</strong><small>NPCs, pistas e reviravoltas</small></span><Plus size={15}/></button><button onClick={() => openEditor('session')}><span className="gm-resource-icon"><ScrollText size={16}/></span><span><strong>Preparar uma cena</strong><small>Registre o próximo encontro</small></span><Plus size={15}/></button></div></section><section className="gm-warning-card"><div className="warning-seal"><KeyRound size={20}/></div><h3>Segredos do mestre</h3><p>Use a visibilidade “Mestre” na lore para marcar registros secretos. No modo de demonstração isso é uma organização visual; para segredos reais em equipe, use o banco de dados e as permissões de acesso.</p><button className="text-button" onClick={() => setPageSafe('world')}>Abrir mundo & lore <ArrowRight size={14}/></button></section></div>
  </div>;
  function setPageSafe(page) { window.dispatchEvent(new CustomEvent('arcana-navigate', { detail: page })); }
}

function Toast({ message, onClose }) {
  useEffect(() => { if (!message) return; const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [message, onClose]);
  return message ? <div className="toast"><span><Check size={15}/></span>{message}<button onClick={onClose}><X size={14}/></button></div> : null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [activeOwner, setActiveOwner] = useState(null);
  const [page, setPage] = useState('overview');
  const [modal, setModal] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [rollHistory, setRollHistory] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [cloudWorkspaces, setCloudWorkspaces] = useState({});
  const backupInputRef = useRef(null);
  const notify = useCallback((msg) => setToast(msg), []);

  const fetchProfile = useCallback(async (authUser) => {
    const { data, error } = await supabase.from('rpg_profiles').select('id, login_name, role').eq('id', authUser.id).single();
    if (error || !data) throw new Error('A conta existe no Auth, mas ainda não tem perfil em rpg_profiles. Confira o README.');
    return { id: data.id, name: data.login_name, loginName: data.login_name, role: data.role };
  }, []);
  const loadCloudWorkspace = useCallback(async (loginName) => {
    const { data: profile, error: pErr } = await supabase.from('rpg_profiles').select('id, login_name').eq('login_name', loginName).single();
    if (pErr || !profile) throw new Error(`Não encontrei o perfil ${loginName} no banco.`);
    const { data, error } = await supabase.from('rpg_workspaces').select('payload').eq('user_id', profile.id).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o espaço de ${loginName}: ${error.message}`);
    if (data?.payload) return data.payload;
    const initial = seedWorkspace(loginName);
    const { error: insertError } = await supabase.from('rpg_workspaces').upsert({ user_id: profile.id, payload: initial }, { onConflict: 'user_id' });
    if (insertError) throw new Error(`Não foi possível criar o espaço inicial: ${insertError.message}`);
    return initial;
  }, []);
  const saveWorkspace = useCallback(async (data, ownerLogin) => {
    if (!data || !ownerLogin) return;
    if (!cloudEnabled) {
      try { localStorage.setItem(`arcana_workspace_${ownerLogin}`, JSON.stringify(data)); } catch (e) { console.warn(e); }
      if (ownerLogin === 'Mestre') {
        setCloudWorkspaces((old) => ({ ...old, Mestre: data }));
      } else if (user?.role === 'master') {
        setCloudWorkspaces((old) => ({ ...old, [ownerLogin]: data }));
      }
      return;
    }
    try {
      const { data: profile, error: profileError } = await supabase.from('rpg_profiles').select('id').eq('login_name', ownerLogin).single();
      if (profileError || !profile) throw profileError || new Error('Perfil não encontrado');
      const { error } = await supabase.from('rpg_workspaces').upsert({ user_id: profile.id, payload: data }, { onConflict: 'user_id' });
      if (error) throw error;
      if (user?.role === 'master') setCloudWorkspaces((old) => ({ ...old, [ownerLogin]: data }));
    } catch (e) { console.error(e); notify(`Falha ao sincronizar: ${e.message || 'verifique a conexão'}`); }
  }, [user, notify]);

  useEffect(() => {
    const onNavigate = (e) => setPage(e.detail);
    window.addEventListener('arcana-navigate', onNavigate);
    const onResource = (e) => {
      if (!workspace) return;
      const next = { ...workspace, characters: workspace.characters.map((c) => c.id === e.detail.id ? { ...c, [e.detail.key]: e.detail.value } : c) };
      setWorkspace(next); saveWorkspace(next, activeOwner);
    };
    window.addEventListener('arcana-resource-change', onResource);
    return () => { window.removeEventListener('arcana-navigate', onNavigate); window.removeEventListener('arcana-resource-change', onResource); };
  }, [workspace, activeOwner, saveWorkspace]);

  useEffect(() => {
    if (!cloudEnabled) return;
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted || !session?.user) return;
      try {
        const who = await fetchProfile(session.user);
        const data = await loadCloudWorkspace(who.loginName);
        if (mounted) { setUser(who); setWorkspace(data); setActiveOwner(who.loginName); setPage('overview'); }
        if (who.role === 'master') await refreshMasterData();
      } catch (e) { if (mounted) { setLoginError(e.message); await supabase.auth.signOut(); } }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && mounted) { setUser(null); setWorkspace(null); setActiveOwner(null); }
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshMasterData() {
    if (!cloudEnabled) {
      const all = {}; ACCOUNTS.forEach((a) => { all[a.name] = readLocalWorkspace(a.name); }); setCloudWorkspaces(all);
      return;
    }
    const { data, error } = await supabase.from('rpg_profiles').select('id, login_name, role');
    if (error) { notify(`Não foi possível listar jogadores: ${error.message}`); return; }
    setProfiles(data || []);
    const all = {};
    for (const p of data || []) {
      const { data: w } = await supabase.from('rpg_workspaces').select('payload').eq('user_id', p.id).maybeSingle();
      if (w?.payload) all[p.login_name] = w.payload;
    }
    setCloudWorkspaces(all);
  }

  async function handleLogin(loginName, password) {
    setLoginError(''); setLoginLoading(true);
    try {
      const account = ACCOUNTS.find((a) => a.name === loginName.replace(' · Mestre', ''));
      if (!account) throw new Error('Selecione uma conta válida.');
      if (!cloudEnabled) {
        if (password !== account.password) throw new Error('Senha incorreta. Confira a credencial da conta selecionada.');
        const who = { name: account.name, loginName: account.name, role: account.role, id: account.name };
        const data = readLocalWorkspace(account.name);
        setUser(who); setWorkspace(data); setActiveOwner(account.name); setPage('overview'); setRollHistory([]);
        if (account.role === 'master') refreshMasterData();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: accountEmail(account.name), password });
        if (error) throw new Error('Não foi possível entrar. Verifique a senha e se a conta foi criada no Supabase.');
        const who = await fetchProfile(data.user);
        const workspaceData = await loadCloudWorkspace(who.loginName);
        setUser(who); setWorkspace(workspaceData); setActiveOwner(who.loginName); setPage('overview'); setRollHistory([]);
        if (who.role === 'master') await refreshMasterData();
      }
    } catch (e) { setLoginError(e.message || 'Não foi possível entrar.'); }
    finally { setLoginLoading(false); }
  }
  async function handleLogout() {
    if (cloudEnabled) await supabase.auth.signOut();
    setUser(null); setWorkspace(null); setActiveOwner(null); setPage('overview'); setLoginError('');
  }
  function commitWorkspace(next) {
    setWorkspace(next);
    saveWorkspace(next, activeOwner);
    if (user?.role === 'master') setCloudWorkspaces((old) => ({ ...old, [activeOwner]: next }));
  }
  function openEditor(type, item = null) { setModal({ type, item: item ? deepCopy(item) : null }); }
  function saveItem(type, item) {
    const key = byType[type]; if (!key) return;
    const prev = workspace[key] || [];
    const exists = prev.some((entry) => entry.id === item.id);
    const next = { ...workspace, [key]: exists ? prev.map((entry) => entry.id === item.id ? item : entry) : [item, ...prev] };
    commitWorkspace(next); setModal(null); notify(`${type === 'character' ? 'Ficha' : type === 'campaign' ? 'Campanha' : type === 'system' ? 'Sistema' : type === 'session' ? 'Sessão' : type === 'lore' ? 'Entrada de lore' : 'Anotação'} salva com sucesso.`);
  }
  function deleteItem(type, item) {
    if (!window.confirm(`Excluir “${item.title || item.name}”? Esta ação não pode ser desfeita.`)) return;
    const key = byType[type]; const next = { ...workspace, [key]: workspace[key].filter((entry) => entry.id !== item.id) };
    commitWorkspace(next); notify('Item removido.');
  }
  async function openPlayerWorkspace(loginName) {
    try {
      if (cloudEnabled) {
        const data = await loadCloudWorkspace(loginName);
        setWorkspace(data); setActiveOwner(loginName); setPage('overview'); notify(`Espaço de ${loginName} aberto.`);
      } else {
        const data = readLocalWorkspace(loginName);
        setWorkspace(data); setActiveOwner(loginName); setPage('overview'); setCloudWorkspaces((old) => ({ ...old, [loginName]: data })); notify(`Espaço de ${loginName} aberto.`);
      }
    } catch (e) { notify(e.message || 'Não foi possível abrir o espaço.'); }
  }
  async function returnToOwnWorkspace() {
    if (!user) return;
    if (activeOwner === user.loginName) { setPage('overview'); return; }
    try {
      const data = cloudEnabled ? await loadCloudWorkspace(user.loginName) : readLocalWorkspace(user.loginName);
      setWorkspace(data); setActiveOwner(user.loginName); setPage('overview'); notify('Você voltou ao seu espaço.');
    } catch (e) { notify(e.message || 'Não foi possível abrir seu espaço.'); }
  }
  function managePlayerProfile(loginName) { openEditor('character', { player: loginName, system: 'Terras Longínquas', level: 1, hp: 19, maxHp: 19, mana: 19, maxMana: 19, attributes: { Força: 1, Agilidade: 1, Resistência: 1, Carisma: 1, Inteligência: 1 }, skills: ['Percepção', 'Sobrevivência'], inventory: ['Item de dano', 'Utensílio', 'Utensílio'] }); setPage('characters'); }
  function exportWorkspace() {
    const payload = { app: 'Arcana Mesa', version: 1, owner: activeOwner, exportedAt: new Date().toISOString(), workspace };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arcana-${String(activeOwner || 'mesa').toLowerCase().replaceAll(' ', '-')}-backup.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    notify('Backup exportado. Guarde o arquivo em um local seguro.');
  }
  async function importWorkspace(file) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const data = parsed.workspace || parsed;
      if (!data || !Array.isArray(data.campaigns) || !Array.isArray(data.characters) || !Array.isArray(data.notes) || !Array.isArray(data.systems)) {
        throw new Error('O arquivo não parece ser um backup válido do Arcana Mesa.');
      }
      if (!window.confirm('Importar este backup substituirá o conteúdo atual deste espaço. Deseja continuar?')) return;
      commitWorkspace({ ...seedWorkspace(activeOwner), ...data });
      notify('Backup importado com sucesso.');
    } catch (e) { notify(e.message || 'Não foi possível importar o arquivo.'); }
    finally { if (backupInputRef.current) backupInputRef.current.value = ''; }
  }
  function rollDice(sides, modifier = 0, reason = '', quantity = 1, mode = 'normal') {
    const count = Math.max(1, Math.min(50, Number(quantity) || 1));
    const rolls = () => Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    let results = rolls();
    if ((mode === 'advantage' || mode === 'disadvantage') && count === 1) {
      const two = [results[0], Math.floor(Math.random() * sides) + 1];
      results = [mode === 'advantage' ? Math.max(...two) : Math.min(...two)];
    }
    const total = results.reduce((a, b) => a + b, 0) + Number(modifier || 0);
    const record = { id: uuid(), sides, modifier: Number(modifier || 0), reason: reason || `${count}d${sides}`, formula: `${count}d${sides}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`, mode, results, total, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setRollHistory((old) => [record, ...old].slice(0, 30));
    notify(`Rolagem: ${record.total} · ${record.reason}`);
    return record;
  }
  const counts = useMemo(() => ({ characters: workspace?.characters?.length || 0 }), [workspace]);

  if (!user || !workspace) return <LoginScreen onLogin={handleLogin} error={loginError} loading={loginLoading}/>;
  const titles = pageTitles[page] || pageTitles.overview;
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} counts={counts} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20}/></button><div className="breadcrumbs"><span>ARCANA</span><ChevronRight size={13}/><strong>{titles[0]}</strong></div></div><div className="topbar-right"><input ref={backupInputRef} type="file" accept="application/json,.json" hidden onChange={(e) => importWorkspace(e.target.files?.[0])}/><button className="icon-button backup-action" title="Exportar backup JSON" onClick={exportWorkspace}><Download size={16}/></button><button className="icon-button backup-action" title="Importar backup JSON" onClick={() => backupInputRef.current?.click()}><Archive size={16}/></button><div className="connection-status"><span className="status-dot"/>{cloudEnabled ? 'Sincronizado' : 'Modo local'}</div>{user.role === 'master' && <button className="top-master-chip" onClick={() => setPage(page === 'master' ? 'overview' : 'master')}><ShieldCheck size={15}/>{page === 'master' ? 'Área do mestre' : 'Escudo do mestre'}</button>}<button className="top-user-chip" onClick={returnToOwnWorkspace}><div className={`avatar avatar-xs ${user.role === 'master' ? 'avatar-gold' : ''}`}>{user.role === 'master' ? <Crown size={13}/> : user.name.split(' ').map((v) => v[0]).join('').slice(0, 2)}</div><span>{activeOwner === user.loginName ? user.name : `${activeOwner} · visualizando`}</span><ChevronDown size={14}/></button></div></header>
      <div className="page-scroll"><div className="top-page-description"><span>{titles[1]}</span>{activeOwner !== user.loginName && user.role === 'master' && <button onClick={returnToOwnWorkspace}><ArrowDownRight size={14}/> Voltar ao meu espaço</button>}</div>
        {page === 'overview' && <Overview workspace={workspace} user={{ ...user, name: activeOwner === user.loginName ? user.name : activeOwner }} setPage={setPage} openEditor={openEditor} quickRoll={(d) => { rollDice(d, 0, 'Rolagem rápida'); setPage('dice'); }} onQuickEdit={() => {}}/>}
        {page === 'campaigns' && <CampaignsPage workspace={workspace} setPage={setPage} openEditor={openEditor} onDelete={deleteItem}/>}
        {page === 'characters' && <CharactersPage key={activeOwner} workspace={workspace} openEditor={openEditor} onDelete={deleteItem} rollDice={rollDice}/>}
        {page === 'world' && <WorldPage workspace={workspace} openEditor={openEditor} onDelete={deleteItem}/>}
        {page === 'notes' && <NotesPage workspace={workspace} openEditor={openEditor} onDelete={deleteItem}/>}
        {page === 'systems' && <SystemsPage workspace={workspace} openEditor={openEditor} onDelete={deleteItem}/>}
        {page === 'dice' && <DicePage onRoll={rollDice} history={rollHistory} clearHistory={() => setRollHistory([])}/>}
        {page === 'sessions' && <SessionsPage workspace={workspace} openEditor={openEditor} onDelete={deleteItem} setPage={setPage}/>}
        {page === 'master' && user.role === 'master' && <MasterPage user={user} workspace={workspace} activeOwner={activeOwner} onOpenPlayer={openPlayerWorkspace} onReturnMine={returnToOwnWorkspace} openEditor={openEditor} profiles={profiles} cloudWorkspaces={cloudWorkspaces} onManageProfile={managePlayerProfile} onDelete={deleteItem} isCloud={cloudEnabled}/>}
        {page === 'master' && user.role !== 'master' && <Overview workspace={workspace} user={user} setPage={setPage} openEditor={openEditor} quickRoll={(d) => rollDice(d, 0, 'Rolagem rápida')}/>}
        <footer className="app-footer"><span>ARCANA MESA <i>✦</i> FERRAMENTAS PARA NARRATIVAS EXTRAORDINÁRIAS</span><span>SEUS MUNDOS. SUAS REGRAS.</span></footer>
      </div>
    </main>
    {modal && <Editor modal={modal} onClose={() => setModal(null)} onSave={saveItem}/>}
    <Toast message={toast} onClose={() => setToast('')}/>
  </div>;
}
