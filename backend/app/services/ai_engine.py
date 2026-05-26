import json
import logging
from typing import List, Dict, Any
from groq import Groq
from app.core.config import settings

logger = logging.getLogger("webdoctor")

async def generate_recommendations(
    url: str,
    overall_score: int,
    metrics: Dict[str, Any],
    issues: List[str]
) -> List[str]:
    """
    Generates dynamic AI recommendations using the Groq API as primary,
    and falls back to a highly customized local heuristics generator if credentials are not provided.
    """
    if settings.GROQ_API_KEY:
        try:
            logger.info("Attempting to generate recommendations using Groq AI...")
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            prompt = f"""
            You are WebDoctor AI, an elite SaaS website auditing tool similar to SEMrush and GTmetrix.
            You must analyze the technical diagnostics of a website and return a list of high-quality, 
            professional, human-readable, and highly actionable suggestions.
            
            Website URL: {url}
            Overall Score: {overall_score}/100
            
            Diagnostics Data:
            {json.dumps(metrics, indent=2)}
            
            List of detected technical issues:
            {json.dumps(issues, indent=2)}
            
            Generate between 4 to 6 specific, highly actionable recommendations.
            Each recommendation must be structured as a concise, high-impact instruction.
            Examples:
            - "Enable HSTS (Strict-Transport-Security) to force secure connections and improve your security score."
            - "Compress high-resolution images. We detected that some image resources contribute significantly to page weight."
            - "Add descriptive alt attributes to the images missing them to improve SEO ranking and accessibility."
            - "Defer or remove unused JavaScript files to speed up page rendering and decrease blocking time."
            
            Return ONLY a raw JSON list of strings, e.g., ["Recommendation 1", "Recommendation 2", ...]. Do not write markdown formatting other than the JSON block. Do not write explanation text.
            """
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
                temperature=0.2,
                max_tokens=800
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            # Clean possible markdown surrounding JSON
            if response_text.startswith("```json"):
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif response_text.startswith("```"):
                response_text = response_text.split("```")[1].split("```")[0].strip()
                
            recommendations = json.loads(response_text)
            if isinstance(recommendations, list) and len(recommendations) > 0:
                logger.info("Groq AI successfully generated recommendations.")
                return recommendations
        except Exception as e:
            logger.error(f"Groq API call failed: {e}. Falling back to Local AI Recommendation Engine.")
            
    # Local Heuristics Recommendation Engine (Fallback)
    # This generates extremely high-quality, customized recommendations based on real scan findings
    recommendations = []
    
    # 1. Transport/Security recommendations
    sec_details = metrics.get("security_details", {})
    if not sec_details.get("https_enabled", True):
        recommendations.append("Install an SSL/TLS certificate immediately. Serving your website over HTTP damages user trust and severely impacts search rankings.")
    elif not sec_details.get("hsts_enabled", False):
        recommendations.append("Configure the Strict-Transport-Security (HSTS) header to force all browsers to load the site via HTTPS, eliminating risk of protocol-downgrade attacks.")
        
    if not sec_details.get("csp_enabled", False):
        recommendations.append("Implement a robust Content Security Policy (CSP) header. This mitigates Cross-Site Scripting (XSS) vulnerability risks by restricting allowed resource sources.")
        
    # 2. SEO recommendations
    seo_details = metrics.get("seo_details", {})
    if not seo_details.get("title"):
        recommendations.append("Add a descriptive <title> tag to your HTML. Page titles are the single most important meta-factor for search visibility and click-through rates.")
    elif seo_details.get("title_length", 0) < 30 or seo_details.get("title_length", 0) > 60:
        recommendations.append(f"Optimize your page title length (currently {seo_details.get('title_length')} characters). Keep it between 30 and 60 characters for ideal display in search engine results.")
        
    if not seo_details.get("meta_description"):
        recommendations.append("Write a compelling meta description. This snippet appears below your title in SERPs and dramatically influences user click-through behavior.")
    elif seo_details.get("meta_description_length", 0) < 120 or seo_details.get("meta_description_length", 0) > 160:
        recommendations.append(f"Adjust meta description length (currently {seo_details.get('meta_description_length')} characters). Target 120-160 characters to avoid truncation by search crawlers.")
        
    if seo_details.get("h1_count", 0) == 0:
        recommendations.append("Create exactly one primary H1 heading containing your page's key topic. This guides search engines and assistive technologies on what the page is about.")
    elif seo_details.get("h1_count", 0) > 1:
        recommendations.append(f"Consolidate H1 headings. We detected {seo_details.get('h1_count')} H1 tags; using multiple H1s dilutes page topic relevance and complicates document outline structure.")
        
    if seo_details.get("images_without_alt", 0) > 0:
        recommendations.append(f"Add descriptive alt text to the {seo_details.get('images_without_alt')} images currently lacking it. Image alt attributes are critical for screen readers and Google Image search indexation.")
        
    # 3. Performance recommendations
    perf_details = metrics.get("performance_details", {})
    resp_time = perf_details.get("response_time_ms", 200.0)
    page_size = perf_details.get("page_size_kb", 500.0)
    
    if resp_time > 800:
        recommendations.append(f"Optimize your web server response latency (currently {round(resp_time, 1)}ms). Leverage multi-region hosting, database index optimization, or a fast caching layer to decrease Time-to-First-Byte.")
        
    if page_size > 1500:
        recommendations.append(f"Reduce total page weight (currently {round(page_size/1024, 2)}MB). Modern pages should remain under 1.5MB; compress assets, serve modern image formats (WebP/AVIF), and purge unused CSS/JS packages.")
    elif perf_details.get("lighthouse_score", 90) < 80:
        recommendations.append("Enable modern compression protocols like Gzip or Brotli at the server level to shrink transfer size of static scripts and layout resources.")
        
    # Ensure we always have at least 4 top-tier recommendations
    if len(recommendations) < 4:
        recommendations.append("Ensure your primary call-to-action (CTA) sits above the fold to maximize landing conversion and user interaction signals.")
        recommendations.append("Audit external scripts. External tags increase blocking times; load third-party analytics and chat pixels asynchronously to keep the main thread responsive.")
        
    logger.info(f"Heuristics recommendations compiled. Count: {len(recommendations)}")
    return recommendations[:6]
