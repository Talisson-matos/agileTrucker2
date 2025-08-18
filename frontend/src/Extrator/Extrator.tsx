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

    // Lista de URLs para tentar
    const backendUrls = [
      'https://agiletrucker-backend.onrender.com/upload',
      'https://agiletrucker-backend.onrender.com/upload'
    ];

    for (const url of backendUrls) {
      try {
        console.log('Tentando URL:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          mode: 'cors',
          // Removendo headers explícitos para deixar o browser definir o Content-Type
        });

        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro da resposta:', errorText);
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        setDados(data);
        return; // Sucesso, sair do loop
        
      } catch (error) {
        console.error(`Erro na URL ${url}:`, error);
        
        // Se é o último URL da lista, mostrar erro
        if (url === backendUrls[backendUrls.length - 1]) {
          let errorMessage = 'Falha ao extrair dados da nota fiscal.';
          if (error instanceof Error) {
            errorMessage += ` Detalhes: ${error.message}`;
          }
          alert(errorMessage);
        }
      }
    }
    
    setLoading(false);
  };

  const copiarParaClipboard = (valor: string, label: string) => {
    navigator.clipboard.writeText(valor).then(() => {
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
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert(`${label} copiado!`);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    });
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