require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error']
});

const app = express();

/* =========================
   CORS – VERCEL + LOCAL
========================= */
app.use(cors({
    origin: [
        'https://imcloud.vercel.app'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* =========================
   REGISTER
========================= */
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        res.json({
            id: user.id,
            email: user.email
        });

    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

/* =========================
   LOGIN
========================= */
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
            id: user.id,
            email: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no login' });
    }
});

/* =========================
   CALCULATE IMC
========================= */
app.post('/calculate', async (req, res) => {
    const { weight, height, userId } = req.body;

    const imc = (weight / ((height / 100) ** 2)).toFixed(2);

    let status =
        imc < 18.5 ? 'Magreza' :
            imc < 24.9 ? 'Peso normal' :
                imc < 29.9 ? 'Sobrepeso' :
                    'Obesidade';

    try {
        const last = await prisma.imcCalculation.findFirst({
            where: { userId: Number(userId) },
            orderBy: { order: 'desc' }
        });

        const nextOrder = last ? last.order + 1 : 1;

        const entry = await prisma.imcCalculation.create({
            data: {
                order: nextOrder,
                weight: Number(weight),
                height: Number(height),
                imcValue: Number(imc),
                status,
                userId: Number(userId)
            }
        });

        res.json(entry);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar cálculo' });
    }
});

/* =========================
   HISTORY
========================= */
app.get('/history/:userId', async (req, res) => {
    const userId = Number(req.params.userId);

    try {
        const history = await prisma.imcCalculation.findMany({
            where: { userId },
            orderBy: { order: 'desc' }
        });

        res.json(history);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
