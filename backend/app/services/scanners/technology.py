import logging
from app.schemas.analysis import SEODetails

logger = logging.getLogger("webdoctor")

# Custom signature-matching technology detector
TECHNOLOGY_SIGNATURES = {
    # Frontend Frameworks & Libraries
    "Next.js": {
        "html": ["_next/static", "__NEXT_DATA__"],
        "headers": {"x-powered-by": "Next.js"}
    },
    "React": {
        "html": ["react.development.js", "react.production.min.js", "data-reactroot", "_next/static"]
    },
    "Vue.js": {
        "html": ["vue.js", "vue.min.js", "v-cloak", "data-v-"]
    },
    "Angular": {
        "html": ["ng-version", "ng-app", "ng-controller"]
    },
    "Svelte": {
        "html": ["svelte-", "__svelte"]
    },
    "jQuery": {
        "html": ["jquery.js", "jquery.min.js", "jquery-ui"]
    },
    "Alpine.js": {
        "html": ["x-data", "x-init", "x-show"]
    },
    
    # CSS Frameworks
    "TailwindCSS": {
        "html": ["tailwind.css", "tailwind.min.css", "_next/static/css"]
    },
    "Bootstrap": {
        "html": ["bootstrap.css", "bootstrap.min.css", "bootstrap.js", "bootstrap.min.js", "class=\"col-xs-", "class=\"col-sm-"]
    },
    
    # CMS Platforms
    "WordPress": {
        "html": ["wp-content", "wp-includes", "/wp-json", "generator\" content=\"WordPress"],
        "headers": {"x-pingback": ""}
    },
    "Shopify": {
        "html": ["shopify.com", "cdn.shopify.com", "Shopify.shop", "Shopify.theme"]
    },
    "Webflow": {
        "html": ["data-wf-page", "data-wf-site", "webflow.css"]
    },
    "Wix": {
        "html": ["wix.com", "_wix", "wix-code-sdk"]
    },
    
    # CDNs & Hosting / Proxies
    "Cloudflare": {
        "headers": {
            "server": "cloudflare",
            "cf-ray": "",
            "cf-cache-status": ""
        }
    },
    "Vercel": {
        "headers": {
            "server": "vercel",
            "x-vercel-id": "",
            "x-vercel-cache": ""
        }
    },
    "Netlify": {
        "headers": {
            "server": "netlify",
            "x-nf-request-id": ""
        }
    },
    "Amazon CloudFront": {
        "headers": {
            "x-amz-cf-id": "",
            "via": "cloudfront"
        }
    },
    
    # Analytics & Marketing
    "Google Analytics": {
        "html": ["googletagmanager.com", "google-analytics.com", "gtag.js", "ga.js"]
    },
    "Mixpanel": {
        "html": ["mixpanel.com/libs", "mixpanel.init"]
    },
    "Hotjar": {
        "html": ["static.hotjar.com", "hotjar-"]
    },
    "HubSpot": {
        "html": ["js.hs-scripts.com", "js.hs-analytics.net"]
    }
}

async def detect_technologies(url: str, html_content: str, headers: dict) -> tuple[list[str], int]:
    """
    Scans HTML and headers using regex signature matching.
    Returns a list of detected technologies and a computed technology stack score (0-100).
    """
    detected = []
    headers_lower = {k.lower(): str(v).lower() for k, v in headers.items()}
    html_lower = html_content.lower()
    
    # Perform signature matching
    for tech, rules in TECHNOLOGY_SIGNATURES.items():
        found = False
        
        # Check HTML keywords
        if "html" in rules:
            for keyword in rules["html"]:
                if keyword.lower() in html_lower:
                    found = True
                    break
                    
        # Check Header signatures
        if not found and "headers" in rules:
            for h_key, h_val in rules["headers"].items():
                if h_key in headers_lower:
                    if not h_val or h_val.lower() in headers_lower[h_key]:
                        found = True
                        break
                        
        if found:
            detected.append(tech)
            
    # Remove duplicates but keep logic simple
    detected = list(set(detected))
    
    # Add implicit dependencies (e.g. Next.js implies React)
    if "Next.js" in detected and "React" not in detected:
        detected.append("React")
        
    # Calculate a technology modernity & capability score
    # Modern CDNs (Cloudflare/Vercel) and frameworks (Next.js/React) score highly
    score = 80  # Baseline
    
    if "Cloudflare" in detected or "Vercel" in detected:
        score += 10
    if "Next.js" in detected or "Svelte" in detected:
        score += 10
    elif "WordPress" in detected or "jQuery" in detected:
        # Legacy stacks are stable but marked slightly lower for modernization reports
        score -= 10
        
    if "Google Analytics" in detected:
        score += 5
        
    # Clamp score
    score = max(50, min(100, score))
    
    return sorted(detected), score
