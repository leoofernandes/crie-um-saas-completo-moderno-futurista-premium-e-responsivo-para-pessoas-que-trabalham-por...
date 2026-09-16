# Crie um SaaS completo, moderno, futurista, premium e responsivo para pessoas que trabalham por...

Crie um SaaS completo, moderno, futurista, premium e responsivo para pessoas que trabalham por conta própria com aluguel de veículos.

O objetivo é criar uma plataforma que permita ao usuário controlar seus carros alugados, clientes, contratos/aluguéis, pagamentos, manutenção, despesas, disponibilidade e divulgação dos veículos através de um mini-site personalizado.

O produto deve parecer uma startup SaaS moderna e tecnológica, e NÃO um sistema ERP antigo ou um software administrativo engessado.

==================================================

CONCEITO DO PRODUTO
==================================================

O produto é destinado principalmente a pessoas AUTÔNOMAS que possuem carros e alugam esses veículos para outras pessoas.

O usuário pode possuir:

1 carro
2 carros
5 carros
10 carros
20 carros
30 carros
50 carros
100+ carros

Não exigir CNPJ para utilizar o sistema.

Não assumir que o usuário possui uma empresa formal.

A comunicação deve priorizar:

"seus carros"
"sua frota"
"seus clientes"
"seus aluguéis"
"seus pagamentos"
"seus veículos"

Evitar posicionar o produto exclusivamente como:

"software para empresas"
"ERP para locadoras"
"sistema empresarial"

A proposta é:

"Comece com poucos carros e tenha controle profissional mesmo quando sua frota crescer."

Mensagem central:

"Seus carros. Seus clientes. Seus pagamentos. Tudo sob controle."

==================================================
2. POSICIONAMENTO

O produto deve ser percebido como um verdadeiro painel de controle da frota do usuário.

Não criar aparência de sistema tradicional.

O usuário deve sentir que está utilizando uma plataforma tecnológica de alto nível.

Características visuais:

Futurista

Premium

Minimalista

Dark SaaS

Tecnológico

Elegante

Profissional

Intuitivo

Mobile-first

Gráficos modernos

Microinterações

Glassmorphism moderado

Excelente hierarquia visual

Evitar:

Visual antigo de ERP

Excesso de tabelas

Excesso de bordas

Gradientes exagerados

Ícones infantis

Interface poluída

Visual genérico de template

Excesso de informações na mesma tela

A experiência deve lembrar um produto SaaS moderno de tecnologia financeira/frotas.

==================================================
3. IDENTIDADE VISUAL

Criar identidade visual própria e facilmente editável.

Utilizar no sistema uma interface predominantemente escura.

Paleta conceitual:

Preto

Grafite

Cinza profundo

Branco

Verde elétrico

Azul tecnológico

Verde e azul devem ser utilizados como cores de destaque para:

Indicadores

Gráficos

Botões principais

Estados positivos

Alertas

Elementos interativos

Utilizar efeitos de glow muito sutis quando apropriado.

Não exagerar nos efeitos.

Priorizar legibilidade e sofisticação.

Criar um logotipo provisório moderno usando o nome provisório do sistema.

O nome e o logo deverão ser facilmente substituíveis posteriormente.

==================================================
4. ARQUITETURA DO SISTEMA

Criar um SaaS real, e não apenas um protótipo visual.

Separar corretamente:

Landing Page

Autenticação

Área pública

Área privada

Banco de dados

Regras de negócio

Componentes

Serviços

Integrações

Utilizar arquitetura escalável.

Se utilizar Supabase:

Auth

Database

Storage

Row Level Security

Implementar proteção real dos dados.

Cada usuário deverá enxergar somente seus próprios dados.

Nunca permitir acesso entre contas.

==================================================
5. ROTAS PÚBLICAS

Criar:

/

Landing Page

/planos

Página de planos

/login

Login

/cadastro

Cadastro

/checkout

Checkout

/recuperar-senha

