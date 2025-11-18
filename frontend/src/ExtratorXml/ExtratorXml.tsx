import React, { useState, useCallback } from 'react';
import './ExtratorXml.css';

interface DadosNF {
  [key: string]: string;
}

const campoLabels: Record<string, string> = {
  cnpj_pagador_frete: 'CNPJ/CPF Pagador do Frete',
  cnpj_remetente: 'CNPJ/CPF Remetente',
  cnpj_destinatario: 'CNPJ/CPF Destinatário',
  cnpj_terminal_coleta: 'CNPJ/CPF Terminal de Coleta',
  cnpj_terminal_entrega: 'CNPJ/CPF Terminal de Entrega',
  serie: 'Série',
  numero_nota: 'Número da Nota',
  chave_acesso: 'Chave de Acesso',
  quantidade: 'Quantidade',
  peso_liquido: 'Peso Líquido',
  valor_nota: 'Valor da Nota',
};

const ExtratorXML: React.FC = () => {
  const [dadosLista, setDadosLista] = useState<DadosNF[]>([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // 1) LEITURA / EXTRAÇÃO XML
  // -----------------------------
  const extrairDadosXml = async (file: File): Promise<DadosNF> => {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    const getCnpjOrCpf = (node: Element | null) => {
      const cpf = node?.querySelector('CPF')?.textContent;
      const cnpj = node?.querySelector('CNPJ')?.textContent;
      return cpf || cnpj || 'Não encontrado';
    };

    const emitNode = xmlDoc.querySelector('emit');
    const destNode = xmlDoc.querySelector('dest');
    const retiradaNode = xmlDoc.querySelector('retirada');
    const entregaNode = xmlDoc.querySelector('entrega');

    const cnpjRemetente = getCnpjOrCpf(emitNode);
    const cnpjDestinatario = getCnpjOrCpf(destNode);
    const cnpjTerminalColeta = getCnpjOrCpf(retiradaNode);
    const cnpjTerminalEntrega = getCnpjOrCpf(entregaNode);

    const modFrete = xmlDoc.querySelector('transp modFrete')?.textContent || '9';
    const cnpjPagadorFrete =
      ['0', '4'].includes(modFrete)
        ? cnpjRemetente
        : modFrete === '1'
        ? cnpjDestinatario
        : 'Não especificado';

    const quantidade = xmlDoc.querySelector('transp vol qVol')?.textContent || 'Não encontrado';
    const pesoLiquido = xmlDoc.querySelector('transp vol pesoL')?.textContent;
    const pesoBruto = xmlDoc.querySelector('transp vol pesoB')?.textContent;
    const peso = pesoLiquido || pesoBruto || 'Não encontrado';

    return {
      cnpj_pagador_frete: cnpjPagadorFrete,
      cnpj_remetente: cnpjRemetente,
      cnpj_destinatario: cnpjDestinatario,
      ...(cnpjTerminalColeta && cnpjTerminalColeta !== 'Não encontrado' && {
        cnpj_terminal_coleta: cnpjTerminalColeta,
      }),
      ...(cnpjTerminalEntrega && cnpjTerminalEntrega !== 'Não encontrado' && {
        cnpj_terminal_entrega: cnpjTerminalEntrega,
      }),
      serie: xmlDoc.querySelector('ide serie')?.textContent || 'Não encontrado',
      numero_nota: xmlDoc.querySelector('ide nNF')?.textContent || 'Não encontrado',
      chave_acesso: xmlDoc.querySelector('infNFe')?.getAttribute('Id')?.replace('NFe', '') || 'Não encontrado',
      quantidade: quantidade.replace('.', ','),
      peso_liquido: peso.replace('.', ','),
      valor_nota: xmlDoc.querySelector('ICMSTot vNF')?.textContent?.replace('.', ',') ?? 'Não encontrado',
    };
  };

  // ---------------------------------------
  // 2) PROCESSA AUTOMATICAMENTE AO RECEBER OS ARQUIVOS
  // ---------------------------------------
  const processarArquivos = async (fileList: FileList | File[]) => {
    const xmlFiles = Array.from(fileList).filter(
      (f) => f.type === 'text/xml' || f.name.toLowerCase().endsWith('.xml')
    );

    if (xmlFiles.length === 0) {
      alert('Selecione arquivos XML válidos.');
      return;
    }

    setLoading(true);

    try {
      const dados = await Promise.all(xmlFiles.map(extrairDadosXml));
      setDadosLista(dados);
    } catch (e) {
      alert('Erro ao processar arquivos XML.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // 3) DROPZONE
  // ---------------------------------------
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      processarArquivos(e.dataTransfer.files);
    },
    []
  );

  const handleClickInput = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processarArquivos(e.target.files);
  };

  // ---------------------------------------
  // 4) COPIAR VALOR
  // ---------------------------------------
  const copiar = (valor: string, label: string) => {
    navigator.clipboard.writeText(valor).then(() => {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = `${label} copiado!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    });
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div className="extrator-container">
      <header className="header">
        <h2 className="title">📄 Extrator de Nota Fiscal (XML)</h2>
      </header>

      <div
        className="upload-section"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClickInput}
        style={{
          border: '2px dashed #7a7a7a',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <p style={{ marginBottom: 8, fontSize: 15 }}>
          Arraste e solte XMLs aqui <br /> ou clique para buscar no computador
        </p>

        {loading && <p>⏳ Processando arquivos...</p>}

        <input
          id="file-input"
          type="file"
          accept=".xml"
          style={{ display: 'none' }}
          multiple
          onChange={handleFileChange}
        />
      </div>

      {dadosLista.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>Nenhum XML processado.</p>
        </div>
      )}

      {dadosLista.length > 0 &&
        dadosLista.map((dados, i) => (
          <section key={i} className="results-section">
            <h3 className="results-title">📋 Dados Extraídos - Arquivo {i + 1}</h3>

            <div className="data-grid">
              {Object.entries(dados).map(([key, val]) => {
                const label = campoLabels[key] || key;
                return (
                  <div key={key} className="data-item">
                    <span className="data-label">{label}</span>
                    <button
                      className="data-button has-value"
                      onClick={() => copiar(val, label)}
                    >
                      <span className="button-text">{val}</span>
                      <span className="copy-icon">📋</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
};

export default ExtratorXML;
