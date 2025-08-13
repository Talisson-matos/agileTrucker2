import  { useState, useEffect } from 'react'
import './Message.css'

type CustomMessage = {
    label: string
    text: string
}

const fixedMessages: Record<string, string> = {
    Carregamento: 'Prezado Sr.@, Assim que finalizado o carregamento e a amarração, solicitamos, por gentileza, o envio das fotos das notas fiscais para prosseguirmos com a documentação. 📸 📝',
    Pedagio: 'Prezado Sr.@, Pedimos que solicite o Vale-Pedágio na portaria, para que possamos dar continuidade ao envio de sua documentação. 🛣️ 📄',
    Descarga: 'Agradecemos pelo envio das informações. Procederemos com a baixa da documentação conforme recebido. ✅ 📂',
    Notas: 'Grato pelos envios prestados, em breve retornaremos com suas documentações no grupo. 📄 ✅ ',
    Atraso: 'Sr.@,estamos com alta demanda no momento. Mas assim que tivermos disponibilidade retornaremos no grupo com suas documentações',
    Cadastro: 'Cadastro motorista: sendo iniciado',
    CadMessage:'Prezado Sr.@, Para prosseguirmos com o cadastro requerido, solicitamos atenção especial à apresentação completa e legível dos seguintes documentos:📌 PIS/INSS do proprietário da ANTT vinculada ao cavalo-mecânico;🏠 Comprovante de residência atualizado e de leitura nítida;🚘 CNH atualizada, preferencialmente em versão digital com QR Code legível;📞 Contato telefônico do motorista para registro;📄 CRLV do cavalo-mecânico, emitido no ano vigente, em formato digital ou foto nítida que abranja o documento por completo;📄 CRLV do semi-reboque, também atualizado no ano vigente, em versão digital ou imagem legível e completa.Contamos com sua colaboração para garantir a agilidade e eficiência no processo de cadastramento.🤝 Atenciosamente, Equipe da Expedição',
    CTE1: 'Prezado Sr.@, segue em anexo suas documentações de transporte para realização da viagem em conformidade com a legislação vigente. 📎🚛',
    CTE2: 'Desejamos uma excelente viagem, Sr.@! Estamos à disposição. 🌍 🛣️',
    SINISTRO: 'AO OCORRER SINISTRO LIGUE PARA A CENTRAL DO SEGURO ATRAVÉS DO TELEFONE 0800 292 1234'

}

const Message = () => {
    const [customMessages, setCustomMessages] = useState<CustomMessage[]>([])
    const [showModal, setShowModal] = useState(false)
    const [newLabel, setNewLabel] = useState('')
    const [newText, setNewText] = useState('')
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('customMessages')
        if (saved) {
            setCustomMessages(JSON.parse(saved))
        }
    }, [])

    const saveMessagesToLocal = (messages: CustomMessage[]) => {
        localStorage.setItem('customMessages', JSON.stringify(messages))
        setCustomMessages(messages)
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopiedLabel(label)
        setTimeout(() => setCopiedLabel(null), 1500)
    }

    const handleCreate = () => {
        if (!newLabel || !newText) return
        const updated = [...customMessages, { label: newLabel, text: newText }]
        saveMessagesToLocal(updated)
        setNewLabel('')
        setNewText('')
        setShowModal(false)
    }

    const handleClearStorage = () => {
        if (window.confirm('Tem certeza que deseja apagar todas as mensagens salvas?')) {
            localStorage.removeItem('customMessages')
            setCustomMessages([])
        }
    }

    return (
        <div className="message-container">
            <h2 className="message-title">📨 Mensagens do Motorista</h2>

            <div className="button-list">
                {/* Botões fixos */}
                {Object.entries(fixedMessages).map(([label, text]) => (
                    <button
                        key={label}
                        className="message-button"
                        onClick={() => handleCopy(text, label)}
                    >
                        {label}
                    </button>
                ))}

                {/* Botões personalizados */}
                {customMessages.map(({ label, text }, idx) => (
                    <button
                        key={idx}
                        className="message-button custom"
                        onClick={() => handleCopy(text, label)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {copiedLabel && <div className="copied-feedback">✅ Copiado: {copiedLabel}</div>}

            <div className="action-buttons">
                <button onClick={() => setShowModal(true)} className="create-button">Criar mensagem</button>
                <button onClick={handleClearStorage} className="clear-button">🗑️ Esvaziar mensagens</button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Criar nova mensagem</h3>
                        <input
                            type="text"
                            placeholder="Nome do botão"
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value)}
                            className="modal-input"
                        />
                        <textarea
                            placeholder="Texto da mensagem"
                            value={newText}
                            onChange={e => setNewText(e.target.value)}
                            className="modal-textarea"
                        />

                        <div className="modal-actions">
                            <button onClick={handleCreate} className="modal-create">Salvar</button>
                            <button onClick={() => setShowModal(false)} className="modal-cancel">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Message
