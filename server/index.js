const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// 1. AJUSTE PRISMA: Passando a URL explicitamente para evitar o erro de inicialização
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

const app = express();
app.use(cors());
app.use(express.json());

// ... (Suas rotas /register e /calculate continuam exatamente iguais)

// 2. AJUSTE PORTA: O Render exige que você use process.env.PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));