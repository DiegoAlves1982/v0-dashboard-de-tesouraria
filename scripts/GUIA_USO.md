# CONTH - Processador de Dados Financeiros

## Visão Geral

Este script Python processa dados financeiros de múltiplas fontes e gera um JSON com todos os indicadores necessários para o Dashboard de Tesouraria.

## Fontes de Dados Suportadas

| Formato | Extensões | Biblioteca |
|---------|-----------|------------|
| Excel | `.xlsx`, `.xls` | pandas + openpyxl |
| CSV | `.csv` | pandas ou csv nativo |
| PDF | `.pdf` | pdfplumber |
| Google Sheets | ID da planilha | gspread |

## Instalação

```bash
cd scripts
uv sync
```

## Como Usar

### 1. Processar Arquivos Excel/CSV

Coloque seus arquivos na pasta `dados/` e execute:

```bash
uv run processar_dados.py
```

Ou processe um arquivo específico:

```bash
uv run processar_dados.py relatorio_janeiro.xlsx
uv run processar_dados.py dados_financeiros.csv
```

### 2. Processar PDF

```bash
uv run processar_dados.py extrato_bancario.pdf
```

### 3. Processar Google Sheets

Primeiro, configure as credenciais:
1. Acesse Google Cloud Console
2. Crie um projeto e ative a API do Google Sheets
3. Crie uma conta de serviço e baixe o arquivo `credentials.json`
4. Compartilhe a planilha com o email da conta de serviço

```bash
uv run processar_dados.py --google "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
```

### 4. Gerar Dados de Teste

```bash
uv run processar_dados.py --teste
```

## Formato dos Dados de Entrada

### Colunas Obrigatórias

| Coluna | Descrição | Nomes Aceitos |
|--------|-----------|---------------|
| **data** | Data da transação | data, date, dt, data_lancamento |
| **valor** | Valor da transação | valor, value, vlr, montante, amount |

### Colunas Opcionais

| Coluna | Descrição | Nomes Aceitos |
|--------|-----------|---------------|
| tipo | Receita ou Despesa | tipo, type, natureza, entrada_saida |
| categoria | Classificação | categoria, category, grupo, classificacao |
| descricao | Descrição | descricao, description, historico |
| cliente | Cliente/Fornecedor | cliente, fornecedor, cliente_fornecedor |
| vencimento | Data de vencimento | vencimento, due_date, dt_venc |

### Exemplo de CSV

```csv
data,tipo,categoria,valor,descricao,cliente_fornecedor,vencimento
2026-01-05,receita,Locação,45000.00,Locação de equipamentos,TRUCKS CONTROL,2026-01-10
2026-01-10,despesa,Operacional,8500.00,Manutenção de frota,Fornecedor A,2026-01-10
```

### Formatos de Data Aceitos

- `YYYY-MM-DD` (2026-01-15)
- `DD/MM/YYYY` (15/01/2026)
- `DD-MM-YYYY` (15-01-2026)
- `DD.MM.YYYY` (15.01.2026)

### Formatos de Valor Aceitos

- `45000.00` (decimal com ponto)
- `45.000,00` (formato brasileiro)
- `R$ 45.000,00` (com símbolo)
- `(5000.00)` (negativo entre parênteses)

### Identificação de Tipo (Receita/Despesa)

O sistema reconhece automaticamente:

**Receita:** receita, entrada, crédito, recebimento, venda, C, E

**Despesa:** despesa, saída, débito, pagamento, compra, D, S

Se não especificado, usa o sinal do valor (positivo = receita).

## Saída

O script gera dois arquivos:

### 1. `dados_dashboard.json`

Contém todos os indicadores calculados:

```json
{
  "kpis": {
    "receita_total": { "total": 1310000, "liquido": 872660, "percentual_caixa": 66.6 },
    "saidas": { "total": 438350, "percentual_saidas": 33.4 },
    "media_saidas_mensais": { "media": 73058.80, "perpetuidade_meses": 11.94 },
    "ticket_medio": { "atual": 1992.42, "previsto": 2336.12, "variacao": 17.3 }
  },
  "graficos": {
    "fluxo_caixa_diario": [...],
    "receitas_despesas_por_mes": [...],
    "despesas_por_categoria": [...],
    "maiores_clientes": [...]
  },
  "previsibilidade": {
    "perpetuidade_caixa": { "meses": 11.94, "saldo_atual": 872660 },
    "ponto_equilibrio": { "valor": 350000, "percentual_atingido": 89.5 },
    "ebitda": { "valor": 256000, "margem": 28.5, "variacao": 12.3 }
  }
}
```

### 2. `transacoes.json`

Lista completa das transações processadas para auditoria.

## Fluxo de Trabalho Mensal

1. **Receba os dados** (Excel, PDF ou CSV do cliente)
2. **Coloque na pasta** `scripts/dados/`
3. **Execute o script:** `uv run processar_dados.py`
4. **Copie o JSON** para atualizar o dashboard
5. **Entregue o dashboard** ao cliente

## Personalização

### Adicionar Novas Colunas

Edite `MAPEAMENTO_COLUNAS` no início do script:

```python
MAPEAMENTO_COLUNAS = {
    'data': ['data', 'date', 'sua_coluna_customizada'],
    # ...
}
```

### Adicionar Novos Tipos

Edite `PALAVRAS_RECEITA` e `PALAVRAS_DESPESA`:

```python
PALAVRAS_RECEITA = ['receita', 'entrada', 'seu_termo']
PALAVRAS_DESPESA = ['despesa', 'saida', 'seu_termo']
```

## Troubleshooting

### Erro: pandas não instalado

```bash
uv add pandas openpyxl
```

### Erro: Arquivo de credenciais não encontrado

Para Google Sheets, baixe o `credentials.json` do Google Cloud Console.

### Colunas não reconhecidas

Verifique se os nomes das colunas estão no `MAPEAMENTO_COLUNAS` ou renomeie no arquivo de origem.

### Valores zerados

O script ignora linhas com valor igual a zero.
