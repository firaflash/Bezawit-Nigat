import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import chapaRoutes from "./chapaRoutes.js";
import supaBaseRoutes from './dbsroutes.js'

import dotenv from 'dotenv';

const app = express();

const PORT = process.env.PORT || 5000;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, '..', 'public');
app.use(express.static(frontendPath));

app.use(express.json());
app.use('/api/chapa', chapaRoutes);
app.use('/api/dbs', supaBaseRoutes)



app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


export default app;
// Only listen locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port http://localhost:${PORT}`);
  });
}