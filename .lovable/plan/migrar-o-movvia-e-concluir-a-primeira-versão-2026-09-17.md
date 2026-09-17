# Migrar o movvia e concluir a primeira versão

## Objetivo
Transferir o backend atual para um projeto Supabase novo na sua conta, incluindo usuários, dados e imagens, e concluir a Fase 1 com mini-site sem interromper o que já funciona.

## Sua próxima ação
1. Crie um projeto vazio em sua conta no Supabase.
2. No Lovable, abra as configurações do projeto e conecte esse novo projeto Supabase.
3. Volte aqui e diga **“conectado”**. Não envie senha, URL do banco ou chaves no chat.

Enquanto essa conexão não estiver pronta, o aplicativo continuará usando o Lovable Cloud atual. A troca definitiva só acontecerá depois da conferência dos dados.

## Implementação
- Concluir a base protegida do painel, onboarding e navegação mobile/desktop.
- Finalizar veículos com galeria de até 10 fotos, clientes, aluguéis, pagamentos, manutenções e despesas.
- Finalizar relatórios, notificações, configurações e estados de carregamento, vazio, erro e sucesso.
- Finalizar personalização do catálogo, páginas públicas, detalhes do veículo, leads, link, WhatsApp e QR Code.
- Manter checkout apenas estrutural, sem processar ou simular pagamentos reais.

## Migração
- Aplicar no projeto novo os tipos, tabelas, índices, permissões, regras por usuário, funções e gatilhos já versionados.
- Recriar os armazenamentos privados `vehicle-photos` e `site-assets` com as mesmas regras.
- Transferir usuários, perfis e registros preservando identificadores e relações.
- Copiar os arquivos enviados e manter as referências corretas.
- Trocar a conexão do app somente após comparar contagens e testar uma inclusão, leitura, edição e exclusão.

## Validação
- Cadastro, login, logout e recuperação de senha.
- Isolamento total entre contas e acesso público somente ao catálogo publicado.
- Fluxos principais no celular e desktop.
- Limite de fotos, criação de aluguel, pagamentos, alertas e interesse em veículo.
- Metadados próprios em todas as páginas públicas e ausência de erros no navegador.

## Limites desta etapa
- Pix, cobrança real, WhatsApp automatizado, IA e domínio próprio continuam apenas preparados para o futuro.
- A migração de usuários e dados depende da conexão do novo projeto Supabase.
