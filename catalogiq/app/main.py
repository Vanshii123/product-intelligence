from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import catalog_df, faiss_index, image_embeddings
import os
from dotenv import load_dotenv
import google.generativeai as genai
import numpy as np
import faiss
from fastembed import TextEmbedding

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="CatalogIQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel("gemini-2.0-flash")
text_model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

def embed_text(query: str) -> np.ndarray:
    vec = np.array(list(text_model.embed([query]))).astype("float32")
    faiss.normalize_L2(vec)
    return vec

@app.get("/health")
def health():
    return {"status": "ok", "catalog_size": len(catalog_df)}

@app.get("/product/{product_id}")
def get_product(product_id: int):
    if product_id < 0 or product_id >= len(catalog_df):
        raise HTTPException(status_code=404, detail="Product not found")
    return catalog_df.iloc[product_id].to_dict()

@app.post("/search")
def search(query: str, k: int = 8):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    query_vec = embed_text(query)
    distances, indices = faiss_index.search(query_vec, k)
    results = []
    for rank, idx in enumerate(indices[0]):
        if idx == -1:
            continue
        row = catalog_df.iloc[idx].to_dict()
        row["_similarity_score"] = float(distances[0][rank])
        row["_product_id"] = int(idx)
        results.append(row)
    return {"query": query, "results": results}

@app.post("/seo/{product_id}")
def seo(product_id: int):
    if product_id < 0 or product_id >= len(catalog_df):
        raise HTTPException(status_code=404, detail="Product not found")
    row = catalog_df.iloc[product_id]
    try:
        if not os.getenv("GEMINI_API_KEY"):
            return {"product_id": product_id, "seo": f"Dummy SEO for {row.get('productDisplayName')}"}
        prompt = (
            f"Write a concise e-commerce SEO listing for this product.\n"
            f"Name: {row.get('productDisplayName')}\nCategory: {row.get('articleType')}\nColor: {row.get('baseColour')}\n"
            f"Return: Title, Brand guess, Material guess, Key selling points (bulleted)."
        )
        response = model.generate_content(prompt)
        return {"product_id": product_id, "seo": response.text.replace("```json", "").replace("```", "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini generation failed: {str(e)}")
