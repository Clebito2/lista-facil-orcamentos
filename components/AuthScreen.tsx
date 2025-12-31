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
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/school-bg.png')" }}
        >
            {/* Overlay para garantir leitura */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-0"></div>

            <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">

                {/* Hero Section - Explicação do Sistema */}
                <div className="text-center md:text-left space-y-6 order-2 md:order-1">
                    <div className="inline-block">
                        <div className="text-6xl mb-4">📚✨</div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">
                        Lista Fácil
                        <span className="block text-pink-500 mt-2">Orçamentos Escolares</span>
                    </h1>

                    <p className="text-lg text-gray-600 leading-relaxed">
                        A ferramenta inteligente que usa <strong className="text-pink-600">IA</strong> para
                        transformar listas escolares em orçamentos comparativos.
                    </p>

                    <div className="space-y-4 text-left bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-pink-100">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📖</span>
                            <div>
                                <h3 className="font-bold text-gray-800">Tire fotos das listas ou insira o documento PDF</h3>
                                <p className="text-sm text-gray-600">A IA identifica automaticamente os itens e quantidades</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💰</span>
                            <div>
                                <h3 className="font-bold text-gray-800">Adicione orçamentos</h3>
                                <p className="text-sm text-gray-600">Fotografe os orçamentos de diferentes fornecedores</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h3 className="font-bold text-gray-800">Economize dinheiro</h3>
                                <p className="text-sm text-gray-600">Descubra onde comprar cada item pelo melhor preço</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="order-1 md:order-2 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">

                        {sharedListTitle && (
                            <div className="mb-6 bg-pink-50 border border-pink-200 rounded-xl p-4 text-center animate-pulse">
                                <span className="text-2xl block mb-2">🎁</span>
                                <h3 className="font-bold text-pink-700">Você recebeu uma lista!</h3>
                                <p className="text-sm text-pink-600">
                                    Faça login ou crie uma conta para salvar a lista <strong>"{sharedListTitle}"</strong>.
                                </p>
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {isLogin ? 'Bem-vindo! 👋' : 'Criar nova conta 🎉'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isLogin ? 'Entre para acessar suas listas' : 'Comece a economizar agora'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                                <span>✅</span>
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processando...
                                    </span>
                                ) : (
                                    isLogin ? 'Entrar' : 'Criar Conta'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                            >
                                {isLogin ? 'Não tem conta? Cadastre-se aqui' : 'Já tem conta? Faça login'}
                            </button>
                        </div>

                        {!isLogin && (
                            <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                <p className="text-xs text-gray-600 text-center">
                                    ℹ️ Ao criar uma conta, o administrador receberá uma notificação por email.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Advertise Button */}
                    <div className="w-full text-center">
                        <a
                            href="https://api.whatsapp.com/send/?phone=5561996993134&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+como+anunciar+no+Lista+F%C3%A1cil&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-pink-200 px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all group"
                        >
                            <span className="text-xl">📢</span>
                            <span className="font-bold text-gray-700 group-hover:text-pink-600">Quer divulgar sua papelaria aqui? <span className="text-pink-500">Anuncie conosco</span></span>
                        </a>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-4 text-center text-gray-400 text-xs w-full z-20">
                <a
                    href="https://api.whatsapp.com/send/?phone=5561996993134&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 transition-colors"
                >
                    Desenvolvido por Cléber Donato
                </a>
            </footer>
        </div>
    );
};

export default AuthScreen;
