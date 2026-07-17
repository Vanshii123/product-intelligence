import faiss
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

print("Loading artifacts...")
catalog_df = pd.read_csv(os.path.join(BASE_DIR, "artifacts/catalog.csv"))
faiss_index = faiss.read_index(os.path.join(BASE_DIR, "artifacts/product_index.faiss"))
image_embeddings = np.load(os.path.join(BASE_DIR, "artifacts/image_embeddings.npy"))
print(f"Loaded {len(catalog_df)} products")