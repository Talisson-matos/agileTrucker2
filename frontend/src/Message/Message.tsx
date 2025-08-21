import { useState, useEffect, useCallback, memo } from 'react'
import './Message.css'

type CustomMessage = {
    label: string
    text: string
    column: 'padrao' | 'frota' | 'terceiro'
}

type MessageItem = {
    label?: string
    text?: string
    image?: string
}

const mensagensPadrao: MessageItem[] = [
    {
        label: 'Carregamento',
        text: 'Prezado Sr.@, Assim que finalizado o carregamento e a amarração, solicitamos, por gentileza, o envio das fotos das notas fiscais para prosseguirmos com a documentação. 📸 📝',
    },
    {
        label: 'Pedagio',
        text: 'Prezado Sr.@, Pedimos que solicite o Vale-Pedágio na portaria, para que possamos dar continuidade ao envio de sua documentação. 🛣️ 📄',
    },
    {
        label: 'Descarga',
        text: 'Agradecemos pelo envio das informações. Procederemos com a baixa da documentação conforme recebido. ✅ 📂',
    },
    {
        label: 'Envio de Notas',
        text: 'Grato pelos envios prestados, em breve retornaremos com suas documentações no grupo. 📄 ✅ ',
    },
    {
        label: 'Atraso',
        text: 'Sr.@, estamos com alta demanda no momento. Mas assim que tivermos disponibilidade retornaremos no grupo com suas documentações',
    },
    {
        label: 'Monitoramento',
        text: '*PARA PROBLEMAS COM O MONITORAMENTO, ACESSE O LINK ABAIXO*\n\nhttps://api.whatsapp.com/send?phone=5511947794867&text=Ol%C3%A1!%20Estou%20com%20problemas%20com%20o%20MONITORAMENTO.%20Pode%20me%20ajudar,%20por%20favor?%20',
        image: '/monitoramento.jpg',
    },
    {
        label: 'Checklist',
        text: `*SOLICITE SEU CHECKLSIT ACESSANDO O LINK ABAIXO*\n https://api.whatsapp.com/send?phone=5511947794867&text=Ol%C3%A1!%20Quero%20fazer%20o%20checklist%20do%20RASTREADOR%20e%20depois%20vou%20me%20apresentar%20para%20o%20carregamento`,
        image: '/checklist.jpg',
    },
    {
        image: '/nestle1.jpg',
    },
    {
        image: '/nestle2.jpg',
    },
]

const mensagensFrota: MessageItem[] = [
    {
        label: 'Mensagem Inicial',
        text: 'Prezado Sr.@, segue em anexo suas documentações de transporte para realização da viagem em conformidade com a legislação vigente. 📎🚛',
    },
    {
        label: 'Mensagem Monitoramento - (caso se viagem for monitorada)',
        text: `Você será monitorado pela KOMANDO, favor dar início de viagem no teclado!\nAo fazer a parada para pernoite, lembre-se de parar em um local seguro onde haja sinal telefônico para facilitar a comunicação.\n\nCódigo SM:\n`,
    },
    {
        label: 'Orientações',
        text: 'Favor se antentar às orientações abaixo, por gentileza:',
        image: '/messageFrota.jpg',
    },
    {
        label: 'Mensagem Final',
        text: 'Desejamos uma excelente viagem, Sr.@!\n\nEstamos à disposição. 🌍 🛣️',
    },
]

