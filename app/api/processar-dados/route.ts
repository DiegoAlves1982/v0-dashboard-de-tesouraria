"use server"

import { NextRequest, NextResponse } from "next/server"

// Tipos para os dados processados
interface Transacao {
  data: string
  tipo: "receita" | "despesa"
  categoria: string
  valor: number
  descricao: string
  clienteFornecedor: string
  vencimento: string
  empresa?: string
}

interface DadosProcessados {
  transacoes: Transacao[]
  kpis: {
    receitaTotal: number
    despesaTotal: number
    lucroLiquido: number
    percentualCaixa: number
    ticketMedio: number
    mediaSaidasMensais: number
    perpetuidadeMeses: number
  }
  receitasPorVencimento: Record<string, number>
  despesasPorVencimento: Record<string, number>
  receitaPorCategoria: Record<string, number>
  despesaPorCategoria: Record<string, number>
  fluxoCaixaDiario: Array<{
    dia: string
    entrada: number
    saida: number
    saldo: number
  }>
  maioresClientes: Array<{
    cliente: string
    total: number
    transacoes: number
    ticketMedio: number
  }>
  lucroPorMes: Record<string, {
    receitas: number
    despesas: number
    lucro: number
    margem: number
  }>
  receitaPorPeriodo: Array<{
    mes: string
    ano: number
    valor: number
  }>
  entradasPorEmpresa: Array<{
    empresa: string
    valor: number
    percentual: number
  }>
  tabelaVencimentos: Array<{
    vencimento: string
    dataVencimento: string
    receitaTotal: number
    clienteFornecedor: string
  }>
  previsibilidade: {
    perpetuidadeCaixa: {
      meses: number
      saldoAtual: number
      mediaGastos: number
    }
    pontoEquilibrio: {
      valor: number
      percentualAtingido: number
      faltante: number
    }
    ebitda: {
      valor: number
      margem: number
      variacao: number
    }
  }
  dataProcessamento: string
  periodo: {
    inicio: string
    fim: string
  }
}

// Funções auxiliares para parsing
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0]
  
  // Remove espaços extras
  dateStr = dateStr.toString().trim()
  
  // Tenta diferentes formatos
  const formatos = [
    /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, // D/M/YYYY
  ]
  
  for (const formato of formatos) {
    const match = dateStr.match(formato)
    if (match) {
      if (formato === formatos[0]) {
        return `${match[1]}-${match[2]}-${match[3]}`
      } else {
        const dia = match[1].padStart(2, "0")
        const mes = match[2].padStart(2, "0")
        const ano = match[3]
        return `${ano}-${mes}-${dia}`
      }
    }
  }
  
  // Tenta Excel serial date
  const num = parseFloat(dateStr)
  if (!isNaN(num) && num > 25000 && num < 60000) {
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + num * 86400000)
    return date.toISOString().split("T")[0]
  }
  
  return new Date().toISOString().split("T")[0]
}

function parseValor(valorStr: string | number): number {
  if (typeof valorStr === "number") return Math.abs(valorStr)
  if (!valorStr) return 0
  
  let str = valorStr.toString().trim()
  
  // Remove R$, espaços
  str = str.replace(/R\$\s*/gi, "").replace(/\s/g, "")
  
  // Detecta formato brasileiro (1.234,56) vs americano (1,234.56)
  const temVirgulaDecimal = /\d,\d{2}$/.test(str)
  const temPontoDecimal = /\d\.\d{2}$/.test(str)
  
  if (temVirgulaDecimal) {
    // Formato brasileiro: remove pontos de milhar, troca vírgula por ponto
    str = str.replace(/\./g, "").replace(",", ".")
  } else if (!temPontoDecimal && str.includes(",")) {
    // Pode ser milhar com vírgula (formato americano)
    str = str.replace(/,/g, "")
  }
  
  const valor = parseFloat(str)
  return isNaN(valor) ? 0 : Math.abs(valor)
}

