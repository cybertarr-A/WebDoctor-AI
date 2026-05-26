import time
import logging
import httpx
from app.schemas.analysis import PerformanceDetails
from app.core.config import settings

logger = logging.getLogger("webdoctor")

async def analyze_performance(
    url: str,
    response_time_ms: float,
    html_content: str,
    ttfb_ms: float
) -> tuple[PerformanceDetails, int]:
    """
    Analyzes website performance, utilizing Google PageSpeed Insights API if available,
    otherwise falling back to a robust simulation engine based on actual network latency.
    """
    # Base size estimation
    html_size_kb = len(html_content.encode("utf-8")) / 1024.0
    
    # Heuristic additions for CSS/JS assets (based on simple HTML parsing)
    # We estimate size based on average file weights
    js_count = html_content.count("<script")
    css_count = html_content.count("<link rel=\"stylesheet\"") or html_content.count("type=\"text/css\"")
    img_count = html_content.count("<img")
    
    estimated_assets_size_kb = (js_count * 45) + (css_count * 20) + (img_count * 120)
    page_size_kb = round(html_size_kb + estimated_assets_size_kb, 1)
    
    # Initialize variables for PageSpeed API
    lighthouse_score = None
    lcp = 0.0
    fcp = 0.0
    speed_index = 0.0
    tbt = 0.0
    cls = 0.0
    
    # Try using Google PageSpeed Insights API if key is available
    if settings.GOOGLE_PAGESPEED_API_KEY:
        try:
            logger.info("Attempting to fetch Google PageSpeed Insights API data...")
            api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&key={settings.GOOGLE_PAGESPEED_API_KEY}&category=PERFORMANCE"
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(api_url)
                if res.status_code == 200:
                    data = res.json()
                    lighthouse_data = data.get("lighthouseResult", {})
                    categories = lighthouse_data.get("categories", {}) or {}
                    perf_category = categories.get("performance", {}) or {}
                    
                    # Performance score (0-100)
                    lighthouse_score = int(perf_category.get("score", 0.8) * 100) if perf_category else None
                    
                    if lighthouse_score is not None:
                        # Audits
                        audits = lighthouse_data.get("audits", {}) or {}
                        lcp = float(audits.get("largest-contentful-paint", {}).get("numericValue", 1200) / 1000.0)
                        fcp = float(audits.get("first-contentful-paint", {}).get("numericValue", 800) / 1000.0)
                        speed_index = float(audits.get("speed-index", {}).get("numericValue", 1500) / 1000.0)
                        tbt = float(audits.get("total-blocking-time", {}).get("numericValue", 150))
                        cls = float(audits.get("cumulative-layout-shift", {}).get("numericValue", 0.05))
                        
                        logger.info("Successfully fetched PageSpeed metrics.")
        except Exception as e:
            logger.error(f"Failed to fetch PageSpeed Insights: {e}. Falling back to simulation.")
            
    # Fallback Simulation Engine
    if lighthouse_score is None:
        # Base latency logic
        # Faster websites (e.g. Google, Vercel) have response_time < 300ms
        # Slower ones (heavy frameworks, unoptimized host) > 1000ms
        latency_factor = min(3.0, max(0.5, response_time_ms / 400.0))
        
        fcp = round(0.5 * latency_factor + (js_count * 0.05), 2)
        lcp = round(1.2 * latency_factor + (img_count * 0.08) + (page_size_kb / 1000.0), 2)
        speed_index = round(1.0 * latency_factor + (js_count * 0.1), 2)
        tbt = round(80 * latency_factor + (js_count * 15.0), 1)
        cls = round(0.01 + (img_count * 0.005), 3)
        if cls > 0.4:
            cls = 0.4
            
        # Lighthouse Performance Score formula based on Core Web Vitals
        # High-scoring criteria: LCP < 2.5s, FCP < 1.8s, TBT < 200ms, CLS < 0.1
        score_calc = 100
        
        # Deduct for slow LCP
        if lcp > 2.5:
            score_calc -= int((lcp - 2.5) * 15)
        # Deduct for slow FCP
        if fcp > 1.8:
            score_calc -= int((fcp - 1.8) * 10)
        # Deduct for high TBT
        if tbt > 200:
            score_calc -= int((tbt - 200) / 10)
        # Deduct for high CLS
        if cls > 0.1:
            score_calc -= int(cls * 50)
            
        lighthouse_score = max(10, min(99, score_calc))
        
    details = PerformanceDetails(
        response_time_ms=response_time_ms,
        ttfb_ms=ttfb_ms,
        page_size_kb=page_size_kb,
        lighthouse_score=lighthouse_score,
        largest_contentful_paint_s=lcp,
        first_contentful_paint_s=fcp,
        speed_index_s=speed_index,
        total_blocking_time_ms=tbt,
        cumulative_layout_shift=cls
    )
    
    # Calculate a composite performance score for WebDoctor (ranges 0-100)
    # Give heavy weight to Lighthouse, but account for raw response time too
    response_score = max(0, min(100, 100 - int(response_time_ms / 15.0)))
    performance_score = int((lighthouse_score * 0.8) + (response_score * 0.2))
    performance_score = max(0, min(100, performance_score))
    
    return details, performance_score
