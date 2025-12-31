import React from 'react';
import { BudgetAnalysis, ConsolidatedItem, SupplierQuote } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  analysis: BudgetAnalysis | null;
  consolidatedItems: ConsolidatedItem[];
  quotes: SupplierQuote[];
}

const ReportView: React.FC<Props> = ({ analysis, consolidatedItems, quotes }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const generatePDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(236, 72, 153); // Pink-500
    doc.text("Lista Fácil - Checklist de Compras", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${today}`, 14, 26);

    if (!analysis) {
      // SIMPLE MODE (No Quotes)
      doc.text("Lista para cotação de preços.", 14, 30);

      const tableBody = consolidatedItems.map(item => [
        item.name,
        `x${item.totalQuantity}`,
        '', // Store
        '', // Price
        '[   ]' // Check
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Item', 'Qtd', 'Loja (Nome)', 'Preço (R$)', 'Check']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20, halign: 'center' }
        }
      });
    } else {
      // FULL MODE (With Recommendations)
      doc.text("Leve esta lista para as lojas indicadas para garantir o menor preço.", 14, 30);
      let yPos = 40;

      // Group items by supplier
      const itemsBySupplier = (analysis.recommendations || []).reduce((acc: Record<string, typeof analysis.recommendations>, rec) => {
        if (!acc[rec.bestSupplier]) acc[rec.bestSupplier] = [];
        acc[rec.bestSupplier].push(rec);
        return acc;
      }, {});

      Object.entries(itemsBySupplier).forEach(([supplier, items]) => {
        const storeTotal = items.reduce((sum, item) => {
          const master = consolidatedItems.find(m => m.name === item.itemName);
          return sum + (item.price * (master?.totalQuantity || 0));
        }, 0);

        // Store Header
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`${supplier}`, 14, yPos);

        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text(`Total Est.: R$ ${storeTotal.toFixed(2)}`, 150, yPos);

        yPos += 5;

        // Table
        const tableBody = items.map(item => {
          const master = consolidatedItems.find(m => m.name === item.itemName);
          return [
            item.itemName,
            `x${master?.totalQuantity || 1}`,
            `R$ ${item.price.toFixed(2)}`,
            '[   ]'
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Item', 'Qtd', 'Preço Unit.', 'Check']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [236, 72, 153] }, // Pink headers
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 90 }, // Item
            1: { cellWidth: 20 }, // Qtd
            2: { cellWidth: 30 }, // Price
            3: { cellWidth: 20, halign: 'center' } // Checkbox
          }
        });

        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;
      });
    }

    doc.save(`lista_facil_checklist_${today.replace(/\//g, '-')}.pdf`);
  };

  if (!analysis) {
    if (consolidatedItems.length > 0) {
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="text-5xl mb-4 text-pink-500">📊</div>
            <h2 className="text-xl font-bold text-gray-800">Relatório de Preços</h2>
            <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">
              Adicione pelo menos um <strong>Orçamento</strong> para ver a mágica da comparação de preços.
            </p>

            <button
              onClick={generatePDF}
              className="text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl shadow-lg shadow-pink-200 flex items-center gap-2 transition-all hover:scale-105"
            >
              📄 Baixar Checklist Simples (PDF)
            </button>
            <p className="text-xs text-gray-400 mt-2">Gera uma lista limpa para você levar às lojas.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-5xl mb-4 text-pink-500">📊</div>
        <h2 className="text-xl font-bold text-gray-800">Gerar Relatório de Economia</h2>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Para que possamos calcular o melhor preço, você precisa adicionar pelo menos uma lista de materiais e um orçamento.
        </p>
      </div>
    );
  }

  const exportCSV = () => {
    let csv = "Item,Melhor Fornecedor,Preco Unitario,Quantidade Total,Custo Total\n";
    analysis.recommendations.forEach(rec => {
      const master = consolidatedItems.find(m => m.name === rec.itemName);
      const total = rec.price * (master?.totalQuantity || 0);
      csv += `"${rec.itemName}","${rec.bestSupplier}",${rec.price},${master?.totalQuantity || 0},${total.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "planejamento_lista_facil.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#EC4899', '#6366F1', '#10B981', '#F59E0B', '#3B82F6'];

  const chartData = quotes.map((q, i) => ({
    name: q.supplierName,
    valor: q.totalValue,
    fill: COLORS[i % COLORS.length]
  }));

  const splitData = { name: 'Estratégia Mista (Lista Fácil)', valor: analysis.splitSupplierTotal, fill: '#10B981' };
  const allData = [...chartData, splitData];

  // FILTER LOGIC - Although we filter in the render for the search table, 
  // we might want to filter the bottom table too. Let's start with just the search table as requested.

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Share CTA */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="font-bold text-green-800">Encontrou preços baixos e quer divulgar para outros pais?</h3>
            <p className="text-sm text-green-600">Compartilhe sua descoberta e ajude a comunidade.</p>
          </div>
        </div>
        <a
          href="https://api.whatsapp.com/send/?phone=5561996993134&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
        >
          <span>💬</span>
          Clique aqui
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-pink-500 text-white p-6 rounded-2xl shadow-lg shadow-pink-200">
          <p className="text-xs uppercase font-bold opacity-80">Melhor Opção (Loja Única)</p>
          <h3 className="text-lg font-medium mt-1">{analysis.bestGlobalSupplier}</h3>
          <p className="text-3xl font-black mt-2">R$ {analysis.bestGlobalTotal.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg shadow-emerald-200">
          <p className="text-xs uppercase font-bold opacity-80">Estratégia Mista (Economia Máxima)</p>
          <h3 className="text-lg font-medium mt-1">Dividindo entre Lojas</h3>
          <p className="text-3xl font-black mt-2">R$ {analysis.splitSupplierTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
          <p className="text-xs uppercase font-bold text-gray-400">Economia Potencial</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            R$ {(analysis.bestGlobalTotal - analysis.splitSupplierTotal).toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 italic">* Comprando cada item no local mais barato</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Pesquisar e Comparar Preços</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Digite o nome do produto para comparar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>

        {searchTerm && (
          <div className="mt-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 rounded-tl-lg">Item</th>
                    {quotes.map(q => (
                      <th key={q.id} className="px-4 py-2">{q.supplierName}</th>
                    ))}
                    <th className="px-4 py-2 font-bold text-emerald-600 rounded-tr-lg">Melhor Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                    const prices = quotes.map(q => {
                      const match = q.items.find(qi => qi.itemName.toLowerCase().trim() === item.name.toLowerCase().trim());
                      return match ? match.unitPrice : null;
                    });
                    const validPrices = prices.filter(p => p !== null) as number[];
                    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

                    return (
                      <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        {quotes.map((q, idx) => {
                          const price = prices[idx];
                          const isBest = price === minPrice && price !== null;
                          return (
                            <td key={q.id} className={`px-4 py-3 ${isBest ? 'font-bold text-green-600 bg-green-50' : 'text-gray-500'}`}>
                              {price ? `R$ ${price.toFixed(2)}` : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          {minPrice > 0 ? `R$ ${minPrice.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {consolidatedItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                const prices = quotes.map(q => {
                  const match = q.items.find(qi => qi.itemName.toLowerCase().trim() === item.name.toLowerCase().trim());
                  return { price: match ? match.unitPrice : null, supplier: q.supplierName };
                });
                const validPrices = prices.filter(p => p.price !== null);
                const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.price!)) : 0;

                return (
                  <div key={item.name} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                        Melhor: {minPrice > 0 ? `R$ ${minPrice.toFixed(2)}` : '-'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {prices.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className={`${p.price === minPrice && p.price !== null ? 'font-bold text-green-700' : 'text-gray-500'}`}>
                            {p.supplier}
                          </span>
                          <span className={`${p.price === minPrice && p.price !== null ? 'font-bold text-green-700' : 'text-gray-400'}`}>
                            {p.price ? `R$ ${p.price.toFixed(2)}` : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {consolidatedItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-8 text-gray-400">Nenhum item encontrado.</div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Comparativo de Custos Totais</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allData}>
              <XAxis dataKey="name" fontSize={10} interval={0} />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Bar dataKey="valor">
                {allData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHOPPING LIST BY STORE (MIXED STRATEGY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🛍️ Lista de Compras por Loja (Estratégia Mista)</h3>
          <p className="text-gray-500 text-sm mb-4">Compre estes itens em cada loja para garantir o menor preço total.</p>
        </div>

        {Object.entries(
          (analysis?.recommendations || []).reduce((acc: Record<string, typeof analysis.recommendations>, rec) => {
            if (!acc[rec.bestSupplier]) acc[rec.bestSupplier] = [];
            acc[rec.bestSupplier].push(rec);
            return acc;
          }, {})
        ).map(([supplier, items]) => {
          const storeList = items;
          const storeTotal = storeList.reduce((sum, item) => {
            const master = consolidatedItems.find(m => m.name === item.itemName);
            return sum + (item.price * (master?.totalQuantity || 0));
          }, 0);

          return (
            <div key={supplier} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h4 className="font-bold text-lg text-gray-800">{supplier}</h4>
                <p className="text-emerald-600 font-black text-xl">R$ {storeTotal.toFixed(2)}</p>
              </div>
              <ul className="space-y-3 flex-1">
                {storeList.map((item, idx) => {
                  const master = consolidatedItems.find(m => m.name === item.itemName);
                  return (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.itemName}</span>
                      <span className="font-bold text-gray-800">x{master?.totalQuantity}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{storeList.length} itens</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Onde comprar (Plano de Compra)</h3>
          <div className="flex gap-4">
            <button
              onClick={generatePDF}
              className="text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              📄 Baixar Checklist (PDF)
            </button>
            <button
              onClick={exportCSV}
              className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1"
            >
              📥 Exportar Planejamento (CSV)
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Qtd Total</th>
                <th className="px-6 py-4">Melhor Fornecedor</th>
                <th className="px-6 py-4">Preço Un.</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analysis.recommendations.map((rec, idx) => {
                const master = consolidatedItems.find(m => m.name === rec.itemName);
                const total = rec.price * (master?.totalQuantity || 0);
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">{rec.itemName}</td>
                    <td className="px-6 py-4 text-gray-500">{master?.totalQuantity}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs rounded-full font-bold">
                        {rec.bestSupplier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">R$ {rec.price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">R$ {total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
