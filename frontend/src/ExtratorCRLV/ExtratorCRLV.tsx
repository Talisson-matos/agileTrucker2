import React, { useState, useCallback, useRef } from "react";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// @ts-ignore
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
// @ts-ignore
import { Check, Rocket, Trash2, FileText, Clipboard, Paperclip, Upload, File } from "lucide-react";
import "./ExtratorCRLV.css";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

// -------- TIPOS --------
type FieldKey =
  | "renavam"
  | "placa"
  | "anoFab"
  | "anoModelo"
  | "marcaModelo"
  | "especieTipo"
  | "chassi"
  | "cor"
  | "eixos"
  | "nome"
  | "cpfCnpj"
  | "local";

const FIELD_ORDER: { key: FieldKey; label: string; searchLabel?: string }[] = [
  { key: "renavam", label: "CÓDIGO RENAVAM" },
  { key: "placa", label: "PLACA" },
  { key: "anoFab", label: "ANO FABRICAÇÃO" },
  { key: "anoModelo", label: "ANO MODELO" },
  { key: "marcaModelo", label: "MARCA / MODELO / VERSÃO" },
  { key: "especieTipo", label: "ESPÉCIE / TIPO" },
  { key: "chassi", label: "CHASSI" },
  { key: "cor", label: "COR PREDOMINANTE" },
  { key: "eixos", label: "EIXOS" },
  { key: "nome", label: "PROPRIETÁRIO", searchLabel: "NOME" },
  { key: "cpfCnpj", label: "CPF / CNPJ" },
  { key: "local", label: "LOCAL" },
];

// -------- UTILS --------
const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Erro ao copiar", err);
    return false;
  }
};

type PdfItem = { text: string; x: number; y: number };

async function extractPdfItems(file: File): Promise<PdfItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const items: PdfItem[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    (content.items as any[]).forEach((it) => {
      if (it.str?.trim()) {
        items.push({
          text: it.str.trim(),
          x: it.transform[4],
          y: it.transform[5],
        });
      }
    });
  }
  return items;
}

function findValueBelowLabel(items: PdfItem[], searchText: string, tolerance = 20): string {
  const labelItem = items.find((it) => it.text.toUpperCase().includes(searchText.toUpperCase()));
  if (!labelItem) return "NÃO ENCONTRADO";

  const labelX = labelItem.x;
  const labelY = labelItem.y;

  // Find items below (y < labelY) and x close
  const candidates = items.filter(
    (it) =>
      it.y < labelY &&
      Math.abs(it.x - labelX) < tolerance &&
      it.text.trim() !== ""
  );

  if (candidates.length === 0) return "NÃO ENCONTRADO";

  // Sort by y descending (closest to label, highest y below)
  candidates.sort((a, b) => b.y - a.y);

  return candidates[0].text;
}

function extractFields(items: PdfItem[]): Record<FieldKey, string> {
  const out: Record<FieldKey, string> = {
    renavam: "NÃO ENCONTRADO",
    placa: "NÃO ENCONTRADO",
    anoFab: "NÃO ENCONTRADO",
    anoModelo: "NÃO ENCONTRADO",
    marcaModelo: "NÃO ENCONTRADO",
    especieTipo: "NÃO ENCONTRADO",
    chassi: "NÃO ENCONTRADO",
    cor: "NÃO ENCONTRADO",
    eixos: "NÃO ENCONTRADO",
    nome: "NÃO ENCONTRADO",
    cpfCnpj: "NÃO ENCONTRADO",
    local: "NÃO ENCONTRADO",
  };

  FIELD_ORDER.forEach(({ key, label, searchLabel }) => {
    const value = findValueBelowLabel(items, searchLabel || label);
    out[key] = value !== "NÃO ENCONTRADO" ? value : "NÃO ENCONTRADO";
  });

  // Clean CPF/CNPJ
  if (out.cpfCnpj !== "NÃO ENCONTRADO") {
    out.cpfCnpj = out.cpfCnpj.replace(/[\.\-\/]/g, "");
  }

  console.log("Campos extraídos:", out); // Debug

  return out;
}

// -------- COMPONENTE --------
export default function ExtratorCRLV() {
  const [fields, setFields] = useState<Record<FieldKey, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    try {
      const items = await extractPdfItems(file);
      const extracted = extractFields(items);
      setFields(extracted);
      
      const foundCount = Object.values(extracted).filter(v => v !== "NÃO ENCONTRADO").length;
      showNotification(`PDF processado! ${foundCount}/12 campos encontrados`);
    } catch (err) {
      console.error("Erro ao processar PDF", err);
      setFields(null);
      showNotification("Erro ao processar PDF", 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      handleFile(files[0]);
    } else {
      showNotification("Por favor, selecione um arquivo PDF válido", 'error');
    }
  };

  const clear = () => {
    setFields(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showNotification("Dados limpos");
  };

  const handleCopy = async (fieldKey: FieldKey, value: string, label: string) => {
    if (value === "NÃO ENCONTRADO") return;
    
    const success = await copy(value);
    if (success) {
      setCopiedField(fieldKey);
      showNotification(`${label} copiado!`);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      showNotification("Erro ao copiar", 'error');
    }
  };

 return (
  <div className="app">
    <h1>
      <FileText size={32} />
      Leitor CRLV
    </h1>
    
    <div className="upload-section">
      {/* Área de Drag & Drop */}
      <div
        className={`drag-drop-area ${isDragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drag-drop-content">
          <div className="drag-drop-icon">
            <Upload size={28} color={isDragOver ? 'white' : '#6c757d'} />
          </div>
          
          <div>
            <p className="drag-drop-text">
              {isDragOver ? 'Solte o arquivo PDF aqui' : 'Arraste o PDF do CRLV aqui'}
            </p>
            <p className="drag-drop-subtext">
              ou clique para selecionar
            </p>
          </div>
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="application/pdf" 
        onChange={onInput}
      />

      {fileName && (
        <div className="file-selected">
          <File size={18} />
          <span className="file-selected-name">{fileName}</span>
        </div>
      )}

      <div className="controls">
        <button onClick={clear} className="clear-btn">
          <Trash2 size={16} />
          Limpar Tudo
        </button>
      </div>
    </div>

    {/* Notificação */}
    {notification && (
      <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
        <Check size={16} />
        {notification.message}
      </div>
    )}

    {loading && (
      <div className="loading">
        <div className="spinner"></div>
        Processando PDF...
      </div>
    )}

    {fields && (
      <div className="data-section">
        <h2>Dados Extraídos</h2>
        <div className="field-grid">
          {FIELD_ORDER.map(({ key, label }) => (
            <button
              key={key}
              className={`field-card ${copiedField === key ? 'copied' : ''} ${fields[key] === 'NÃO ENCONTRADO' ? 'not-found' : ''}`}
              onClick={() => handleCopy(key, fields[key], label)}
              disabled={fields[key] === 'NÃO ENCONTRADO'}
            >
              <span className="field-label">{label}</span>
              <div className="value-box">
                <span className="field-value">{fields[key]}</span>
                {copiedField === key && fields[key] !== 'NÃO ENCONTRADO' ? 
                  <Check size={16} className="check-icon" /> : 
                  <Clipboard size={16} className="clipboard-icon" />
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
)};