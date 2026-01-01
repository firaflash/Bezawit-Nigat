# 🎨 TimeLess Emotions – Bezawit Nigat Portfolio & Art Shop

**A full-stack portfolio website and art e-commerce platform** for Bezawit Nigat — architect and visual artist based in Addis Ababa, Ethiopia.

Live site: [https://bezawit-nigat.vercel.app/](https://bezawit-nigat.vercel.app/)

---

## ✨ Features

- Fully responsive portfolio showcasing architecture projects, art galleries, and animated hero sections
- Client-side art shop with product browsing, cart, and seamless checkout experience
- Secure server-side payment initialization & verification with Chapa
- Product management (CRUD) using Supabase PostgreSQL
- Automatic marking of sold items + insertion of sold_items records
- Email confirmation after successful purchases
- Proper error handling, input validation, and secure environment variable usage
- Easy deployment on Vercel (serverless functions + static hosting)

---

## 🖼️ Screenshots

### Homepage Hero Section
![Beauty of Art - Landing Page](https://euxhwztkmhzyrcwoupne.supabase.co/storage/v1/object/public/public-img//Screenshot%20from%202025-07-17%2013-28-00%20(1).png)

> More screenshots available in the live site!

---

## 🛠️ Technologies & Stack

- **Frontend**: HTML5, CSS3 (with modern animations), Vanilla JavaScript
- **Backend**: Node.js (≥18), Express.js
- **API Architecture**: RESTful endpoints with JSON payloads
- **Database**: Supabase (PostgreSQL) – uses **indexing**, **joins**, and **Row Level Security (RLS)**
- **Payments**: Chapa API (server-side integration)
- **Validation & Security**: Joi or express-validator (input validation), custom error handling middleware
- **Environment Management**: dotenv for secure configuration
- **Other**: Vercel deployment config, serverless-friendly structure

---

## 📁 Project Structure

```text
public/                  # Static frontend files (served directly)
  index.html             # Main portfolio page
  artShop/               # Art shop pages + checkout flow
  assets/                # Images, fonts, etc.

api/                     # Backend Express application
  index.js               # Main server entry point
  chapaRoutes.js         # payment routes
  supabase.js            # DB helpers

.env.example             # Template for environment variables
package.json             # Dependencies & scripts
vercel.json              # Vercel deployment configuration
README.md
```

---

## ✅ Requirements

- Node.js 18+
- npm (or yarn/pnpm)
- Supabase project (PostgreSQL database with products & sold_items tables)
- Chapa merchant account + secret key

---

## 🧩 Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (from the example) and fill in the values:

```bash
cp .env.example .env
# then edit .env with your keys
```

4. Start the development server:

```bash
npm run dev
```

5. Open the site: http://localhost:5000

The server serves static files from `/public` and exposes API routes under `/api`.

🔐 Environment Variables (.env)

Create a `.env` file with the following values (do NOT commit):

```env
# Supabase (use service_role key – server only)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key

# Chapa payment gateway
CHAPA_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
PORT=5000
NODE_ENV=development
```

Security note: never commit `.env`. The `service_role` key grants full database access and must remain server-only.

---

▶️ Available Scripts

```bash
npm run dev    # Start development server (nodemon or similar)
npm start      # Production start
```


🌐 API Endpoints (REST)
All endpoints are under /api and follow REST best practices.

GET /                        → Serves main portfolio (index.html)
POST /api/chapa/proceedpayment → Initialize Chapa payment session (body: orderInfo)
POST /api/chapa/verify         → Verify payment webhook/callback, update DB, send email
POST /api/dbs/fetchProduct     → Get all available products (with joins & filters)
POST /api/dbs/sellProduct      → Mark products as sold (internal/admin usage)

Features implemented in backend:

Input validation (request body schema checks)
Error handling middleware (consistent JSON error responses)
Proper async/await usage with try-catch blocks
PostgreSQL best practices (indexed queries, joins between products & categories/sales)

See /api/ folder for detailed implementation and request/response examples.

🛍️ Art Shop & Payment Flow Notes

User selects products → submits order info
Backend → creates Chapa payment session & returns checkout URL
User completes payment on Chapa
Chapa callback/verification → backend confirms, updates Supabase (mark sold + record sale), sends confirmation email

Always test with Chapa test keys first!

🚀 Deployment

Recommended: Vercel (handles both static files + serverless Node.js functions automatically)
Set environment variables in Vercel dashboard
Deploy /public as static assets + /api as serverless functions

Alternative options: Render, Railway, Fly.io, or any Node.js-capable host.

🙋 Contributing

Found a bug? → Open an issue with reproduction steps
Want a new feature? → Discuss in an issue first
Pull requests welcome after discussion


❤️ Credits

Artist: Bezawit Nigat
Developers: Firaol Feyisa 


📜 License
ISC – see package.json.
For commercial usage of the artwork/portfolio content, please contact the artist directly.
Happy coding! ✦