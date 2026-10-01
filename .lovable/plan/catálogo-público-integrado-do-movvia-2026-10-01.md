# Catálogo público integrado do movvia

## Resultado
- Transformar “Meu catálogo” em uma central completa para configurar, visualizar, publicar e compartilhar o site público.
- Reutilizar os mesmos carros e fotos do painel; nenhuma informação de veículo será duplicada.
- Manter o site público premium, rápido e priorizado para celular, com páginas de catálogo e detalhes do carro.

## Central “Meu catálogo”
- Organizar a área em: Visão geral, Personalização, Veículos, Aparência, Compartilhar e Leads.
- Permitir editar nome, link exclusivo, logo, banner e enquadramento, títulos, descrição, seção Sobre, WhatsApp, Instagram, cidade/região e texto do rodapé.
- Mostrar estado publicado/privado, ações para publicar, visualizar e compartilhar, além de preview para celular, tablet e computador.
- Permitir mostrar/ocultar cada carro e alterar sua ordem no catálogo sem excluir ou duplicar o cadastro.
- Exibir leads com carro, data, mensagem, status e ação real para conversar pelo WhatsApp.

## Site público
- Preservar a URL `/catalogo/{slug}` e a página `/catalogo/{slug}/veiculo/{id}`, ambas sem login.
- Completar cabeçalho, banner, filtros reais, cards, estados vazios, Sobre, contato, rodapé e WhatsApp acessível no celular.
- Manter fotos reais como destaque, galeria com até 10 imagens, zoom, informações, preço, disponibilidade e formulário de interesse persistido.
- Atualizar automaticamente preço, foto, descrição e status quando o proprietário altera o carro no painel.

## Dados e segurança
- Aproveitar `public_sites`, `vehicles.show_in_catalog`, `vehicles.catalog_order`, `vehicle_photos` e `site_leads` já existentes.
- Adicionar somente os campos editoriais realmente ausentes, como horário e texto do rodapé, com permissões restritas ao proprietário.
- Manter visitantes limitados a catálogos publicados, carros públicos e envio de interesse; nunca expor clientes, CPF, pagamentos, despesas ou dados internos.
- Registrar em migração os campos atuais que ainda não estão reproduzíveis e manter os arquivos enviados nos espaços existentes.

## Compartilhamento e descoberta
- Gerar link copiável, compartilhamento nativo/WhatsApp e QR Code funcional a partir da URL real.
- Gerar título, descrição, imagem social e URL dinâmica no servidor para catálogo e veículo, com imagem apenas quando houver arquivo público válido.
- Não apresentar reserva, pagamento, WhatsApp automatizado ou qualquer integração inexistente como funcional.

## Validação
- Verificar criação e personalização do catálogo, slug único, upload e enquadramento das imagens, visibilidade e ordem dos carros.
- Conferir publicar → abrir URL → ver veículo → enviar interesse → receber e atualizar lead.
- Alterar status, preço e foto de um carro e confirmar a atualização pública automática.
- Conferir isolamento entre contas, acesso anônimo restrito e experiência em celular, tablet e computador.
- Finalizar com compilação e tipos sem erros.