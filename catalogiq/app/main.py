from fastapi import FastAPI
from .models import catalog_df, faiss_index, image_embeddings
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 1. PEHLE app banao
app = FastAPI(title="CatalogIQ")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
model = genai.GenerativeModel("gemini-2.0-flash")

# 2. FIR endpoints banao

@app.get("/health")
def health():
    return {"status": "ok", "catalog_size": len(catalog_df)}

@app.get("/product/{product_id}")
def get_product(product_id: int):
    row = catalog_df.iloc[product_id].to_dict()
    return row

@app.post("/search")
def search(query: str, k: int = 5):
    return {"query": query, "results": catalog_df.head(k).to_dict(orient="records")}

@app.post("/seo/{product_id}")
def seo(product_id: int):
    try:
        row = catalog_df.iloc[product_id]
        # Agar GEMINI_API_KEY nahi hai to dummy data de de taaki frontend na toote
        if not os.getenv("GEMINI_API_KEY"):
            return {"product_id": product_id, "seo": f"Dummy SEO for {row.get('productDisplayName')} - ADIDAS watch, Black, Analogue"}

        prompt = f"Product: {row.get('productDisplayName')}..."
        response = model.generate_content(prompt)
        text = response.text.replace("```json","").replace("```","")
        return {"product_id": product_id, "seo": text}
    except Exception as e:
        return {"product_id": product_id, "seo": f"Error: {str(e)}"}
