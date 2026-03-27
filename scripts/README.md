# Dashboard de Tesouraria - Sistema Python de Processamento de Dados Financeiros

Este sistema processa dados financeiros (receitas e despesas) e calcula todos os indicadores do dashboard de tesouraria automaticamente.

## Características

### Indicadores Históricos
- **Receitas por Vencimento**: Agrupa receitas pela data de vencimento
- **Despesas por Vencimento**: Agrupa despesas pela data de vencimento
- **Despesas por Categoria**: Análise de despesas por tipo (operacional, variável, fixa, etc.)
- **Receita por Categoria**: Análise de receitas por tipo (vendas, locação, serviços)
- **Fluxo de Caixa Diário**: Movimentação diária com saldo acumulado
- **Maiores Clientes**: Top 10 clientes por volume de receita
- **Lucro Bruto e Margem por Mês**: Resultado financeiro mensal com percentual de margem
- **Posição de Estoque**: Saldo por categoria

### Indicadores de Previsibilidade
- **Perpetuidade do Caixa**: Valor presente do fluxo de caixa futuro
- **Ponto de Equilíbrio**: Faturamento mínimo para cobrir despesas fixas
- **EBITDA**: Lucro operacional antes de impostos e juros
- **Dias de Caixa**: Quantos dias o caixa consegue manter operações

## Como Usar

### 1. Preparar os Dados (Arquivo CSV)

O arquivo CSV deve conter as seguintes colunas:

```
data,tipo,categoria,valor,descricao,cliente_fornecedor,vencimento
```

**Exemplo:**
```csv
2026-01-05,receita,locacao,25000.00,Locação de empilhadeira,CLIENTE A,2026-01-20
2026-01-10,despesa,folha,8500.00,Folha de pagamento,EMPRESA,2026-01-25
```

**Formatos de Data Aceitos:**
- `YYYY-MM-DD` (2026-01-15)
- `DD/MM/YYYY` (15/01/2026)
- `DD-MM-YYYY` (15-01-2026)

**Colunas Obrigatórias:**
- `data`: Data da transação
- `tipo`: "receita" ou "despesa"
- `categoria`: Categoria da transação
- `valor`: Valor numérico (ex: 1500.00)
- `descricao`: Descrição da transação
- `cliente_fornecedor`: Nome do cliente ou fornecedor
- `vencimento`: Data de vencimento (mesma da data se não especificado)

### 2. Executar o Script

```bash
# Com arquivo CSV customizado
python processar_dados.py dados_financeiros.csv

# Com arquivo padrão (dados_exemplo.csv)
python processar_dados.py

# Gera dados de teste se arquivo não existir
python processar_dados.py
```

### 3. Saída do Script

O script gera:

1. **Exibição no Terminal**: Resumo dos indicadores calculados
2. **Arquivo JSON**: `resultado_indicadores.json` com todos os dados estruturados

### Exemplo de Execução

```bash
$ python processar_dados.py

================================================================================
PROCESSAMENTO DE DADOS FINANCEIROS - DASHBOARD TESOURARIA
================================================================================

Carregando: dados_exemplo.csv
[OK] Total de transações: 50

Calculando indicadores...

================================================================================
RESUMO DOS INDICADORES
================================================================================

HISTÓRICO:
  Receitas por categoria: 3 categorias
  Despesas por categoria: 3 categorias
  Dias com movimento: 38 dias
  Maiores clientes: 5 clientes
  Meses processados: 4 meses

PREVISIBILIDADE:
  Saldo Caixa: R$ 517,024.00
  Perpetuidade Caixa: R$ 2,549,165.52
  Ponto de Equilíbrio: R$ 47,527.24
  EBITDA: R$ 584,824.00
  Dias de Caixa: 202.4 dias

[OK] Resultado salvo: resultado_indicadores.json
```

## Estrutura do Arquivo de Saída (JSON)

