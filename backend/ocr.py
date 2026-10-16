import re
from typing import Any, Dict, List, Tuple

import easyocr
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance


def _amount_regexps() -> List[re.Pattern]:
    """Common regex patterns to capture currency amounts in various locales."""
    patterns = [
        # e.g., Rs 1,234.56 or LKR 1,234.56 or $1,234.56 or €1.234,56
        r"(?:\b(?:rs\.?|lkr|usd|eur|gbp|inr|aed|sar)\b)?\s*[\$₹£€]?[\s]*([0-9]{1,3}(?:[ ,][0-9]{3})*(?:[\.,][0-9]{2})|[0-9]+(?:[\.,][0-9]{2}))",
        # plain number with decimals
        r"\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})\b",
        # some locales use comma decimal
        r"\b([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2}))\b",
    ]
    return [re.compile(p, re.IGNORECASE) for p in patterns]


NEG_TOTAL_HINTS = {
    "subtotal",
    "sub total",
    "total items",
    "total qty",
    "total quantity",
    "total points",
    "total savings",
    "savings total",
    "tax total",
    "item total",
}

POS_TOTAL_HINTS = {
    "grand total",
    "net total",
    "total",
    "gross amount",
    "amount",
    "amount due",
    "amount payable",
    "balance due",
    "total due",
    "cash total",
    "bill total",
}


def _normalize_amount_str(s: str) -> float:
    """Convert an extracted amount string into a float, handling ,/. separators."""
    s = s.strip()
    # If both comma and dot appear, assume comma is thousands and dot is decimals (en-US)
    if "," in s and "." in s:
        s = s.replace(",", "")
    else:
        # If only comma appears, it's likely decimal in EU formats
        if "," in s and "." not in s:
            s = s.replace(".", "").replace(",", ".")
        else:
            # Only dots present: already decimal
            s = s.replace(",", "")
    try:
        return float(s)
    except Exception:
        return 0.0


def _group_into_lines(detailed: List[Tuple[List[Tuple[int, int]], str, float]]) -> List[Dict[str, Any]]:
    """Group OCR results into logical lines using the y-center of each box."""
    lines: List[Dict[str, Any]] = []
    # Compute y center for each detection
    items = []
    for bbox, text, conf in detailed:
        try:
            ys = [p[1] for p in bbox]
            y_center = sum(ys) / len(ys)
        except Exception:
            y_center = 0
        items.append({"y": y_center, "text": text, "conf": conf})
    # Sort top to bottom
    items.sort(key=lambda x: x["y"])
    # Merge items that are close in y into lines
    threshold = 10  # pixels
    current_line: List[Dict[str, Any]] = []
    for it in items:
        if not current_line:
            current_line = [it]
            continue
        if abs(it["y"] - current_line[-1]["y"]) <= threshold:
            current_line.append(it)
        else:
            # flush
            line_text = " ".join(tok["text"] for tok in current_line)
            lines.append({
                "y": sum(tok["y"] for tok in current_line) / len(current_line),
                "text": line_text.strip(),
                "tokens": current_line,
            })
            current_line = [it]
    if current_line:
        line_text = " ".join(tok["text"] for tok in current_line)
        lines.append({
            "y": sum(tok["y"] for tok in current_line) / len(current_line),
            "text": line_text.strip(),
            "tokens": current_line,
        })
    return lines