function detectTipo(row: Record<string, any>, valor: number): "receita" | "despesa" {
  const tipoFields = ["tipo", "type", "natureza", "operacao"]
  
  for (const field of tipoFields) {
    const val = row[field]?.toString().toLowerCase() || ""
    if (val.includes("receita") || val.includes("entrada") || val.includes("credito") || val.includes("credit")) {
      return "receita"
    }
    if (val.includes("despesa") || val.includes("saida") || val.includes("debito") || val.includes("debit") || val.includes("pagamento")) {
      return "despesa"
    }
  }
  
  // Verifica pelo sinal do valor original
  const valorOriginal = row["valor"] || row["value"] || row["total"] || ""
  if (valorOriginal.toString().includes("-")) {
    return "despesa"
  }
  
  // Verifica pela categoria
  const categoria = (row["categoria"] || row["category"] || "").toString().toLowerCase()
  const categoriasReceita = ["locacao", "venda", "servico", "receita", "faturamento"]
  const categoriasDespesa = ["folha", "salario", "imposto", "aluguel", "combustivel", "manutencao", "fornecedor"]
  
  if (categoriasReceita.some(c => categoria.includes(c))) return "receita"
  if (categoriasDespesa.some(c => categoria.includes(c))) return "despesa"
  
  return "receita"
}

function getFieldValue(row: Record<string, any>, possibleNames: string[]): string {
  for (const name of possibleNames) {
    const lowerName = name.toLowerCase()
    for (const key of Object.keys(row)) {
      if (key.toLowerCase() === lowerName || key.toLowerCase().includes(lowerName)) {
        return row[key]?.toString() || ""
      }
    }
  }
  return ""
}

function processarLinhas(rows: Record<string, any>[]): Transacao[] {
  const transacoes: Transacao[] = []
  
  for (const row of rows) {
    // Pula linhas vazias
    if (!row || Object.values(row).every(v => !v)) continue
    
    // Extrai campos
    const dataStr = getFieldValue(row, ["data", "date", "dt_lanc", "dt_lancamento", "data_lancamento", "dt"])
    const valorStr = getFieldValue(row, ["valor", "value", "total", "amount", "vlr"])
    const categoriaStr = getFieldValue(row, ["categoria", "category", "tipo_despesa", "tipo_receita", "classificacao"])
    const descricaoStr = getFieldValue(row, ["descricao", "description", "historico", "obs", "observacao", "memo"])
    const clienteStr = getFieldValue(row, ["cliente", "fornecedor", "cliente_fornecedor", "entidade", "nome", "razao_social", "customer", "supplier"])
    const vencimentoStr = getFieldValue(row, ["vencimento", "dt_vencimento", "data_vencimento", "due_date", "venc"])
    const empresaStr = getFieldValue(row, ["empresa", "company", "filial", "unidade", "empresa_origem"])
    
    const valor = parseValor(valorStr)
    if (valor === 0) continue
    
    const data = parseDate(dataStr)
    const tipo = detectTipo(row, valor)
    
    transacoes.push({
      data,
      tipo,
      categoria: categoriaStr || (tipo === "receita" ? "Outros" : "Outros"),
      valor,
      descricao: descricaoStr || `Transacao ${transacoes.length + 1}`,
      clienteFornecedor: clienteStr || "Nao informado",
      vencimento: vencimentoStr ? parseDate(vencimentoStr) : data,
      empresa: empresaStr || "Principal"
    })
  }
  
  return transacoes
}