Recuperação de senha

/termos

Termos de uso

/privacidade

Política de privacidade

/catalogo/:slug

Mini-site público personalizado do usuário

/catalogo/:slug/veiculo/:id

Página pública individual do veículo

==================================================
6. ROTAS PRIVADAS

Criar:

/app

Dashboard

/app/veiculos

Veículos

/app/veiculos/novo

Novo veículo

/app/veiculos/:id

Detalhes do veículo

/app/clientes

Clientes

/app/clientes/novo

Novo cliente

/app/clientes/:id

Detalhes do cliente

/app/alugueis

Aluguéis

/app/alugueis/novo

Novo aluguel

/app/pagamentos

Pagamentos

/app/manutencoes

Manutenções

/app/despesas

Despesas

/app/relatorios

Relatórios

/app/catalogo

Personalização do mini-site

/app/notificacoes

Notificações

/app/configuracoes

Configurações

==================================================
7. LANDING PAGE

Criar uma landing page extremamente moderna e focada em conversão.

A primeira impressão deve ser de uma startup SaaS premium.

Não parecer site de locadora.

HEADER:

Logo

Recursos
Como funciona
Planos
FAQ

Botão:

"Entrar"

HERO:

Título:

"Controle seus carros alugados em um só lugar."

Subtítulo:

"Organize seus veículos, clientes, pagamentos, manutenções e aluguéis sem depender de planilhas."

CTA principal:

"Começar agora"

CTA secundário:

"Ver como funciona"

Adicionar:

"Já tenho uma conta → Entrar"

No hero, mostrar um mockup realista do dashboard.

==================================================
8. HERO VISUAL

Criar mockup visual do dashboard.

Mostrar:

Minha frota

32 veículos

25 alugados

5 disponíveis

2 em manutenção

Receita da semana

R$ 18.450

A receber

R$ 3.250

Pagamentos atrasados

R$ 650

Adicionar gráficos modernos.

O mockup deve parecer uma interface real.

==================================================
9. SEÇÃO DE PROBLEMAS

Mostrar situações que o público enfrenta:

"Quem está com qual carro?"

"Quem já pagou esta semana?"

"Quem está atrasado?"

"Qual carro está disponível?"

"Quando preciso fazer a próxima manutenção?"

"Quanto cada carro está gerando?"

"Quanto estou gastando com manutenção?"

"Está tudo espalhado em WhatsApp, planilhas e anotações?"

Mostrar essas dores de maneira visual e objetiva.

Finalizar com:

"Você não precisa controlar tudo na cabeça."

==================================================
10. SEÇÃO DE SOLUÇÃO

Apresentar a plataforma como um centro de controle.

Recursos:

🚗 Seus carros

👤 Seus clientes

💰 Seus pagamentos

📅 Seus aluguéis

🔧 Suas manutenções

📊 Seus resultados

🌐 Seu mini-site

📲 WhatsApp

Criar cards premium para cada recurso.

==================================================
11. COMO FUNCIONA

Criar uma seção em etapas:

01
Cadastre seus carros

02
Cadastre seus clientes

03
Defina o valor do aluguel

04
Controle os pagamentos

05
Acompanhe sua frota

06
Compartilhe seu catálogo

Utilizar visual de timeline ou fluxo.

==================================================
12. PLANOS

Criar página de planos.

Os planos devem ser baseados na quantidade de veículos.

Plano:

START
Até 5 veículos

Plano:

PRO
Até 20 veículos

Plano:

FROTA
Até 50 veículos

Plano:

FROTA+
Até 100 veículos

Plano:

PERSONALIZADO
Mais de 100 veículos

Os valores devem ser facilmente editáveis pelo administrador.

Não colocar valores fixos diretamente no código.

Cada plano deverá informar:

Limite de veículos

Clientes

Aluguéis

Pagamentos

Manutenção

Despesas

Mini-site

Relatórios

Notificações

Suporte

