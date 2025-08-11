# # # # import face_recognition
# # # # import cv2

# # # # # 1. Load known face image & get encoding
# # # # known_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/obama.jpg")
# # # # known_encoding = face_recognition.face_encodings(known_image)[0]
# # # # known_name = "Obama"

# # # # # 2. Load image with multiple faces
# # # # unknown_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/mutip.jpg")

# # # # # 3. Detect faces & get encodings
# # # # face_locations = face_recognition.face_locations(unknown_image)
# # # # face_encodings = face_recognition.face_encodings(unknown_image, face_locations)

# # # # # 4. Compare each face
# # # # for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
# # # #     results = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.4)
# # # #     distance = face_recognition.face_distance([known_encoding], face_encoding)[0]

# # # #     if results[0]:
# # # #         top, right, bottom, left = face_location
# # # #         print(f"[Face {i+1}] ✅ Match with {known_name} (Distance: {distance:.2f})")
# # # #         # Draw a rectangle
# # # #         cv2.rectangle(unknown_image, (left, top), (right, bottom), (0, 255, 0), 2)
# # # #         cv2.putText(unknown_image, known_name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
# # # #     else:
# # # #         print(f"[Face {i+1}] ❌ Not {known_name} (Distance: {distance:.2f})")

# # # # # 5. Show image
# # # # cv2.imshow("Result", cv2.cvtColor(unknown_image, cv2.COLOR_RGB2BGR))
# # # # cv2.waitKey(0)
# # # # cv2.destroyAllWindows()


# # # import face_recognition
# # # import cv2
# # # import time

# # # # 1. Load known face image & get encoding
# # # known_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/obama.jpg")
# # # known_encoding = face_recognition.face_encodings(known_image)[0]
# # # known_name = "Obama"

# # # # 2. Load image with multiple faces
# # # unknown_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/mutip.jpg")

# # # # 3. Detect faces & get encodings
# # # start_time_total = time.perf_counter()
# # # face_locations = face_recognition.face_locations(unknown_image)
# # # face_encodings = face_recognition.face_encodings(unknown_image, face_locations)
# # # end_time_total = time.perf_counter()

# # # # 4. Display header
# # # print(f"{'Face':<6} {'Match':<8} {'Distance':<10} {'Processing Time':<16}")
# # # print("-" * 45)

# # # # 5. Compare each face
# # # for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
# # #     start_time = time.perf_counter()

# # #     results = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.4)
# # #     distance = face_recognition.face_distance([known_encoding], face_encoding)[0]

# # #     result = "Yes" if results[0] else "No"

# # #     top, right, bottom, left = face_location
# # #     if results[0]:
# # #         cv2.rectangle(unknown_image, (left, top), (right, bottom), (0, 255, 0), 2)
# # #         cv2.putText(unknown_image, known_name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

# # #     end_time = time.perf_counter()
# # #     processing_time = end_time - start_time

# # #     print(f"{i+1:<6} {result:<8} {distance:<10.2f} {processing_time:<.4f}s")

# # # # 6. Show total processing time
# # # print("-" * 45)
# # # print(f"{'Total faces':<16}: {len(face_encodings)}")
# # # print(f"{'Total time':<16}: {end_time_total - start_time_total:.4f}s")

# # # # 7. Show final image
# # # cv2.imshow("Result", cv2.cvtColor(unknown_image, cv2.COLOR_RGB2BGR))
# # # cv2.waitKey(0)
# # # cv2.destroyAllWindows()

# # import face_recognition
# # import cv2
# # import time

# # # 1. Load known face image & get encoding
# # known_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/obama.jpg")
# # known_encoding = face_recognition.face_encodings(known_image)[0]
# # known_name = "Obama"

# # # 2. Load image with multiple faces
# # unknown_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/mutip.jpg")

# # # 3. Detect faces & get encodings
# # start_time_total = time.perf_counter()
# # face_locations = face_recognition.face_locations(unknown_image)
# # face_encodings = face_recognition.face_encodings(unknown_image, face_locations)
# # end_time_total = time.perf_counter()

# # # 4. Display header giống insightface
# # print(f"{'Face':<6} {'Name':<10} {'Distance':<10} {'Status':<10} {'Processing Time':<16}")
# # print("-" * 60)

# # # 5. Compare each face
# # for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
# #     start_time = time.perf_counter()

# #     results = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.4)
# #     distance = face_recognition.face_distance([known_encoding], face_encoding)[0]

