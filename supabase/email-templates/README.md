# Templates de email — Hub de Produtividade

Templates HTML branded para os emails transacionais do Supabase Auth
(enviados via Resend SMTP).

## Como aplicar

No painel do Supabase: **Authentication → Emails → Templates**.
Para cada template, cole o HTML correspondente e ajuste o **Subject**.

| Arquivo | Template no Supabase | Assunto sugerido |
|---|---|---|
| `confirm-signup.html` | Confirm signup | Confirme seu cadastro no Hub de Produtividade |
| `reset-password.html` | Reset Password | Redefina sua senha do Hub de Produtividade |
| `magic-link.html` | Magic Link | Seu link de acesso ao Hub de Produtividade |
| `change-email.html` | Change Email Address | Confirme seu novo email no Hub de Produtividade |

## Importante — fluxo token_hash

Todos os links usam o fluxo `token_hash` + `/auth/confirm` (rota em
`app/auth/confirm/route.ts`), que funciona em qualquer navegador/aba —
diferente do fluxo PKCE (`?code=`), que falha em links de email.

URLs por tipo:

- Cadastro:   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
- Recuperação: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
- Magic Link:  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`
- Trocar email: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change`

## Pré-requisitos

- **Site URL** configurada em *Authentication → URL Configuration*:
  `https://hub-produtividade.crbasso.com`
- **Redirect URLs** incluindo: `https://hub-produtividade.crbasso.com/**`
- **SMTP** (Resend) ativo em *Authentication → Emails → SMTP Settings*.

## Observações de compatibilidade

- Layout em tabela + estilos inline (padrão para clientes de email).
- Cor primária: indigo `#4f46e5`.
- Largura máx. 480px, fontes do sistema (sem webfonts).
