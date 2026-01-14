import { useState, useEffect } from 'react';

export default function App() {
    // Estados de Autenticação
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState(''); // CORRETO: Iniciado como string vazia
    const [password, setPassword] = useState(''); // CORRETO: Iniciado como string vazia
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Estados do Cálculo e Histórico
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');

    const API_URL = 'https://app-web-imcloud.onrender.com';

    // Função para buscar histórico ao logar
    const fetchHistory = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/history/${userId}`);
            const data = await response.json();
            if (response.ok) setHistory(data);
        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
        }
    };

    // Função Unificada para Login/Cadastro
    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isLoginMode ? '/login' : '/register';

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
                fetchHistory(data.id);
                setMessage(isLoginMode ? "Login realizado!" : "Conta criada com sucesso!");
            } else {
                setMessage(data.error || "Erro na autenticação");
            }
        } catch (err) {
            setMessage("Erro ao conectar com o servidor.");
        }
    };

    // Função de Cálculo de IMC
    const calculateIMC = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: Number(weight),
                    height: Number(height),
                    userId: user.id
                }),
            });

            const newEntry = await response.json();

            if (response.ok) {
                // CORRETO: Tratamento seguro da data para evitar erros de parâmetro
                const formattedDate = newEntry.createdAt
                    ? new Date(newEntry.createdAt).toLocaleDateString()
                    : new Date().toLocaleDateString();

                const tableEntry = {
                    ...newEntry,
                    date: formattedDate
                };

                setHistory([tableEntry, ...history]);
                setWeight('');
                setHeight('');
            }
        } catch (err) {
            console.error("Erro no cálculo:", err);
        }
    };

    // Tela de Autenticação
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                    <div className="text-center mb-8">
                        <img src="/imcloud-logo.png" alt="Logo" className="w-20 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">IMC Cloud</h1>
                    </div>

                    {/* Botões Separados para Alternar Modo */}
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setIsLoginMode(true)}
                            className={`flex-1 py-2 rounded-md transition-all ${isLoginMode ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLoginMode(false)}
                            className={`flex-1 py-2 rounded-md transition-all ${!isLoginMode ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            Cadastro
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            {isLoginMode ? 'Acessar Sistema' : 'Criar Minha Conta'}
                        </button>
                    </form>
                    {message && <p className="mt-4 text-center text-sm text-red-500 font-medium">{message}</p>}
                </div>
            </div>
        );
    }

    // Dashboard do Usuário
    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold">Bem-vindo, {user.email}</h2>
                        <p className="text-gray-500 text-sm">Controle seu IMC de forma inteligente</p>
                    </div>
                    <button onClick={() => setUser(null)} className="text-red-500 hover:underline">Sair</button>
                </header>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Novo Cálculo</h3>
                    <form onSubmit={calculateIMC} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="number"
                            placeholder="Peso (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="flex-1 p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Altura (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="flex-1 p-3 border rounded-lg"
                            required
                        />
                        <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700">Calcular</button>
                    </form>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-bold">Histórico de Resultados</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">Ordem</th>
                            <th className="p-4 font-bold text-gray-600">Data</th>
                            <th className="p-4 font-bold text-gray-600">IMC</th>
                            <th className="p-4 font-bold text-gray-600">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry, index) => (
                            <tr key={entry.id || index} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">#{entry.order}</td>
                                <td className="p-4 text-gray-500">{entry.date || new Date(entry.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-bold">{entry.imcValue}</td>
                                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        entry.status === 'Peso normal' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {entry.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}