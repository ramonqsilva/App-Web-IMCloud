const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
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

// Rota de Cálculo e Salvamento
app.post('/calculate', async (req, res) => {
    const { weight, height, userId } = req.body;

    // Lógica do IMC
    const imc = (weight / ((height / 100) ** 2)).toFixed(2);
    let status = imc < 18.5 ? "Magreza" : imc < 24.9 ? "Peso normal" : imc < 29.9 ? "Sobrepeso" : "Obesidade";

    // Busca a última ordem para incrementar
    const lastEntry = await prisma.imcCalculation.findFirst({
        where: { userId },
        orderBy: { order: 'desc' }
    });
    const nextOrder = lastEntry ? lastEntry.order + 1 : 1;

    const entry = await prisma.imcCalculation.create({
        data: {
            order: nextOrder,
            weight,
            height,
            imcValue: parseFloat(imc),
            status,
            userId
        }
    });

    res.json(entry);
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));