import logging
from app.schemas.analysis import SecurityDetails

logger = logging.getLogger("webdoctor")

async def analyze_security(url: str, headers: dict) -> tuple[SecurityDetails, int]:
    """
    Analyzes website security headers and transport layer, generating a security score.
    Returns SecurityDetails and an integer score (0-100).
    """
    score = 100
    missing_headers = []
    
    # 1. Transport Layer Security (HTTPS)
    https_enabled = url.lower().startswith("https://")
    if not https_enabled:
        score -= 40
        missing_headers.append("HTTPS Protocol")
        
    # Standard security headers (keys in lowercase because headers dict is normalized)
    headers_lower = {k.lower(): v for k, v in headers.items()}
    
    # 2. Strict-Transport-Security (HSTS)
    hsts_enabled = "strict-transport-security" in headers_lower
    if not hsts_enabled:
        if https_enabled:
            score -= 15
        missing_headers.append("Strict-Transport-Security (HSTS)")
        
    # 3. Content-Security-Policy (CSP)
    csp_enabled = "content-security-policy" in headers_lower
    if not csp_enabled:
        score -= 15
        missing_headers.append("Content-Security-Policy (CSP)")
        
    # 4. X-Frame-Options
    x_frame = headers_lower.get("x-frame-options")
    if not x_frame:
        score -= 10
        missing_headers.append("X-Frame-Options")
        
    # 5. Referrer-Policy
    referrer_policy = headers_lower.get("referrer-policy")
    if not referrer_policy:
        score -= 5
        missing_headers.append("Referrer-Policy")
        
    # 6. X-XSS-Protection
    xss_protect = headers_lower.get("x-xss-protection")
    if not xss_protect:
        score -= 5
        missing_headers.append("X-XSS-Protection")
        
    # 7. X-Content-Type-Options (crucial web header)
    x_content_type = headers_lower.get("x-content-type-options")
    if not x_content_type:
        score -= 10
        missing_headers.append("X-Content-Type-Options")
        
    # 8. Secure Cookies Flag
    secure_cookies = True
    cookie_headers = [v for k, v in headers_lower.items() if k == "set-cookie"]
    for cookie in cookie_headers:
        cookie_low = cookie.lower()
        if "secure" not in cookie_low or "httponly" not in cookie_low:
            secure_cookies = False
            score -= 5
            break
            
    # Final clamping
    score = max(0, min(100, score))
    
    details = SecurityDetails(
        https_enabled=https_enabled,
        hsts_enabled=hsts_enabled,
        csp_enabled=csp_enabled,
        x_frame_options=x_frame,
        referrer_policy=referrer_policy,
        xss_protection=xss_protect,
        missing_headers=missing_headers,
        secure_cookies=secure_cookies
    )
    
    return details, score