Preparar estrutura para cobrança mensal e anual.

==================================================
13. FLUXO DE CONTRATAÇÃO

IMPORTANTE:

Não criar um cadastro isolado antes da escolha do plano.

O fluxo principal deverá ser:

COMEÇAR AGORA

↓

ESCOLHER PLANO

↓

CRIAR CONTA

↓

PAGAMENTO

↓

CONTA CRIADA

↓

ONBOARDING

↓

DASHBOARD

Na página de planos:

Botão:

"Começar agora"

Ao clicar:

PASSO 1

Escolher plano.

PASSO 2

Criar conta.

Campos:

Nome
E-mail
WhatsApp
Senha
Confirmar senha

NÃO exigir CNPJ.

Checkbox:

"Li e concordo com os Termos de Uso e Política de Privacidade."

PASSO 3

Checkout.

Mostrar:

Plano escolhido
Valor
Periodicidade
Resumo

Botão:

"Assinar e começar"

PASSO 4

Após confirmação:

"Seu painel está pronto."

Botão:

"Acessar minha frota"

==================================================
14. TRIAL

Criar estrutura para período de teste gratuito.

O número de dias deverá ser configurável pelo administrador.

Mostrar no dashboard:

"Seu teste termina em X dias."

Botão:

"Escolher plano"

==================================================
15. LOGIN

Criar uma tela de login extremamente moderna.

Campos:

E-mail
Senha

Botão:

"Entrar"

Links:

"Esqueci minha senha"

"Ainda não tenho uma conta → Começar agora"

Preparar estrutura para login social futuramente.

==================================================
16. ONBOARDING

Após o primeiro acesso:

"Vamos configurar sua frota."

Perguntar:

"Quantos carros você aluga atualmente?"

Opções:

1
2–5
6–10
11–20
21–50
50+

IMPORTANTE:

Essa informação não deve bloquear nenhuma funcionalidade.

Depois:

"Cadastre seu primeiro carro."

Permitir pular etapas.

Ao finalizar:

"Seu painel está pronto."

==================================================
17. DASHBOARD

Criar dashboard futurista.

Topo:

"Boa tarde, [Nome]."

"Veja como está sua frota hoje."

Cards:

🚗 Minha frota

32 veículos

🟢 Alugados

25

🔵 Disponíveis

5

🔴 Em manutenção

2

💰 Recebido esta semana

R$ 18.450

💵 A receber

R$ 3.250

⚠️ Em atraso

R$ 650

Criar:

Gráfico de receita

Gráfico de ocupação

Gráfico de evolução dos recebimentos

Ranking dos veículos

Próximos pagamentos

Próximas manutenções

Alertas importantes

==================================================
18. VEÍCULOS

Criar página de veículos com visual moderno.

Preferir cards visuais e filtros ao invés de depender apenas de tabelas.

Cada veículo:

Foto principal
Marca
Modelo
Ano
Placa
Quilometragem
Valor do aluguel
Status
Cliente atual

Status:

🟢 Disponível

🔵 Alugado

🟠 Reservado

🔴 Manutenção

⚫ Inativo

Adicionar:

"+ Adicionar carro"

==================================================
19. FOTOS DOS VEÍCULOS

Permitir até 10 fotos por veículo.

Estrutura:

1 foto principal

9 fotos adicionais

Permitir:

Upload múltiplo

Escolher foto principal

Reordenar

Excluir

Substituir

Visualizar

Formatos:

JPG
PNG
WebP

Criar limite de tamanho configurável.

Após upload:

Redimensionar

Comprimir

Otimizar

Gerar thumbnail

Evitar armazenar arquivos desnecessariamente grandes.

A interface deve informar:

"Até 10 fotos por veículo."

==================================================
20. DETALHES DO VEÍCULO

Criar página completa.

Mostrar galeria de fotos.

Informações:

Marca
Modelo
Ano
Placa
Quilometragem
Valor
Status

Cliente atual

