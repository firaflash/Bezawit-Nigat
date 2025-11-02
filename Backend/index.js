import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import chapaRoutes from "./routes/chapaRoutes.js";
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT_NUMBER || 5000;

dotenv.config();

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from Frontend folder
const frontendPath = path.join(__dirname, '..', 'FrontEnd' , 'Home');
app.use(express.static(frontendPath));

app.use(express.json());
app.use('/api/Chapa', chapaRoutes);

// ✅ CORRECT: Serve index.html from Frontend folder
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ ALTERNATIVE: If you want to be explicit about the file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Frontend path: ${frontendPath}`);
});
