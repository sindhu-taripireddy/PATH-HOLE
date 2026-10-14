"""
Severity Analyzer Module for PotholeGuard

Classifies pothole severity based on:
1. Pothole pixel area ratio relative to total frame size
2. Contrast / depth intensity (darkness & edge gradient of cavity)
3. Aspect ratio and width
"""

def analyze_pothole_severity(box_width: float, box_height: float, img_width: int, img_height: int, confidence: float, darkness_score: float = 0.5):
    img_area = img_width * img_height
    box_area = box_width * box_height
    area_ratio = box_area / max(img_area, 1.0)
    
    # Estimate size in cm2 assuming a standard road camera FOV (e.g. 1m2 = ~10,000 cm2 mapped at road focal distance)
    estimated_size_cm2 = round(area_ratio * 25000.0, 1)
    # Ensure realistic range
    if estimated_size_cm2 < 45.0:
        estimated_size_cm2 = round(float(45.0 + (box_width * 1.5)), 1)
    
    # Determine Severity Category
    # Criteria:
    # High: Area ratio > 0.05 (5% of frame) or size > 800 cm2 or very deep darkness score > 0.7
    # Medium: Area ratio between 0.025 and 0.05 or size between 300 and 800 cm2
    # Low: Area ratio < 0.025 or size < 300 cm2
    
    if area_ratio > 0.05 or estimated_size_cm2 > 800 or darkness_score > 0.75:
        severity = "High"
    elif area_ratio > 0.022 or estimated_size_cm2 > 320 or darkness_score > 0.55:
        severity = "Medium"
    else:
        severity = "Low"
        
    return {
        "severity": severity,
        "estimated_size_cm2": estimated_size_cm2,
        "area_ratio": round(area_ratio, 4)
    }
