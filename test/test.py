# # # # # import os
# # # # # import cv2
# # # # # import numpy as np
# # # # # import argparse
# # # # # import warnings
# # # # # import time
# # # # # import math
# # # # # import face_recognition

# # # # # from src.anti_spoof_predict import AntiSpoofPredict, Detection
# # # # # from src.generate_patches import CropImage
# # # # # from src.utility import parse_model_name
# # # # # import pickle


# # # # # warnings.filterwarnings('ignore')

# # # # # SAMPLE_IMAGE_PATH = "./images/sample/"
# # # # # KNOWN_FACE_PATH = "./known_faces/"


# # # # # def check_image(image):
# # # # #     height, width, channel = image.shape
# # # # #     desired_width = int(height * 3 / 4)
# # # # #     if width != desired_width:
# # # # #         image = cv2.resize(image, (desired_width, height))
# # # # #     return True

# # # # # def load_known_faces(pkl_file="known_faces.pkl"):
# # # # #     with open(pkl_file, "rb") as f:
# # # # #         known_faces = pickle.load(f)

# # # # #     known_face_encodings = []
# # # # #     known_face_names = []

# # # # #     for name, encodings in known_faces.items():
# # # # #         known_face_encodings.extend(encodings)
# # # # #         known_face_names.extend([name] * len(encodings))

# # # # #     return known_face_encodings, known_face_names


# # # # # def test(image_name, model_dir, device_id):
# # # # #     model_test = AntiSpoofPredict(device_id)
# # # # #     image_cropper = CropImage()
# # # # #     detector = Detection()
# # # # #     known_encodings, known_names = load_known_faces("known_faces.pkl")

# # # # #     image = cv2.imread(SAMPLE_IMAGE_PATH + image_name)
# # # # #     result = check_image(image)
# # # # #     if not result:
# # # # #         return

# # # # #     image_bboxes = detector.get_bboxes(image)
# # # # #     print(f"Found {len(image_bboxes)} face(s) in image.")
# # # # #     test_speed_total = 0

# # # # #     for i, image_bbox in enumerate(image_bboxes):
# # # # #         x, y, w, h = image_bbox
# # # # #         face_image = image[y:y + h, x:x + w]
# # # # #         rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
# # # # #         encoding = face_recognition.face_encodings(rgb_face)

# # # # #         face_identity = "Unknown"
# # # # #         if len(encoding) > 0:
# # # # #             matches = face_recognition.compare_faces(known_encodings, encoding[0], tolerance=0.5)
# # # # #             face_distances = face_recognition.face_distance(known_encodings, encoding[0])
# # # # #             best_match_index = np.argmin(face_distances)
# # # # #             if matches[best_match_index]:
# # # # #                 face_identity = known_names[best_match_index]

# # # # #         prediction = np.zeros((1, 3))
# # # # #         test_speed = 0

# # # # #         for model_name in os.listdir(model_dir):
# # # # #             h_input, w_input, model_type, scale = parse_model_name(model_name)
# # # # #             param = {
# # # # #                 "org_img": image,
# # # # #                 "bbox": image_bbox,
# # # # #                 "scale": scale,
# # # # #                 "out_w": w_input,
# # # # #                 "out_h": h_input,
# # # # #                 "crop": True,
# # # # #             }
# # # # #             if scale is None:
# # # # #                 param["crop"] = False
# # # # #             img = image_cropper.crop(**param)
# # # # #             start = time.time()
# # # # #             prediction += model_test.predict(img, os.path.join(model_dir, model_name))
# # # # #             test_speed += time.time() - start

# # # # #         test_speed_total += test_speed
# # # # #         label = np.argmax(prediction)
# # # # #         value = prediction[0][label] / 2
# # # # #         if label == 1:
# # # # #             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
# # # # #             color = (0, 255, 0)
# # # # #         else:
# # # # #             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
# # # # #             color = (0, 0, 255)

# # # # #         print(f"[Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

# # # # #         cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
# # # # #         cv2.putText(image, result_text, (x, y - 10),
# # # # #                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

# # # # #     print("Total prediction time: {:.2f}s".format(test_speed_total))

# # # # #     format_ = os.path.splitext(image_name)[-1]
# # # # #     result_image_name = image_name.replace(format_, "_result" + format_)
# # # # #     cv2.imwrite(SAMPLE_IMAGE_PATH + result_image_name, image)


# # # # # if __name__ == "__main__":
# # # # #     desc = "Silent Face Anti-Spoofing + Recognition Test"
# # # # #     parser = argparse.ArgumentParser(description=desc)
# # # # #     parser.add_argument("--device_id", type=int, default=0, help="which gpu id, [0/1/2/3]")
# # # # #     parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
# # # # #     parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
# # # # #     args = parser.parse_args()

# # # # #     test(args.image_name, args.model_dir, args.device_id)


# # # # import os
# # # # import cv2
# # # # import numpy as np
# # # # import argparse
# # # # import warnings
# # # # import time
# # # # import pickle
# # # # import face_recognition # Consolidated for detection and encoding

# # # # from src.anti_spoof_predict import AntiSpoofPredict
# # # # from src.generate_patches import CropImage
# # # # from src.utility import parse_model_name

# # # # warnings.filterwarnings('ignore')

# # # # SAMPLE_IMAGE_PATH = "./images/sample/"

# # # # def load_known_faces(pkl_file="known_faces.pkl"):
# # # #     """
# # # #     Loads known face encodings and names from a pickle file.
# # # #     """
# # # #     try:
# # # #         with open(pkl_file, "rb") as f:
# # # #             known_faces = pickle.load(f)
# # # #     except FileNotFoundError:
# # # #         print(f"Error: {pkl_file} not found. Please ensure known faces are pre-processed.")
# # # #         return [], []

