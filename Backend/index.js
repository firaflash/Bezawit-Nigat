import express, { json } from "express";
import path from "path";
import chapaRoutes from "./routes/chapaRoutes.js";

const app = express();
const PORT = process.env.PORT_NUMBER || 5000;

import dotenv from 'dotenv';
dotenv.config();

app.use(json()); // Recommended approach

// OR if you prefer body-parser:
// app.use(bodyParser.json());

app.use('/api/Chapa', chapaRoutes);

app.get('/', (req, res) => {
  res.send('Hello World 🌍');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});