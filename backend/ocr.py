import re
from typing import Dict, Any, List, Tuple

import easyocr


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
}

POS_TOTAL_HINTS = {
    "grand total",
    "net total",
    "total",
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
    for idx, line in enumerate(lines):
        text = line["text"]
        if line_has_pos_total(text):
            # Extract last amount on the line
            found_amount = None
            for pat in amt_patterns:
                matches = list(pat.finditer(text))
                if matches:
                    found_amount = matches[-1].group(1)
            if found_amount:
                val = _normalize_amount_str(found_amount)
                candidates.append({
                    "index": idx,
                    "y": line["y"],
                    "text": text,
                    "amount_text": found_amount,
                    "amount": val,
                })

    # Prefer the candidate nearest to the bottom of the receipt
    if candidates:
        candidates.sort(key=lambda c: (c["y"], c["amount"]))
        best = candidates[-1]
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
    
    # Define keywords for different bill types
    receipt_patterns = {
        "grocery": ["supermarket", "grocery", "mart", "fresh", "organic", "vegetables", "fruits"],
        "restaurant": ["restaurant", "cafe", "coffee", "dining", "food", "bistro", "diner", "pizza", "burger"],
        "fuel": ["gas", "petrol", "fuel", "diesel", "oil", "gallons", "liters", "pump"],
        "utilities": ["electricity", "water", "gas bill", "utility", "kwh", "consumption"],
        "pharmacy": ["pharmacy", "medical", "rx", "prescription", "medicine", "health"],
        "transportation": ["taxi", "uber", "lyft", "transport", "ride", "fare", "metro", "bus"],
        "shopping": ["store", "shop", "retail", "mall", "purchase", "sale"],
        "online": ["amazon", "ebay", "online", "order", "delivery", "shipping"],
    }
    
    detected = []
    for bill_type, keywords in receipt_patterns.items():
        if any(kw in text_lower for kw in keywords):
            detected.append(bill_type)
    
    if not detected:
        detected.append("general")
    
    return {
        "type": detected[0] if len(detected) == 1 else "mixed",
        "all_types": detected,
        "confidence": "high" if len(detected) == 1 else "medium" if detected else "low"
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
    # Common date patterns
    patterns = [
        r'\b(\d{4}[-/]\d{2}[-/]\d{2})\b',  # YYYY-MM-DD
        r'\b(\d{2}[-/]\d{2}[-/]\d{4})\b',  # DD-MM-YYYY or MM-DD-YYYY
        r'\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b',  # 15 Jan 2025
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return ""


def extract_text_and_fields(image_path: str) -> Dict[str, Any]:
    """Run EasyOCR and return both raw text and parsed fields (like total, vendor, type)."""
    reader = easyocr.Reader(['en'])
    detailed = reader.readtext(image_path, detail=1)  # [(bbox, text, conf), ...]
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


def extract_text_and_fields(image_path: str) -> Dict[str, Any]:
    """Run EasyOCR and return both raw text and parsed fields (like total)."""
    reader = easyocr.Reader(['en'])
    detailed = reader.readtext(image_path, detail=1)  # [(bbox, text, conf), ...]
    # Build plain text (joined by newlines to preserve some structure)
    plain_text = "\n".join([t for (_, t, _) in detailed])
    lines = _group_into_lines(detailed)
    total = _extract_total_from_lines(lines)
    return {
        "text": plain_text,
        "lines": lines,
        "fields": {
            "total": total,
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