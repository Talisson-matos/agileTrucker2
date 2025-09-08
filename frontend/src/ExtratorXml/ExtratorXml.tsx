import React, { useState } from 'react';
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
    const [file, setFile] = useState<File | null>(null);
    const [dados, setDados] = useState<DadosNF>({});
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected?.type === 'text/xml' || selected?.name.endsWith('.xml')) {
            setFile(selected);
        } else {
            alert('Por favor, selecione um arquivo XML.');
            e.target.value = '';
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');

            // Helper function to get CNPJ or CPF from a node
            const getCnpjOrCpf = (node: Element | null) => {
                const cpf = node?.querySelector('CPF')?.textContent;
                const cnpj = node?.querySelector('CNPJ')?.textContent;
                return cpf || cnpj || 'Não encontrado';
            };

            // Extract CNPJ or CPF for emitter, destination, pickup, and delivery
            const emitNode = xmlDoc.querySelector('emit');
            const destNode = xmlDoc.querySelector('dest');
            const retiradaNode = xmlDoc.querySelector('retirada');
            const entregaNode = xmlDoc.querySelector('entrega');

            const cnpjOrCpfRemetente = getCnpjOrCpf(emitNode);
            const cnpjOrCpfDestinatario = getCnpjOrCpf(destNode);
            const cnpjOrCpfTerminalColeta = getCnpjOrCpf(retiradaNode);
            const cnpjOrCpfTerminalEntrega = getCnpjOrCpf(entregaNode);

            // Determine pagador do frete based on modFrete
            const modFrete = xmlDoc.querySelector('transp modFrete')?.textContent || '9';
            const cnpjOrCpfPagadorFrete = ['0', '4'].includes(modFrete)
                ? cnpjOrCpfRemetente
                : modFrete === '1'
                ? cnpjOrCpfDestinatario
                : 'Não especificado';

            // Format quantidade and peso (prefer pesoL, fallback to pesoB if pesoL is not found)
            const quantidade = xmlDoc.querySelector('transp vol qVol')?.textContent || 'Não encontrado';
            const pesoLiquido = xmlDoc.querySelector('transp vol pesoL')?.textContent || '';
            const pesoBruto = xmlDoc.querySelector('transp vol pesoB')?.textContent || '';
            const peso = pesoLiquido || pesoBruto || 'Não encontrado';

            const dadosExtraidos: DadosNF = {
                cnpj_pagador_frete: cnpjOrCpfPagadorFrete,
                cnpj_remetente: cnpjOrCpfRemetente,
                cnpj_destinatario: cnpjOrCpfDestinatario,
                ...(cnpjOrCpfTerminalColeta && cnpjOrCpfTerminalColeta !== 'Não encontrado' && {
                    cnpj_terminal_coleta: cnpjOrCpfTerminalColeta,
                }),
                ...(cnpjOrCpfTerminalEntrega && cnpjOrCpfTerminalEntrega !== 'Não encontrado' && {
                    cnpj_terminal_entrega: cnpjOrCpfTerminalEntrega,
                }),
                serie: xmlDoc.querySelector('ide serie')?.textContent || 'Não encontrado',
                numero_nota: xmlDoc.querySelector('ide nNF')?.textContent || 'Não encontrado',
                chave_acesso: xmlDoc.querySelector('infNFe')?.getAttribute('Id')?.replace('NFe', '') || 'Não encontrado',
                quantidade: quantidade !== 'Não encontrado' ? quantidade.replace('.', ',') : quantidade,
                peso_liquido: peso !== 'Não encontrado' ? peso.replace('.', ',') : peso,
                valor_nota: xmlDoc.querySelector('ICMSTot vNF')?.textContent?.replace('.', ',') ?? 'Não encontrado',
            };

            setDados(dadosExtraidos);
        } catch (err) {
            console.error('Erro ao processar o arquivo XML:', err);
            alert(`Falha ao extrair dados da nota fiscal.\n${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const valorNaoEncontrado = (v: string) => !v || v === 'Não encontrado';

    const copiarParaClipboard = (valor: string, label: string) => {
        navigator.clipboard
            .writeText(valor)
            .then(() => {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.textContent = `${label} copiado!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.classList.add('show'), 100);
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => document.body.removeChild(toast), 300);
                }, 2000);
            })
            .catch(console.error);
    };

    const limparTudo = () => {
        setFile(null);
        setDados({});
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.value = '';
    };

    const temDados = Object.keys(dados).length > 0;

    return (
        <div className="extrator-container">
            <header className="header">
                <h2 className="title">📄 Extrator de Nota Fiscal (XML)</h2>
            </header>
            <section className="upload-section">
                <div className="file-input-wrapper">
                    <input
                        id="file-input"
                        type="file"
                        accept="text/xml,application/xml,.xml"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                        <span className="file-icon">📎</span>
                        {file ? file.name : 'Escolher arquivo XML'}
                    </label>
                </div>
                <div className="button-group">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`btn btn-primary ${!file || loading ? 'disabled' : ''}`}
                    >
                        {loading ? 'Processando...' : '🚀 Extrair Dados'}
                    </button>
                    {temDados && (
                        <button onClick={limparTudo} className="btn btn-secondary">
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
                            const label = campoLabels[key] || key;
                            const noValue = valorNaoEncontrado(val);
                            return (
                                <div key={key} className="data-item">
                                    <span className="data-label">{label}</span>
                                    <button
                                        onClick={() => copiarParaClipboard(val, label)}
                                        className={`data-button ${noValue ? 'no-value' : 'has-value'}`}
                                        title={noValue ? 'Valor não encontrado' : `Clique para copiar: ${val}`}
                                    >
                                        <span className="button-text">{noValue ? 'Não encontrado' : val}</span>
                                        <span className="copy-icon">📋</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <p>Selecione e envie um arquivo XML para extrair os dados.</p>
                </div>
            )}
        </div>
    );
};

export default ExtratorXML;