# # # #     known_face_encodings = []
# # # #     known_face_names = []

# # # #     for name, encodings in known_faces.items():
# # # #         known_face_encodings.extend(encodings)
# # # #         known_face_names.extend([name] * len(encodings))

# # # #     return known_face_encodings, known_face_names

# # # # def test(image_name, model_dir, device_id):
# # # #     """
# # # #     Performs face recognition and anti-spoofing on an image.
# # # #     """
# # # #     model_test = AntiSpoofPredict(device_id)
# # # #     image_cropper = CropImage()
# # # #     known_encodings, known_names = load_known_faces("known_faces.pkl")

# # # #     image = cv2.imread(os.path.join(SAMPLE_IMAGE_PATH, image_name))
# # # #     if image is None:
# # # #         print(f"Error: Could not load image {os.path.join(SAMPLE_IMAGE_PATH, image_name)}")
# # # #         return

# # # #     # --- OPTIMIZATION 1: Remove `check_image` or simplify if not strictly needed ---
# # # #     # Most deep learning models handle their own resizing. If this causes issues,
# # # #     # consider a single resize to a fixed, optimal resolution for the entire pipeline.
# # # #     # The original check_image forced a specific aspect ratio, which might not be ideal
# # # #     # for all input images or faster processing.

# # # #     # --- OPTIMIZATION 2: Consolidate Face Detection and Encoding ---
# # # #     # Convert image to RGB (face_recognition prefers RGB)
# # # #     rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# # # #     start_detection_encoding = time.time()
# # # #     # Use face_recognition to find all face locations and their encodings in one go
# # # #     face_locations = face_recognition.face_locations(rgb_image) # Detects faces
# # # #     face_encodings = face_recognition.face_encodings(rgb_image, face_locations) # Computes encodings for detected faces
# # # #     end_detection_encoding = time.time()
# # # #     print(f"Face Detection & Encoding Time: {end_detection_encoding - start_detection_encoding:.4f}s")

# # # #     print(f"Found {len(face_locations)} face(s) in image.")

# # # #     total_anti_spoof_time = 0
# # # #     total_face_processing_time = 0 # Includes recognition and anti-spoofing per face

# # # #     # --- OPTIMIZATION 3: Select a single Anti-Spoofing Model to use ---
# # # #     # The original code looped through ALL models for EACH face, which is very slow.
# # # #     # We should pick one primary model. For example, the one with a larger input size,
# # # #     # often indicated by model name, or a specific version known to be good.
# # # #     selected_model_path = None
# # # #     preferred_model_name_part = "3.2_160x160" # Example: choose a specific model if known
    
# # # #     available_models = os.listdir(model_dir)
# # # #     if not available_models:
# # # #         print(f"Error: No anti-spoofing models found in {model_dir}. Please check the path.")
# # # #         return

# # # #     # Prioritize a specific model if it exists
# # # #     for model_file in available_models:
# # # #         if preferred_model_name_part in model_file:
# # # #             selected_model_path = os.path.join(model_dir, model_file)
# # # #             break
    
# # # #     # Fallback: if preferred model not found, pick the largest one (heuristic)
# # # #     if selected_model_path is None:
# # # #         max_w_input = 0
# # # #         for model_file in available_models:
# # # #             try:
# # # #                 h_input, w_input, model_type, scale = parse_model_name(model_file)
# # # #                 if w_input > max_w_input:
# # # #                     max_w_input = w_input
# # # #                     selected_model_path = os.path.join(model_dir, model_file)
# # # #             except Exception as e:
# # # #                 # Handle cases where model_file might not be a valid model (e.g., .DS_Store)
# # # #                 # print(f"Warning: Could not parse model name {model_file}: {e}")
# # # #                 pass
    
# # # #     if selected_model_path is None:
# # # #         print("Error: No suitable anti-spoofing model found in the directory.")
# # # #         return

# # # #     # Parse parameters for the selected model once
# # # #     h_input_main, w_input_main, model_type_main, scale_main = parse_model_name(os.path.basename(selected_model_path))
# # # #     print(f"Using anti-spoofing model: {os.path.basename(selected_model_path)}")

# # # #     # Process each detected face
# # # #     for i, (top, right, bottom, left), encoding in zip(range(len(face_locations)), face_locations, face_encodings):
# # # #         start_face_processing = time.time()

# # # #         # Convert face_recognition's (top, right, bottom, left) to (x, y, w, h)
# # # #         x, y, w, h = left, top, right - left, bottom - top
# # # #         image_bbox = [x, y, w, h] # Used for anti-spoofing cropping

# # # #         # --- Face Recognition (comparison) ---
# # # #         face_identity = "Unknown"
# # # #         if len(known_encodings) > 0 and encoding is not None:
# # # #             # Compare with known faces
# # # #             matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
# # # #             if True in matches:
# # # #                 face_distances = face_recognition.face_distance(known_encodings, encoding)
# # # #                 best_match_index = np.argmin(face_distances)
# # # #                 if matches[best_match_index]:
# # # #                     face_identity = known_names[best_match_index]

# # # #         # --- Anti-Spoofing Prediction ---
# # # #         prediction = np.zeros((1, 3))
# # # #         anti_spoof_start_time = time.time()

