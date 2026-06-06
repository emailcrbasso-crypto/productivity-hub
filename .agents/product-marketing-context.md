# Product Marketing Context — Hub de Produtividade

> Documento de contexto para skills de marketing (copy, social, email, SEO, etc.).
> Mantenha atualizado conforme o produto evoluir.

## Visão geral

**Nome:** Hub de Produtividade
**URL:** https://hub-produtividade.crbasso.com
**O que é:** PWA (web app instalável) que reúne **6 métodos de produtividade** em um só lugar, com **gamificação** (XP, níveis, sequência e conquistas) para manter a consistência.
**Empresa:** CR BASSO (será divulgado no blog da CR BASSO + LinkedIn pessoal do criador).
**Modelo atual:** acesso por convite/link (lead magnet); sem cobrança no momento.

## Proposta de valor (1 frase)

Pare de pular entre 5 apps: organize tarefas, foco, agenda, metas e hábitos
num só lugar — e mantenha a consistência porque cada conclusão vira XP.

## Diferenciais

- **6 métodos integrados** (não é "mais um app de tarefas"):
  - Matriz de **Eisenhower** (urgência × importância)
  - Matriz **Impacto × Esforço** (retorno do esforço)
  - **Pomodoro** (foco cronometrado, funciona em segundo plano)
  - **Time Boxing** (dia em blocos, timeline visual)
  - **Plano Semanal** (metas + revisão semanal)
  - **Hábitos** (check diário com sequência por hábito)
- **Gamificação real e transversal:** XP, níveis, streak e conquistas alimentados
  por TODOS os módulos (inclusive conquistas específicas de hábitos).
- **Tudo conectado:** meta → vira tarefa no Eisenhower → agenda no Time Boxing →
  foca no Pomodoro, sem trocar de app. Tarefas podem ser vinculadas ao Pomodoro.
- **Dashboard "Seu dia"** + **Relatórios** com gráficos (XP/dia, foco/dia, por módulo).
- **Sincroniza com o calendário** (feed .ics: Google/Apple/Outlook).
- **PWA**: instala no celular/desktop, dark mode, notificações de fim de foco.

## Público-alvo (ICP)

- **Primário:** profissionais e empreendedores (PME, autônomos, gestores) que já
  tentaram métodos de produtividade mas não mantêm consistência.
- **Secundário:** estudantes e pessoas em transição de carreira que querem
  organização + motivação.
- **Dores:** ferramentas espalhadas, falta de consistência, "ocupado mas não
  produtivo", abandono de apps no 3º dia.
- **Desejos:** clareza de prioridades, foco, hábitos que pegam, sensação de progresso.

## Tom de voz

- Próximo, direto e prático (PT-BR). Sem jargão acadêmico.
- Evitar termos que precisem de explicação (ex.: "Eat the Frog / o sapo" foi
  deliberadamente NÃO usado por gerar confusão).
- Pode usar gancho pessoal (jornada de quem construiu) no LinkedIn pessoal;
  tom mais institucional/educacional no conteúdo CR BASSO.

## Marca

- **Cor primária:** indigo (#4f46e5), com gradiente índigo (#818cf8 → #6366f1 → #4338ca).
- **Logo:** tile arredondado com gradiente + raio branco; lockup "Hub / PRODUTIVIDADE".
  Componente em `components/brand/Logo.tsx`. Ícones em `public/icon*.png|svg`.
- **Estética:** SaaS limpo, minimalista, muito espaço em branco, cantos arredondados.

## Objetivos de marketing

1. **Post no LinkedIn pessoal** (criador): gerar comentários e pedidos de acesso.
   Mecânica: gancho → valor → CTA "comenta HUB que te mando o link".
   (Link NÃO no corpo do post; enviar por comentário/DM.)
2. **Post de produtividade para a CR BASSO**: foco em **geração de lead**
   (conteúdo educacional → hub como recurso/isca).
3. Futuro possível: blog CR BASSO (SEO de produtividade), waitlist, etc.

## Provas / números (preencher conforme surgirem)

- Métricas de uso, depoimentos e prints de progresso ainda a coletar.

## Stack (referência rápida)

Next.js (App Router) · Supabase (auth + Postgres + RLS) · Tailwind v4 ·
PWA · deploy Vercel · emails via Resend (SMTP).

## Restrições / observações

- Gamificação é por usuário (sem ranking público hoje) — não prometer leaderboard.
- App em PT-BR, fuso fixo Brasil (UTC-3).
