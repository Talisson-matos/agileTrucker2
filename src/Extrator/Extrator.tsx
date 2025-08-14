import React, { useState } from 'react';
import './Extrator.css';

const ExtratorNF: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dados, setDados] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Por favor, selecione um arquivo PDF.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro na resposta do servidor');

      const data = await response.json();
      setDados(data);
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      alert('Falha ao extrair dados da nota fiscal.');
    } finally {
      setLoading(false);
    }
  };

  const copiarParaClipboard = (valor: string, label: string) => {
    navigator.clipboard.writeText(valor);
    
    // Toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `${label} copiado!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const limparTudo = () => {
    setFile(null);
    setDados({});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Mapeia os nomes dos campos para rótulos mais amigáveis
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
  };

  const temDados = Object.keys(dados).length > 0;
  const valorNaoEncontrado = (valor: string) => valor === 'Não encontrado' || !valor;

  return (
    <div className="extrator-container">
      <div className="header">
        <h2 className="title">📄 Extrator de Nota Fiscal</h2>
      </div>

      <div className="upload-section">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="file-input"
            id="file-input"
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
            className={`btn btn-primary ${(!file || loading) ? 'disabled' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processando...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Extrair Dados
              </>
            )}
          </button>

          {temDados && (
            <button
              onClick={limparTudo}
              className="btn btn-secondary"
            >
              <span className="btn-icon">🗑️</span>
              Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {temDados ? (
        <div className="results-section">
          <h2 className="results-title">
            <span className="icon">📋</span>
            Dados Extraídos
          </h2>
          
          <div className="data-grid">
            {Object.entries(dados).map(([campo, valor]) => {
              const label = campoLabels[campo] || campo;
              const semValor = valorNaoEncontrado(valor);
              
              return (
                <div key={campo} className="data-item">
                  <div className="data-label">{label}</div>
                  <button
                    onClick={() => copiarParaClipboard(valor, label)}
                    className={`data-button ${semValor ? 'no-value' : 'has-value'}`}
                    title={semValor ? 'Valor não encontrado' : `Clique para copiar: ${valor}`}
                  >
                    <span className="button-text">{semValor ? 'Não encontrado' : valor}</span>
                    <span className="copy-icon">📋</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Nenhum dado extraído</h3>
          <p>Selecione e envie um arquivo PDF para começar a extrair os dados da nota fiscal.</p>
        </div>
      )}
    </div>
  );
};

export default ExtratorNF;