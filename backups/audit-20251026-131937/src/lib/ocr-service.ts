/**
 * 📄 OCR Service — Tesseract.js
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Serviço de OCR (Optical Character Recognition) usando Tesseract.js
 * Processa no cliente (navegador), zero custo de servidor
 * Economia: US$ 300-1.2k/ano vs serviços pagos
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { createWorker, type Worker } from "tesseract.js";

interface OCRResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

interface OCRProgress {
  status: string;
  progress: number;
}

class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  /**
   * Inicializa o worker do Tesseract
   * @param lang Idioma (padrão: português)
   */
  async initialize(lang: string = "por"): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      this.isInitialized = true;
      console.log("✅ OCR Service inicializado");
    } catch (error) {
      const err = error as Error;
      console.error("❌ Erro ao inicializar OCR:", err);
      throw error;
    }
  }

  /**
   * Processa imagem e extrai texto
   * @param image File, Blob, ou URL da imagem
   * @param onProgress Callback de progresso opcional
   */
  async extractText(
    image: File | Blob | string,
    onProgress?: (progress: OCRProgress) => void,
  ): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error("OCR Worker não inicializado");
    }

    try {
      const result = await this.worker.recognize(image, {
        rotateAuto: true,
      });

      const confidence = result.data.confidence;
      const text = result.data.text.trim();

      // Extrair palavras com coordenadas (quando disponível)
      const dataAny = result.data as unknown as {
        words?: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      };
      const words = Array.isArray(dataAny.words)
        ? dataAny.words.map((word) => ({
            text: word.text,
            confidence: word.confidence,
            bbox: word.bbox,
          }))
        : undefined;

      console.log(
        `✅ OCR concluído: ${text.length} caracteres, confiança: ${confidence.toFixed(1)}%`,
      );

      return {
        text,
        confidence,
        words,
      };
    } catch (error) {
      const err = error as Error;
      console.error("❌ Erro no OCR:", err);
      throw error;
    }
  }

  /**
   * Processa documento PDF (converte páginas em imagens primeiro)
   * @param pdfFile File do PDF
   */
  async extractTextFromPDF(pdfFile: File): Promise<string[]> {
    // TODO: Implementar conversão PDF -> Imagens
    // Requer library adicional (pdf.js ou similar)
    throw new Error("PDF OCR ainda não implementado. Use imagens (JPG/PNG)");
  }

  /**
   * Detecta e extrai campos específicos (útil para DANFEs, recibos)
   * @param image Imagem
   * @param fields Campos a buscar (regex)
   */
  async extractFields(
    image: File | Blob | string,
    fields: Record<string, RegExp>,
  ): Promise<Record<string, string | null>> {
    const { text } = await this.extractText(image);

    const extracted: Record<string, string | null> = {};

    for (const [fieldName, regex] of Object.entries(fields)) {
      const match = text.match(regex);
      extracted[fieldName] = match ? match[1] || match[0] : null;
    }

    return extracted;
  }

  /**
   * Limpa recursos do worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log("✅ OCR Service finalizado");
    }
  }
}

// Singleton
const ocrService = new OCRService();
export default ocrService;

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXEMPLOS DE USO:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * // 1. Uso básico (extrair texto):
 * import ocrService from '@/lib/ocr-service';
 *
 * const handleFileUpload = async (file: File) => {
 *   const result = await ocrService.extractText(file);
 *   console.log('Texto extraído:', result.text);
 *   console.log('Confiança:', result.confidence, '%');
 * };
 *
 * // 2. Com progresso:
 * const result = await ocrService.extractText(file, (progress) => {
 *   setProgress(progress.progress * 100);
 * });
 *
 * // 3. Extrair campos específicos (DANFE):
 * const fields = await ocrService.extractFields(danfeImage, {
 *   chaveAcesso: /Chave de Acesso:\s*(\d{44})/i,
 *   numeroNF: /NF-e Nº\s*(\d+)/i,
 *   valorTotal: /Valor Total.*?R\$\s*([\d.,]+)/i,
 * });
 *
 * console.log('Chave:', fields.chaveAcesso);
 * console.log('NF:', fields.numeroNF);
 * console.log('Valor:', fields.valorTotal);
 *
 * // 4. Limpeza (opcional, ao desmontar componente):
 * useEffect(() => {
 *   return () => {
 *     ocrService.terminate();
 *   };
 * }, []);
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
