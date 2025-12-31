
import React from 'react';
import { ConsolidatedItem } from '../types';

interface Props {
  items: ConsolidatedItem[];
}

const MasterList: React.FC<Props> = ({ items }) => {
  const categories = Array.from(new Set(items.map(i => i.items[0]?.category || 'Geral')));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">Lista Consolidada (Total para todos os Filhos)</h2>
        <p className="text-sm text-gray-500">A IA somou automaticamente os itens repetidos para você.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Material</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Qtd Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-pink-50/30 transition-colors">
                <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                    {item.items[0]?.category || 'Papelaria'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-pink-600">{item.totalQuantity}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                  Adicione listas de materiais para ver o resumo consolidado aqui.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterList;