```json
{
  "timestamp": "2026-03-27T18:45:30.123456",
  "total_transacoes": 50,
  "indicadores_historico": {
    "receitas_por_vencimento": {
      "2026-01-20": 25000.00,
      "2026-01-15": 12500.00
    },
    "despesas_por_vencimento": {
      "2026-01-25": 8500.00
    },
    "despesas_por_categoria": {
      "Operacional": 45000.00,
      "Variável": 32000.00
    },
    "receita_por_categoria": {
      "Locação": 250000.00,
      "Vendas": 120000.00
    },
    "fluxo_caixa_diario": {
      "2026-01-05": {
        "receitas": 25000.00,
        "despesas": 0,
        "saldo": 25000.00
      }
    },
    "maiores_clientes": [
      {
        "cliente": "CLIENTE A",
        "total": 85000.00,
        "transacoes": 5,
        "ticket_medio": 17000.00
      }
    ],
    "lucro_bruto_por_mes": {
      "2026-01": {
        "receitas": 95000.00,
        "despesas": 45000.00,
        "lucro": 50000.00,
        "margem": 52.63
      }
    },
    "posicao_estoque": {
      "Locação": 120000.00,
      "Vendas": 85000.00
    }
  },
  "indicadores_previsibilidade": {
    "saldo_caixa_atual": 517024.00,
    "perpetuidade_caixa": 2549165.52,
    "ponto_equilibrio": 47527.24,
    "ebitda": 584824.00,
    "dias_de_caixa": 202.4
  }
}
```

## Interpretação dos Indicadores

### Saldo de Caixa Atual
- Soma de todas as receitas menos despesas
- Indica a disponibilidade de caixa em determinado período

### Perpetuidade do Caixa
- Valor presente do fluxo perpétuo de caixa
- Quanto o caixa pode gerar indefinidamente

### Ponto de Equilíbrio
- Faturamento mínimo necessário para cobrir despesas fixas
- Se receitas < ponto de equilíbrio, o negócio está no prejuízo

### EBITDA
- Lucro operacional puro (sem impostos e juros)
- Indica a saúde operacional do negócio

### Dias de Caixa
- Quantos dias a empresa consegue se manter com as despesas atuais
- Exemplo: 202.4 dias = ~6.7 meses de caixa

## Tratamento de Erros

O script trata automaticamente:
- Linhas com dados faltantes ou inválidos
- Formatos de data não reconhecidos
- Valores em formato texto ou com símbolos de moeda
- Arquivo CSV não encontrado (gera dados de teste)

## Integração com Dashboard

Os dados do JSON gerado podem ser consumidos pelo frontend:

```javascript
// Carregar dados
const resultado = await fetch('/api/processar-dados').then(r => r.json());

// Usar nos gráficos
const kpis = resultado.indicadores_previsibilidade;
const historico = resultado.indicadores_historico;
```

## Exemplos de Uso

### Exemplo 1: Processar arquivo customizado
```bash
python processar_dados.py meus_dados_2026.csv
```

### Exemplo 2: Usar dados de teste
```bash
python processar_dados.py
# (será criado resultado_indicadores.json)
```

### Exemplo 3: Integração em Python
```python
from processar_dados import CalculadoraFinanceira, carregar_csv

# Carregar dados
transacoes = carregar_csv('dados.csv')

# Calcular indicadores
calc = CalculadoraFinanceira(transacoes)
indicadores = calc.calcular_todos_indicadores()

# Usar os dados
print(f"Saldo: R$ {indicadores['indicadores_previsibilidade']['saldo_caixa_atual']}")
```

## Requisitos

- Python 3.7+
- Biblioteca padrão (csv, json, datetime, collections)
- Sem dependências externas!

## Arquivos Inclusos

- `processar_dados.py` - Script principal
- `dados_exemplo.csv` - Exemplo de dados (com separador vírgula)
- `resultado_indicadores.json` - Saída gerada (se existente)

## Suporte

Para adicionar novos indicadores ou modificar cálculos, edite a classe `CalculadoraFinanceira` em `processar_dados.py`.

## Notas de Produção

- O script não modifica arquivos de entrada
- Sempre gera um novo `resultado_indicadores.json`
- Timestamps são salvos em UTC/ISO 8601
- Valores monetários armazenados com 2 casas decimais