function calcularIndicadores(transacoes: Transacao[], saldoInicial: number = 0): DadosProcessados {
  // Ordena por data
  transacoes.sort((a, b) => a.data.localeCompare(b.data))
  
  // KPIs básicos
  const receitaTotal = transacoes.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0)
  const despesaTotal = transacoes.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0)
  const lucroLiquido = receitaTotal - despesaTotal
  const saldoAtual = saldoInicial + lucroLiquido
  
  // Número de meses no período
  const datas = transacoes.map(t => t.data)
  const dataInicio = datas[0] || new Date().toISOString().split("T")[0]
  const dataFim = datas[datas.length - 1] || new Date().toISOString().split("T")[0]
  const meses = Math.max(1, Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (30 * 24 * 60 * 60 * 1000)))
  
  const mediaSaidasMensais = despesaTotal / meses
  const perpetuidadeMeses = mediaSaidasMensais > 0 ? saldoAtual / mediaSaidasMensais : 0
  
  const transacoesReceita = transacoes.filter(t => t.tipo === "receita")
  const ticketMedio = transacoesReceita.length > 0 ? receitaTotal / transacoesReceita.length : 0
  
  // Receitas/Despesas por vencimento
  const receitasPorVencimento: Record<string, number> = {}
  const despesasPorVencimento: Record<string, number> = {}
  
  for (const t of transacoes) {
    if (t.tipo === "receita") {
      receitasPorVencimento[t.vencimento] = (receitasPorVencimento[t.vencimento] || 0) + t.valor
    } else {
      despesasPorVencimento[t.vencimento] = (despesasPorVencimento[t.vencimento] || 0) + t.valor
    }
  }
  
  // Por categoria
  const receitaPorCategoria: Record<string, number> = {}
  const despesaPorCategoria: Record<string, number> = {}
  
  for (const t of transacoes) {
    if (t.tipo === "receita") {
      receitaPorCategoria[t.categoria] = (receitaPorCategoria[t.categoria] || 0) + t.valor
    } else {
      despesaPorCategoria[t.categoria] = (despesaPorCategoria[t.categoria] || 0) + t.valor
    }
  }
  
  // Fluxo de caixa diário
  const fluxoPorDia: Record<string, { entrada: number; saida: number }> = {}
  for (const t of transacoes) {
    if (!fluxoPorDia[t.data]) {
      fluxoPorDia[t.data] = { entrada: 0, saida: 0 }
    }
    if (t.tipo === "receita") {
      fluxoPorDia[t.data].entrada += t.valor
    } else {
      fluxoPorDia[t.data].saida += t.valor
    }
  }
  
  let saldoAcumulado = saldoInicial
  const fluxoCaixaDiario = Object.entries(fluxoPorDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, { entrada, saida }]) => {
      saldoAcumulado += entrada - saida
      return { dia, entrada, saida, saldo: saldoAcumulado }
    })
  
  // Maiores clientes
  const clientesMap: Record<string, { total: number; transacoes: number }> = {}
  for (const t of transacoes) {
    if (t.tipo === "receita") {
      if (!clientesMap[t.clienteFornecedor]) {
        clientesMap[t.clienteFornecedor] = { total: 0, transacoes: 0 }
      }
      clientesMap[t.clienteFornecedor].total += t.valor
      clientesMap[t.clienteFornecedor].transacoes += 1
    }
  }
  
  const maioresClientes = Object.entries(clientesMap)
    .map(([cliente, dados]) => ({
      cliente,
      total: dados.total,
      transacoes: dados.transacoes,
      ticketMedio: dados.total / dados.transacoes
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
  
  // Lucro por mês
  const lucroPorMes: Record<string, { receitas: number; despesas: number; lucro: number; margem: number }> = {}
  for (const t of transacoes) {
    const mes = t.data.substring(0, 7) // YYYY-MM
    if (!lucroPorMes[mes]) {
      lucroPorMes[mes] = { receitas: 0, despesas: 0, lucro: 0, margem: 0 }
    }
    if (t.tipo === "receita") {
      lucroPorMes[mes].receitas += t.valor
    } else {
      lucroPorMes[mes].despesas += t.valor
    }
  }
  
  for (const mes of Object.keys(lucroPorMes)) {
    lucroPorMes[mes].lucro = lucroPorMes[mes].receitas - lucroPorMes[mes].despesas
    lucroPorMes[mes].margem = lucroPorMes[mes].receitas > 0 
      ? (lucroPorMes[mes].lucro / lucroPorMes[mes].receitas) * 100 
      : 0
  }
  
  // Receita por período (para gráfico de barras)
  const receitaPorPeriodo = Object.entries(lucroPorMes)
    .map(([mes, dados]) => {
      const [ano, mesNum] = mes.split("-")
      const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
      return {
        mes: meses[parseInt(mesNum) - 1],
        ano: parseInt(ano),
        valor: dados.receitas
      }
    })
    .sort((a, b) => a.ano === b.ano ? a.mes.localeCompare(b.mes) : a.ano - b.ano)
  
  // Entradas por empresa
  const empresasMap: Record<string, number> = {}
  for (const t of transacoes) {
    if (t.tipo === "receita" && t.empresa) {
      empresasMap[t.empresa] = (empresasMap[t.empresa] || 0) + t.valor
    }
  }
  
  const totalEmpresas = Object.values(empresasMap).reduce((a, b) => a + b, 0)
  const entradasPorEmpresa = Object.entries(empresasMap)
    .map(([empresa, valor]) => ({
      empresa,
      valor,
      percentual: totalEmpresas > 0 ? (valor / totalEmpresas) * 100 : 0
    }))
    .sort((a, b) => b.valor - a.valor)
  
  // Tabela de vencimentos
  const vencimentosMap: Record<string, { receitaTotal: number; clientes: Set<string> }> = {}
  for (const t of transacoes) {
    if (!vencimentosMap[t.vencimento]) {
      vencimentosMap[t.vencimento] = { receitaTotal: 0, clientes: new Set() }
    }
    if (t.tipo === "receita") {
      vencimentosMap[t.vencimento].receitaTotal += t.valor
    }
    vencimentosMap[t.vencimento].clientes.add(t.clienteFornecedor)
  }
  
  const tabelaVencimentos = Object.entries(vencimentosMap)
    .map(([vencimento, dados]) => ({
      vencimento,
      dataVencimento: vencimento,
      receitaTotal: dados.receitaTotal,
      clienteFornecedor: Array.from(dados.clientes).slice(0, 3).join(", ")
    }))
    .filter(v => v.receitaTotal > 0)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 20)
  
  // Previsibilidade
  const pontoEquilibrio = despesaTotal / meses
  const percentualAtingido = pontoEquilibrio > 0 ? Math.min(100, (receitaTotal / meses / pontoEquilibrio) * 100) : 100
  
  const ebitda = lucroLiquido
  const margemEbitda = receitaTotal > 0 ? (ebitda / receitaTotal) * 100 : 0
  
  return {
    transacoes,
    kpis: {
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      percentualCaixa: receitaTotal > 0 ? ((receitaTotal - despesaTotal) / receitaTotal) * 100 : 0,
      ticketMedio,
      mediaSaidasMensais,
      perpetuidadeMeses
    },
    receitasPorVencimento,
    despesasPorVencimento,
    receitaPorCategoria,
    despesaPorCategoria,
    fluxoCaixaDiario,
    maioresClientes,
    lucroPorMes,
    receitaPorPeriodo,
    entradasPorEmpresa,
    tabelaVencimentos,
    previsibilidade: {
      perpetuidadeCaixa: {
        meses: perpetuidadeMeses,
        saldoAtual,
        mediaGastos: mediaSaidasMensais
      },
      pontoEquilibrio: {
        valor: pontoEquilibrio,
        percentualAtingido,
        faltante: Math.max(0, pontoEquilibrio - (receitaTotal / meses))
      },
      ebitda: {
        valor: ebitda,
        margem: margemEbitda,
        variacao: 12.5 // Placeholder - precisaria de dados históricos
      }
    },
    dataProcessamento: new Date().toISOString(),
    periodo: {
      inicio: dataInicio,
      fim: dataFim
    }
  }
}

// Função para parsear CSV
function parseCSV(content: string): Record<string, any>[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []
  
  // Detecta separador
  const firstLine = lines[0]
  const separator = firstLine.includes(";") ? ";" : ","
  
  const headers = firstLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase())
  const rows: Record<string, any>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/^["']|["']$/g, ""))
    if (values.length === headers.length) {
      const row: Record<string, any> = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx]
      })
      rows.push(row)
    }
  }
  
  return rows
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const saldoInicial = parseFloat(formData.get("saldoInicial") as string) || 0
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }
    
    const fileName = file.name.toLowerCase()
    let rows: Record<string, any>[] = []
    
    // Processa CSV
    if (fileName.endsWith(".csv")) {
      const content = await file.text()
      rows = parseCSV(content)
    }
    // Processa Excel (simplificado - envia como CSV no frontend)
    else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      // O frontend vai converter para JSON antes de enviar
      const content = await file.text()
      try {
        rows = JSON.parse(content)
      } catch {
        rows = parseCSV(content)
      }
    }
    // Processa JSON direto
    else if (fileName.endsWith(".json")) {
      const content = await file.text()
      const data = JSON.parse(content)
      rows = Array.isArray(data) ? data : data.transacoes || data.dados || [data]
    }
    else {
      return NextResponse.json({ error: "Formato de arquivo nao suportado. Use CSV, Excel ou JSON." }, { status: 400 })
    }
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Nenhum dado encontrado no arquivo" }, { status: 400 })
    }
    
    // Processa transações
    const transacoes = processarLinhas(rows)
    
    if (transacoes.length === 0) {
      return NextResponse.json({ error: "Nao foi possivel extrair transacoes do arquivo. Verifique o formato." }, { status: 400 })
    }
    
    // Calcula indicadores
    const dados = calcularIndicadores(transacoes, saldoInicial)
    
    return NextResponse.json({
      success: true,
      message: `Processadas ${transacoes.length} transacoes`,
      dados
    })
    
  } catch (error) {
    console.error("Erro ao processar arquivo:", error)
    return NextResponse.json({ 
      error: "Erro ao processar arquivo: " + (error instanceof Error ? error.message : "Erro desconhecido")
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "API de processamento de dados financeiros",
    formatos: ["CSV", "Excel (.xlsx, .xls)", "JSON"],
    campos: ["data", "valor", "tipo", "categoria", "cliente_fornecedor", "vencimento", "empresa"]
  })
}