# # # #         # Parameters for cropping specific to the selected model
# # # #         param = {
# # # #             "org_img": image,
# # # #             "bbox": image_bbox,
# # # #             "scale": scale_main,
# # # #             "out_w": w_input_main,
# # # #             "out_h": h_input_main,
# # # #             "crop": True,
# # # #         }
# # # #         if scale_main is None:
# # # #             param["crop"] = False
# # # #         img_cropped_for_spoof = image_cropper.crop(**param)

# # # #         # Perform prediction with the *single selected model*
# # # #         prediction += model_test.predict(img_cropped_for_spoof, selected_model_path)
        
# # # #         anti_spoof_speed = time.time() - anti_spoof_start_time
# # # #         total_anti_spoof_time += anti_spoof_speed

# # # #         label = np.argmax(prediction)
# # # #         value = prediction[0][label] / 2
# # # #         if label == 1:
# # # #             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
# # # #             color = (0, 255, 0)
# # # #         else:
# # # #             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
# # # #             color = (0, 0, 255)

# # # #         end_face_processing = time.time()
# # # #         single_face_total_time = end_face_processing - start_face_processing
# # # #         total_face_processing_time += single_face_total_time

# # # #         print(f"[Face {i + 1}] {result_text} - Anti-Spoof Time: {anti_spoof_speed:.4f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

# # # #         cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
# # # #         cv2.putText(image, result_text, (x, y - 10),
# # # #                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

# # # #     print(f"Total Anti-Spoofing Prediction Time (sum for all faces): {total_anti_spoof_time:.4f}s")
# # # #     print(f"Total Face Processing Time (including recognition & anti-spoofing for all faces): {total_face_processing_time:.4f}s")
# # # #     print(f"Overall processing time (excluding image load/save): {end_detection_encoding - start_detection_encoding + total_face_processing_time:.4f}s")

# # # #     format_ = os.path.splitext(image_name)[-1]
# # # #     result_image_name = image_name.replace(format_, "_result" + format_)
# # # #     cv2.imwrite(os.path.join(SAMPLE_IMAGE_PATH, result_image_name), image)


# # # # if __name__ == "__main__":
# # # #     desc = "Silent Face Anti-Spoofing + Recognition Test"
# # # #     parser = argparse.ArgumentParser(description=desc)
# # # #     parser.add_argument("--device_id", type=int, default=0, help="which gpu id, [0/1/2/3]")
# # # #     parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
# # # #     parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
# # # #     args = parser.parse_args()

# # # #     test(args.image_name, args.model_dir, args.device_id)

# # # import os
# # # import cv2
# # # import numpy as np
# # # import argparse
# # # import warnings
# # # import time
# # # import pickle
# # # import face_recognition

# # # # import dlib # No need to import dlib explicitly here, face_recognition handles it internally.

# # # from src.anti_spoof_predict import AntiSpoofPredict
# # # from src.generate_patches import CropImage
# # # from src.utility import parse_model_name

# # # warnings.filterwarnings('ignore')

# # # SAMPLE_IMAGE_PATH = "./images/sample/"

# # # def load_known_faces(pkl_file="known_faces.pkl"):
# # #     """
# # #     Loads known face encodings and names from a pickle file.
# # #     """
# # #     try:
# # #         with open(pkl_file, "rb") as f:
# # #             known_faces = pickle.load(f)
# # #     except FileNotFoundError:
# # #         print(f"Error: {pkl_file} not found. Please ensure known faces are pre-processed.")
# # #         return [], []

# # #     known_face_encodings = []
# # #     known_face_names = []

# # #     for name, encodings in known_faces.items():
# # #         known_face_encodings.extend(encodings)
# # #         known_face_names.extend([name] * len(encodings))

# # #     return known_face_encodings, known_face_names

# # # def test(image_name, model_dir, device_id):
# # #     """
# # #     Performs face recognition and anti-spoofing on an image, optimized for CPU.
# # #     """
# # #     # For CPU, ensure device_id is set to -1.
# # #     # AntiSpoofPredict's constructor likely handles this to use 'cpu' device.
# # #     model_test = AntiSpoofPredict(device_id) 
# # #     image_cropper = CropImage()
# # #     known_encodings, known_names = load_known_faces("known_faces.pkl")

# # #     image = cv2.imread(os.path.join(SAMPLE_IMAGE_PATH, image_name))
# # #     if image is None:
# # #         print(f"Error: Could not load image {os.path.join(SAMPLE_IMAGE_PATH, image_name)}")
# # #         return

# # #     rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# # #     # --- OPTIMIZATION FOR CPU: Downscale image for faster face detection ---
# # #     # This is CRUCIAL for CPU performance with dlib's HOG detector.
# # #     # A smaller factor means faster detection but might miss very small faces.
# # #     # Typical values: 0.25 (1/4th size) or 0.5 (1/2 size).
# # #     # Experiment to find the balance between speed and detection accuracy for your use case.
# # #     downscale_factor = 0.5 # Start with 0.5, try 0.25 if needed. Set to 1.0 to disable.
    
# # #     if downscale_factor < 1.0:
# # #         small_rgb_image = cv2.resize(rgb_image, (0, 0), fx=downscale_factor, fy=downscale_factor)
# # #     else:
# # #         small_rgb_image = rgb_image

# # #     start_detection_encoding = time.time()
# # #     # For CPU, always use the 'hog' model which is the default for face_recognition.
# # #     # The 'cnn' model is extremely slow on CPU and should be avoided unless you have a GPU.
# # #     face_locations = face_recognition.face_locations(small_rgb_image, model="hog")
# # #     # Face encodings are computed on the detected faces from the downscaled image
# # #     face_encodings = face_recognition.face_encodings(small_rgb_image, face_locations)
# # #     end_detection_encoding = time.time()
# # #     print(f"Face Detection & Encoding Time: {end_detection_encoding - start_detection_encoding:.4f}s")

