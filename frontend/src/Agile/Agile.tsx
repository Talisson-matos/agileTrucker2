import React, { useState, useRef } from "react";
import "./Agile.css";

type ButtonItem = {
  label: string;
  content: string;
};

type TabType = "liberacao" | "monitoramento" | "pedagio" | "arquivos";

const Agile: React.FC = () => {
  const initialButtons: ButtonItem[] = [
    { label: "Nº PEDIDO", content: "" },
    { label: "MOTORISTA", content: "" },
    { label: "CAVALO", content: "" },
    { label: "REBOQUE", content: "" },
    { label: "REBOQUE2", content: "" },
    { label: "LINHA", content: "" },
    { label: "PROPRIETÁRIO", content: "" },
    { label: "ITEM FRETE", content: "" },
    { label: "EIXOS", content: "" },
    { label: "FRETE S/IMPOSTO", content: "" },
    { label: "FRETE C/ IMPOSTO", content: "" },
    { label: "CONTA BANCÁRIA", content: "" },
    { label: "PEDÁGIO", content: "" },
    { label: "FRETE TERCEIRO C/ IMPOSTO", content: "" },
    { label: "FRETE TOTAL TERCEIRO", content: "" },
    { label: "FILIAL", content: "" },
    { label: "CTE", content: "" },
    { label: "LIBERAÇÃO", content: "" },
    { label: "MONITORAMENTO", content: "" },
  ];

  const [buttons, setButtons] = useState<ButtonItem[]>(initialButtons);
  const [customLabel, setCustomLabel] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("liberacao");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const clickCounts = useRef<{ [key: number]: number }>({});
  const clickTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> | null }>({});


  const toUpper = (str: string) => str.toUpperCase().trim();

  const getValue = (label: string) => toUpper(buttons.find(b => b.label === label)?.content || "");

  const formatPlate = (plate: string) => {
    if (!plate || plate.length < 7) return plate;
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  };

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2000);
  };

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(successMsg);
    } catch {
      notify("Falha ao copiar.");
    }
  };

  const handleClick = async (index: number) => {
    const button = buttons[index];

    if (!navigator.clipboard) {
      notify("Área de transferência não suportada.");
      return;
    }

    if (button.content === "") {
      try {
        const text = await navigator.clipboard.readText();
        const updated = [...buttons];
        updated[index].content = toUpper(text);
        setButtons(updated);
        notify(`Colado em ${button.label}`);
      } catch {
        notify("Falha ao colar.");
      }
      clickCounts.current[index] = 0;
    } else {
      clickCounts.current[index] = (clickCounts.current[index] || 0) + 1;

      if (clickTimers.current[index]) {
        clearTimeout(clickTimers.current[index]);
      }

      clickTimers.current[index] = setTimeout(() => {
        clickCounts.current[index] = 0;
        clickTimers.current[index] = null;
      }, 500);

      if (clickCounts.current[index] >= 3) {
        const updated = [...buttons];
        updated[index].content = "";
        setButtons(updated);
        notify(`Limpo: ${button.label}`);
        clickCounts.current[index] = 0;
      } else {
        copyToClipboard(button.content, `Copiado: ${button.label}`);
      }
    }
  };

  const handlePasteInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const cleaned = val.replace(/[\s.\-\/]/g, "");
    if (cleaned) {
      await copyToClipboard(cleaned, `Copiado: ${cleaned}`);
    }
    e.target.value = "";
  };

  const handleCustomCreate = () => {
    const label = customLabel.trim();
    if (!label) return notify("Digite um nome.");
    if (buttons.some(b => b.label.toLowerCase() === label.toLowerCase())) {
      return notify("Botão já existe.");
    }
    setButtons([...buttons, { label: toUpper(label), content: "" }]);
    setCustomLabel("");
    notify(`Botão criado: ${toUpper(label)}`);
  };

  const handleClear = () => {
    setButtons(initialButtons.map(b => ({ ...b, content: "" })));
    setGeneratedItems([]);
    notify("Tudo limpo!");
  };

  const generateContent = () => {
    const items: string[] = [];

    if (activeTab === "liberacao") {
      const motorista = getValue("MOTORISTA");
      const cavalo = formatPlate(getValue("CAVALO"));
      const reboque = formatPlate(getValue("REBOQUE"));
      const linha = getValue("LINHA");

      if (motorista) items.push(motorista);
      if (cavalo) items.push(cavalo);
      if (reboque) items.push(reboque);
      if (linha) items.push(linha);

    } else if (activeTab === "monitoramento") {
      const motorista = getValue("MOTORISTA");
      const cavalo = formatPlate(getValue("CAVALO"));
      const reboque = formatPlate(getValue("REBOQUE"));
      const linha = getValue("LINHA");

      const now = new Date();
      const inicio = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const termino = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const formatDate = (d: Date) =>
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${d
          .getSeconds()
          .toString()
          .padStart(2, "0")} ${d.getDate().toString().padStart(2, "0")}/${(
          d.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;

      if (motorista) items.push(motorista);
      if (cavalo) items.push(cavalo);
      if (reboque) items.push(reboque);
      items.push(`INÍCIO ${formatDate(inicio)}; TÉRMINO ${formatDate(termino)}`);
      if (linha) items.push(linha);

    } else if (activeTab === "pedagio") {
      const filial = getValue("FILIAL");
      const mdfe = getValue("MDFE");
      const motorista = getValue("MOTORISTA");
      const placas = [getValue("CAVALO"), getValue("REBOQUE"), getValue("REBOQUE2")]
        .filter(Boolean)
        .map(p => formatPlate(p))
        .join(" / ");
      const eixos = getValue("EIXOS");
      const valor = getValue("PEDÁGIO");
      const linha = getValue("LINHA");
      const proprietario = getValue("PROPRIETÁRIO");      

      items.push(`FILIAL: ${filial || "VAZIO"}`);
      items.push(`MDFE: ${mdfe || "VAZIO"}`);
      items.push(`MOTORISTA: ${motorista || "VAZIO"}`);
      items.push(`PLACAS: ${placas || "VAZIO"}`);
      items.push(`EIXOS: ${eixos || "VAZIO"}`);
      items.push(`LINHA: ${linha || "VAZIO"}`);
      items.push(`CARTÃO: VAZIO`);
      items.push(`VALOR: ${valor || "0,00"}`);
      items.push(`FATURADO: SAMID`);
      items.push(`CPF/CNPJ PROPRIETÁRIO ANTT: ${proprietario || "VAZIO"}`);     

    } else if (activeTab === "arquivos") {
      const motorista = getValue("MOTORISTA");
      const cte = getValue("CTE");
      const mdfe = getValue("MDFE");
      const cavalo = getValue("CAVALO");
      const reboque = getValue("REBOQUE");
      const reboque2 = getValue("REBOQUE2");
      const dolly = getValue("DOLLY") || "";

      if (cte && motorista) items.push(`(CTe ${cte}) • ${motorista}`);
      if (mdfe && motorista) items.push(`(MDFe ${mdfe}) • ${motorista}`);
      if (cte && motorista) items.push(`(CTRB ${cte}) • ${motorista}`);
      if (cte && motorista) items.push(`(Gnre ${cte}) • ${motorista}`);
      if (cavalo && motorista) items.push(`(CAVALO - ${cavalo}) • ${motorista}`);
      if (reboque && motorista) items.push(`(REBOQUE - ${reboque}) • ${motorista}`);
      if (reboque2 && motorista) items.push(`(REBOQUE2 - ${reboque2}) • ${motorista}`);
      if (dolly && motorista) items.push(`(DOLLY - ${dolly}) • ${motorista}`);
      if (motorista) items.push(`CNH • ${motorista}`);
    }

    setGeneratedItems(items);
  };

  const copyAllPedagio = () => {
    const text = generatedItems.join("\n");
    copyToClipboard(text, "Tudo copiado (Pedágio)");
  };

  const copyAllSummary = () => {
    const summaryText = buttons.map(btn => `${btn.label}: ${btn.content || "[vazio]"}`).join("\n");
    copyToClipboard(summaryText, "Resumo copiado");
  };

  const downloadSummaryTxt = () => {
    const summaryText = buttons.map(btn => `${btn.label}: ${btn.content || "[vazio]"}`).join("\n");
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resumo.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify("Arquivo .txt gerado");
  };

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="agile-container">
      <h2 className="agile-title">Agile Pro</h2>     

      <div className="agile-cleaner-box">
        <h4>Limpar Número</h4>
        <input
          type="text"
          placeholder="Cole aqui para limpar..."
          onChange={handlePasteInput}
        />
        {feedback && <span className="agile-feedback">{feedback}</span>}
      </div>

      <div className="agile-actions-bar">
        <div className="agile-custom-input">
          <input
            placeholder="Novo campo..."
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomCreate()}
          />
          <button className="agile-botao-metalico agile-small" onClick={handleCustomCreate}>
            Criar
          </button>
        </div>
        <button className="agile-botao-metalico agile-clear" onClick={handleClear}>
          Limpar Tudo
        </button>
      </div>

      <div className="agile-button-grid">
        {buttons.map((btn, i) => (
          <button
            key={i}
            className="agile-botao-metalico agile-clip-btn"
            onClick={() => handleClick(i)}
          >
            <span className="agile-label">{btn.label}</span>
            <span className="agile-content">{btn.content || "[vazio]"}</span>
          </button>
        ))}
      </div>      

      <div className="agile-generator-control">
        <button
          className="agile-botao-metalico agile-open-modal"
          onClick={() => {
            generateContent();
            setIsModalOpen(true);
          }}
        >
          Gerar Informações
        </button>
      </div>

      <div className="agile-summary-control">
        <button
          className="agile-botao-metalico agile-summary-btn"
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? "Esconder Resumo" : "Mostrar Resumo"}
        </button>
      </div>

      {showSummary && (
        <div className="agile-summary-section">
          <h3>Resumo de Informações</h3>
          <div className="agile-summary-list">
            {buttons.map((btn, i) => (
              <div key={i} className="agile-summary-item">
                {btn.label}: {btn.content || "[vazio]"}
              </div>
            ))}
          </div>
          <div className="agile-summary-actions">
            <button
              className="agile-botao-metalico agile-copy-all"
              onClick={copyAllSummary}
            >
              Copiar Tudo
            </button>
            <button
              className="agile-botao-metalico agile-download-txt"
              onClick={downloadSummaryTxt}
            >
              Gerar .txt
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="agile-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="agile-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gerador de Informações</h3>

            <div className="agile-tabs">
              {(["liberacao", "monitoramento", "pedagio", "arquivos"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  className={`agile-tab-btn ${activeTab === tab ? "agile-active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    generateContent();
                  }}
                >
                  {tab === "liberacao" ? "Liberação" : tab === "monitoramento" ? "Monitoramento" : tab === "pedagio" ? "Pedágio" : "Arquivos"}
                </button>
              ))}
            </div>

            <div className="agile-generated-list">
              {generatedItems.length === 0 ? (
                <p className="agile-empty">Nenhum dado preenchido.</p>
              ) : (
                generatedItems.map((item, i) => (
                  <div key={i} className="agile-generated-item">
                    <span>{item}</span>
                    {activeTab !== "pedagio" && (
                      <button
                        className="agile-botao-metalico agile-mini"
                        onClick={() => copyToClipboard(item, "Copiado")}
                      >
                        Copiar
                      </button>
                    )}
                  </div>
                ))
              )}
              {activeTab === "pedagio" && generatedItems.length > 0 && (
                <button className="agile-botao-metalico agile-full-copy" onClick={copyAllPedagio}>
                  Copiar Tudo
                </button>
              )}
            </div>

            {activeTab === "liberacao" || activeTab === "monitoramento" ? (
              <div className="agile-links-section">
                <h4>Links Úteis</h4>
                <div className="agile-link-item">
                  <button
                    className="agile-botao-metalico agile-link-btn"
                    onClick={() => openLink("http://vstrack.ddns.net/komando/?ReturnUrl=%2Fkomando%2FRastreamento%2FIndex")}
                  >
                    Acessar KOMANDO
                  </button>
                  <p>Usuário: expedicao3@samidtransportes.com.br</p>
                  <p>Senha: 123456</p>
                </div>
                <div className="agile-link-item">
                  <button
                    className="agile-botao-metalico agile-link-btn"
                    onClick={() => openLink("http://vstrack.ddns.net/komando/?ReturnUrl=%2Fkomando%2FRastreamento%2FIndex")}
                  >
                    Acessar KOMANDO JOLAZ
                  </button>
                  <p>Usuário: contato@jolaz.com.br</p>
                  <p>Senha: 123456</p>
                </div>
              </div>
            ) : activeTab === "pedagio" ? (
              <div className="agile-links-section">
                <h4>Links Úteis</h4>
                <button
                  className="agile-botao-metalico agile-link-btn"
                  onClick={() => openLink("https://www.roadcard.com.br/sistemapamcard/?loadGaScript=load")}
                >
                  Acessar Pamcard
                </button>

                <button
                  className="agile-botao-metalico agile-link-btn"
                  onClick={() => openLink("https://qualp.com.br/#/")}
                >
                  Acessar Qualp
                </button>

                <button
                  className="agile-botao-metalico agile-link-btn"
                  onClick={() => openLink("https://rotasbrasil.com.br/")}
                >
                  Acessar Rotas Brasil
                </button>

                <button
                  className="agile-botao-metalico agile-link-btn"
                  onClick={() => openLink("https://consultapublica.antt.gov.br/Site/ConsultaRNTRC.aspx/consultapublica")}
                >
                  Acessar Consulta ANTT
                </button>
              </div>
            ) : null}

            <button className="agile-botao-metalico agile-close" onClick={() => setIsModalOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agile;