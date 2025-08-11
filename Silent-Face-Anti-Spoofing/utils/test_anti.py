import cv2
import numpy as np
import time
import os
import warnings

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name
warnings.filterwarnings('ignore')

def check_image(image):
    height, width, _ = image.shape
    return width / height == 3 / 4

def process_frame(frame, model_test, image_cropper, model_dir):
    prediction = np.zeros((1, 3))
    image_bbox = model_test.get_bbox(frame)
    
    for model_name in os.listdir(model_dir):
        h_input, w_input, model_type, scale = parse_model_name(model_name)
        param = {
            "org_img": frame,
            "bbox": image_bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }
        if scale is None:
            param["crop"] = False
        img = image_cropper.crop(**param)

        start = time.time()
        prediction += model_test.predict(img, os.path.join(model_dir, model_name))
        
    label = np.argmax(prediction)
    value = prediction[0][label] / 2
    
    if label == 1:
        result_text = "Real Face: {:.2f}".format(value)
        color = (0, 255, 0)
    else:
        result_text = "Fake Face: {:.2f}".format(value)
        color = (0, 0, 255)
    
    # Vẽ kết quả lên khung hình
    cv2.rectangle(frame, (image_bbox[0], image_bbox[1]), 
                  (image_bbox[0] + image_bbox[2], image_bbox[1] + image_bbox[3]), color, 2)
    cv2.putText(frame, result_text, (image_bbox[0], image_bbox[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    return frame

if __name__ == "__main__":
    model_dir = "./resources/anti_spoof_models"
    device_id = 0  # GPU ID
    model_test = AntiSpoofPredict(device_id)
    image_cropper = CropImage()

    cap = cv2.VideoCapture(0)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = process_frame(frame, model_test, image_cropper, model_dir)
        cv2.imshow("Anti-Spoofing Detection", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()