# # #     print(f"Found {len(face_locations)} face(s) in image.")

# # #     # --- Adjust bounding box coordinates back to original image size ---
# # #     processed_face_locations = []
# # #     if downscale_factor < 1.0:
# # #         for (top, right, bottom, left) in face_locations:
# # #             top = int(top / downscale_factor)
# # #             right = int(right / downscale_factor)
# # #             bottom = int(bottom / downscale_factor)
# # #             left = int(left / downscale_factor)
# # #             processed_face_locations.append((top, right, bottom, left))
# # #     else:
# # #         processed_face_locations = face_locations


# # #     total_anti_spoof_time = 0
# # #     total_face_processing_time = 0

# # #     # --- OPTIMIZATION FOR CPU: Select the smallest Anti-Spoofing Model ---
# # #     # "2.7_80x80_MiniFASNetV2.pth" is usually the smallest and fastest for CPU.
# # #     # Prefer this one explicitly over larger models.
# # #     selected_model_path = None
# # #     preferred_model_name_part = "2.7_80x80" # Explicitly target the smallest model for CPU
    
# # #     available_models = os.listdir(model_dir)
# # #     if not available_models:
# # #         print(f"Error: No anti-spoofing models found in {model_dir}. Please check the path.")
# # #         return

# # #     # Prioritize the smallest model if it exists
# # #     for model_file in available_models:
# # #         if preferred_model_name_part in model_file:
# # #             selected_model_path = os.path.join(model_dir, model_file)
# # #             break
    
# # #     # Fallback: if preferred model not found, pick the smallest one available (heuristic)
# # #     if selected_model_path is None:
# # #         min_w_input = float('inf') # Initialize with a very large number
# # #         for model_file in available_models:
# # #             try:
# # #                 h_input, w_input, model_type, scale = parse_model_name(model_file)
# # #                 if w_input < min_w_input: # Find the smallest width model
# # #                     min_w_input = w_input
# # #                     selected_model_path = os.path.join(model_dir, model_file)
# # #             except Exception as e:
# # #                 # print(f"Warning: Could not parse model name {model_file}: {e}")
# # #                 pass # Ignore files that aren't valid model names
        
# # #     if selected_model_path is None:
# # #         print("Error: No suitable anti-spoofing model found in the directory.")
# # #         return

# # #     h_input_main, w_input_main, model_type_main, scale_main = parse_model_name(os.path.basename(selected_model_path))
# # #     print(f"Using anti-spoofing model: {os.path.basename(selected_model_path)}")

# # #     # Process each detected face
# # #     for i, (top, right, bottom, left), encoding in zip(range(len(processed_face_locations)), processed_face_locations, face_encodings):
# # #         start_face_processing = time.time()

# # #         # Convert face_recognition's (top, right, bottom, left) to (x, y, w, h)
# # #         x, y, w, h = left, top, right - left, bottom - top
# # #         image_bbox = [x, y, w, h] # Used for anti-spoofing cropping

# # #         # --- Face Recognition (comparison) ---
# # #         face_identity = "Unknown"
# # #         if len(known_encodings) > 0 and encoding is not None:
# # #             # Compare with known faces
# # #             matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
# # #             if True in matches:
# # #                 face_distances = face_recognition.face_distance(known_encodings, encoding)
# # #                 best_match_index = np.argmin(face_distances)
# # #                 if matches[best_match_index]:
# # #                     face_identity = known_names[best_match_index]

# # #         # --- Anti-Spoofing Prediction ---
# # #         prediction = np.zeros((1, 3))
# # #         anti_spoof_start_time = time.time()

# # #         # Parameters for cropping specific to the selected model
# # #         param = {
# # #             "org_img": image,
# # #             "bbox": image_bbox,
# # #             "scale": scale_main,
# # #             "out_w": w_input_main,
# # #             "out_h": h_input_main,
# # #             "crop": True,
# # #         }
# # #         if scale_main is None:
# # #             param["crop"] = False
# # #         img_cropped_for_spoof = image_cropper.crop(**param)

# # #         # Perform prediction with the *single selected model* on CPU
# # #         prediction += model_test.predict(img_cropped_for_spoof, selected_model_path)
        
# # #         anti_spoof_speed = time.time() - anti_spoof_start_time
# # #         total_anti_spoof_time += anti_spoof_speed

# # #         label = np.argmax(prediction)
# # #         value = prediction[0][label] / 2 # Assuming this normalization is correct for your model output
# # #         if label == 1:
# # #             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
# # #             color = (0, 255, 0)
# # #         else:
# # #             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
# # #             color = (0, 0, 255)

# # #         end_face_processing = time.time()
# # #         single_face_total_time = end_face_processing - start_face_processing
# # #         total_face_processing_time += single_face_total_time

# # #         print(f"[Face {i + 1}] {result_text} - Anti-Spoof Time: {anti_spoof_speed:.4f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

# # #         cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
# # #         cv2.putText(image, result_text, (x, y - 10),
# # #                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

# # #     print(f"Total Anti-Spoofing Prediction Time (sum for all faces): {total_anti_spoof_time:.4f}s")
# # #     print(f"Total Face Processing Time (including recognition & anti-spoofing for all faces): {total_face_processing_time:.4f}s")
# # #     print(f"Overall processing time (excluding image load/save): {end_detection_encoding - start_detection_encoding + total_face_processing_time:.4f}s")