def _extract_total_from_lines(lines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Heuristically extract the grand total from OCR lines."""
    amt_patterns = _amount_regexps()

    def line_has_pos_total(line_text: str) -> bool:
        lt = line_text.lower()
        if any(h in lt for h in NEG_TOTAL_HINTS):
            return False
        return any(h in lt for h in POS_TOTAL_HINTS)

    candidates = []
    all_amounts: Dict[float, int] = {}
    for idx, line in enumerate(lines):
        text = line["text"]
        for pat in amt_patterns:
            for match in pat.finditer(text):
                amount_value = _normalize_amount_str(match.group(1))
                if 0.05 <= amount_value <= 1000000:
                    all_amounts[amount_value] = all_amounts.get(amount_value, 0) + 1
        if line_has_pos_total(text):
            # Extract the most likely amount on the line. Prefer a currency-tagged amount,
            # otherwise take the last amount on the total-like line.
            found_amount = None
            for pat in amt_patterns:
                matches = list(pat.finditer(text))
                if matches:
                    found_amount = matches[-1].group(1)
                    break
            if found_amount:
                val = _normalize_amount_str(found_amount)
                candidates.append({
                    "index": idx,
                    "y": line["y"],
                    "text": text,
                    "amount_text": found_amount,
                    "amount": val,
                })

    # Prefer the amount that repeats most across total-like lines. This helps when a
    # single OCR pass misreads one digit on only one line, but the same value appears
    # again on another total/amount line.
    if candidates:
        votes: Dict[float, List[Dict[str, Any]]] = {}
        for candidate in candidates:
            votes.setdefault(candidate["amount"], []).append(candidate)

        best_amount = max(
            votes.items(),
            key=lambda item: (
                all_amounts.get(item[0], 0),
                len(item[1]),
                max(candidate["y"] for candidate in item[1]),
                item[0],
            ),
        )[0]
        best_candidates = votes[best_amount]
        best = max(best_candidates, key=lambda c: c["y"])
        return {
            "amount": best["amount"],
            "amount_text": best["amount_text"],
            "line_index": best["index"],
            "line_text": best["text"],
            "strategy": "keyword_bottommost",
        }

    # Fallback: choose the maximum plausible amount across all lines
    max_amt = 0.0
    max_info = None
    for idx, line in enumerate(lines):
        text = line["text"]
        # Skip obvious non-amount lines
        if re.search(r"\b(visa|mastercard|amex|card|auth|approval|invoice|gst|vat|tax|tel|phone)\b", text, re.I):
            continue
        for pat in amt_patterns:
            for m in pat.finditer(text):
                val = _normalize_amount_str(m.group(1))
                # Heuristic: ignore very small or very large unrealistic numbers
                if 0.05 <= val <= 1000000:
                    if val >= max_amt:
                        max_amt = val
                        max_info = {
                            "amount": val,
                            "amount_text": m.group(1),
                            "line_index": idx,
                            "line_text": text,
                            "strategy": "global_max",
                        }
    return max_info or {}


def _detect_receipt_type(text: str, lines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detect the type of receipt/bill based on keywords."""
    text_lower = text.lower()

    # Score receipt types by signals across the whole receipt.
    # We deliberately downweight the first line so a vendor name like "Spice Store"
    # does not override stronger body signals such as "Take Away" or itemized food lines.
    receipt_patterns = {
        "grocery": ["supermarket", "grocery", "mart", "fresh", "organic", "vegetables", "fruits"],
        "restaurant": ["restaurant", "cafe", "coffee", "dining", "food", "bistro", "diner", "pizza", "burger", "take away", "takeaway", "take-out", "take out", "meal", "lunch", "dinner", "breakfast", "snack"],
        "fuel": ["gas", "petrol", "fuel", "diesel", "oil", "gallons", "liters", "pump"],
        "utilities": ["electricity", "water", "gas bill", "utility", "kwh", "consumption"],
        "pharmacy": ["pharmacy", "medical", "rx", "prescription", "medicine", "health"],
        "transportation": ["taxi", "uber", "lyft", "transport", "ride", "fare", "metro", "bus"],
        "shopping": ["store", "shop", "retail", "mall", "purchase", "sale", "superstore"],
        "online": ["amazon", "ebay", "online", "order", "delivery", "shipping"],
    }

    scores = {key: 0.0 for key in receipt_patterns}
    line_texts = [line.get("text", "") for line in lines if line.get("text")]

    for idx, line_text in enumerate(line_texts):
        line_lower = line_text.lower()
        weight = 0.6 if idx == 0 else 1.0
        for bill_type, keywords in receipt_patterns.items():
            for keyword in keywords:
                if keyword in line_lower:
                    scores[bill_type] += weight

    detected = [bill_type for bill_type, score in sorted(scores.items(), key=lambda item: item[1], reverse=True) if score > 0]

    if not detected:
        detected.append("general")

    best_type = detected[0]
    best_score = scores.get(best_type, 0.0)
    second_score = scores.get(detected[1], 0.0) if len(detected) > 1 else 0.0

    if best_score == 0:
        confidence = "low"
    elif best_score >= second_score + 1:
        confidence = "high"
    else:
        confidence = "medium"

    return {
        "type": best_type if best_type != "general" else "general",
        "all_types": detected,
        "confidence": confidence,
    }


def _extract_vendor(text: str, lines: List[Dict[str, Any]]) -> str:
    """Extract vendor/merchant name (typically first few lines, all caps)."""
    if not lines:
        return ""
    
    # Look at first 3 lines for all-caps vendor names
    for i in range(min(3, len(lines))):
        line_text = lines[i]["text"].strip()
        # Vendor names often ALL CAPS and longer than 3 chars
        if line_text.isupper() and len(line_text) > 3:
            # Remove common noise
            clean = re.sub(r'[^A-Z\s]', '', line_text).strip()
            if len(clean) >= 3:
                return clean
    
    # Fallback: take first non-empty line
    for line in lines[:3]:
        text = line["text"].strip()
        if len(text) > 2:
            return text.split()[0]  # First word
    
    return ""


def _extract_date(text: str) -> str:
    """Extract date from receipt."""
    normalized_text = re.sub(r"\s+", " ", text)
    # Common date patterns
    patterns = [
        r'\b(\d{4}[-/]\d{2}[-/]\d{2})\b',  # YYYY-MM-DD
        r'\b(\d{2}[-/]\d{2}[-/]\d{4})\b',  # DD-MM-YYYY or MM-DD-YYYY
        r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2})\b',  # DD/MM/YY or MM/DD/YY
        r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?)\b',  # Nov 18, 2020 4:46:35 PM
        r'\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?)\b',  # 18 Nov 2020 4:46 PM
    ]
    
    for pattern in patterns:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            raw_date = match.group(1)
            for date_format in (
                "%Y-%m-%d",
                "%d-%m-%Y",
                "%d/%m/%Y",
                "%m/%d/%Y",
                "%d/%m/%y",
                "%m/%d/%y",
                "%d %b %Y %I:%M:%S %p",
                "%d %b %Y %I:%M %p",
                "%d %b %Y",
                "%b %d, %Y %I:%M:%S %p",
                "%b %d, %Y %I:%M %p",
                "%b %d, %Y",
            ):
                try:
                    return __import__("datetime").datetime.strptime(raw_date, date_format).strftime("%Y-%m-%d")
                except Exception:
                    continue
            return raw_date
    
    return ""