const mensagensTerceiro: MessageItem[] = [
    {
        label: 'Mensagem Inicial',
        text: 'Prezado Sr.@, segue em anexo suas documentações de transporte para realização da viagem em conformidade com a legislação vigente. 📎🚛',
    },
    {
        label: 'Mensagem Monitoramento - (caso se viagem for monitorada)',
        text: `Você será monitorado pela KOMANDO, favor dar início de viagem no teclado!\nAo fazer a parada para pernoite, lembre-se de parar em um local seguro onde haja sinal telefônico para facilitar a comunicação.\n\nCódigo SM:\n`,
    },
    {
        label: 'Regras de Saldo',
        text: `*REGRAS* para recebimento do saldo:\n1. *Imprimir CTe em duas vias*, uma para o cliente e uma para a SAMID Transportes.\n2. Após a descarga, *scanear o CTe completo (não somente o canhoto) frente e verso (mesmo o verso estando em branco)*, juntamente com os canhotos e encaminhar para os e-mails e endereço a seguir:`,
        image: '/terc1.jpg',
    },
    {
        label: 'Exemplo de Comprovante',
        text: 'Segue este comprovante, como um exemplo ao envio a ser realizado para recebimento de saldo:',
        image: '/terc2.jpg',
    },
    {
        label: 'Orientações Gerais',
        text: 'Favor se atentar às orientações abaixo, por gentileza:',
        image: '/terc3.jpg',
    },
    {
        label: 'Mensagem Final',
        text: 'Desejamos uma excelente viagem, Sr.@!\n\nEstamos à disposição. 🌍 🛣️',
    },
]

// Cache para imagens já carregadas
const imageCache = new Map<string, string>()