# # #     format_ = os.path.splitext(image_name)[-1]
# # #     result_image_name = image_name.replace(format_, "_result" + format_)
# # #     cv2.imwrite(os.path.join(SAMPLE_IMAGE_PATH, result_image_name), image)


# # # if __name__ == "__main__":
# # #     desc = "Silent Face Anti-Spoofing + Recognition Test"
# # #     parser = argparse.ArgumentParser(description=desc)
# # #     # Set default device_id to -1 to explicitly target CPU.
# # #     # Your AntiSpoofPredict class should interpret -1 as "use CPU".
# # #     parser.add_argument("--device_id", type=int, default=-1, help="which device id, use -1 for CPU")
# # #     parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
# # #     parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
# # #     args = parser.parse_args()

# # #     test(args.image_name, args.model_dir, args.device_id)

# # import os
# # import cv2
# # import numpy as np
# # import argparse
# # import warnings
# # import time
# # import pickle
# # import face_recognition

# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name

# # warnings.filterwarnings('ignore')

# # SAMPLE_IMAGE_PATH = "./images/sample/"

# # def load_known_faces(pkl_file="known_faces.pkl"):
# #     """
# #     Loads known face encodings and names from a pickle file.
# #     """
# #     try:
# #         with open(pkl_file, "rb") as f:
# #             known_faces = pickle.load(f)
# #     except FileNotFoundError:
# #         print(f"Error: {pkl_file} not found. Please ensure known faces are pre-processed.")
# #         return [], []

# #     known_face_encodings = []
# #     known_face_names = []

# #     for name, encodings in known_faces.items():
# #         known_face_encodings.extend(encodings)
# #         known_face_names.extend([name] * len(encodings))

# #     return known_face_encodings, known_face_names

# # def test(image_name, model_dir, device_id):
# #     """
# #     Performs face recognition and anti-spoofing on an image, optimized for CPU.
# #     """
# #     # For CPU, ensure device_id is set to -1.
# #     model_test = AntiSpoofPredict(device_id) 
# #     image_cropper = CropImage()
# #     known_encodings, known_names = load_known_faces("known_faces.pkl")

# #     image = cv2.imread(os.path.join(SAMPLE_IMAGE_PATH, image_name))
# #     if image is None:
# #         print(f"Error: Could not load image {os.path.join(SAMPLE_IMAGE_PATH, image_name)}")
# #         return

# #     rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# #     # --- OPTIMIZATION FOR CPU: Downscale image for faster face detection ---
# #     # CRUCIAL for CPU performance. Recommended to try 0.25 or even 0.125
# #     # for significant speedup, but test accuracy on your dataset.
# #     downscale_factor = 0.5 # Adjusted to 0.25 for more aggressive optimization
    
# #     if downscale_factor < 1.0:
# #         small_rgb_image = cv2.resize(rgb_image, (0, 0), fx=downscale_factor, fy=downscale_factor)
# #     else:
# #         small_rgb_image = rgb_image

# #     # --- BREAKDOWN OF FACE DETECTION AND ENCODING TIME ---
# #     start_detection = time.time()
# #     # For CPU, always use the 'hog' model. Set number_of_times_to_upsample=0
# #     # to prevent dlib from upsampling the image multiple times for detection,
# #     # which is slow on CPU. This might miss smaller faces.
# #     face_locations = face_recognition.face_locations(small_rgb_image, model="hog", number_of_times_to_upsample=0)
# #     end_detection = time.time()
    
# #     start_encoding = time.time()
# #     face_encodings = face_recognition.face_encodings(small_rgb_image, face_locations)
# #     end_encoding = time.time()

# #     detection_time = end_detection - start_detection
# #     encoding_time = end_encoding - start_encoding
# #     total_det_enc_time = detection_time + encoding_time # Sum for overall comparison

# #     print(f"Face Detection Time (HOG, {downscale_factor*100}% scale, upsample=0): {detection_time:.4f}s")
# #     print(f"Face Encoding Time: {encoding_time:.4f}s")
# #     print(f"Total Face Detection & Encoding Time: {total_det_enc_time:.4f}s")

# #     print(f"Found {len(face_locations)} face(s) in image.")

# #     # --- Adjust bounding box coordinates back to original image size ---
# #     processed_face_locations = []
# #     if downscale_factor < 1.0:
# #         for (top, right, bottom, left) in face_locations:
# #             top = int(top / downscale_factor)
# #             right = int(right / downscale_factor)
# #             bottom = int(bottom / downscale_factor)
# #             left = int(left / downscale_factor)
# #             processed_face_locations.append((top, right, bottom, left))
# #     else:
# #         processed_face_locations = face_locations

# #     total_anti_spoof_time = 0
# #     total_face_processing_time = 0

# #     # --- OPTIMIZATION FOR CPU: Select the smallest Anti-Spoofing Model ---
# #     selected_model_path = None
# #     preferred_model_name_part = "2.7_80x80" 
    
# #     available_models = os.listdir(model_dir)
# #     if not available_models:
# #         print(f"Error: No anti-spoofing models found in {model_dir}. Please check the path.")
# #         return

# #     for model_file in available_models:
# #         if preferred_model_name_part in model_file:
# #             selected_model_path = os.path.join(model_dir, model_file)
# #             break
    
# #     if selected_model_path is None:
# #         min_w_input = float('inf') 
# #         for model_file in available_models:
# #             try:
# #                 h_input, w_input, model_type, scale = parse_model_name(model_file)
# #                 if w_input < min_w_input: 
# #                     min_w_input = w_input
# #                     selected_model_path = os.path.join(model_dir, model_file)
# #             except Exception as e:
# #                 pass 
        
