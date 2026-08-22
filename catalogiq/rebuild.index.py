# rebuild_index.py — run from catalogiq/
import pandas as pd
import numpy as np
import faiss
from fastembed import TextEmbedding

df = pd.read_csv("artifacts/catalog.csv")
df["search_text"] = (
    df["productDisplayName"].fillna("") + " " +
    df["articleType"].fillna("") + " " +
    df["baseColour"].fillna("") + " " +
    df["gender"].fillna("") + " " +
    df["usage"].fillna("")
).str.strip()

print(f"Embedding {len(df)} products...")
model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")  # 384-dim, ONNX
embeddings = np.array(list(model.embed(df["search_text"].tolist()))).astype("float32")

# normalize for cosine similarity via inner product
faiss.normalize_L2(embeddings)

index = faiss.IndexFlatIP(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "artifacts/product_index.faiss")
np.save("artifacts/image_embeddings.npy", embeddings)
print(f"Done. Index dimension: {index.d}, vectors: {index.ntotal}")
