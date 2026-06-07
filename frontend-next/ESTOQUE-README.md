# Sistema de Estoque - VetHub Central

## Funcionalidades Implementadas

### 1. Cadastro de Produtos
- **Rota**: `/estoque/novo-produto`
- **Campos disponíveis**:
  - Informações básicas: código, nome, categoria, marca, fornecedor, localização
  - Preços: preço de compra, preço de venda
  - Estoque: quantidade atual, quantidade mínima
  - Informações adicionais: unidade de medida, data de validade, status, observações

### 2. Visualização de Produtos
- **Rota**: `/estoque/visualizar/[id]`
- Exibe todos os detalhes do produto
- Alerta visual para produtos com estoque baixo
- Botões para editar e excluir

### 3. Edição de Produtos
- **Rota**: `/estoque/editar/[id]`
- Formulário pré-preenchido com dados atuais
- Validação de campos obrigatórios
- Atualização em tempo real

### 4. Exclusão de Produtos
- Confirmação antes da exclusão
- Remoção permanente do produto

### 5. Importação de Produtos
- **Formato**: CSV
- **Campos obrigatórios**: codigo, nome, categoria, precoCompra, precoVenda, quantidadeAtual, quantidadeMinima
- **Validações**:
  - Verificação de campos obrigatórios
  - Validação de códigos únicos
  - Tratamento de erros com relatório detalhado

### 6. Exportação de Produtos
- Exporta todos os produtos em formato CSV
- Download automático do arquivo
- Inclui todos os campos do produto

## Formato do CSV para Importação

```csv
codigo,nome,categoria,marca,fornecedor,localizacao,precoCompra,precoVenda,quantidadeAtual,quantidadeMinima,unidadeMedida,dataValidade,status,observacoes
VERM001,Vermífugo Canino,Medicamentos,VetPharma,Distribuidora ABC,Prateleira A1,25.50,45.00,50,10,Comprimido,2025-12-31,ativo,Para cães de 10-20kg
```

### Campos Obrigatórios:
- `codigo`: Código único do produto
- `nome`: Nome do produto
- `categoria`: Categoria do produto
- `precoCompra`: Preço de compra (número)
- `precoVenda`: Preço de venda (número)
- `quantidadeAtual`: Quantidade em estoque (número)
- `quantidadeMinima`: Quantidade mínima (número)

### Campos Opcionais:
- `marca`: Marca do produto
- `fornecedor`: Fornecedor do produto
- `localizacao`: Localização no estoque
- `unidadeMedida`: Unidade de medida
- `dataValidade`: Data de validade (formato: YYYY-MM-DD)
- `status`: Status do produto (ativo/inativo)
- `observacoes`: Observações adicionais

## Estatísticas do Estoque

O sistema calcula automaticamente:
- **Total de Produtos**: Quantidade total de produtos cadastrados
- **Produtos Ativos**: Produtos com status "ativo"
- **Estoque Baixo**: Produtos com quantidade atual menor que a mínima
- **Valor Total**: Soma do valor total do estoque (quantidade × preço de venda)

## Filtros e Busca

- **Busca por termo**: Pesquisa em nome, código, categoria e marca
- **Filtro por categoria**: Filtra produtos por categoria específica
- **Filtro por status**: Filtra produtos ativos ou inativos

## Arquivo de Exemplo

Um arquivo `exemplo-produtos.csv` foi criado na raiz do projeto com dados de exemplo para testar a funcionalidade de importação.

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Ícones**: Lucide React
- **Processamento CSV**: Implementação nativa JavaScript
- **Gerenciamento de Estado**: React Hooks (useState, useEffect)
- **Roteamento**: Next.js App Router