Próximo pagamento

Próxima manutenção

Criar abas:

Resumo
Aluguel
Pagamentos
Manutenção
Despesas
Histórico

==================================================
21. CLIENTES

Cadastrar:

Nome
CPF
WhatsApp
E-mail
Endereço
Observações

Mostrar:

Veículo atual
Valor do aluguel
Próximo vencimento
Status
Histórico

Não exigir CNPJ do cliente.

==================================================
22. ALUGUÉIS

Criar cadastro:

Cliente
Veículo
Data inicial
Data final opcional
Valor
Periodicidade
Dia de pagamento
Observações

Periodicidades:

Semanal
Quinzenal
Mensal
Personalizada

Ao criar o aluguel:

Atualizar status do veículo para "Alugado".

Gerar estrutura das cobranças futuras.

==================================================
23. PAGAMENTOS

Criar painel financeiro.

Mostrar:

Recebidos
Pendentes
Atrasados
Cancelados

Cada cobrança:

Cliente
Veículo
Valor
Vencimento
Data de pagamento
Status
Forma de pagamento

Status:

Pago
Pendente
Atrasado
Cancelado

Filtros:

Hoje
Semana
Mês
Período personalizado

==================================================
24. PIX E COBRANÇA

Preparar arquitetura para integração com gateway de pagamento.

Futuramente permitir:

Pix
QR Code
Pix copia e cola
Link de pagamento
Comprovante

Não simular pagamentos reais.

Se o gateway ainda não estiver configurado, criar a estrutura de integração sem fingir que o pagamento está funcionando.

==================================================
25. MANUTENÇÃO

Permitir registrar:

Troca de óleo
Pneus
Freios
Bateria
Revisão
Mecânica
Elétrica
Lavagem
Outros

Campos:

Data
Quilometragem
Valor
Descrição
Próxima manutenção
Observações

Criar alertas.

Exemplo:

"🚨 Onix 2022 está próximo da próxima troca de óleo."

==================================================
26. DESPESAS

Registrar despesas vinculadas ao veículo.

Exemplo:

Onix 2022

Categoria:
Manutenção

Valor:
R$350

Data:
14/09/2026

Criar categorias editáveis.

==================================================
27. RENTABILIDADE

Criar estrutura para mostrar:

Receita por veículo
Despesas por veículo
Resultado estimado

Criar ranking:

🏆 Mais rentáveis

⚠️ Maior custo

🅿️ Mais tempo parado

Permitir filtrar por:

Semana
Mês
Ano
Período personalizado

==================================================
28. MINI-SITE PERSONALIZADO

Este é um dos principais diferenciais do produto.

Cada usuário deverá possuir um mini-site público próprio para divulgar seus carros.

O sistema é seu, mas a vitrine pertence ao usuário.

Exemplo:

seusistema.com.br/catalogo/jr-carros

O usuário poderá escolher seu próprio:

Nome
Slug
Logo
Banner
Descrição
WhatsApp
Instagram

O mini-site deverá parecer um verdadeiro site profissional de aluguel de veículos.

Não parecer apenas uma página administrativa.

==================================================
29. PERSONALIZAÇÃO DO MINI-SITE

Dentro do painel:

"Personalizar meu site"

Campos:

Nome exibido
Descrição
Logo
Banner
Título principal
Texto secundário
WhatsApp
Instagram

Mostrar pré-visualização.

Permitir visualizar:

Desktop
Tablet
Celular

==================================================
30. BANNER DO MINI-SITE

Permitir upload de banner personalizado.

Dimensão recomendada:

1920 × 600 px

Formatos:

JPG
PNG
WebP

Máximo configurável de tamanho do arquivo.

O sistema deve otimizar automaticamente.

Criar:

Compressão

Redimensionamento

Conversão para formato otimizado

Preview

Criar ferramenta de enquadramento:

"Arraste para ajustar o enquadramento."

O usuário não precisa entender de edição de imagem.

