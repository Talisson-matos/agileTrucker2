import express from 'express';
import multer from 'multer';
import PDFParser from 'pdf2json';
import path from 'path';
import { unlink } from 'fs/promises';
import cors from 'cors';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Habilita CORS para permitir requisições do frontend
app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const filePath = path.resolve(req.file.path);

    try {
        // Inicializa o parser PDF
        const pdfParser = new PDFParser();

        // Promisifica o processo de parsing
        const parsePDF = () => new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataError', errData => reject(new Error(String(errData.parserError))));
            pdfParser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
            pdfParser.loadPDF(filePath);
        });

        // Extrai os dados do PDF
        const pdfData: any = await parsePDF();

        // Combina o texto de todas as páginas
        const texto = pdfData.Pages.map((page: any) =>
            page.Texts.map((text: any) => decodeURIComponent(text.R[0].T)).join(' ')
        ).join(' ');

        // Log do texto extraído para depuração
        console.log('Texto extraído do PDF:', texto);

        // Extrai os CNPJs primeiro
        const cnpjRemetente = extrairCNPJ(texto, 1);
        const cnpjDestinatario = extrairCNPJ(texto, 2);

        const resultado = {
            cnpj_pagador_frete: extrairCNPJPagadorFrete(texto, cnpjRemetente, cnpjDestinatario),
            cnpj_remetente: cnpjRemetente,
            cnpj_destinatario: cnpjDestinatario,
            serie: extrairSerie(texto),
            numero_nota: extrairNumeroNota(texto),
            chave_acesso: extrairChave(texto),
            quantidade: extrairQuantidade(texto),
            peso_liquido: extrairPesoLiquido(texto),
            valor_nota: extrairValorNota(texto),

        };

        // Log do resultado para depuração
        console.log('Dados extraídos:', resultado);

        // Remove o arquivo após o processamento
        await unlink(filePath);
        res.json(resultado);
    } catch (err) {
        console.error('Erro ao processar PDF:', err);
        res.status(500).json({ error: 'Erro ao processar PDF', details: err.message });
    }
});

function extrairCNPJ(texto: string, posicao: number): string {
    const matches = texto.matchAll(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g);
    const cnpjs = Array.from(matches).map(match =>
        match[0].replace(/[.\-\/\s]/g, '') // Remove ponto, traço, barra e espaço
    );
    return cnpjs[posicao - 1] ?? 'Não encontrado';
}

function extrairSerie(texto: string): string {
    const match = texto.match(/(?:Série|Serie)\s+(\d+)/i);
    return match?.[1] ?? 'Não encontrado';
}

function extrairNumeroNota(texto: string): string {
    const match = texto.match(/(?:Nº\.|Nº|Numero)\s*([\d.]+)/i);
    const numero = match?.[1];
    if (!numero) return 'Não encontrado';

    const semPontos = numero.replace(/\./g, '');
    const semZerosIniciais = semPontos.replace(/^0+/, '');
    return semZerosIniciais;
}

function extrairChave(texto: string): string {
    // Captura 44 dígitos, ignorando espaços, pontos ou outros separadores
    const match = texto.match(/\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}/);
    const chave = match?.[0];
    return chave ? chave.replace(/\s/g, '').replace(/\./g, '') : 'Não encontrado';
}

function extrairQuantidade(texto: string): string {
    const match = texto.match(/(?:Quantidade|Qtd)\s+([\d.,]+)/i);
    return match?.[1] ?? 'Não encontrado';
}

function extrairPesoLiquido(texto: string): string {
    const match = texto.match(/(?:Peso Líquido|Peso Liquido)\s+([\d.,]+)/i);
    const peso = match?.[1];
    return peso ? peso.replace(/\./g, '').replace(/,/g, '.') : 'Não encontrado';
}

function extrairValorNota(texto: string): string {
    const match = texto.match(/(?:V\. TOTAL DA NOTA|V\. TOTAL|Valor Total)\s+R?\$?\s*([\d.,]+)/i);
    const valor = match?.[1];
    if (!valor) return 'Não encontrado';

    const semPontos = valor.replace(/\./g, '');
    const comPontoDecimal = semPontos.replace(/,/g, '.');
    return comPontoDecimal;
}

function extrairCNPJPagadorFrete(texto: string, cnpjRemetente: string, cnpjDestinatario: string): string {
    // Procura por padrões relacionados ao frete
    const textoFrete = texto.match(/FRETE[\s\S]{0,200}/i)?.[0] || '';

    // Padrões que indicam que o remetente paga o frete (CIF)
    const padroesCIF = [
        /0\s*[-,]\s*CIF/i,
        /0\s*[-]\s*Por conta do Emit/i,
        /Por conta do Remetente/i,
        /CIF/i,
        /0\s*[-,]/,
        /Modalidade do Frete[\s\S]{0,50}0/i
    ];

    // Padrões que indicam que o destinatário paga o frete (FOB)
    const padroesFOB = [
        /1\s*[-,]\s*FOB/i,
        /1\s*[-]\s*Por conta do Dest/i,
        /Por conta do Destinat[aá]rio/i,
        /FOB/i,
        /1\s*[-,]/,
        /Modalidade do Frete[\s\S]{0,50}1/i
    ];

    // Verifica se algum padrão CIF é encontrado
    for (const padrao of padroesCIF) {
        if (padrao.test(textoFrete) || padrao.test(texto)) {
            return cnpjRemetente;
        }
    }

    // Verifica se algum padrão FOB é encontrado
    for (const padrao of padroesFOB) {
        if (padrao.test(textoFrete) || padrao.test(texto)) {
            return cnpjDestinatario;
        }
    }

    // Se não encontrar nenhum padrão específico, retorna "Não encontrado"
    return 'Não encontrado';
}

app.listen(5000, () => {
    console.log('Servidor rodando em http://localhost:5000');
});