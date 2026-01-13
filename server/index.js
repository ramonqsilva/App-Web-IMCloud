const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Ajuste para a Versão 7: O Prisma já sabe a URL pelo prisma.config.ts
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
