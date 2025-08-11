import cv2
import os

# Function to capture and save an image with a filename based on the entered name
def registerFace(name):
    # Create "K15-CNTT4" folder if it doesn't exist
    if not os.path.exists('K15-CNTT4'):
        os.makedirs('K15-CNTT4')

    # Create a subfolder inside "K15-CNTT4" with the entered name
    folder_path = f'K15-CNTT4/{name}'
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Open webcam (0 is the default camera)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Cannot open the camera.")
        return

    image_count = 0
    max_images = 1  # Capture only 1 image

    while True:
        ret, frame = cap.read()  # Read frame from webcam
        
        if not ret:
            print("Failed to grab frame.")
            break

        # Display the current frame
        cv2.imshow('Press C to capture, S to exit', frame)

        # Listen for key events
        key = cv2.waitKey(1) & 0xFF

        if key == ord('c'):  # Press 'c' to capture
            file_name = f"{folder_path}/{image_count}.png"  # File name
            cv2.imwrite(file_name, frame)  # Save image to file
            
            print(f"Saved: {file_name}")
            
            image_count += 1
            if image_count >= max_images:
                print(f"Captured {max_images} image(s).")
                break

        elif key == ord('s'):  # Press 's' to exit
            print("Exiting the program.")
            break

    # Release the camera and close all windows
    cap.release()
    cv2.destroyAllWindows()

# Prompt the user to enter a name
name_input = input("Enter a name for the image set: ")
registerFace(name_input)
