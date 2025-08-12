import time
import cv2
import numpy as np
import face_recognition
from insightface.app import FaceAnalysis
from sklearn.metrics.pairwise import cosine_similarity

# -----------------------------
# Benchmark face_recognition
# -----------------------------
def benchmark_face_recognition(known_path, unknown_path):
    print("\n=== Benchmark: face_recognition ===")
    results = {}
    start_total = time.perf_counter()

    # 1. Load ảnh gốc và known face
    start_load_known = time.perf_counter()
    known_image = face_recognition.load_image_file(known_path)
    known_encoding = face_recognition.face_encodings(known_image)[0]
    end_load_known = time.perf_counter()

    # 2. Load ảnh chứa nhiều khuôn mặt
    start_load_input = time.perf_counter()
    unknown_image = face_recognition.load_image_file(unknown_path)
    end_load_input = time.perf_counter()

    # 3. Phát hiện khuôn mặt
    start_detect = time.perf_counter()
    face_locations = face_recognition.face_locations(unknown_image)
    end_detect = time.perf_counter()

    # 4. Trích xuất embedding (encoding)
    start_encode = time.perf_counter()
    face_encodings = face_recognition.face_encodings(unknown_image, face_locations)
    end_encode = time.perf_counter()

    # 5. So sánh từng khuôn mặt
    print(f"{'Face':<6} {'Name':<10} {'Distance':<10} {'Status':<10} {'Processing Time':<16}")
    print("-" * 60)
    total_compare_time = 0
    for i, face_encoding in enumerate(face_encodings):
        start_compare = time.perf_counter()
        distance = face_recognition.face_distance([known_encoding], face_encoding)[0]
        result = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.4)
        status = "Match" if result[0] else "Unknown"
        end_compare = time.perf_counter()
        compare_time = end_compare - start_compare
        total_compare_time += compare_time
        print(f"{i+1:<6} {'Obama':<10} {distance:<10.2f} {status:<10} {compare_time:<.4f}s")

    # 6. Tổng kết thời gian
    end_total = time.perf_counter()
    results["load_known"] = end_load_known - start_load_known
    results["load_input"] = end_load_input - start_load_input
    results["detect"] = end_detect - start_detect
    results["encode"] = end_encode - start_encode
    results["compare"] = total_compare_time
    results["total"] = end_total - start_total
    return results

# -----------------------------
# Benchmark insightface
# -----------------------------
def benchmark_insightface(known_path, unknown_path):
    print("\n=== Benchmark: insightface ===")
    results = {}
    start_total = time.perf_counter()

    # 1. Khởi tạo model
    start_init = time.perf_counter()
    app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0)
    end_init = time.perf_counter()

    # 2. Load ảnh khuôn mặt đã biết
    start_load_known = time.perf_counter()
    known_img = cv2.imread(known_path)
    known_faces = app.get(known_img)
    known_embedding = known_faces[0].embedding
    known_name = "Obama"
    end_load_known = time.perf_counter()

    # 3. Load ảnh nhận diện
    start_load_unknown = time.perf_counter()
    unknown_img = cv2.imread(unknown_path)
    end_load_unknown = time.perf_counter()

    # 4. Detect + extract embedding các khuôn mặt
    start_detect = time.perf_counter()
    unknown_faces = app.get(unknown_img)
    end_detect = time.perf_counter()

    # 5. So sánh từng khuôn mặt
    print(f"{'Face':<6} {'Name':<20} {'Similarity':<12} {'Status':<10} {'Processing Time':<16}")
    print("-" * 70)
    total_compare_time = 0
    for i, face in enumerate(unknown_faces):
        start_compare = time.perf_counter()
        unknown_embedding = face.embedding
        similarity = cosine_similarity([known_embedding], [unknown_embedding])[0][0]
        status = known_name if similarity > 0.6 else "Unknown"
        process_time = time.perf_counter() - start_compare
        total_compare_time += process_time
        print(f"{i+1:<6} {known_name:<20} {similarity:<12.2f} {status:<10} {process_time:<.4f}s")

    # 6. Tổng kết thời gian
    end_total = time.perf_counter()
    results["init_model"] = end_init - start_init
    results["load_known"] = end_load_known - start_load_known
    results["load_input"] = end_load_unknown - start_load_unknown
    results["detect_encode"] = end_detect - start_detect
    results["compare"] = total_compare_time
    results["total"] = end_total - start_total
    return results

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    KNOWN_PATH = "E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/images/obama.jpg"
    UNKNOWN_PATH = "E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/images/mutip.jpg"

    fr_results = benchmark_face_recognition(KNOWN_PATH, UNKNOWN_PATH)
    isf_results = benchmark_insightface(KNOWN_PATH, UNKNOWN_PATH)

    # So sánh tổng quan
    print("\n=== Summary ===")
    print(f"{'Step':<20} {'face_recognition':<20} {'insightface':<20}")
    print("-" * 60)
    print(f"{'Load known face':<20} {fr_results['load_known']:<20.4f} {isf_results['load_known']:<20.4f}")
    print(f"{'Load input image':<20} {fr_results['load_input']:<20.4f} {isf_results['load_input']:<20.4f}")
    print(f"{'Detect faces':<20} {fr_results['detect']:<20.4f} {isf_results['detect_encode']:<20.4f}")
    print(f"{'Encode faces':<20} {fr_results['encode']:<20.4f} {'-':<20}")
    print(f"{'Compare faces':<20} {fr_results['compare']:<20.4f} {isf_results['compare']:<20.4f}")
    print(f"{'Total time':<20} {fr_results['total']:<20.4f} {isf_results['total']:<20.4f}")
