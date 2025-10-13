from PIL import Image, ImageChops
import numpy as np
import matplotlib.pyplot as plt

# Load your images
image1 = Image.open("D:/Learning/Game-Hub/images/Photo-hunt/Left/L61.jpg").convert("RGB")
image2 = Image.open("D:/Learning/Game-Hub/images/Photo-hunt/Right/R61.jpg").convert("RGB")

# Resize if needed to ensure both are the same size
image1 = image1.resize(image2.size)

# Find difference
diff = ImageChops.difference(image1, image2)

# Convert to numpy array
diff_np = np.array(diff)

# Threshold to detect significant differences
threshold = 30  # Tune this if needed
diff_coords = np.argwhere(np.sum(diff_np, axis=2) > threshold)

# Get bounding box of difference
if diff_coords.size > 0:
    top_left = diff_coords.min(axis=0)[::-1]  # (x, y)
    bottom_right = diff_coords.max(axis=0)[::-1]
    print("Top-left corner of difference:", top_left)
    print("Bottom-right corner of difference:", bottom_right)
else:
    print("No significant difference found.")

# (Optional) Show the diff with bounding box
fig, ax = plt.subplots()
ax.imshow(diff)
rect = plt.Rectangle(top_left, bottom_right[0] - top_left[0], bottom_right[1] - top_left[1],
                     edgecolor='red', facecolor='none', linewidth=2)
ax.add_patch(rect)
plt.title("Difference Highlighted")
plt.axis('off')
plt.show()