==================================================
31. PÁGINA PÚBLICA

Estrutura:

HEADER

Logo
Nome
WhatsApp

HERO

Banner personalizado

Título
Descrição

Botão:

"Ver veículos"

SEÇÃO:

"Veículos disponíveis"

Mostrar cards.

Cada card:

Foto
Marca
Modelo
Ano
Categoria
Valor
Periodicidade
Disponibilidade

==================================================
32. PÁGINA INDIVIDUAL DO VEÍCULO

Ao clicar:

Abrir página individual.

Mostrar:

Galeria com até 10 fotos

Marca
Modelo
Ano
Categoria
Valor
Periodicidade
Descrição
Características
Disponibilidade

CTA:

"Tenho interesse neste carro"

==================================================
33. INTERESSE NO VEÍCULO

Ao clicar em:

"Tenho interesse neste carro"

Mostrar:

Nome
WhatsApp
Mensagem opcional

Registrar o lead no banco de dados.

Preparar futura área de leads.

Mostrar também:

"Falar pelo WhatsApp"

Gerar mensagem automática:

"Olá! Vi o [VEÍCULO] no seu catálogo e tenho interesse em alugar."

==================================================
34. LEADS

Preparar estrutura para leads.

Registrar:

Nome
WhatsApp
Veículo de interesse
Data
Mensagem
Status

Status:

Novo
Em atendimento
Alugado
Sem interesse

Não precisa construir CRM completo na primeira versão, mas preparar banco e arquitetura.

==================================================
35. COMPARTILHAMENTO

Dentro do painel criar:

"Compartilhar meu catálogo"

Mostrar URL pública.

Botões:

"Copiar link"

"Compartilhar no WhatsApp"

"Compartilhar"

Criar QR Code.

Permitir futuramente download do QR Code.

O link deve gerar uma prévia bonita quando enviado pelo WhatsApp ou redes sociais.

==================================================
36. SEO E OPEN GRAPH

Cada mini-site deve possuir:

Título
Descrição
Imagem de compartilhamento
URL amigável

Ao compartilhar o link:

Mostrar:

Nome
Imagem
Descrição

Configurar Open Graph.

==================================================
37. URL PERSONALIZADA

Permitir slug:

/catalogo/jr-carros

Validar:

Único

Sem espaços

Apenas caracteres permitidos

Fácil de compartilhar

Preparar futuramente para domínio próprio:

www.jrcarros.com.br

Não implementar domínio próprio inicialmente.

==================================================
38. STATUS DO MINI-SITE

Permitir:

Publicado
Privado

Quando privado:

"Seu catálogo ainda não está publicado."

==================================================
39. NOTIFICAÇÕES

Criar central de notificações.

Exemplos:

🔔 Pagamento vencendo

⚠️ Pagamento atrasado

🔧 Manutenção próxima

🚗 Carro disponível

📅 Aluguel próximo do vencimento

Registrar notificações.

==================================================
40. WHATSAPP

Preparar arquitetura para integração futura com WhatsApp.

Futuramente enviar:

Pagamento próximo
Pagamento atrasado
Manutenção próxima
Resumo semanal
Novo interesse em veículo

Preparar comandos futuros:

"Quem está atrasado?"

"Quanto recebi essa semana?"

"Quais carros estão disponíveis?"

"Quanto o Onix faturou?"

"Qual a próxima manutenção do HB20?"

Não fingir que a integração existe se ainda não estiver configurada.

==================================================
41. RELATÓRIOS

Criar relatórios visuais:

Receita
Despesas
Resultado
Pagamentos
Atrasos
Ocupação
Manutenção

Utilizar gráficos modernos.

Permitir filtros:

Hoje
Semana
Mês
Ano
Personalizado

==================================================
42. EXPERIÊNCIA MOBILE

Prioridade máxima para celular.

O usuário deve conseguir administrar praticamente toda sua frota pelo smartphone.

Criar navegação inferior no mobile:

