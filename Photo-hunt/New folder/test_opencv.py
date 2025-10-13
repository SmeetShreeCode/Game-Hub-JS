import cv2

# Load an image (make sure you have an image file in the same folder)
image = cv2.imread("test.png")

# Show the image
cv2.imshow("Test Image", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
