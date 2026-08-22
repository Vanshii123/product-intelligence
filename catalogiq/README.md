# CatalogIQ — AI-Powered Product Search & Listing Generator

**Live demo:** [product-intelligence-n1os.vercel.app](https://product-intelligence-n1os.vercel.app/)
**API:** [product-intelligence-6.onrender.com](https://product-intelligence-6.onrender.com/health)

Semantic product search across an 8,000-item e-commerce catalog, with AI-generated SEO listings. Built and deployed end-to-end: FastAPI backend, React frontend, vector search, and an LLM in the loop.

> ⚠️ Backend is on Render's free tier — the first request after inactivity can take 30-60s to wake up.

---

## What it does

- **Semantic search** — type a natural-language query ("red running shoes") and get relevance-ranked results, not just keyword matches
- **AI-generated SEO listings** — click any product to have Gemini 2.0 Flash generate a structured title, brand guess, material, and selling points on demand
- **Category-based visual system** — since the catalog has no hosted product images, each result is rendered with a distinct icon/color per category rather than a broken image placeholder

## Architecture

```
User query
   │
   ▼
React (Vite) frontend  ──────────────►  FastAPI backend
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                        Text embedding    FAISS index    Gemini 2.0 Flash
                        (fastembed/ONNX)  (8,000 vecs)   (on-demand SEO gen)
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite |
| Backend | FastAPI, Uvicorn |
| Search | `fastembed` (ONNX-based sentence embeddings) + FAISS |
| LLM | Google Gemini 2.0 Flash |
| Deployment | Vercel (frontend), Render (backend) |
| Data | Flipkart Fashion product catalog, 8,000 items |

## Why `fastembed` instead of CLIP

This started as a CLIP + FAISS image-search project. Two things changed the design:

1. **No product images were actually available** — the catalog only ships with local Kaggle file paths, not hosted URLs, so true visual search wasn't viable without re-sourcing 44k images.
2. **CLIP's memory footprint (~900MB+ with torch/CUDA deps) exceeded free-tier hosting limits** and repeatedly crashed the deployed service with OOM errors.

Since the actual search behavior was always text-to-text (query text vs. product text), switching to `fastembed` — a lightweight ONNX runtime for sentence embeddings — kept the same semantic search quality at a fraction of the memory cost, and made free-tier deployment stable. This tradeoff is documented here deliberately: **it's a real engineering decision made under real constraints**, not an oversight.

## Running locally

**Backend**
```bash
cd catalogiq
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend**
```bash
cd catalogiq/frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to point at your local backend (`http://localhost:8000`).

## API

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Service + catalog status |
| `/search?query=...&k=8` | POST | Semantic search, returns top-k ranked products |
| `/seo/{product_id}` | POST | Generate an SEO listing for a product |
| `/product/{id}` | GET | Fetch a single product record |

## Known limitations

- No real product images (dataset constraint — see above)
- Free-tier hosting means cold starts on both frontend and backend
- Search quality is bounded by product metadata richness (name, category, color, usage) rather than deep visual features

## What I'd build next

- Duplicate/near-duplicate product detection using the existing FAISS index
- A small relevance evaluation set (query → expected top results) to quantify search quality
- Re-introduce image-based search if a hosted image source becomes available
