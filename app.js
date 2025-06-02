document.addEventListener("DOMContentLoaded", () => {
  const baseInicial = 1890.0
  document.querySelector(".print-control").style.display = "none"
  const form = document.getElementById("remuneracao-form")
  const resultados = document.getElementById("resultados")

  // Elementos de input que precisam de máscara de moeda
  const inputBaseAtual = document.getElementById("baseAtual")
  const inputValorExtraFestivo = document.getElementById("valorExtraFestivo")
  const inputOutrosDescontos = document.getElementById("outrosDescontos")

  // Formatter para moeda BRL
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })

  // Função genérica para aplicar máscara de moeda
  function aplicarMascaraMoeda(e) {
    const value = e.target.value.replace(/\D/g, "")
    const numeric = Number(value) / 100
    e.target.value = formatter.format(numeric)
  }

  // Adiciona listener de input para cada campo que precisa de máscara
  ;[inputValorExtraFestivo, inputOutrosDescontos].forEach((input) => {
    input.addEventListener("input", (e) => {
      const v = e.target.value.replace(/\D/g, "")
      e.target.value = formatter.format(Number(v) / 100)
    })
  })

  function parseBRL(brl) {
    return Number(
      brl
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^0-9\.]/g, "")
    )
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Entradas originais
    const baseAtual = parseBRL(inputBaseAtual.value)
    const plantoes = parseInt(document.getElementById("plantoes").value, 10)
    const escolaridade = parseInt(
      document.getElementById("escolaridade").value,
      10
    )
    const quinquenio =
      parseInt(document.getElementById("quinquenio").value, 10) || 0
    const especializacao =
      parseInt(document.getElementById("especializacao").value, 10) || 0
    const extra24 = parseInt(document.getElementById("extra24").value, 10) || 0
    const extra10diurno =
      parseInt(document.getElementById("extra10diurno").value, 10) || 0
    const extra10noturno =
      parseInt(document.getElementById("extra10noturno").value, 10) || 0
    const extraFestivo =
      parseInt(document.getElementById("extraFestivo").value, 10) || 0
    const valorExtraFestivo = parseBRL(
      document.getElementById("valorExtraFestivo").value || "0"
    )
    const dependentes =
      parseInt(document.getElementById("dependentes").value, 10) || 0
    const sindicalizado = document.getElementById("sindicalizado").value === "1"
    const outrosDescontos = parseBRL(
      document.getElementById("outrosDescontos").value || "0"
    )
    const ferias = document.getElementById("ferias").value

    // Cálculos
    const riscoVida = baseAtual * 0.5
    let adNoturno = (baseAtual / 160 / 5) * (plantoes === 8 ? 88 : 77)
    const horasExcedentes50 =
      (baseAtual / 160 + (baseAtual / 160) * 0.5) * (plantoes === 8 ? 17 : 4)
    const horasExcedentes70 =
      (baseAtual / 160 + (baseAtual / 160) * 0.7) * (plantoes === 8 ? 15 : 4)

    // Auxílio Alimentação
    let auxAlimenta = baseInicial * 0.02 * (plantoes === 8 ? 24 : 21)
    const valorAuxAlimentacao24 =
      extra24 > 0 ? baseInicial * 0.02 * 3 * extra24 : 0
    const valorAuxAlimentacao10diurno =
      extra10diurno > 0 ? baseInicial * 0.02 * 1 * extra10diurno : 0
    const valorAuxAlimentacao10noturno =
      extra10noturno > 0 ? baseInicial * 0.02 * 1 * extra10noturno : 0
    auxAlimenta +=
      valorAuxAlimentacao24 +
      valorAuxAlimentacao10diurno +
      valorAuxAlimentacao10noturno

    // Valores extras
    const valorExtra24 = 370.0 * extra24
    const valorExtra10diurno = 141.48 * extra10diurno
    const valorExtra10noturno = 163.25 * extra10noturno

    // Adicional noturno em extras
    const valorAdnoturnoExtra24 =
      extra24 > 0 ? (baseAtual / 160 / 5) * 11 * extra24 : 0
    const valorAdnoturnoExtra10 =
      extra10noturno > 0 ? (baseAtual / 160 / 5) * 8 * extra10noturno : 0
    adNoturno += valorAdnoturnoExtra24 + valorAdnoturnoExtra10

    // Extras festivos
    const totalExtraFestivo = valorExtraFestivo * extraFestivo

    // Escolaridade e quinquênio
    let valorEscolaridade = 0
    if (escolaridade === 2) valorEscolaridade = baseAtual * 0.1
    if (escolaridade === 3) valorEscolaridade = baseAtual * 0.2
    if (escolaridade === 4) valorEscolaridade = baseAtual * 0.3
    const valorQuinquenio = baseAtual * 0.05 * quinquenio

    // Monta os itens até antes das férias e especialização
    const itens = [
      { label: "Base Atual", value: baseAtual },
      { label: "Risco de Vida", value: riscoVida },
      { label: "Adicional Noturno", value: adNoturno },
      { label: "Horas Excedentes 50%", value: horasExcedentes50 },
      { label: "Horas Excedentes 70%", value: horasExcedentes70 },
      { label: "Auxílio Alimentação", value: auxAlimenta },
      { label: "Serviço Extra 24h", value: valorExtra24 },
      { label: "Serviço Extra 10h Diurno", value: valorExtra10diurno },
      { label: "Serviço Extra 10h Noturno", value: valorExtra10noturno },
      { label: "Extras Festivos (total)", value: totalExtraFestivo },
      { label: "Escolaridade", value: valorEscolaridade },
      { label: "Quinquênio", value: valorQuinquenio },
    ]

    const totalBruto = itens.reduce((sum, item) => sum + item.value, 0)

    // Férias
    let valorFerias = 0
    if (ferias === "sim") {
      valorFerias = totalBruto * 0.333334
    }

    // Total antes da especialização (com férias)
    const totalAntesEsp = [
      baseAtual,
      riscoVida,
      adNoturno,
      horasExcedentes50,
      horasExcedentes70,
      auxAlimenta,
      valorExtra24,
      valorExtra10diurno,
      valorExtra10noturno,
      valorEscolaridade,
      valorQuinquenio,
      valorFerias,
    ].reduce((sum, v) => sum + v, 0)

    // Especialização
    let valorEspecializacaoOrig = 0
    if (especializacao === 15) valorEspecializacaoOrig = totalAntesEsp * 0.15
    if (especializacao === 25) valorEspecializacaoOrig = totalAntesEsp * 0.25
    const valorEspecializacao = valorEspecializacaoOrig

    // Adiciona os dois itens finais
    itens.push({ label: "Especialização", value: valorEspecializacao })
    if (valorFerias > 0) {
      itens.push({ label: "1/3 de férias", value: valorFerias })
    }

    const totalBrutoFinal = itens.reduce((sum, item) => sum + item.value, 0)

    // Descontos
    const previdencia = (baseAtual + valorQuinquenio) * 0.14
    const sindicato = sindicalizado ? baseAtual * 0.02 : 0
    const valorDependentes = 189.59 * dependentes

    const baseCalculoIR =
      totalBrutoFinal -
      (previdencia + auxAlimenta + valorEspecializacao + valorDependentes)
    let descontoIR = 0
    if (baseCalculoIR <= 2259.2) descontoIR = 0
    else if (baseCalculoIR <= 2826.65)
      descontoIR = baseCalculoIR * 0.075 - 169.44
    else if (baseCalculoIR <= 3751.05)
      descontoIR = baseCalculoIR * 0.15 - 381.44
    else if (baseCalculoIR <= 4664.68)
      descontoIR = baseCalculoIR * 0.225 - 662.77
    else descontoIR = baseCalculoIR * 0.275 - 896.0

    const totalLiquido =
      totalBrutoFinal - (previdencia + descontoIR + sindicato + outrosDescontos)

    // Exibe os resultados
    resultados.innerHTML = ""
    itens.forEach((item) => {
      const linha = document.createElement("div")
      linha.classList.add("item")
      if (item.label === "Base Atual") linha.classList.add("highlight-base")
      linha.innerHTML = `
        <span>${item.label}</span>
        <span>${formatter.format(item.value)}</span>
      `
      resultados.appendChild(linha)
    })

    document.querySelector(".print-control").style.display = "block"

    const linhaBruta = document.createElement("div")
    linhaBruta.classList.add("item")
    linhaBruta.innerHTML = `
      <strong>Total Bruto</strong>
      <strong>${formatter.format(totalBrutoFinal)}</strong>
    `
    resultados.appendChild(linhaBruta)

    const linhaLiquida = document.createElement("div")
    linhaLiquida.classList.add("item", "total-liquido")
    linhaLiquida.innerHTML = `
      <strong>Total Líquido</strong>
      <strong>${formatter.format(totalLiquido)}</strong>
    `
    resultados.appendChild(linhaLiquida)

    const descontos = [
      { label: "Sindicato", value: sindicato },
      { label: "Santa Cruz Prev", value: previdencia },
      { label: "Imposto de Renda", value: descontoIR },
      { label: "Descontos Individuais", value: outrosDescontos },
    ]
    descontos.forEach((d) => {
      const div = document.createElement("div")
      div.classList.add("item")
      div.innerHTML = `
        <span>${d.label}</span>
        <span>${formatter.format(d.value)}</span>
      `
      resultados.appendChild(div)
    })

    const totalDescontos = descontos.reduce((sum, d) => sum + d.value, 0)
    const linhaDescontos = document.createElement("div")
    linhaDescontos.classList.add("item", "total-descontos")
    linhaDescontos.innerHTML = `
      <strong>Total Descontos</strong>
      <strong>${formatter.format(totalDescontos)}</strong>
    `
    resultados.appendChild(linhaDescontos)
  })
  
   // === Bloco de impressão (com data/hora) ===
 const printBtn = document.getElementById('print-btn');
 printBtn.addEventListener('click', () => {
   if (confirm('Deseja imprimir o relatório de remuneração?')) {
     // preenche data e hora
     const now  = new Date();
     const date = now.toLocaleDateString('pt-BR');
     const time = now.toLocaleTimeString('pt-BR');
     document.getElementById('print-date').textContent =
       `Data de Impressão: ${date} ${time}`;

     window.print();
   }
 });
  // === Fim do bloco de impressão ===
})
