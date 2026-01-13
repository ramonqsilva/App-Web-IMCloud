import React, { useState, useMemo, useEffect } from 'react';
import imcloudLogo from './assets/imcloud-logo.png';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null); // Armazena o ID do banco
    const [user, setUser] = useState({ email: '', password: '' });
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);

    const API_URL = 'http://localhost:3001';

    // FUNÇÃO DE LOGIN / REGISTRO REAL
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const data = await response.json();

            if (response.ok) {
                setUserId(data.id);
                setIsLoggedIn(true);
                // Aqui você poderia buscar o histórico inicial do banco
            } else {
                alert(data.error || "Erro ao entrar");
            }
        } catch (error) {
            alert("Servidor offline. Verifique o Node.js");
        }
    };

    // FUNÇÃO DE CÁLCULO VIA API
    const calculateIMC = async (e) => {
        e.preventDefault();
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    userId: userId
                })
            });

            const newEntry = await response.json();

            if (response.ok) {
                // O Backend retorna: { order, weight, imcValue, status, etc }
                setResult({
                    order: newEntry.order,
                    value: newEntry.imcValue,
                    class: newEntry.status,
                    weight: newEntry.weight
                });

                // Atualiza a tabela com o que veio do banco
                const tableEntry = {
                    id: newEntry.id,
                    order: newEntry.order,
                    date: new Date(newEntry.createdAt).toLocaleDateString(),
                    weight: newEntry.weight,
                    value: newEntry.imcValue,
                    class: newEntry.status
                };

                setHistory([tableEntry, ...history]);
                setWeight('');
                setHeight('');
            }
        } catch (error) {
            alert("Erro ao calcular no servidor");
        }
    };

    // Filtro dinâmico (Mantido igual, mas agora com dados do banco)
    const filteredHistory = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        return history.filter((item) => {
            return (
                item.order.toString().includes(search) ||
                item.date.includes(search) ||
                item.class.toLowerCase().includes(search) ||
                item.weight.toString().includes(search)
            );
        });
    }, [history, searchTerm]);

    if (!isLoggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                    <div className="mb-8 flex items-center justify-center gap-3">
                        <img src={imcloudLogo} className="h-12 w-auto" alt="Logo" />
                        <h1 className="text-3xl font-bold text-blue-600">IMCloud</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="email" placeholder="E-mail" className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                               onChange={(e) => setUser({ ...user, email: e.target.value })} required />
                        <input type="password" placeholder="Senha" className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                               onChange={(e) => setUser({ ...user, password: e.target.value })} required />
                        <button className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 cursor-pointer shadow-lg active:scale-95">
                            Entrar / Cadastrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
            <div className="mx-auto max-w-6xl">
                {/* Header e Tabelas de referência (Mantidos iguais ao anterior para consistência visual) */}
                <header className="mb-8 flex flex-col xl:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-3">
                            <img src={imcloudLogo} className="h-8 w-auto" alt="Logo" />
                            <h1 className="text-xl font-bold text-slate-800 border-r pr-4 border-slate-200">Dashboard</h1>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">MAGREZA &lt; 18.5</span>
                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">NORMAL 18.5-24.9</span>
                            <span className="text-[10px] bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full font-bold">SOBREPESO 25-29.9</span>
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">OBESIDADE &gt; 30</span>
                        </div>
                    </div>
                    <button onClick={() => setIsLoggedIn(false)} className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer">Sair</button>
                </header>

                <div className="grid gap-8 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sticky top-10">
                            <h2 className="mb-4 text-lg font-bold text-slate-700">Novo Cálculo Online</h2>
                            <form onSubmit={calculateIMC} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</label>
                                    <input type="number" step="0.1" className="w-full rounded-lg border border-slate-200 p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ex: 75.5" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Altura (cm)</label>
                                    <input type="number" className="w-full rounded-lg border border-slate-200 p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ex: 180" required />
                                </div>
                                <button className="w-full rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition cursor-pointer shadow-md active:scale-95">Salvar no Banco</button>
                            </form>

                            {result && (
                                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-center border border-blue-100 animate-in fade-in zoom-in duration-300">
                                    <p className="text-[10px] text-blue-600 uppercase font-black">№ {result.order} • {result.weight}kg</p>
                                    <p className="text-4xl font-black text-blue-900">{result.value}</p>
                                    <p className="text-blue-700 font-bold">{result.class}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-700">Histórico do Banco de Dados</h2>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Pesquise no PostgreSQL..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full md:w-80 rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                    <span className="absolute left-4 text-slate-400">🔍</span>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-black">№ Ordem</th>
                                        <th className="p-4 font-black">Data</th>
                                        <th className="p-4 font-black">Peso</th>
                                        <th className="p-4 font-black">IMC</th>
                                        <th className="p-4 font-black">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition text-sm">
                                                <td className="p-4 font-bold text-slate-400">#{item.order}</td>
                                                <td className="p-4 text-slate-600">{item.date}</td>
                                                <td className="p-4 text-slate-600">{item.weight} kg</td>
                                                <td className="p-4 font-bold text-slate-800">{item.value}</td>
                                                <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase shadow-sm ${
                                                            item.class === 'Peso normal' ? 'bg-green-100 text-green-700' :
                                                                item.class === 'Magreza' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {item.class}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-slate-400 italic">Nenhum registro no banco de dados.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}