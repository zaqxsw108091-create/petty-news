#!/usr/bin/env python3
from PIL import Image
import os

downloads_folder = os.path.expanduser("~\\Downloads")
project_folder = os.path.dirname(os.path.abspath(__file__))
output_folder = os.path.join(project_folder, "screenshots")

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# TOSS spec resolution
target_width = 636
target_height = 1048

# Find and process Toss screenshots
screenshots = [
    "Screenshot_20260824_231305_Toss.jpg",
    "Screenshot_20260824_231319_Toss.jpg",
    "Screenshot_20260824_235618_Toss.jpg"
]

for screenshot in screenshots:
    input_path = os.path.join(downloads_folder, screenshot)
    if not os.path.exists(input_path):
        print(f"[SKIP] {screenshot} not found")
        continue
    
    try:
        img = Image.open(input_path)
        
        # Resize with aspect ratio preservation and padding if needed
        img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Create a new image with the target size and paste the resized image
        result = Image.new("RGB", (target_width, target_height), (255, 255, 255))
        x = (target_width - img.width) // 2
        y = (target_height - img.height) // 2
        result.paste(img, (x, y))
        
        # Save to project folder
        output_name = screenshot.replace(".jpg", ".png")
        output_path = os.path.join(output_folder, output_name)
        result.save(output_path, "PNG")
        
        print(f"[OK] {screenshot} -> {output_name} ({target_width}x{target_height})")
    except Exception as e:
        print(f"[ERROR] {screenshot}: {e}")

print(f"\n[DONE] Screenshots saved to: {output_folder}")
