# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import catalog_df, faiss_index, image_embeddings
import os
from dotenv import load_dotenv
import google.generativeai as genai
import numpy as np
import torch
import clip  # pip install git+https://github.com/openai/CLIP.git

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="CatalogIQ")

# Restrict this before deploying — "*" is fine for local dev only
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel("gemini-2.0-flash")

# --- Load CLIP once at startup, not per-request ---
device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model, clip_preprocess = clip.load("ViT-L/14", device=device)
clip_model.eval()

def embed_text(query: str) -> np.ndarray:
    with torch.no_grad():
        tokens = clip.tokenize([query]).to(device)
        text_features = clip_model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features.cpu().numpy().astype("float32")

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

    query_vec = embed_text(query)          # (1, dim)
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
            f"Name: {row.get('productDisplayName')}\n"
            f"Category: {row.get('articleType')}\n"
            f"Color: {row.get('baseColour')}\n"
            f"Return: Title, Brand guess, Material guess, Key selling points (bulleted)."
        )
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "")
        return {"product_id": product_id, "seo": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini generation failed: {str(e)}")