# #     if results[0]:
# #         name = known_name
# #         status = "Match"
# #         top, right, bottom, left = face_location
# #         cv2.rectangle(unknown_image, (left, top), (right, bottom), (0, 255, 0), 2)
# #         cv2.putText(unknown_image, known_name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
# #     else:
# #         name = known_name
# #         status = "Unknown"

# #     end_time = time.perf_counter()
# #     processing_time = end_time - start_time

# #     print(f"{i+1:<6} {name:<10} {distance:<10.2f} {status:<10} {processing_time:<.4f}s")

# # # 6. Show total processing time
# # print("-" * 60)
# # print(f"{'Total processing time':<28}: {(end_time_total - start_time_total):.4f}s")

# # # 7. Show final image
# # # cv2.imshow("Result", cv2.cvtColor(unknown_image, cv2.COLOR_RGB2BGR))
# # # cv2.waitKey(0)
# # # cv2.destroyAllWindows()

# import face_recognition
# import cv2
# import time

# # 1. Load ảnh gốc và known face
# start_total = time.perf_counter()

# start_load_known = time.perf_counter()
# known_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/obama.jpg")
# known_encoding = face_recognition.face_encodings(known_image)[0]
# end_load_known = time.perf_counter()

# # 2. Load ảnh chứa nhiều khuôn mặt
# start_load_input = time.perf_counter()
# unknown_image = face_recognition.load_image_file("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/mutip.jpg")
# end_load_input = time.perf_counter()

# # 3. Phát hiện khuôn mặt
# start_detect = time.perf_counter()
# face_locations = face_recognition.face_locations(unknown_image)
# end_detect = time.perf_counter()

# # 4. Trích xuất embedding (encoding)
# start_encode = time.perf_counter()
# face_encodings = face_recognition.face_encodings(unknown_image, face_locations)
# end_encode = time.perf_counter()

# # 5. So sánh từng khuôn mặt
# print(f"{'Face':<6} {'Name':<10} {'Distance':<10} {'Status':<10} {'Processing Time':<16}")
# print("-" * 60)

# total_compare_time = 0
# for i, face_encoding in enumerate(face_encodings):
#     start_compare = time.perf_counter()

#     distance = face_recognition.face_distance([known_encoding], face_encoding)[0]
#     result = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.4)

#     if result[0]:
#         status = "Match"
#     else:
#         status = "Unknown"

#     end_compare = time.perf_counter()
#     compare_time = end_compare - start_compare
#     total_compare_time += compare_time

#     print(f"{i+1:<6} {'Obama':<10} {distance:<10.2f} {status:<10} {compare_time:<.4f}s")

# # 6. Tổng kết thời gian
# end_total = time.perf_counter()

# print("-" * 60)
# print(f"{'Time to load known face':<30}: {(end_load_known - start_load_known):.4f}s")
# print(f"{'Time to load input image':<30}: {(end_load_input - start_load_input):.4f}s")
# print(f"{'Time to detect faces':<30}: {(end_detect - start_detect):.4f}s")
# print(f"{'Time to encode faces':<30}: {(end_encode - start_encode):.4f}s")
# print(f"{'Time to compare faces':<30}: {total_compare_time:.4f}s")
# print(f"{'Total processing time':<30}: {(end_total - start_total):.4f}s")


import cv2
import time
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from sklearn.metrics.pairwise import cosine_similarity

# 1. Khởi tạo model
start_total = time.perf_counter()
start_init = time.perf_counter()
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0)
end_init = time.perf_counter()

# 2. Load ảnh khuôn mặt đã biết
start_load_known = time.perf_counter()
known_img = cv2.imread("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/obama.jpg")
known_faces = app.get(known_img)
end_load_known = time.perf_counter()

known_embedding = known_faces[0].embedding
known_name = "Obama"

# 3. Load ảnh nhận diện
start_load_unknown = time.perf_counter()
unknown_img = cv2.imread("E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/insightface/mutip.jpg")
end_load_unknown = time.perf_counter()

# 4. Detect + extract embedding các khuôn mặt trong ảnh
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
print("-" * 70)
print(f"{'Time to init model':<30}: {(end_init - start_init):.4f}s")
print(f"{'Time to load known face':<30}: {(end_load_known - start_load_known):.4f}s")
print(f"{'Time to load input image':<30}: {(end_load_unknown - start_load_unknown):.4f}s")
print(f"{'Time to detect & encode faces':<30}: {(end_detect - start_detect):.4f}s")
print(f"{'Time to compare faces':<30}: {total_compare_time:.4f}s")
print(f"{'Total processing time':<30}: {(end_total - start_total):.4f}s")
