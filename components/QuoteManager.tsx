
import React, { useState } from 'react';
import { SupplierQuote, ConsolidatedItem } from '../types';
import { analyzeQuoteFromImage } from '../services/geminiService';
import { firebaseService } from '../services/firebaseService';

interface Props {
  quotes: SupplierQuote[];
  masterItems: ConsolidatedItem[];
  onUpdate: () => void;
  userId: string;
}

const QuoteManager: React.FC<Props> = ({ quotes, masterItems, onUpdate, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleQuoteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const mimeType = result.split(';')[0].split(':')[1];
          const base64 = result.split(',')[1];

          const masterNames = masterItems.map(i => i.name);
          // Pass mimeType to service
          console.log("Enviando para Gemini:", { mimeType, size: base64.length });
          const extracted = await analyzeQuoteFromImage(base64, mimeType, masterNames);
          console.log("Resposta do Gemini:", extracted);

          if (!extracted || extracted.supplierName === "Desconhecido") {
            throw new Error(`Falha na análise. Retorno: ${JSON.stringify(extracted)}`);
          }

          // Calculate total based on master list quantities
          let total = 0;
          extracted.items.forEach(qi => {
            const master = masterItems.find(m => m.name.toLowerCase().trim() === qi.itemName.toLowerCase().trim());
            if (master) {
              let qty = master.totalQuantity;
              // Fix for Sulfite/Paper unit mismatch (500 sheets vs 1 pack)
              const isPaper = /sulfite|papel|a4/i.test(master.name);
              const isHighQty = qty >= 100;
              const isPackPrice = qi.unitPrice > 1.0;

              if (isPaper && isHighQty && isPackPrice) {
                qty = Math.ceil(qty / 500);
              }
              total += qi.unitPrice * qty;
            }
          });

          await firebaseService.saveQuote(userId, { ...extracted, totalValue: total });
          onUpdate();
        } catch (innerError) {
          console.error("Erro interno no processamento:", innerError);
          alert("Não foi possível ler o orçamento. Verifique se a imagem está clara ou se a chave de API está configurada.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar upload.");
    } finally {
      // Delay estendido para melhor UX (dá tempo do usuário ver que processou)
      setTimeout(() => setIsUploading(false), 2500);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este orçamento?")) {
      await firebaseService.deleteQuote(userId, id);
      onUpdate();
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = async () => {
    if (editingId && editValue.trim()) {
      await firebaseService.updateQuote(userId, editingId, editValue.trim());
      setEditingId(null);
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cotações e Orçamentos</h2>
            <p className="text-gray-500 text-sm">Envie as fotos ou PDFs dos orçamentos que recebeu das papelarias.</p>
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*,application/pdf"
              id="quote-upload"
              className="hidden"
              onChange={handleQuoteUpload}
              disabled={isUploading || masterItems.length === 0}
            />
            <label
              htmlFor="quote-upload"
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold cursor-pointer transition-all ${isUploading || masterItems.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-200'}`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="text-gray-500">Processando...</span>
                </>
              ) : (
                '💰 Adicionar Orçamento'
              )}
            </label>
            {masterItems.length === 0 && <p className="text-[10px] text-red-400 mt-1">* Adicione pelo menos uma lista primeiro</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {quotes.map(quote => (
          <div key={quote.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-gray-50/50">
              <div className="flex-1 mr-4">
                {editingId === quote.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border border-pink-300 rounded px-2 py-1 text-lg font-bold w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="text-green-500 text-xl">✅</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 text-xl">❌</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/edit">
                    <h3 className="text-lg font-bold text-gray-800">{quote.supplierName}</h3>
                    <button
                      onClick={() => startEdit(quote.id, quote.supplierName)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      title="Editar nome"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400">{new Date(quote.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Valor Total Calculado</p>
                  <p className="text-2xl font-black text-pink-600">R$ {quote.totalValue.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelete(quote.id)} className="p-2 text-gray-300 hover:text-red-500">🗑️</button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quote.items.map((item, idx) => {
                  const master = masterItems.find(m => m.name.toLowerCase().trim() === item.itemName.toLowerCase().trim());
                  return (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 truncate mb-1" title={item.itemName}>{item.itemName}</p>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-400 italic">un.</span>
                        <span className="font-bold text-gray-700">R$ {item.unitPrice.toFixed(2)}</span>
                      </div>
                      {master && (
                        <div className="mt-1 pt-1 border-t border-gray-200 flex justify-between text-[10px]">
                          {/* Lógica de correção para Sulfite: Se qtd > 100 e preço > 1, assume que é pacote e divide por 500 */}
                          <span>Total ({(master.totalQuantity >= 100 && /sulfite|papel|a4/i.test(master.name) && item.unitPrice > 1.0) ? Math.ceil(master.totalQuantity / 500) : master.totalQuantity}x):</span>
                          <span className="font-semibold">R$ {(item.unitPrice * ((master.totalQuantity >= 100 && /sulfite|papel|a4/i.test(master.name) && item.unitPrice > 1.0) ? Math.ceil(master.totalQuantity / 500) : master.totalQuantity)).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Nenhum orçamento cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteManager;
