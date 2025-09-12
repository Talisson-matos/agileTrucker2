import React, { useState, useRef, useCallback } from 'react';
import './ExtratorOCR.css';

// API Configuration
const OCR_API_URL = 'https://api.ocr.space/parse/image';
const API_KEY = 'K88176837288957'; // Atenção: não exponha chaves em produção

// Types
interface ParsedResult {
  ParsedText: string;
  ErrorMessage?: string;
  ErrorDetails?: string;
}

interface OCRResponse {
  ParsedResults?: ParsedResult[];
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[] | string;
  ErrorDetails?: string;
}

interface StatusMessage {
  message: string;
  type: 'success' | 'error' | 'processing';
  id: number;
}

interface CopyButton {
  id: number;
  text: string;
  originalText: string;
}

const ExtratorOCR: React.FC = () => {
  // State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [quickCopyInput, setQuickCopyInput] = useState<string>('');
  const [copyButtons, setCopyButtons] = useState<CopyButton[]>([]);
  const [copiedButtonId, setCopiedButtonId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageIdRef = useRef<number>(1);
  const copyButtonIdRef = useRef<number>(1);

  // Utility Functions
  const formatNumbersOnly = (text: string): string => {
    return text.replace(/[.\-\/\s]/g, '');
  };

  const showMessage = useCallback((message: string, type: 'success' | 'error' | 'processing') => {
    const newMessage: StatusMessage = {
      message,
      type,
      id: messageIdRef.current++
    };

    // Keep only one processing message at a time; append others
    setStatusMessages(prev => {
      if (type === 'processing') {
        // remove existing processing messages then add this
        return [...prev.filter(m => m.type !== 'processing'), newMessage];
      }
      return [...prev, newMessage];
    });

    // Auto-remove non-processing messages after 5s
    if (type !== 'processing') {
      setTimeout(() => {
        setStatusMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      }, 5000);
    }
  }, []);

  const removeProcessingMessage = useCallback(() => {
    setStatusMessages(prev => prev.filter(msg => msg.type !== 'processing'));
  }, []);

  // File Upload Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e?: React.DragEvent<HTMLDivElement>) => {
    if (e) e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    const allowedTypes = new Set([
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/bmp', 'application/pdf'
    ]);

    if (!allowedTypes.has(file.type)) {
      showMessage('Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, BMP) ou PDF.', 'error');
      return;
    }

    // Validate file size (max 1MB for free API)
    if (file.size > 1024 * 1024) {
      showMessage('Arquivo muito grande. O limite é 1MB para a API gratuita.', 'error');
      return;
    }

    setCurrentFile(file);
    // start OCR
    void processOCR(file);
  };

  // OCR Processing
  const processOCR = async (file: File) => {
    setIsProcessing(true);
    showMessage('Processando documento...', 'processing');
    setProgress(0);

    try {
      setProgress(20);

      const formData = new FormData();
      formData.append('apikey', API_KEY);
      formData.append('file', file);
      formData.append('language', 'por'); // Portuguese
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');

      setProgress(45);

      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OCRResponse = await response.json();
      setProgress(95);

      // Handle possible shapes of ErrorMessage
      if (data.IsErroredOnProcessing) {
        const err = data.ErrorMessage;
        const errText = Array.isArray(err) ? err.join(', ') : (typeof err === 'string' ? err : 'Erro no processamento OCR');
        throw new Error(errText);
      }

      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const result = data.ParsedResults[0];

        if (result.ErrorMessage) {
          throw new Error(result.ErrorMessage);
        }

        const text = result.ParsedText || '';
        setExtractedText(text);
        showMessage('Texto extraído com sucesso!', 'success');

        // Auto-open accordion
        if (!isAccordionOpen) {
          setIsAccordionOpen(true);
        }
      } else {
        throw new Error('Nenhum texto foi extraído do documento');
      }

      setProgress(100);
    } catch (unknownError) {
      console.error('OCR Error:', unknownError);
      const errMessage = unknownError instanceof Error ? unknownError.message : String(unknownError);
      showMessage(errMessage || 'Erro ao processar documento', 'error');
      setExtractedText('');
    } finally {
      setIsProcessing(false);
      removeProcessingMessage();
      // reset progress shortly after finish
      setTimeout(() => setProgress(0), 400);
    }
  };

  // Clear Functionality
  const handleClear = () => {
    setCurrentFile(null);
    setExtractedText('');
    setIsAccordionOpen(false);
    setStatusMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    showMessage('Tudo limpo! Pronto para novo upload.', 'success');
  };

  // Accordion Functionality
  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev);
  };

  // Quick Copy Functionality
  const handleCreateCopyButton = () => {
    const inputValue = quickCopyInput.trim();

    if (!inputValue) {
      showMessage('Digite algum texto para criar o botão de cópia.', 'error');
      return;
    }

    // Format numbers (remove dots, dashes, slashes)
    const isNumeric = /^\d[\d.\-\/\s]*\d$/.test(inputValue) || /^\d+$/.test(inputValue);
    const finalValue = isNumeric ? formatNumbersOnly(inputValue) : inputValue;

    const newCopyButton: CopyButton = {
      id: copyButtonIdRef.current++,
      text: finalValue,
      originalText: inputValue
    };

    setCopyButtons(prev => [...prev, newCopyButton]);
    setQuickCopyInput('');

    showMessage(`Botão criado: "${finalValue}"`, 'success');
  };

  const handleQuickCopyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateCopyButton();
    }
  };

  const copyToClipboard = async (text: string, buttonId: number) => {
    try {
      if (!navigator.clipboard) {
        // fallback: create temporary textarea
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } else {
        await navigator.clipboard.writeText(text);
      }

      // Visual feedback
      setCopiedButtonId(buttonId);

      setTimeout(() => {
        setCopiedButtonId(null);
      }, 1000);

      showMessage(`Copiado: "${text}"`, 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      showMessage('Erro ao copiar para área de transferência', 'error');
    }
  };

  return (
    <div className="ocr-container">
      {/* Header */}
      <header className="ocr-header">
        <h1 className="ocr-title">🔍 OCR Document Reader</h1>
        <p className="ocr-subtitle">Faça upload de documentos para extração de texto</p>
      </header>

      <main className="ocr-main">
        {/* Status Messages */}
        <div aria-live="polite" className="status-messages-wrapper">
          {statusMessages.map(msg => (
            <div key={msg.id} className={`status-message ${msg.type}`}>
              {msg.message}
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <section className="ocr-section">
          <div
            className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleUploadClick();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf"
              onChange={handleFileInputChange}
              className="file-input"
              style={{ display: 'none' }}
            />
            <div className="upload-icon" aria-hidden>
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={48} height={48}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17,8 12,3 7,8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3 className="upload-title">Clique para fazer upload</h3>
            <p className="upload-description">ou arraste e solte o arquivo aqui</p>
            <small className="upload-hint">Suporte para imagens (JPG, PNG, GIF, BMP) e PDF — máximo 1MB</small>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="progress-container" aria-hidden={!isProcessing}>
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* File Info */}
          {currentFile && (
            <div className="file-info">
              <span className="file-name">{currentFile.name}</span>
              <button onClick={handleClear} className="clear-button">Limpar Tudo</button>
            </div>
          )}
        </section>

        {/* Results Section */}
        <section className="ocr-section">
          <div className="accordion-container">
            <div className="accordion-header" onClick={toggleAccordion} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleAccordion(); }}>
              <h3 className="accordion-title">📄 Texto Extraído</h3>
              <span className={`accordion-icon ${isAccordionOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`accordion-content ${isAccordionOpen ? 'open' : ''}`}>
              <div className="text-output">
                {extractedText.trim() ? (
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{extractedText.trim()}</pre>
                ) : (
                  <p className="text-placeholder">O texto extraído aparecerá aqui...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Copy Section */}
        <section className="ocr-section">
          <h3 className="quick-copy-title">📋 Cópia Rápida</h3>

          <div className="input-group">
            <input
              type="text"
              value={quickCopyInput}
              onChange={(e) => setQuickCopyInput(e.target.value)}
              onKeyDown={handleQuickCopyKeyDown}
              placeholder="Digite texto ou números para criar botão de cópia rápida"
              className="quick-copy-input"
            />
            <button onClick={handleCreateCopyButton} className="create-button">Criar Botão</button>
          </div>

          {/* Copy Buttons */}
          <div className="copy-buttons-container">
            {copyButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => copyToClipboard(btn.text, btn.id)}
                className={`copy-button ${copiedButtonId === btn.id ? 'copied' : ''}`}
              >
                <span className="copy-text" title={btn.text}>{btn.text}</span>
                <span className="copy-icon">{copiedButtonId === btn.id ? '✓' : '📋'}</span>
              </button>
            ))}
          </div>

          {copyButtons.length > 0 && (
            <button
              onClick={() => setCopyButtons([])}
              className="clear-copy-buttons"
            >
              Limpar Botões
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default ExtratorOCR;
