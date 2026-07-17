# CatalogIQ - AI Product Intelligence

> Flipkart catalog ke liye CLIP + FAISS + Gemini powered search & SEO generator

![Architecture](architecture.png)

### Tech Stack
- **Backend:** FastAPI, Python, Uvicorn
- **AI Search:** OpenAI CLIP (image embeddings) + FAISS (vector DB)
- **LLM:** Gemini 1.5 Flash for SEO generation
- **Frontend:** React + Vite
- **Data:** 44k Flipkart Products

### Features
- 🔍 Semantic Search - "red running shoes" -> FAISS similarity
- 🖼️ Reverse Image Search (Part 1 classifier ready)
- 🤖 Auto SEO - Title, description, brand, material

### How to Run
Backend:
```bash
cd catalogiq

Frontend:

```Bash
cd frontend
npm install
npm run dev
python -m uvicorn app.main:app --reload