Dashboard
Carros
Clientes
Pagamentos
Mais

Desktop:

Sidebar moderna.

Mobile:

Bottom navigation + menus secundários.

==================================================
43. BANCO DE DADOS

Criar estrutura relacional.

Tabelas principais:

users
profiles
plans
subscriptions
vehicles
vehicle_photos
customers
rentals
payments
maintenance
expenses
notifications
public_sites
site_leads

Preparar futuramente:

whatsapp_messages
contracts
documents
fines
insurance

==================================================
44. SEGURANÇA

Implementar:

Autenticação segura
Rotas privadas
Validação
Row Level Security
Proteção entre contas
Controle de acesso

Cada usuário só pode acessar seus próprios dados.

Nunca permitir exposição de dados de outros usuários.

Não armazenar senhas manualmente.

==================================================
45. ASSINATURAS

Estruturar:

Trial
Ativo
Pagamento pendente
Cancelado
Expirado

Registrar:

Plano
Limite de veículos
Data de início
Data de renovação
Status

Quando atingir limite:

Mostrar:

"Você atingiu o limite de veículos do seu plano."

Botão:

"Fazer upgrade"

==================================================
46. ADMINISTRADOR

Preparar arquitetura para painel administrativo.

Futuramente:

Usuários
Assinaturas
Planos
Receita
Cancelamentos
Quantidade de veículos
Atividade

O administrador deverá conseguir alterar:

Planos
Preços
Limites
Trial

Não construir tudo agora se isso comprometer a primeira versão, mas preparar arquitetura.

==================================================
47. DESIGN SYSTEM

Criar componentes reutilizáveis:

Button
Card
Modal
Input
Select
Badge
Toast
Chart
StatCard
VehicleCard
PaymentCard
MaintenanceCard
CustomerCard
EmptyState
LoadingState

Manter consistência.

==================================================
48. MICROINTERAÇÕES

Adicionar animações sutis:

Hover
Fade
Slide
Loading
Transições
Feedback de ações
Atualização de gráficos

Não exagerar.

O sistema deve parecer premium.

==================================================
49. LANDING PAGE — PROVA VISUAL

Mostrar visualmente:

Dashboard
Cards de veículos
Pagamentos
Manutenção
Mini-site

Criar uma seção:

"Seu painel de controle."

Mostrar dashboard em desktop e mobile.

==================================================
50. FAQ

Criar perguntas como:

"Preciso ter CNPJ?"

Resposta:

"Não. O sistema foi pensado também para quem trabalha por conta própria."

"Posso começar com poucos carros?"

"Sim. Você pode começar com poucos veículos e aumentar sua frota."

"Posso cadastrar muitos carros?"

"Sim. Escolha o plano de acordo com o tamanho da sua frota."

"Meus clientes conseguem ver meus carros?"

"Sim. Você terá um mini-site personalizado para compartilhar."

"Posso receber pagamentos?"

"Sim. O sistema será preparado para cobrança e integração com Pix e gateways."

==================================================
51. CTA FINAL

Criar seção:

"Seus carros. Seus clientes. Seus pagamentos. Tudo sob controle."

Subtítulo:

"Comece com poucos carros e tenha uma gestão profissional desde o primeiro aluguel."

Botão:

"Começar agora"

==================================================
52. PRINCÍPIO DE UX

O usuário deve conseguir:

Cadastrar um carro rapidamente.

Cadastrar um cliente rapidamente.

Criar um aluguel rapidamente.

Registrar um pagamento rapidamente.

Ver quem está atrasado rapidamente.

Ver quais carros estão disponíveis rapidamente.

Ver próximas manutenções rapidamente.

Compartilhar seu catálogo rapidamente.

Evitar telas excessivamente complexas.

==================================================
53. ESTADOS DA INTERFACE

Criar:

Loading
Empty state
Error state
Success state
Confirmation modal

Nunca deixar uma ação sem feedback.

Exemplo:

