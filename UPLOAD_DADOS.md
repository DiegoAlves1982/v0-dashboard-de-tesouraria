# Guia de Upload de Dados - Dashboard CONTH

## Como Usar o Dashboard com Seus Dados

O dashboard agora suporta upload direto de arquivos Excel, CSV, PDF e Google Sheets. Não é mais necessário editar código ou rodar scripts Python manualmente!

## Fluxo de Uso

### 1. Acessar o Dashboard
- Publique o projeto no Vercel ou acesse localmente em `http://localhost:3000`

### 2. Fazer Upload de Dados
1. Clique no botão **Upload** (ícone de pasta com seta para cima) no header
2. Arraste seu arquivo ou clique para selecionar
3. Formatos aceitos: **Excel (.xlsx, .xls), CSV, PDF**

### 3. Processamento Automático
- O arquivo será processado automaticamente
- O sistema detecta automaticamente:
  - Colunas de data, valor, descrição
  - Formato de data (DD/MM/YYYY ou MM/DD/YYYY)
  - Tipo de valor (positivo/negativo para receita/despesa)
- Os indicadores e gráficos atualizam em tempo real

## Estrutura de Arquivo Esperada

### Opção 1: Colunas Simples (Recomendado)
```
Data       | Descrição              | Valor
25/10/2025 | Locação Caminhão AB123 | 2500.00
26/10/2025 | Pagamento Fornecedor   | -1200.50
27/10/2025 | Venda de Peças         | 850.00
```

### Opção 2: Com Categoria
```
Data       | Descrição              | Categoria | Valor
25/10/2025 | Locação Caminhão       | Receita   | 2500.00
26/10/2025 | Pagamento Fornecedor   | Despesa   | -1200.50
```

### Opção 3: Separado (Receita e Despesa)
```
Data       | Descrição     | Receitas | Despesas
25/10/2025 | Locação       | 2500.00  |
26/10/2025 | Fornecedor    |          | 1200.50
```

## Nomes de Colunas Aceitos (Detecta Automaticamente)

**Data:** `Data`, `Date`, `Data_Lancamento`, `dt_lanc`, `Date_Posted`

**Descrição:** `Descrição`, `Description`, `Desc`, `Historico`, `History`

**Valor:** `Valor`, `Amount`, `Value`, `Total`, `Montante`, `Receita`, `Despesa`

**Categoria:** `Categoria`, `Category`, `Type`, `Tipo`

## O Que é Calculado Automaticamente

Após o upload, o sistema calcula:

### KPIs (Indicadores Chave)
- **Receita Total**: Soma de todas as entradas
- **Saídas**: Soma de todas as despesas
- **Média de Saídas Mensais**: Gasto médio por mês
- **Ticket Médio**: Valor médio por transação
- **Perpetuidade**: Quantos meses o caixa suporta

### Gráficos Atualizados
- **Fluxo de Caixa Diário**: Evolução saldo por dia
- **Receitas vs Despesas**: Comparação mensal
- **Posição de Estoque**: Distribuição de ativos
- **Previsibilidade**: Indicadores de crescimento

### Análises
- Tendências (crescimento/queda)
- Margens de lucro
- Categorias mais lucrativas
- Evolução mês a mês

## Dados de Demonstração

Ao abrir o dashboard pela primeira vez, você verá dados de demonstração. O badge "Dados Demo" aparece no header quando está usando dados de exemplo.

Para usar seus dados reais, clique em **Upload** e selecione seu arquivo.

## Problemas Comuns

### "Arquivo não reconhecido"
- Verifique se o arquivo está em Excel (.xlsx), CSV ou PDF
- Certifique-se que as colunas têm nomes similares aos listados acima
- Tente renomear colunas: "Data", "Descrição", "Valor"

### "Nenhuma linha foi processada"
- O arquivo pode estar vazio
- Verifique se há dados além do header
- Tente com o exemplo em `scripts/dados/exemplo_dados.csv`

### "Datas não foram reconhecidas"
- Use formato DD/MM/YYYY ou MM/DD/YYYY
- Não misture formatos no mesmo arquivo
- Evite valores de texto em colunas de data

## Exportação de Dados

Você pode exportar os dados processados em:
- **CSV**: Para abrir em Excel novamente
- **JSON**: Para integração com outros sistemas
- **Imprimir**: Para documentos físicos

Clique no botão **Exportar** (ícone de download) no header.

## Suporte Técnico

Se você tiver problemas com upload ou processamento:

1. Verifique o formato do arquivo
2. Tente com um arquivo menor primeiro
3. Use o exemplo em `scripts/dados/exemplo_dados.csv` como referência
4. Verifique o console do navegador (F12) para mensagens de erro

## Próximas Atualizações

- Integração com Google Sheets em tempo real
- Upload de múltiplos arquivos simultâneos
- Histórico de uploads com versioning
- Alertas automáticos para anomalias
