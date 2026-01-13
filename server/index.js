require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Ajuste para atender a exigência da v7.2.0 por um objeto não vazio
// E permitir visualizar as operações no log do Render
const prisma = new PrismaClient({
    log: ['info', 'query', 'warn', 'error']
});

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://imcloud.vercel.app'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Rota de Registro (Cadastro)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });
        res.json({ message: "Usuário criado!", id: user.id });
    } catch (e) {
        res.status(400).json({ error: "E-mail já cadastrado." });
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        res.json({
            message: 'Login realizado com sucesso',
            userId: user.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no login' });
    }
});

// Rota de Cálculo e Salvamento
app.post('/calculate', async (req, res) => {
    const { weight, height, userId } = req.body;

    // Lógica do IMC: Peso / (Altura * Altura)
    const imc = (weight / ((height / 100) ** 2)).toFixed(2);
    let status = imc < 18.5 ? "Magreza" : imc < 24.9 ? "Peso normal" : imc < 29.9 ? "Sobrepeso" : "Obesidade";

    try {
        // Busca a última ordem para incrementar
        const lastEntry = await prisma.imcCalculation.findFirst({
            where: { userId: Number(userId) },
            orderBy: { order: 'desc' }
        });
        const nextOrder = lastEntry ? lastEntry.order + 1 : 1;

        const entry = await prisma.imcCalculation.create({
            data: {
                order: nextOrder,
                weight: parseFloat(weight),
                height: parseFloat(height),
                imcValue: parseFloat(imc),
                status,
                userId: Number(userId)
            }
        });

        res.json(entry);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erro ao salvar cálculo." });
    }
});

// O Render exige o uso de process.env.PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));