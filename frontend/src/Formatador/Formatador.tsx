

import React, { useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import "./Formatador.css";

interface CNPJInfo {
  label: string;
  valor: string | number | null | undefined;
}

interface CNPJRegistration {
  number?: string;
  state?: string;
  type?: string;
  status?: string;
}

interface CnpjResponse {
  taxId?: string;
  company?: {
    name?: string;
    equity?: number;
    size?: { text?: string };
    nature?: { text?: string };
  };
  alias?: string;
  status?: { text?: string };
  mainActivity?: { text?: string };
  address?: {
    street?: string;
    number?: string;
    details?: string;
    district?: string;
    zip?: string;
    city?: string;
    state?: string;
  };
  phones?: { number?: string }[];
  emails?: { address?: string }[];
  registrations?: CNPJRegistration[];
}


const Formatador: React.FC = () => {
  const [mostrarNotas, setMostrarNotas] = useState<boolean>(false);
  const [mostrarCnpj, setMostrarCnpj] = useState<boolean>(false); 
  const [feedback, setFeedback] = useState<string>("");

  // Estados para consulta CNPJ
  const [cnpjInput, setCnpjInput] = useState<string>("");
  const [dadosCnpj, setDadosCnpj] = useState<CnpjResponse | null>(null);
  const [carregandoCnpj, setCarregandoCnpj] = useState<boolean>(false);
  const [erroCnpj, setErroCnpj] = useState<string>("");
  const [feedbackCnpj, setFeedbackCnpj] = useState<string>("");

  // Função para notificar usuário
  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 1500);
  };

  // Função para notificar usuário CNPJ
  const notifyCnpj = (msg: string) => {
    setFeedbackCnpj(msg);
    setTimeout(() => setFeedbackCnpj(""), 2000);
  };

  const abrirLink = (url: string) => {
    window.open(url, "_blank");
  };

  // Input que limpa e copia automaticamente ao colar
  const handlePasteInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = val.replace(/[\s.\-\/]/g, "");
    if (cleaned) {
      try {
        await navigator.clipboard.writeText(cleaned);
        notify(`✅ Copiado: ${cleaned}`);
      } catch {
        notify("❌ Falha ao copiar número.");
      }
    }
    e.target.value = "";
  };

  // Limpar CNPJ (remove pontuação)
  const limparCnpj = (cnpj: string): string => {
    return cnpj.replace(/[^\d]/g, "");
  };

  // Consulta CNPJ na API
  const consultarCnpj = async () => {
    const cnpjLimpo = limparCnpj(cnpjInput);

    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
      setErroCnpj("CNPJ deve conter 14 dígitos");
      return;
    }

    setCarregandoCnpj(true);
    setErroCnpj("");
    setDadosCnpj(null);

    try {
     const response = await fetch(`https://open.cnpja.com/office/${cnpjLimpo}?registrations=BR`)

      if (!response.ok) {
        throw new Error("CNPJ não encontrado ou API indisponível");
      }

      const dados: CnpjResponse = await response.json();
      setDadosCnpj(dados);
      notifyCnpj("✅ CNPJ consultado com sucesso!");
    } catch (error: any) {
      setErroCnpj(error.message || "Erro desconhecido");
      notifyCnpj("❌ Erro na consulta do CNPJ");
    } finally {
      setCarregandoCnpj(false);
    }
  };

  // Copiar informação específica do CNPJ
  const copiarInfoCnpj = async (info: string | number | undefined, label: string) => {
    try {
      await navigator.clipboard.writeText(String(info ?? ""));
      notifyCnpj(`✅ ${label} copiado!`);
    } catch {
      notifyCnpj(`❌ Falha ao copiar ${label}`);
    }
  };

