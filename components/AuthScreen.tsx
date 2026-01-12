import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    sharedListTitle?: string | null;
}

const AuthScreen: React.FC<Props> = ({ sharedListTitle }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { signup, login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
                setSuccess('Cadastro realizado com sucesso! Você já pode fazer login.');
            }
        } catch (err: any) {
            console.error(err);

            // Traduzir erros do Firebase para português
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email inválido');
            } else if (err.code === 'auth/user-not-found') {
                setError('Usuário não encontrado');
            } else if (err.code === 'auth/wrong-password') {
                setError('Senha incorreta');
            } else if (err.code === 'auth/weak-password') {
                setError('Senha muito fraca');
            } else {
                setError('Erro ao autenticar. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-cover bg-center relative"
            style={{ backgroundImage: "url('/school-bg.png')" }}
        >
            {/* Overlay para garantir leitura */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-0"></div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 w-full">
                <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 lg:gap-16 items-start py-12">

                    {/* Left Column - Hero & Info Boxes */}
                    <div className="flex flex-col gap-8 order-2 md:order-1">
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-block">
                                <span className="text-6xl">📚✨</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-800 leading-tight">
                                Lista Fácil
                                <span className="block text-pink-500 mt-2">Orçamentos Escolares</span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                                A ferramenta inteligente que usa <strong className="text-pink-600">IA</strong> para
                                transformar listas escolares em orçamentos comparativos.
                            </p>
                        </div>

                        {/* Feature Boxes Container */}
                        <div className="flex flex-col gap-6 w-full">
                            {/* Features Box */}
                            <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-pink-100 shadow-xl shadow-pink-50/20 w-full space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">📖</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Tire fotos das listas</h3>
                                        <p className="text-gray-600">A IA identifica automaticamente os itens e quantidades</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">💰</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Adicione orçamentos</h3>
                                        <p className="text-gray-600">Compare preços de diferentes fornecedores em segundos</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">📊</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Economize dinheiro</h3>
                                        <p className="text-gray-600">Descubra onde comprar cada item pelo melhor preço</p>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Rights Box */}
                            <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-50/20 w-full space-y-5">
                                <div className="flex items-center gap-4 text-blue-700">
                                    <span className="text-3xl">⚖️</span>
                                    <h3 className="font-bold text-xl">Seus direitos garantidos</h3>
                                </div>
                                <p className="text-blue-800 leading-relaxed">
                                    As escolas <strong>não podem exigir</strong> que o material seja adquirido em uma papelaria específica ou na própria instituição.
                                </p>
                                <a
                                    href="https://g1.globo.com/go/goias/videos-bom-dia-go/video/escola-nao-pode-exigir-onde-pais-devem-comprar-material-escolar-diz-especialista-14245694.ghtml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 font-bold bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-fit"
                                >
                                    <span>📺</span> Assistir reportagem (G1/Procon)
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Auth Card */}
                    <div className="order-1 md:order-2 flex flex-col gap-8 w-full sticky top-8">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-gray-100 w-full relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                            <div className="relative">
                                {sharedListTitle && (
                                    <div className="mb-8 bg-pink-50 border border-pink-100 rounded-3xl p-5 text-center">
                                        <span className="text-3xl block mb-2">🎁</span>
                                        <h3 className="font-bold text-pink-700">Você recebeu uma lista!</h3>
                                        <p className="text-sm text-pink-600">
                                            Faça login ou crie uma conta para salvar a lista <strong>"{sharedListTitle}"</strong>.
                                        </p>
                                    </div>
                                )}

                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-black text-gray-800 mb-2">
                                        {isLogin ? 'Bem-vindo! 👋' : 'Criar Conta 🎉'}
                                    </h2>
                                    <p className="text-gray-500">
                                        {isLogin ? 'Entre para acessar suas listas' : 'Comece a economizar agora'}
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm flex items-center gap-3">
                                        <span>✅</span>
                                        <span>{success}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white focus:border-pink-500 transition-all"
                                            placeholder="seu@email.com"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                            Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:bg-white focus:border-pink-500 transition-all"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-400 mt-2 ml-1">Mínimo de 6 caracteres</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black py-5 px-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Processando...
                                            </span>
                                        ) : (
                                            isLogin ? 'Entrar Agora' : 'Criar Minha Conta'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="text-pink-600 hover:text-pink-700 font-bold transition-colors"
                                    >
                                        {isLogin ? 'Não tem conta? Cadastre-se aqui' : 'Já tem conta? Faça login'}
                                    </button>
                                </div>

                                {!isLogin && (
                                    <div className="mt-8 p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                                        <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
                                            <span>ℹ️</span> O administrador será notificado por email.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Advertise Button - Integrated in column */}
                        <a
                            href="https://api.whatsapp.com/send/?phone=5561996993134&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+como+anunciar+no+Lista+F%C3%A1cil&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/80 backdrop-blur-md border border-pink-100 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all group flex items-center justify-center gap-4 text-center"
                        >
                            <span className="text-3xl group-hover:animate-bounce">📢</span>
                            <div>
                                <h4 className="font-bold text-gray-800">Quer divulgar sua papelaria aqui?</h4>
                                <p className="text-pink-500 font-black">Anuncie conosco agora!</p>
                            </div>
                        </a>
                    </div>
                </div>

                <footer className="w-full py-12 mt-auto">
                    <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm border-t border-gray-200/20 pt-8">
                        <p>© {new Date().getFullYear()} Lista Fácil. Todos os direitos reservados.</p>
                        <a
                            href="https://api.whatsapp.com/send/?phone=5561996993134&text&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-pink-600 transition-colors font-medium flex items-center gap-2"
                        >
                            <span>🚀</span> Desenvolvido por Cléber Donato
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AuthScreen;
