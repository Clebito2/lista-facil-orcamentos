
import React, { useState } from 'react';
import { ChildList } from '../types';
import { extractItemsFromImage } from '../services/geminiService';
import { firebaseService } from '../services/firebaseService';

interface Props {
  childLists: ChildList[];
  onUpdate: () => void;
  userId: string;
}

const ChildListManager: React.FC<Props> = ({ childLists, onUpdate, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { listTitle, items } = await extractItemsFromImage(base64);

        await firebaseService.saveChildList(userId, listTitle, items);
        onUpdate();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar imagem. Verifique se a conexão está estável e se a foto está nítida.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir esta lista?")) {
      await firebaseService.deleteChildList(userId, id);
      onUpdate();
    }
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const [sharingId, setSharingId] = useState<string | null>(null);

  const handleShare = async (list: ChildList) => {
    try {
      setSharingId(list.id);
      const shareId = await firebaseService.shareList({
        title: list.title,
        items: list.items
      });

      const shareUrl = `${window.location.origin}/?shareId=${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`Link copiado! 📋\n\nEnvie para o WhatsApp dos outros pais.`);
    } catch (error: any) {
      console.error(error);
      alert(`Erro ao gerar link: ${error.message || error.code || 'Desconhecido'}`);
    } finally {
      setSharingId(null);
    }
  };

  const saveEdit = async () => {
    if (editingId && editValue.trim()) {
      await firebaseService.updateChildList(userId, editingId, editValue.trim());
      setEditingId(null);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Adicionar Nova Lista</h2>
        <p className="text-sm text-gray-500 mb-6">
          A nossa IA vai identificar automaticamente os itens da sua lista.
          <br />
          <span className="text-xs text-pink-500 font-medium mt-1 block">
            Dica: Você pode compartilhar suas listas clicando no ícone 🔗 abaixo.
          </span>
        </p>

        <div className="relative w-full max-w-sm">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-pink-50 border-pink-200 hover:border-blue-400 hover:bg-blue-50'}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <span className="text-blue-600 font-bold">Lendo a lista...</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-pink-200">📸</div>
                <span className="text-gray-700 font-bold text-center">Enviar lista de materiais solicitados pela escola</span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {childLists.map(list => (
          <div key={list.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-pink-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                {editingId === list.id ? (
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
                    <h3 className="text-xl font-bold text-gray-800">{list.title}</h3>
                    <button
                      onClick={() => startEdit(list.id, list.title)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      title="Editar nome"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500">{list.items.length} itens identificados</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleShare(list)}
                  className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                  title="Compartilhar lista"
                  disabled={sharingId === list.id}
                >
                  {sharingId === list.id ? '⏳' : '🔗'}
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Excluir lista"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {list.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700 truncate mr-4" title={item.name}>{item.name}</span>
                  <span className="font-bold text-pink-600 whitespace-nowrap">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {childLists.length === 0 && !isUploading && (
          <div className="md:col-span-2 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Nenhuma lista adicionada ainda. Comece enviando uma foto!</p>
          </div>
        )}
      </div>
    </div >
  );
};

export default ChildListManager;