Ao salvar carro:

"Veículo cadastrado com sucesso."

Ao excluir:

"Tem certeza que deseja excluir este veículo?"

==================================================
54. SEO

Configurar Landing Page para SEO.

Title
Meta description
Open Graph
Favicon
URLs amigáveis

Utilizar naturalmente termos relacionados:

gestão de aluguel de carros
controle de carros alugados
sistema para aluguel de carros
gestão de veículos
controle de pagamentos
controle de manutenção
gestão de frota

Não utilizar keyword stuffing.

==================================================
55. RESPONSIVIDADE

Garantir funcionamento perfeito em:

iPhone
Android
Tablet
Notebook
Desktop

Testar especialmente:

Dashboard
Cadastro
Cards
Gráficos
Mini-site
Checkout
Login

==================================================
56. PERFORMANCE

O sistema deve ser otimizado.

Imagens devem ser:

Comprimidas
Redimensionadas
Otimizadas

Evitar carregamento desnecessário.

Utilizar lazy loading quando apropriado.

Não carregar todas as imagens dos veículos simultaneamente quando não necessário.

==================================================
57. ARQUITETURA DE FUTURO

Preparar o sistema para:

WhatsApp
IA
Pix
Cobrança automática
Contratos digitais
Assinatura eletrônica
Multas
Seguro
Documentação
Domínio personalizado
CRM
Múltiplos usuários
Funcionários
Múltiplas frotas

Não implementar tudo agora.

Criar arquitetura que permita evolução.

==================================================
58. PRIORIDADE DE DESENVOLVIMENTO

PRIMEIRA FASE:

Landing Page
Identidade visual
Planos
Escolha de plano
Cadastro
Login
Autenticação
Banco de dados
Dashboard
Veículos
Fotos
Clientes
Aluguéis
Pagamentos
Manutenção
Despesas

SEGUNDA FASE:

Assinatura
Trial
Checkout
Mini-site
Banner
Personalização
URL pública
Compartilhamento
QR Code
Interesse no veículo
Leads
Relatórios

TERCEIRA FASE:

Pix
Cobrança automática
WhatsApp
Notificações WhatsApp
IA
Contratos
Documentação
Multas
Seguro

==================================================
59. IMPORTANTE — NÃO CRIAR FUNCIONALIDADE FALSA

Não criar botões que aparentem executar ações reais quando não existe backend.

Não simular pagamento como se tivesse sido processado.

Não afirmar que WhatsApp está conectado quando não estiver.

Não criar dados fictícios permanentes no banco.

Dados demonstrativos podem ser utilizados apenas na Landing Page para apresentar o produto.

No sistema autenticado, utilizar banco de dados real.

==================================================
60. QUALIDADE FINAL

Antes de considerar o projeto concluído, verificar:

Landing Page
Navegação
Planos
Escolha de plano
Cadastro
Login
Logout
Recuperação de senha
Autenticação
Dashboard
Veículos
Upload de fotos
Limite de 10 fotos
Clientes
Aluguéis
Pagamentos
Manutenção
Despesas
Mini-site
Banner
Logo
Slug
Compartilhamento
QR Code
Página pública
Página individual do veículo
Formulário de interesse
Responsividade
Mobile
Segurança
Row Level Security
Banco de dados
Loading
Erros
Estados vazios
SEO
Open Graph

O produto final deve parecer um SaaS comercial real.

A prioridade é criar uma experiência extremamente moderna e diferenciada visualmente, mas sem sacrificar funcionalidade, segurança, performance e escalabilidade.

NÃO transformar o projeto em um ERP tradicional.

O produto deve transmitir:

"Controle profissional da sua frota, sem complicação."

E permitir que uma pessoa que tenha apenas um carro consiga começar hoje, enquanto alguém com 100+ veículos consiga utilizar o mesmo sistema para administrar toda sua operação.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1dec846f-466e-46b4-bef3-01fb22e5e54d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