// Componente otimizado para imagens com lazy loading, cache e compressão
const OptimizedImage = memo(({ src, alt, className }: { src: string, alt: string, className: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageSrc, setImageSrc] = useState('')
    const [imageError, setImageError] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    // Intersection Observer para lazy loading
    const imageRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                        observer.disconnect()
                    }
                },
                { threshold: 0.1 }
            )
            observer.observe(node)
            return () => observer.disconnect()
        }
    }, [])

    // Função para redimensionar e comprimir imagem
    const compressImage = useCallback((imageSrc: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // Calcula dimensões mantendo proporção (max 800px width)
                const maxWidth = 800
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
                canvas.width = img.width * ratio
                canvas.height = img.height * ratio

                // Desenha imagem redimensionada
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

                // Comprime para JPEG com qualidade 85%
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
                resolve(compressedDataUrl)
            }

            img.src = imageSrc
        })
    }, [])

    useEffect(() => {
        if (!isVisible) return

        // Verifica cache primeiro
        if (imageCache.has(src)) {
            setImageSrc(imageCache.get(src)!)
            setImageLoaded(true)
            return
        }

        const img = new Image()
        img.onload = async () => {
            try {
                // Comprime a imagem antes de exibir
                const compressedSrc = await compressImage(src)
                imageCache.set(src, compressedSrc)
                setImageSrc(compressedSrc)
                setImageLoaded(true)
            } catch (error) {
                // Se falhar na compressão, usa a imagem original
                imageCache.set(src, src)
                setImageSrc(src)
                setImageLoaded(true)
            }
        }
        img.onerror = () => {
            setImageError(true)
        }
        img.src = src
    }, [src, isVisible, compressImage])

    if (imageError) {
        return (
            <div className={`${className} image-error`}>
                <span>❌ Erro ao carregar imagem</span>
            </div>
        )
    }

    return (
        <div className="image-container" ref={imageRef}>
            {!imageLoaded && isVisible && (
                <div className={`${className} image-placeholder`}>
                    <div className="loading-spinner"></div>
                    <span>Carregando...</span>
                </div>
            )}
            {!isVisible && (
                <div className={`${className} image-placeholder`}>
                    <span>📷 Imagem será carregada quando visível</span>
                </div>
            )}
            {imageLoaded && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} ${imageLoaded ? 'loaded' : ''}`}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    )
})

const Message = () => {
    const [customMessages, setCustomMessages] = useState<CustomMessage[]>([])
    const [showModal, setShowModal] = useState(false)
    const [newLabel, setNewLabel] = useState('')
    const [newText, setNewText] = useState('')
    const [selectedColumn, setSelectedColumn] = useState<'padrao' | 'frota' | 'terceiro'>('padrao')
    const [activeColumn, setActiveColumn] = useState<'padrao' | 'frota' | 'terceiro'>('padrao')
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
        const newMessage: CustomMessage = {
            label: newLabel,
            text: newText,
            column: selectedColumn
        }
        const updated = [...customMessages, newMessage]
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

    const handleClearImageCache = () => {
        if (window.confirm('Tem certeza que deseja limpar o cache de imagens? Isso fará com que as imagens sejam recarregadas.')) {
            imageCache.clear()
            // Força rerender para recarregar imagens
            window.location.reload()
        }
    }

    const getMessagesForColumn = (column: 'padrao' | 'frota' | 'terceiro') => {
        let defaultMessages: MessageItem[] = []

        switch (column) {
            case 'padrao':
                defaultMessages = mensagensPadrao
                break
            case 'frota':
                defaultMessages = mensagensFrota
                break
            case 'terceiro':
                defaultMessages = mensagensTerceiro
                break
        }

        const customMessagesForColumn = customMessages
            .filter(msg => msg.column === column)
            .map(msg => ({ label: msg.label, text: msg.text, image: undefined }))

        return [...defaultMessages, ...customMessagesForColumn]
    }

    const getColumnTitle = (column: 'padrao' | 'frota' | 'terceiro') => {
        switch (column) {
            case 'padrao': return 'Mensagens Padrão'
            case 'frota': return 'Mensagens Frota'
            case 'terceiro': return 'Mensagens Terceiro'
        }
    }

    return (
        <div className="message-container">
            <h2 className="message-title">📨 Mensagens do Motorista</h2>

            {/* Seletor de Coluna */}
            <div className="column-selector">
                <button
                    className={`selector-button ${activeColumn === 'padrao' ? 'active' : ''}`}
                    onClick={() => setActiveColumn('padrao')}
                >
                    Padrão
                </button>
                <button
                    className={`selector-button ${activeColumn === 'frota' ? 'active' : ''}`}
                    onClick={() => setActiveColumn('frota')}
                >
                    Frota
                </button>
                <button
                    className={`selector-button ${activeColumn === 'terceiro' ? 'active' : ''}`}
                    onClick={() => setActiveColumn('terceiro')}
                >
                    Terceiro
                </button>

                <div className="action-buttons">
                    <button onClick={() => setShowModal(true)} className="create-button">
                        Criar mensagem
                    </button>
                    <button onClick={handleClearStorage} className="clear-button">
                        🗑️ Esvaziar mensagens
                    </button>

                </div>
            </div>

            {/* Renderização Condicional da Coluna Ativa */}
            <div className="message-column-container">
                <div className={`message-column ${activeColumn}`}>
                    <h3 className="column-title">{getColumnTitle(activeColumn)}</h3>
                    {getMessagesForColumn(activeColumn).map((item, index) => (
                        <div key={`${activeColumn}-${item.label ?? 'imagem'}-${index}`} className="message-item">
                            <button
                                className="message-button"
                                onClick={() => handleCopy(item.text ?? '', item.label ?? 'imagem')}
                            >
                                {item.label ?? ' - '}
                            </button>
                            {item.image && (
                                <OptimizedImage
                                    src={item.image}
                                    alt={`Imagem de ${item.label ?? 'imagem'}`}
                                    className="message-image"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {copiedLabel && <div className="copied-feedback">✅ Copiado: {copiedLabel}</div>}


            <button onClick={handleClearImageCache} className="cache-button">
                🔄 Limpar cache de imagens
            </button>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3 className="modal-title">Criar nova mensagem</h3>

                        <select
                            value={selectedColumn}
                            onChange={e => setSelectedColumn(e.target.value as 'padrao' | 'frota' | 'terceiro')}
                            className="modal-select"
                        >
                            <option value="padrao">Coluna Padrão</option>
                            <option value="frota">Coluna Frota</option>
                            <option value="terceiro">Coluna Terceiro</option>
                        </select>

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
                            <button onClick={handleCreate} className="modal-create">
                                Salvar
                            </button>
                            <button onClick={() => setShowModal(false)} className="modal-cancel">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}

export default Message