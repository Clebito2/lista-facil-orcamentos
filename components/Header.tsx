
import React, { useState } from 'react';

interface HeaderProps {
  activeTab: 'lists' | 'master' | 'quotes' | 'report';
  setActiveTab: (tab: 'lists' | 'master' | 'quotes' | 'report') => void;
  onLogout: () => void;
  userEmail: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onLogout, userEmail }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-lg shadow-lg shadow-pink-200">📖</div>
          <h1 className="text-xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent hidden sm:block tracking-tight">Lista Fácil</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <button
            onClick={() => setActiveTab('lists')}
            className={`font-medium transition-colors ${activeTab === 'lists' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 font-bold' : 'text-gray-500 hover:text-pink-400'}`}
          >
            Listas
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`font-medium transition-colors ${activeTab === 'master' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 font-bold' : 'text-gray-500 hover:text-pink-400'}`}
          >
            Lista Consolidada
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`font-medium transition-colors ${activeTab === 'quotes' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 font-bold' : 'text-gray-500 hover:text-pink-400'}`}
          >
            Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`font-medium transition-colors ${activeTab === 'report' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 font-bold' : 'text-gray-500 hover:text-pink-400'}`}
          >
            Relatório
          </button>
        </nav>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-pink-100 transition-colors"
          >
            <span className="hidden md:inline">{userEmail.split('@')[0]}</span>
            <span>👤</span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 bg-pink-50 border-b border-pink-100">
                  <p className="text-xs text-gray-500 mb-1">Logado como:</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
