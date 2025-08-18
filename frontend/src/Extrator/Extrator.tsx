import React, { useState } from 'react'
import './Extrator.css'

interface DadosNF {
  [key: string]: string
}

const BACKEND_URL = 'https://agiletrucker-backend.onrender.com';

const campoLabels: Record<string, string> = {
  cnpj_pagador_frete: 'CNPJ Tomador do Frete',
  cnpj_remetente: 'CNPJ Remetente',
  cnpj_destinatario: 'CNPJ Destinatário',
  serie: 'Série',
  numero_nota: 'Número da Nota',
  chave_acesso: 'Chave de Acesso',
  quantidade: 'Quantidade',
  peso_liquido: 'Peso Líquido',
  valor_nota: 'Valor da Nota',
}

const ExtratorNF: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [dados, setDados] = useState<DadosNF>({})
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected?.type === 'application/pdf') {
      setFile(selected)
    } else {
      alert('Por favor, selecione um arquivo PDF.')
      e.target.value = ''
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Sempre usar a URL direta do backend
      const endpoint = `${BACKEND_URL}/upload`

      console.log('Enviando para:', endpoint)
      console.log('Arquivo:', file.name, 'Tamanho:', file.size)
      console.log('BACKEND_URL:', BACKEND_URL)
      console.log('Environment:', import.meta.env.MODE)
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      })

      console.log('Status da resposta:', res.status)
      console.log('Headers da resposta:', Object.fromEntries(res.headers.entries()))

      if (!res.ok) {
        const errText = await res.text()
        console.error('Erro do servidor:', errText)
        throw new Error(`Erro ${res.status}: ${errText}`)
      }

      const json = await res.json()
      console.log('Resposta do backend:', json)
      setDados(json)
    } catch (err) {
      console.error('Erro ao enviar o arquivo:', err)
      alert(
        `Falha ao extrair dados da nota fiscal.\n${
          err instanceof Error ? err.message : String(err)
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  const valorNaoEncontrado = (v: string) =>
    !v || v === 'Não encontrado'

  const copiarParaClipboard = (valor: string, label: string) => {
    navigator.clipboard
      .writeText(valor)
      .then(() => {
        const toast = document.createElement('div')
        toast.className = 'toast'
        toast.textContent = `${label} copiado!`
        document.body.appendChild(toast)
        setTimeout(() => toast.classList.add('show'), 100)
        setTimeout(() => {
          toast.classList.remove('show')
          setTimeout(() => document.body.removeChild(toast), 300)
        }, 2000)
      })
      .catch(console.error)
  }

  const limparTudo = () => {
    setFile(null)
    setDados({})
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    if (input) input.value = ''
  }

  const temDados = Object.keys(dados).length > 0

  return (
    <div className="extrator-container">
      <header className="header">
        <h2 className="title">📄 Extrator de Nota Fiscal</h2>
      </header>

      <section className="upload-section">
        <div className="file-input-wrapper">
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <span className="file-icon">📎</span>
            {file ? file.name : 'Escolher arquivo PDF'}
          </label>
        </div>

        <div className="button-group">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`btn btn-primary ${
              !file || loading ? 'disabled' : ''
            }`}
          >
            {loading ? 'Processando...' : '🚀 Extrair Dados'}
          </button>
          {temDados && (
            <button
              onClick={limparTudo}
              className="btn btn-secondary"
            >
              🗑️ Limpar Tudo
            </button>
          )}
        </div>
      </section>

      {temDados ? (
        <section className="results-section">
          <h3 className="results-title">📋 Dados Extraídos</h3>
          <div className="data-grid">
            {Object.entries(dados).map(([key, val]) => {
              const label = campoLabels[key] || key
              const noValue = valorNaoEncontrado(val)
              return (
                <div key={key} className="data-item">
                  <span className="data-label">{label}</span>
                  <button
                    onClick={() => copiarParaClipboard(val, label)}
                    className={`data-button ${
                      noValue ? 'no-value' : 'has-value'
                    }`}
                    title={
                      noValue
                        ? 'Valor não encontrado'
                        : `Clique para copiar: ${val}`
                    }
                  >
                    <span className="button-text">
                      {noValue ? 'Não encontrado' : val}
                    </span>
                    <span className="copy-icon">📋</span>
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>Selecione e envie um arquivo PDF para extrair os dados.</p>
        </div>
      )}
    </div>
  )
}

export default ExtratorNF
