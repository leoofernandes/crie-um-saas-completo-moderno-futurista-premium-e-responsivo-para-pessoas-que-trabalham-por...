# Leads, administração e metadados públicos

## O que será feito
- Adicionar um seletor em cada lead do catálogo para atualizar seu status e recarregar a lista.
- Criar `/admin` dentro da área autenticada, com bloqueio antes da exibição para contas sem permissão administrativa.
- Mostrar usuários, assinaturas e planos reais; permitir editar preços e limite de veículos.
- Exibir um link discreto de administração apenas para a conta administradora.
- Carregar os dados públicos do catálogo no servidor e gerar título, descrição e imagem social dinâmicos nas duas páginas públicas.

## Segurança e banco
- Criar uma tabela separada de papéis de usuário e uma função segura `has_role`, migrando os administradores atuais sem expor dados.
- Adicionar políticas que permitem somente administradores ler todos os perfis e assinaturas e atualizar planos.
- Manter usuários comuns limitados aos próprios registros e validar essa separação com consultas autenticadas.

## Detalhes técnicos
- O painel administrativo ficará em `src/routes/_authenticated/admin.tsx`, resultando na URL `/admin` e reutilizando a proteção de login existente.
- Consultas administrativas usarão as políticas do banco com a sessão atual; nenhuma credencial privilegiada irá para o navegador.
- Os metadados públicos usarão `loader` e uma função pública no servidor, respeitando as políticas públicas existentes.
- As alterações ficarão restritas aos arquivos de leads, menu, administração, metadados públicos e à migração de segurança necessária.

## Validação
- Conferir atualização de status dos leads e invalidação da lista.
- Conferir redirecionamento de usuário comum e acesso da conta administradora.
- Conferir leitura/edição administrativa e isolamento entre contas.
- Conferir metadados renderizados no servidor para catálogo e veículo.
- Verificar compilação, tipos e erros recentes da prévia.