# #     if selected_model_path is None:
# #         print("Error: No suitable anti-spoofing model found in the directory.")
# #         return

# #     h_input_main, w_input_main, model_type_main, scale_main = parse_model_name(os.path.basename(selected_model_path))
# #     print(f"Using anti-spoofing model: {os.path.basename(selected_model_path)}")

# #     # Process each detected face
# #     for i, (top, right, bottom, left), encoding in zip(range(len(processed_face_locations)), processed_face_locations, face_encodings):
# #         start_face_processing = time.time()

# #         x, y, w, h = left, top, right - left, bottom - top
# #         image_bbox = [x, y, w, h] 

# #         # --- Face Recognition (comparison) ---
# #         face_identity = "Unknown"
# #         if len(known_encodings) > 0 and encoding is not None:
# #             matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
# #             if True in matches:
# #                 face_distances = face_recognition.face_distance(known_encodings, encoding)
# #                 best_match_index = np.argmin(face_distances)
# #                 if matches[best_match_index]:
# #                     face_identity = known_names[best_match_index]

# #         # --- Anti-Spoofing Prediction ---
# #         prediction = np.zeros((1, 3))
# #         anti_spoof_start_time = time.time()

# #         param = {
# #             "org_img": image,
# #             "bbox": image_bbox,
# #             "scale": scale_main,
# #             "out_w": w_input_main,
# #             "out_h": h_input_main,
# #             "crop": True,
# #         }
# #         if scale_main is None:
# #             param["crop"] = False
# #         img_cropped_for_spoof = image_cropper.crop(**param)

# #         prediction += model_test.predict(img_cropped_for_spoof, selected_model_path)
        
# #         anti_spoof_speed = time.time() - anti_spoof_start_time
# #         total_anti_spoof_time += anti_spoof_speed

# #         label = np.argmax(prediction)
# #         value = prediction[0][label] / 2 
# #         if label == 1:
# #             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
# #             color = (0, 255, 0)
# #         else:
# #             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
# #             color = (0, 0, 255)

# #         end_face_processing = time.time()
# #         single_face_total_time = end_face_processing - start_face_processing
# #         total_face_processing_time += single_face_total_time

# #         print(f"[Face {i + 1}] {result_text} - Anti-Spoof Time: {anti_spoof_speed:.4f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

# #         cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
# #         cv2.putText(image, result_text, (x, y - 10),
# #                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

# #     print(f"Total Anti-Spoofing Prediction Time (sum for all faces): {total_anti_spoof_time:.4f}s")
# #     print(f"Total Face Processing Time (including recognition & anti-spoofing for all faces): {total_face_processing_time:.4f}s")
# #     # Overall processing time now sums the broken-down detection/encoding time
# #     print(f"Overall processing time (excluding image load/save): {total_det_enc_time + total_face_processing_time:.4f}s")

# #     format_ = os.path.splitext(image_name)[-1]
# #     result_image_name = image_name.replace(format_, "_result" + format_)
# #     cv2.imwrite(os.path.join(SAMPLE_IMAGE_PATH, result_image_name), image)


# # if __name__ == "__main__":
# #     desc = "Silent Face Anti-Spoofing + Recognition Test"
# #     parser = argparse.ArgumentParser(description=desc)
# #     parser.add_argument("--device_id", type=int, default=-1, help="which device id, use -1 for CPU")
# #     parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
# #     parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
# #     args = parser.parse_args()

# #     test(args.image_name, args.model_dir, args.device_id)

# import os
# import cv2
# import numpy as np
# import argparse
# import warnings
# import time
# import pickle
# import face_recognition

# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# SAMPLE_IMAGE_PATH = "./images/sample/"

# def load_known_faces(pkl_file="known_faces.pkl"):
#     """
#     Loads known face encodings and names from a pickle file.
#     """
#     try:
#         with open(pkl_file, "rb") as f:
#             known_faces = pickle.load(f)
#     except FileNotFoundError:
#         print(f"Error: {pkl_file} not found. Please ensure known faces are pre-processed.")
#         return [], []

#     known_face_encodings = []
#     known_face_names = []

#     for name, encodings in known_faces.items():
#         known_face_encodings.extend(encodings)
#         known_face_names.extend([name] * len(encodings))

#     return known_face_encodings, known_face_names

# def test(image_name, model_dir, device_id):
#     """
#     Performs face recognition and anti-spoofing on an image, optimized for CPU.
#     """
#     # For CPU, ensure device_id is set to -1.
#     model_test = AntiSpoofPredict(device_id) 
#     image_cropper = CropImage()
#     known_encodings, known_names = load_known_faces("known_faces.pkl")

#     image = cv2.imread(os.path.join(SAMPLE_IMAGE_PATH, image_name))
#     if image is None:
#         print(f"Error: Could not load image {os.path.join(SAMPLE_IMAGE_PATH, image_name)}")
#         return

#     rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

#     # --- OPTIMIZATION FOR CPU: Downscale image for faster face detection ---
#     # CRUCIAL for CPU performance. Recommended to try 0.25 or even 0.125
#     # for significant speedup, but test accuracy on your dataset.
#     # I'm setting it to 0.25 as an aggressive optimization for CPU.
#     downscale_factor = 0.5
    
#     if downscale_factor < 1.0:
#         small_rgb_image = cv2.resize(rgb_image, (0, 0), fx=downscale_factor, fy=downscale_factor)
#     else:
#         small_rgb_image = rgb_image

