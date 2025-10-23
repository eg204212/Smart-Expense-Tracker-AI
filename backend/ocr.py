import easyocr

def extract_text_from_image(image_path):
    """
    Extract text from an image using EasyOCR.

    :param image_path: Path to the image file.
    :return: Extracted text as a string.
    """
    try:
        reader = easyocr.Reader(['en'])  # Initialize EasyOCR with English language
        result = reader.readtext(image_path, detail=0)  # Extract text without bounding box details
        return " ".join(result)  # Combine the extracted text into a single string
    except Exception as e:
        return f"Error: {str(e)}"