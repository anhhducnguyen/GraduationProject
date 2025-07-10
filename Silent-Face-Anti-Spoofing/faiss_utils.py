# faiss_utils.py
import faiss
import pickle
import numpy as np

# Load FAISS index và student_ids
index = faiss.read_index("faiss_index/face_index.faiss")

with open("faiss_index/student_ids.pkl", "rb") as f:
    student_ids = pickle.load(f)

def find_best_match(embedding: np.ndarray, threshold=0.6):
    vector = embedding.astype(np.float32).reshape(1, -1)
    faiss.normalize_L2(vector)
    D, I = index.search(vector, k=1)
    score = float(D[0][0])
    idx = int(I[0][0])
    identity = student_ids[idx] if score > threshold else "Unknown"
    return identity, score