#     # --- BREAKDOWN OF FACE DETECTION AND ENCODING TIME ---
#     start_detection = time.time()
#     # For CPU, always use the 'hog' model. Set number_of_times_to_upsample=0
#     # to prevent dlib from upsampling the image multiple times for detection,
#     # which is slow on CPU. This might miss smaller faces.
#     face_locations = face_recognition.face_locations(small_rgb_image, model="hog", number_of_times_to_upsample=0)
#     end_detection = time.time()
    
#     start_encoding = time.time()
#     # --- OPTIMIZATION FOR CPU: Reduce num_jitters for faster face encoding ---
#     # Setting num_jitters to 0 means the encoding is calculated only once per face.
#     # This significantly speeds it up on CPU at a potential slight accuracy cost.
#     face_encodings = face_recognition.face_encodings(small_rgb_image, face_locations, num_jitters=0)
#     # face_encodings = face_recognition.batch_face_locations(small_rgb_image, number_of_times_to_upsample=0, batch_size=2)


#     end_encoding = time.time()

#     detection_time = end_detection - start_detection
#     encoding_time = end_encoding - start_encoding
#     total_det_enc_time = detection_time + encoding_time # Sum for overall comparison

#     print(f"Face Detection Time (HOG, {downscale_factor*100:.1f}% scale, upsample=0): {detection_time:.4f}s")
#     print(f"Face Encoding Time (num_jitters=0): {encoding_time:.4f}s")
#     print(f"Total Face Detection & Encoding Time: {total_det_enc_time:.4f}s")

#     print(f"Found {len(face_locations)} face(s) in image.")

#     # --- Adjust bounding box coordinates back to original image size ---
#     processed_face_locations = []
#     if downscale_factor < 1.0:
#         for (top, right, bottom, left) in face_locations:
#             top = int(top / downscale_factor)
#             right = int(right / downscale_factor)
#             bottom = int(bottom / downscale_factor)
#             left = int(left / downscale_factor)
#             processed_face_locations.append((top, right, bottom, left))
#     else:
#         processed_face_locations = face_locations

#     total_anti_spoof_time = 0
#     total_face_processing_time = 0

#     # --- OPTIMIZATION FOR CPU: Select the smallest Anti-Spoofing Model ---
#     selected_model_path = None
#     preferred_model_name_part = "2.7_80x80" 
    
#     available_models = os.listdir(model_dir)
#     if not available_models:
#         print(f"Error: No anti-spoofing models found in {model_dir}. Please check the path.")
#         return

#     for model_file in available_models:
#         if preferred_model_name_part in model_file:
#             selected_model_path = os.path.join(model_dir, model_file)
#             break
    
#     if selected_model_path is None:
#         min_w_input = float('inf') 
#         for model_file in available_models:
#             try:
#                 h_input, w_input, model_type, scale = parse_model_name(model_file)
#                 if w_input < min_w_input: 
#                     min_w_input = w_input
#                     selected_model_path = os.path.join(model_dir, model_file)
#             except Exception as e:
#                 pass 
        
#     if selected_model_path is None:
#         print("Error: No suitable anti-spoofing model found in the directory.")
#         return

#     h_input_main, w_input_main, model_type_main, scale_main = parse_model_name(os.path.basename(selected_model_path))
#     print(f"Using anti-spoofing model: {os.path.basename(selected_model_path)}")

#     # Process each detected face
#     for i, (top, right, bottom, left), encoding in zip(range(len(processed_face_locations)), processed_face_locations, face_encodings):
#         start_face_processing = time.time()

#         x, y, w, h = left, top, right - left, bottom - top
#         image_bbox = [x, y, w, h] 

#         # --- Face Recognition (comparison) ---
#         face_identity = "Unknown"
#         if len(known_encodings) > 0 and encoding is not None:
#             matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
#             if True in matches:
#                 face_distances = face_recognition.face_distance(known_encodings, encoding)
#                 best_match_index = np.argmin(face_distances)
#                 if matches[best_match_index]:
#                     face_identity = known_names[best_match_index]

#         # --- Anti-Spoofing Prediction ---
#         prediction = np.zeros((1, 3))
#         anti_spoof_start_time = time.time()

#         param = {
#             "org_img": image,
#             "bbox": image_bbox,
#             "scale": scale_main,
#             "out_w": w_input_main,
#             "out_h": h_input_main,
#             "crop": True,
#         }
#         if scale_main is None:
#             param["crop"] = False
#         img_cropped_for_spoof = image_cropper.crop(**param)

#         prediction += model_test.predict(img_cropped_for_spoof, selected_model_path)
        
#         anti_spoof_speed = time.time() - anti_spoof_start_time
#         total_anti_spoof_time += anti_spoof_speed

#         label = np.argmax(prediction)
#         value = prediction[0][label] / 2 
#         if label == 1:
#             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
#             color = (0, 255, 0)
#         else:
#             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
#             color = (0, 0, 255)

#         end_face_processing = time.time()
#         single_face_total_time = end_face_processing - start_face_processing
#         total_face_processing_time += single_face_total_time

#         print(f"[Face {i + 1}] {result_text} - Anti-Spoof Time: {anti_spoof_speed:.4f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

#         cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
#         cv2.putText(image, result_text, (x, y - 10),
#                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

#     print(f"Total Anti-Spoofing Prediction Time (sum for all faces): {total_anti_spoof_time:.4f}s")
#     print(f"Total Face Processing Time (including recognition & anti-spoofing for all faces): {total_face_processing_time:.4f}s")
#     print(f"Overall processing time (excluding image load/save): {total_det_enc_time + total_face_processing_time:.4f}s")

#     format_ = os.path.splitext(image_name)[-1]
#     result_image_name = image_name.replace(format_, "_result" + format_)
#     cv2.imwrite(os.path.join(SAMPLE_IMAGE_PATH, result_image_name), image)


