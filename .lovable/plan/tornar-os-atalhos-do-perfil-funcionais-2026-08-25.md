# Tornar os atalhos do perfil funcionais

Escopo aprovado: os 4 atalhos da tela de Perfil — Salvos, Histórico de rolês, Configurações e Sou parceiro Rolei.

## 1. Salvos na nuvem
- Nova tabela `favorites` (user_id, kind: place|event, item_id) com RLS por usuário.
- `src/lib/favorites.functions.ts`: server functions para listar, adicionar e remover favoritos (autenticadas).
- Refatorar `useFavorites` (store.ts) para ler/gravar no backend com cache local como fallback offline.
- Tela Salvos e corações nos cards passam a sincronizar entre dispositivos.

## 2. Histórico de rolês
- Nova tabela `visit_history` (user_id, kind, item_id, visited_at) com RLS por usuário.
- Registrar automaticamente quando o usuário abre a tela de um local (`/place/$id`) ou salva interesse em evento.
- Nova tela `/history`: lista cronológica dos rolês vistos, com contagem no atalho do perfil (badge "12").

## 3. Configurações
- Nova tela `/settings` com:
  - Editar nome de exibição (user_profiles.display_name).
  - Preferências de notificação (salvas em user_profiles.prefs).
  - Trocar senha (via e-mail de redefinição já existente).
  - Sair da conta e excluir conta (com confirmação).

## 4. Área do parceiro
- Revisar o fluxo: atalho "Sou parceiro Rolei" leva a `/partner` se já houver perfil de parceiro, ou a `/auth` para cadastro/login.
- Remover badge "Novo" após o primeiro acesso (flag em prefs).
- Corrigir qualquer quebra de navegação/autenticação encontrada no caminho.

## Detalhes técnicos
- Migração única: tabelas `favorites` e `visit_history`, com GRANTs, RLS (cada usuário só vê os próprios dados) e índices.
- Rotas novas sob `_authenticated/`: `history.tsx`, `settings.tsx`.
- Favoritos e histórico continuam funcionando com os dados mock de `src/lib/data.ts` (item_id = id do mock); quando o catálogo real existir, basta reutilizar os ids.
- Exclusão de conta via server function com `requireSupabaseAuth` + cliente admin (remove dados do usuário).

## Fora do escopo desta etapa
- Catálogo real de estabelecimentos, métricas reais do painel, Guia Rolei com IA, upload de imagens no Storage, monetização.
