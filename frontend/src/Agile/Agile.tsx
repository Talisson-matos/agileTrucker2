import React, { useState } from 'react';
import './Agile.css';

type ButtonItem = {
  label: string;
  content: string;
};

const defaultLabels = [
  'Motorista', 'Cavalo', 'Reboque', 'Reboque2', 'Linha', 'CTe', 'MDFe',
  'CPF', 'CNPJ', 'ANTT', 'Contato', 'Chave'
];

const Agile: React.FC = () => {
  const [buttons, setButtons] = useState<ButtonItem[]>(defaultLabels.map(label => ({ label, content: '' })));
  const [customLabel, setCustomLabel] = useState('');
  const [notification, setNotification] = useState('');

  const handleClick = async (index: number) => {
    const button = buttons[index];
    const updated = [...buttons];

    if (button.content === '') {
      try {
        const text = await navigator.clipboard.readText();
        updated[index].content = text;
        setButtons(updated);
        setNotification(`✅ Valor colado em ${button.label}`);
        setTimeout(() => setNotification(''), 2000);
      } catch {
        setNotification('❌ Falha ao colar da área de transferência.');
        setTimeout(() => setNotification(''), 2000);
      }
    } else {
      try {
        await navigator.clipboard.writeText(button.content);
        setNotification(`✅ Copiado: ${button.label}`);
        setTimeout(() => setNotification(''), 2000);
      } catch {
        setNotification('❌ Falha ao copiar para área de transferência.');
        setTimeout(() => setNotification(''), 2000);
      }
    }
  };

  const handleCustomCreate = () => {
    const label = customLabel.trim();
    if (!label) {
      setNotification('⚠️ Insira um nome para o botão.');
      setTimeout(() => setNotification(''), 2000);
      return;
    }

    const exists = buttons.some(btn => btn.label.toLowerCase() === label.toLowerCase());
    if (exists) {
      setNotification('⚠️ Botão já existe.');
      setTimeout(() => setNotification(''), 2000);
      return;
    }

    setButtons([...buttons, { label, content: '' }]);
    setCustomLabel('');
    setNotification(`✅ Botão ${label} criado.`);
    setTimeout(() => setNotification(''), 2000);
  };

  const handleClear = () => {
    setButtons(defaultLabels.map(label => ({ label, content: '' })));
    setNotification('🧹 Botões e valores resetados!');
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="container">
      <h2>🪄 Agile</h2>

      <div className="button-container">
        {buttons.map((btn, index) => (
          <button key={index} className="clip-btn" onClick={() => handleClick(index)}>
            <span className="label">{btn.label}</span>: <span className="content">{btn.content || '[vazio]'}</span>
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
        <button className="clear-btn" onClick={handleClear}>Limpar botões</button>
      </div>

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
};

export default Agile;