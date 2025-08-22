import React, { useState } from "react";
import "./Agile.css";

type ButtonItem = {
  label: string;
  content: string;
};

const Agile: React.FC = () => {
  const [buttons, setButtons] = useState<ButtonItem[]>([
    { label: "Motorista", content: "" },
    { label: "Cavalo", content: "" },
    { label: "Reboque", content: "" },
    { label: "Reboque2", content: "" },
    { label: "DOLLY", content: "" },
    { label: "Linha", content: "" },
    { label: "CTe", content: "" },
    { label: "MDFe", content: "" },
    { label: "CPF", content: "" },
    { label: "CNPJ", content: "" },
    { label: "ANTT", content: "" },
    { label: "Contato", content: "" },
    { label: "Chave", content: "" },
    { label: "Liberação", content: "" },
    { label: "SM", content: "" },
  ]);
  const [customLabel, setCustomLabel] = useState("");
  const [notification, setNotification] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const handleClick = async (index: number) => {
    const button = buttons[index];
    const updated = [...buttons];

    if (button.content === "") {
      try {
        const text = await navigator.clipboard.readText();
        updated[index].content = text;
        setButtons(updated);
        notify(`✅ Valor colado em ${button.label}`);
      } catch {
        notify("❌ Falha ao colar da área de transferência.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(button.content);
        notify(`✅ Copiado: ${button.label}`);
      } catch {
        notify("❌ Falha ao copiar para área de transferência.");
      }
    }
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  const copyGenerated = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => notify(`✅ Copiado: ${text}`))
      .catch(() => notify("❌ Falha ao copiar."));
  };

  const generateGroup = (group: "emissoes" | "cadastro") => {
    const motorista = buttons.find((btn) => btn.label === "Motorista")?.content || "";
    const cte = buttons.find((btn) => btn.label === "CTe")?.content || "";
    const mdfe = buttons.find((btn) => btn.label === "MDFe")?.content || "";
    const cavalo = buttons.find((btn) => btn.label === "Cavalo")?.content || "";
    const reboque = buttons.find((btn) => btn.label === "Reboque")?.content || "";
    const reboque2 = buttons.find((btn) => btn.label === "Reboque2")?.content || "";
    const dolly = buttons.find((btn) => btn.label === "DOLLY")?.content || "";

    let files: string[] = [];

    if (group === "emissoes") {
      if (cte && motorista) files.push(`(CT-e ${cte}) • ${motorista}`);
      if (mdfe && motorista) files.push(`(MDF-e ${mdfe}) • ${motorista}`);
      if (cte && motorista) files.push(`(CTRB ${cte}) • ${motorista}`);
      if (cte && motorista) files.push(`(Gnre ${cte}) • ${motorista}`);
    }

    if (group === "cadastro") {
      if (cavalo && motorista) files.push(`(CAVALO - ${cavalo}) • ${motorista}`);
      if (reboque && motorista) files.push(`(REBOQUE - ${reboque}) • ${motorista}`);
      if (reboque2 && motorista) files.push(`(REBOQUE - ${reboque2}) • ${motorista}`);
      if (dolly && motorista) files.push(`(DOLLY - ${dolly}) • ${motorista}`);
      if (motorista) files.push(`CNH • ${motorista}`);
    }

    setGeneratedFiles(files);
  };

  const handleCustomCreate = () => {
    const label = customLabel.trim();
    if (!label) return notify("⚠️ Insira um nome para o botão.");

    const exists = buttons.some((btn) => btn.label.toLowerCase() === label.toLowerCase());
    if (exists) return notify("⚠️ Botão já existe.");

    setButtons([...buttons, { label, content: "" }]);
    setCustomLabel("");
    notify(`✅ Botão ${label} criado.`);
  };

  const handleClear = () => {
    setButtons([
      { label: "Motorista", content: "" },
      { label: "Cavalo", content: "" },
      { label: "Reboque", content: "" },
      { label: "Reboque2", content: "" },
      { label: "DOLLY", content: "" },
      { label: "Linha", content: "" },
      { label: "CTe", content: "" },
      { label: "MDFe", content: "" },
      { label: "CPF", content: "" },
      { label: "CNPJ", content: "" },
      { label: "ANTT", content: "" },
      { label: "Contato", content: "" },
      { label: "Chave", content: "" },
    ]);
    notify("🧹 Botões e valores resetados!");
  };

  return (
    <div className="container">
      <h2>🪄 Agile</h2>

      {/* Input para limpar e copiar número */}
      <div className="cleaner-box">
        <h4>🔎 Limpar Número</h4>
        <input
          type="text"
          placeholder="Cole aqui um número..."
          onChange={(e) => {
            let val = e.target.value;
            // Remove espaços, traços, pontos e barras
            let cleaned = val.replace(/[\s.\-\/]/g, "");
            if (cleaned) {
              navigator.clipboard
                .writeText(cleaned)
                .then(() => notify(`✅ Copiado: ${cleaned}`))
                .catch(() => notify("❌ Falha ao copiar número."));
            }
             e.target.value = "";
          }}
        />
      </div>


      <div className="button-container">
        {buttons.map((btn, index) => (
          <button key={index} className="clip-btn" onClick={() => handleClick(index)}>
            <span className="label">{btn.label}</span>:{" "}
            <span className="content">{btn.content || "[vazio]"}</span>
          </button>
        ))}
      </div>

      <div className="custom-creator">
        <input
          type="text"
          placeholder="Novo botão"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
        />
        <button onClick={handleCustomCreate}>Criar botão</button>
        <button className="clear-btn" onClick={handleClear}>
          Limpar botões
        </button>
      </div>

      <div className="generator-control">
        <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
          📂 Gerar Nomes de Arquivos
        </button>
      </div>

      {notification && <div className="notification">{notification}</div>}

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📂 Gerador de Arquivos</h3>

            <div className="modal-buttons">
              <button onClick={() => generateGroup("emissoes")}>Gerar Emissões</button>
              <button onClick={() => generateGroup("cadastro")}>Gerar Cadastro</button>
            </div>

            <div className="generated-list">
              {generatedFiles.length === 0 && <p className="empty">Nenhum arquivo gerado ainda.</p>}
              {generatedFiles.map((file, idx) => (
                <div key={idx} className="generated-item">
                  <span>{file}</span>
                  <button onClick={() => copyGenerated(file)}>Copiar</button>
                </div>
              ))}
            </div>

            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agile;