def _preprocess_image(image_path: str):
    """Create a higher-contrast temporary image for OCR."""
    try:
        image = Image.open(image_path).convert("L")
    except Exception:
        return image_path

    image = ImageOps.autocontrast(image)
    image = ImageEnhance.Sharpness(image).enhance(1.5)
    image = image.filter(ImageFilter.MedianFilter(size=3))
    image = image.filter(ImageFilter.SHARPEN)

    array = np.array(image)
    threshold = float(array.mean())
    binary = (array > threshold).astype(np.uint8) * 255

    if binary.mean() > 245:
        # Very bright receipts can lose detail after thresholding, so keep the grayscale image.
        return np.array(image)

    return binary


def _run_easyocr(image_path: str):
    """Run OCR on the original image and a lightly preprocessed variant."""
    reader = easyocr.Reader(['en'], gpu=False)

    original = reader.readtext(image_path, detail=1, paragraph=False)
    processed_image = _preprocess_image(image_path)

    if isinstance(processed_image, str):
        processed = []
    else:
        processed = reader.readtext(processed_image, detail=1, paragraph=False)

    if not processed:
        return original

    # Keep both passes and deduplicate by text while preserving confidence.
    merged: List[Tuple[List[Tuple[int, int]], str, float]] = []
    seen = set()
    for bbox, text, conf in original + processed:
        normalized = re.sub(r'\s+', ' ', text).strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        merged.append((bbox, text, conf))

    return merged or original


def extract_text_and_fields(image_path: str) -> Dict[str, Any]:
    """Run EasyOCR and return both raw text and parsed fields."""
    detailed = _run_easyocr(image_path)

    if not detailed:
        return {
            "text": "",
            "lines": [],
            "fields": {
                "total": {},
                "receipt_type": {"type": "general", "all_types": ["general"], "confidence": "low"},
                "vendor": "",
                "date": "",
            },
        }

    # Build plain text (joined by newlines to preserve some structure)
    plain_text = "\n".join([t for (_, t, _) in detailed])
    lines = _group_into_lines(detailed)
    total = _extract_total_from_lines(lines)
    receipt_type = _detect_receipt_type(plain_text, lines)
    vendor = _extract_vendor(plain_text, lines)
    date = _extract_date(plain_text)
    
    return {
        "text": plain_text,
        "lines": lines,
        "fields": {
            "total": total,
            "receipt_type": receipt_type,
            "vendor": vendor,
            "date": date,
        },
    }


def extract_text_from_image(image_path):
    """
    Backward-compatible helper that returns only the flattened text.
    """
    try:
        data = extract_text_and_fields(image_path)
        return data.get("text", "")
    except Exception as e:
        return f"Error: {str(e)}"
