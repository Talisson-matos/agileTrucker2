import React, { useState, useCallback } from 'react'
import './Extrator.css'

interface DadosNF {
  [key: string]: string
}

const BACKEND_URL = 'https://agiletrucker-backend.onrender.com'

const campoLabels: Record<string, string> = {
  cnpj_pagador_frete: 'CNPJ Tomador do Frete',
  cnpj_remetente: 'CNPJ Remetente',
  cnpj_destinatario: 'CNPJ Destinatário',
  serie: 'Série',
  numero_nota: 'Número da Nota',
  chave_acesso: 'Chave de Acesso',
  quantidade: 'Quantidade',
  peso_liquido: 'Peso Líquido',
  valor_nota: 'Valor da Nota'
}

const ExtratorNF: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [dados, setDados] = useState<DadosNF>({})
  const [loading, setLoading] = useState(false)

  // -------------------------------------------
  // DRAG & DROP
  // -------------------------------------------
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const arquivo = e.dataTransfer.files?.[0]

    if (arquivo?.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF válido.')
      return
    }

    setFile(arquivo)
    processarUpload(arquivo)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo?.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.')
      return
    }

    setFile(arquivo)
    processarUpload(arquivo)
  }

  const handleClickInput = () => {
    const input = document.getElementById('pdf-input') as HTMLInputElement
    input.click()
  }

  // -------------------------------------------------
  // PROCESSAR PDF AUTOMATICAMENTE
  // -------------------------------------------------
  const processarUpload = async (arquivo: File) => {
    setLoading(true)

    const formData = new FormData()
    formData.append('file', arquivo)

    try {
      const endpoint = `${BACKEND_URL}/upload`

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt)
      }

      const json = await res.json()
      setDados(json)
    } catch (err) {
      alert('Erro ao extrair dados da nota fiscal.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const limparTudo = () => {
    setFile(null)
    setDados({})
    const input = document.getElementById('pdf-input') as HTMLInputElement
    if (input) input.value = ''
  }

  const copiar = (valor: string, label: string) => {
    navigator.clipboard.writeText(valor).then(() => {
      const toast = document.createElement('div')
      toast.className = 'toast'
      toast.textContent = `${label} copiado!`
      document.body.appendChild(toast)
      setTimeout(() => toast.classList.add('show'), 100)
      setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    })
  }

  const temDados = Object.keys(dados).length > 0

  return (
    <div className="extrator-container">
      <header className="header">
        <h2 className="title">📄 Extrator de Nota Fiscal (PDF)</h2>
      </header>

      {/* DROPZONE */}
      <div
        className="upload-section"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClickInput}
      >
        <p className="drop-text">
          Arraste e solte um PDF aqui<br />
          ou clique para buscar no computador
        </p>

        {file && !loading && (
          <p className="file-name">📎 {file.name}</p>
        )}

        {loading && <p>⏳ Processando arquivo...</p>}

        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {temDados && (
        <button className="btn btn-secondary" onClick={limparTudo}>
          🗑️ Limpar Tudo
        </button>
      )}

      {/* RESULTADOS */}
      {temDados ? (
        <section className="results-section">
          <h3 className="results-title">📋 Dados Extraídos</h3>

          <div className="data-grid">
            {Object.entries(dados).map(([key, val]) => {
              const label = campoLabels[key] || key
              const noValue = !val || val === 'Não encontrado'

              return (
                <div key={key} className="data-item">
                  <span className="data-label">{label}</span>

                  <button
                    className={`data-button ${noValue ? 'no-value' : 'has-value'}`}
                    onClick={() => !noValue && copiar(val, label)}
                    title={noValue ? 'Valor não encontrado' : `Copiar: ${val}`}
                  >
                    <span>{noValue ? 'Não encontrado' : val}</span>
                    {!noValue && <span className="copy-icon">📋</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>Nenhum PDF carregado.</p>
        </div>
      )}
    </div>
  )
}

export default ExtratorNF
