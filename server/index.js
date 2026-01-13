const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Ajuste para atender a exigência da v7.2.0 por um objeto não vazio
const prisma = new PrismaClient({
    log: ['info', 'query', 'warn', 'error']
});

const app = express();
// ... restante do código