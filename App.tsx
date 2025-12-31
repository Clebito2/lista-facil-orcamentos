
import React, { useState, useEffect, useMemo } from 'react';
import { ChildList, SupplierQuote, ConsolidatedItem, BudgetAnalysis } from './types';
import { firebaseService } from './services/firebaseService';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import ChildListManager from './components/ChildListManager';
import MasterList from './components/MasterList';
import QuoteManager from './components/QuoteManager';
import ReportView from './components/ReportView';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTabState] = useState<'lists' | 'master' | 'quotes' | 'report'>('lists');
  const setActiveTab = (tab: 'lists' | 'master' | 'quotes' | 'report') => {
    if (navigator.vibrate) navigator.vibrate(50);
    setActiveTabState(tab);
  };
  const [childLists, setChildLists] = useState<ChildList[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const [pendingShareId, setPendingShareId] = useState<string | null>(null);
  const [sharedListTitle, setSharedListTitle] = useState<string | null>(null);

  useEffect(() => {
    // Check for share URL
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('shareId');
    if (shareId) {
      setPendingShareId(shareId);
      checkSharedList(shareId);
    }
  }, []);

  const checkSharedList = async (shareId: string) => {
    try {
      const list = await firebaseService.getSharedList(shareId);
      if (list) {
        setSharedListTitle(list.title);
      }
    } catch (error) {
      console.error("Erro ao carregar lista compartilhada", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();

      // If we have a pending share and user just logged in (or was logged in)
      if (pendingShareId && sharedListTitle) {
        handleImportShare(pendingShareId);
      }
    }
  }, [currentUser, pendingShareId, sharedListTitle]);

  const handleImportShare = async (shareId: string) => {
    if (!currentUser || !sharedListTitle) return;

    if (confirm(`Você recebeu a lista "${sharedListTitle}". Deseja salvá-la em sua conta agora?`)) {
      try {
        const list = await firebaseService.getSharedList(shareId);
        if (list) {
          await firebaseService.importSharedList(currentUser.uid, list);
          alert("Lista importada com sucesso!");
          // Clean URL
          window.history.pushState({}, '', '/');
          setPendingShareId(null);
          setSharedListTitle(null);
          loadData();
        }
      } catch (error) {
        alert("Erro ao importar lista.");
      }
    } else {
      // User rejected, clear URL
      window.history.pushState({}, '', '/');
      setPendingShareId(null);
    }
  }

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    const [lists, storedQuotes] = await Promise.all([
      firebaseService.getChildLists(currentUser.uid),
      firebaseService.getQuotes(currentUser.uid)
    ]);
    setChildLists(lists);
    setQuotes(storedQuotes);
    setLoading(false);
  };

  const consolidatedItems = useMemo(() => {
    const map = new Map<string, ConsolidatedItem>();

    childLists.forEach(list => {
      list.items.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.totalQuantity += item.quantity;
          existing.items.push(item);
        } else {
          map.set(key, {
            name: item.name,
            totalQuantity: item.quantity,
            items: [item]
          });
        }
      });
    });

    return Array.from(map.values());
  }, [childLists]);

  const budgetAnalysis = useMemo((): BudgetAnalysis | null => {
    if (consolidatedItems.length === 0 || quotes.length === 0) return null;

    const recommendations = consolidatedItems.map(masterItem => {
      let bestPrice = Infinity;
      let bestSupplier = "Não cotado";

      quotes.forEach(quote => {
        const found = quote.items.find(qi =>
          qi.itemName.toLowerCase().trim() === masterItem.name.toLowerCase().trim()
        );
        if (found && found.unitPrice < bestPrice) {
          bestPrice = found.unitPrice;
          bestSupplier = quote.supplierName;
        }
      });

      return {
        itemName: masterItem.name,
        bestSupplier,
        price: bestPrice === Infinity ? 0 : bestPrice
      };
    });

    const supplierTotals = quotes.map(quote => {
      const total = consolidatedItems.reduce((sum, masterItem) => {
        const found = quote.items.find(qi =>
          qi.itemName.toLowerCase().trim() === masterItem.name.toLowerCase().trim()
        );
        return sum + (found ? found.unitPrice * masterItem.totalQuantity : 0);
      }, 0);
      return { name: quote.supplierName, total };
    });

    const bestGlobal = [...supplierTotals].sort((a, b) => a.total - b.total)[0];
    const splitTotal = recommendations.reduce((sum, rec) => {
      const master = consolidatedItems.find(m => m.name === rec.itemName);
      return sum + (rec.price * (master?.totalQuantity || 0));
    }, 0);

    return {
      bestGlobalSupplier: bestGlobal.name,
      bestGlobalTotal: bestGlobal.total,
      splitSupplierTotal: splitTotal,
      recommendations
    };
  }, [consolidatedItems, quotes]);

  // Show auth screen if not logged in
  if (!currentUser) {
    return <AuthScreen sharedListTitle={sharedListTitle} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20 bg-cover bg-center relative bg-fixed"
      style={{ backgroundImage: "url('/desk-bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] z-0"></div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userEmail={currentUser.email || ''} />

      <main className="max-w-5xl mx-auto px-4 pt-24 relative z-10">
        {activeTab === 'lists' && (
          <ChildListManager
            childLists={childLists}
            onUpdate={loadData}
            userId={currentUser.uid}
          />
        )}

        {activeTab === 'master' && (
          <MasterList items={consolidatedItems} />
        )}

        {activeTab === 'quotes' && (
          <QuoteManager
            quotes={quotes}
            masterItems={consolidatedItems}
            onUpdate={loadData}
            userId={currentUser.uid}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            analysis={budgetAnalysis}
            consolidatedItems={consolidatedItems}
            quotes={quotes}
          />
        )}

        <footer className="mt-20 mb-10 text-center text-gray-400 text-sm relative z-10">
          <p>© {new Date().getFullYear()} Lista Fácil. Todos os direitos reservados.</p>
          <a
            href="https://api.whatsapp.com/send/?phone=5561996993134&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium mt-1 hover:text-pink-500 transition-colors inline-block"
          >
            Desenvolvido por Cléber Donato
          </a>
        </footer>
      </main>

      {/* Persistent Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 md:hidden">
        <button onClick={() => setActiveTab('lists')} className={`p-2 ${activeTab === 'lists' ? 'text-pink-500' : 'text-gray-400'}`}>
          Listas
        </button>
        <button onClick={() => setActiveTab('master')} className={`p-2 ${activeTab === 'master' ? 'text-pink-500' : 'text-gray-400'}`}>
          Resumo
        </button>
        <button onClick={() => setActiveTab('quotes')} className={`p-2 ${activeTab === 'quotes' ? 'text-pink-500' : 'text-gray-400'}`}>
          Orçamentos
        </button>
        <button onClick={() => setActiveTab('report')} className={`p-2 ${activeTab === 'report' ? 'text-pink-500' : 'text-gray-400'}`}>
          Relatório
        </button>
      </nav>
    </div>
  );
};

export default App;