# if __name__ == "__main__":
#     desc = "Silent Face Anti-Spoofing + Recognition Test"
#     parser = argparse.ArgumentParser(description=desc)
#     parser.add_argument("--device_id", type=int, default=-1, help="which device id, use -1 for CPU")
#     parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
#     parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
#     args = parser.parse_args()

#     test(args.image_name, args.model_dir, args.device_id)

import os
import cv2
import numpy as np
import argparse
import warnings
import time
import face_recognition
import psycopg2
from pgvector.psycopg2 import register_vector

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings("ignore")

SAMPLE_IMAGE_PATH = "./images/sample/"

def load_embeddings_from_postgres():
    conn = psycopg2.connect(
        dbname="defaultdb",
        user="avnadmin",
        password="AVNS_X7Gv-gc_chVFAaKGrLZ",
        host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
        port=10848,
        sslmode="require"
    )
    register_vector(conn)
    cur = conn.cursor()
    
    cur.execute("SELECT student_id, embedding FROM face_embeddings")
    rows = cur.fetchall()

    student_ids = []
    embeddings = []
    for row in rows:
        student_ids.append(row[0])
        embeddings.append(np.array(row[1]))

    cur.close()
    conn.close()

    return embeddings, student_ids

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def test(image_name, model_dir, device_id):
    model_test = AntiSpoofPredict(device_id) 
    image_cropper = CropImage()
    known_encodings, known_names = load_embeddings_from_postgres()

    image_path = os.path.join(SAMPLE_IMAGE_PATH, image_name)
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Lỗi: Không thể đọc ảnh {image_path}")
        return

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    downscale_factor = 0.5
    small_rgb_image = cv2.resize(rgb_image, (0, 0), fx=downscale_factor, fy=downscale_factor)

    start_detection = time.time()
    face_locations = face_recognition.face_locations(small_rgb_image, model="hog", number_of_times_to_upsample=0)
    end_detection = time.time()

    start_encoding = time.time()
    face_encodings = face_recognition.face_encodings(small_rgb_image, face_locations, num_jitters=0)
    end_encoding = time.time()

    detection_time = end_detection - start_detection
    encoding_time = end_encoding - start_encoding

    print(f"🧠 Face Detection: {detection_time:.4f}s | Encoding: {encoding_time:.4f}s")
    print(f"🔍 Found {len(face_locations)} face(s) in image.")

    processed_face_locations = []
    if downscale_factor < 1.0:
        for (top, right, bottom, left) in face_locations:
            processed_face_locations.append((
                int(top / downscale_factor),
                int(right / downscale_factor),
                int(bottom / downscale_factor),
                int(left / downscale_factor)
            ))
    else:
        processed_face_locations = face_locations

    # === Chọn model nhỏ nhất để chạy nhanh
    selected_model_path = None
    min_size = float('inf')
    for model_file in os.listdir(model_dir):
        try:
            h, w, mtype, scale = parse_model_name(model_file)
            if w < min_size:
                min_size = w
                selected_model_path = os.path.join(model_dir, model_file)
                selected_scale = scale
                selected_h, selected_w = h, w
        except:
            continue

    if not selected_model_path:
        print("❌ Không tìm thấy model chống giả phù hợp.")
        return

    print(f"🛡️ Anti-spoof model: {os.path.basename(selected_model_path)}")

    total_anti_spoof_time = 0
    for i, (top, right, bottom, left), encoding in zip(range(len(processed_face_locations)), processed_face_locations, face_encodings):
        x, y, w, h = left, top, right - left, bottom - top
        image_bbox = [x, y, w, h]

        face_identity = "Unknown"
        best_score = -1
        for known_vec, student_id in zip(known_encodings, known_names):
            score = cosine_similarity(encoding, known_vec)
            if score > best_score:
                best_score = score
                face_identity = student_id

        if best_score < 0.5:
            face_identity = "Unknown"

        param = {
            "org_img": image,
            "bbox": image_bbox,
            "scale": selected_scale,
            "out_w": selected_w,
            "out_h": selected_h,
            "crop": selected_scale is not None
        }

        start_spoof = time.time()
        cropped_img = image_cropper.crop(**param)
        prediction = model_test.predict(cropped_img, selected_model_path)
        end_spoof = time.time()

        total_anti_spoof_time += (end_spoof - start_spoof)

        label = np.argmax(prediction)
        spoof_score = prediction[0][label] / 2

        if label == 1:
            result_text = f"{face_identity} | RealFace Score: {spoof_score:.2f}"
            color = (0, 255, 0)
        else:
            result_text = f"{face_identity} | FAKE | Score: {spoof_score:.2f}"
            color = (0, 0, 255)

        print(f"[Face {i + 1}] {result_text} - Cosine: {best_score:.2f} - BBox: x={x}, y={y}, w={w}, h={h}")

        cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
        cv2.putText(image, result_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    print(f"🕒 Total Anti-Spoof Time: {total_anti_spoof_time:.4f}s")

    result_image_path = os.path.join(SAMPLE_IMAGE_PATH, image_name.replace(".", "_result."))
    cv2.imwrite(result_image_path, image)
    print(f"💾 Saved result to: {result_image_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Silent Face Recognition + Anti-Spoofing")
    parser.add_argument("--device_id", type=int, default=-1, help="Device ID (-1 for CPU)")
    parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="Path to anti-spoofing models")
    parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="Input image file name")
    args = parser.parse_args()

    test(args.image_name, args.model_dir, args.device_id)