const renderizarBotoesCnpj = (): React.ReactElement[] | null => {
  if (!dadosCnpj) return null

  const informacoes: CNPJInfo[] = [
    { label: 'CNPJ', valor: dadosCnpj.taxId },
    { label: 'Razão Social', valor: dadosCnpj.company?.name },
    { label: 'Nome Fantasia', valor: dadosCnpj.alias },
    { label: 'Situação', valor: dadosCnpj.status?.text },
    { label: 'Atividade Principal', valor: dadosCnpj.mainActivity?.text },
    { label: 'Capital Social', valor: dadosCnpj.company?.equity ? `R$ ${dadosCnpj.company.equity.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : null },
    { label: 'Porte', valor: dadosCnpj.company?.size?.text },
    { label: 'Natureza Jurídica', valor: dadosCnpj.company?.nature?.text },
    { label: 'Logradouro', valor: dadosCnpj.address?.street },
    { label: 'Número', valor: dadosCnpj.address?.number },
    { label: 'Complemento', valor: dadosCnpj.address?.details },
    { label: 'Bairro', valor: dadosCnpj.address?.district },
    { label: 'CEP', valor: dadosCnpj.address?.zip },
    { label: 'Cidade', valor: dadosCnpj.address?.city },
    { label: 'UF', valor: dadosCnpj.address?.state },
    { label: 'Telefone', valor: dadosCnpj.phones?.[0]?.number },
    { label: 'Email', valor: dadosCnpj.emails?.[0]?.address }
  ]

  // Adiciona as inscrições estaduais se existirem - CORRIGIDO
  if (dadosCnpj.registrations && dadosCnpj.registrations.length > 0) {
    const registrationsInfo: CNPJInfo[] = dadosCnpj.registrations
      .filter(registration => registration.number)
      .map((registration, index) => {
        const ieLabel = dadosCnpj.registrations!.length > 1 
          ? `Inscrição Estadual ${registration.state || (index + 1)}` 
          : 'Inscrição Estadual'
        return {
          label: ieLabel, 
          valor: registration.number
        }
      })
    
    // Insere as IEs após "Natureza Jurídica" (posição 8)
    informacoes.splice(8, 0, ...registrationsInfo)
  }

  const botoes: React.ReactElement[] = informacoes
    .filter(info => info.valor)
    .map((info, index) => (
      <button
        key={index}
        className="cnpj-info-button"
        onClick={() => copiarInfoCnpj(info.valor ?? undefined, info.label)}

      >
        <div className="cnpj-info-label">{info.label}</div>
        <div className="cnpj-info-valor">{info.valor}</div>
      </button>
    ))

  // Adiciona botão de limpar
  botoes.push(
    <button
      key="limpar"
      className="cnpj-limpar-btn"
      onClick={() => {
        setCnpjInput('')
        setDadosCnpj(null)
        setErroCnpj('')
        setFeedbackCnpj('')
      }}
    >
      ►► Nova Consulta
    </button>
  )

  return botoes
}



  return (
    <div className="formatador-container">
      {/* Input para limpar e copiar número */}
      <div className="cleaner-box">
        <h4>🔎 Limpar Número</h4>
        <input
          type="text"
          placeholder="Cole aqui um número..."
          onChange={handlePasteInput}
        />
        {feedback && <span className="formatador-feedback">{feedback}</span>}
      </div>

      {/* Consulta CNPJ */}
      <div className="cnpj-consulta-box">
        <h4>🏢 Consulta CNPJ</h4>
        <div className="cnpj-input-group">
          <input
            type="text"
            placeholder="Digite ou cole um CNPJ..."
            value={cnpjInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCnpjInput(e.target.value)
            }
            className="cnpj-input"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && consultarCnpj()
            }
          />
          <button
            onClick={consultarCnpj}
            disabled={carregandoCnpj}
            className="cnpj-consultar-btn"
          >
            {carregandoCnpj ? "🔄 Consultando..." : "🔍 Consultar"}
          </button>
        </div>

        {erroCnpj && <div className="cnpj-erro">{erroCnpj}</div>}
        {feedbackCnpj && (
          <span className="formatador-feedback">{feedbackCnpj}</span>
        )}

        {dadosCnpj && (
          <div className="cnpj-resultados">
            <h5>📋 Informações (clique para copiar):</h5>
            <div className="cnpj-info-grid">{renderizarBotoesCnpj()}</div>
          </div>
        )}
      </div>

      <h3>🔗 Links úteis</h3>

      <div className="formatador-links">
        <button
          className="dropdown-toggle"
          onClick={() => setMostrarNotas(!mostrarNotas)}
        >
          📑 Notas Fiscais / CTe
        </button>
        {mostrarNotas && (
          <div className="link-buttons">
            <button onClick={() => abrirLink("https://consultadanfe.com/")}>
              Consulta DANFE
            </button>
            <button onClick={() => abrirLink("https://www.meudanfe.com.br/")}>
              Meu DANFE
            </button>
            <button onClick={() => abrirLink("https://www.danfeonline.com.br/")}>
              DANFE Online
            </button>
            <button onClick={() => abrirLink("https://danferapida.com.br/")}>
              DANFE Rápida
            </button>
            <button onClick={() => abrirLink("https://www.fsist.com.br/")}>
              FSist
            </button>
            <button
              onClick={() =>
                abrirLink("https://www.cte.fazenda.gov.br/portal/")
              }
            >
              Portal CTe
            </button>
            <button
              onClick={() =>
                abrirLink(
                  "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g="
                )
              }
            >
              Portal Danfe
            </button>
          </div>
        )}

        <button
          className="dropdown-toggle"
          onClick={() => setMostrarCnpj(!mostrarCnpj)}
        >
          🧾 CNPJ
        </button>
        {mostrarCnpj && (
          <div className="link-buttons">
            <button
              onClick={() =>
                abrirLink(
                  "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_Solicitacao.asp"
                )
              }
            >
              Receita Federal
            </button>
            <button onClick={() => abrirLink("https://cnpja.com/")}>
              CNPJá
            </button>
            <button onClick={() => abrirLink("https://consultacnpj.com/")}>
              Consulta CNPJ
            </button>
            <button onClick={() => abrirLink("http://www.sintegra.gov.br/")}>
              SINTEGRA
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Formatador;
