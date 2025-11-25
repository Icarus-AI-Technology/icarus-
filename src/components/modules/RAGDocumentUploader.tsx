/**
 * Componente: RAGDocumentUploader
 * 
 * Permite upload de arquivos (PDF, TXT, MD) para indexação no sistema RAG.
 * Extrai texto, divide em chunks e envia para o RAGService.
 */

import React, { useState } from 'react';
import { Card, Button, Progress } from '@/components/oraclusx-ds';
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { ragService } from '@/lib/llm/rag.service';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export function RAGDocumentUploader() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (fileObj: File, fileId: string) => {
    try {
      // Atualiza status para processando
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 10 } : f));

      // 1. Ler conteúdo do arquivo
      const text = await readFileContent(fileObj);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 40 } : f));

      if (!text || text.length < 10) {
        throw new Error('Arquivo vazio ou sem texto extraível');
      }

      // 2. Dividir em chunks (simples) - idealmente usar um splitter mais robusto
      const chunks = splitTextIntoChunks(text, 1000);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 60 } : f));

      // 3. Preparar metadados
      const metadatas = chunks.map((_, i) => ({
        source: fileObj.name,
        chunk_index: i,
        upload_date: new Date().toISOString(),
        file_size: fileObj.size,
        type: fileObj.type
      }));

      // 4. Enviar para RAGService
      await ragService.addDocuments(chunks, metadatas);
      
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f));
      addToast(`Arquivo ${fileObj.name} indexado com sucesso!`, 'success');

    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao processar ${fileObj.name}:`, err);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', message: err.message } : f));
      addToast(`Erro ao indexar ${fileObj.name}: ${err.message}`, 'error');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = (_event) => reject(new Error('Falha ao ler arquivo'));
      
      if (file.type === 'application/pdf') {
        // TODO: Implementar extração real de PDF (pdf.js)
        // Por enquanto, rejeita ou trata como texto se for possível
        reject(new Error('Suporte a PDF requer biblioteca adicional (pdf.js)'));
      } else {
        reader.readAsText(file);
      }
    });
  };

  const splitTextIntoChunks = (text: string, chunkSize: number): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    
    const newFiles = droppedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Processar cada arquivo
    droppedFiles.forEach((file, index) => {
      processFile(file, newFiles[index].id);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      const newFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        status: 'pending' as const,
        progress: 0
      }));

      setFiles(prev => [...prev, ...newFiles]);

      selectedFiles.forEach((file, index) => {
        processFile(file, newFiles[index].id);
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <Card className="p-6 neuro-raised w-full max-w-2xl mx-auto">
      <h3 className="text-lg orx-orx-font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-[var(--primary)]" />
        Upload para Base de Conhecimento (RAG)
      </h3>
      
      <div 
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
        <p className="text-[var(--text-primary)] orx-orx-font-medium mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Suporta .txt, .md, .json (PDF em breve)
        </p>
        
        <input
          type="file"
          id="rag-upload"
          multiple
          accept=".txt,.md,.json,.csv"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Selecionar Arquivos"
        />
        <label htmlFor="rag-upload">
          <Button variant="primary">
            <span>Selecionar Arquivos</span>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map(file => (
            <div key={file.id} className="neuro-flat p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-secondary)] rounded-lg">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                
                <Progress value={file.progress} className="h-1.5" />
                
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {file.status === 'pending' && 'Aguardando...'}
                    {file.status === 'processing' && 'Indexando...'}
                    {file.status === 'completed' && 'Concluído'}
                    {file.status === 'error' && 'Erro'}
                  </span>
                  {file.status === 'error' && (
                    <span className="text-xs text-red-500 truncate max-w-[200px]">
                      {file.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {file.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                <button 
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
