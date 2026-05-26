import logging
from bs4 import BeautifulSoup
import httpx
from urllib.parse import urlparse, urljoin
from app.schemas.analysis import SEODetails

logger = logging.getLogger("webdoctor")

async def analyze_seo(url: str, html_content: str, headers_dict: dict) -> tuple[SEODetails, int]:
    """
    Analyzes website SEO features based on fetched HTML and generates an SEO score.
    Returns SEODetails schema and an integer score (0-100).
    """
    score = 100
    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1. Title Analysis
    title_el = soup.find("title")
    title = title_el.text.strip() if title_el else None
    title_len = len(title) if title else 0
    if not title:
        score -= 20
    elif title_len < 30 or title_len > 60:
        score -= 5  # Sub-optimal title length
        
    # 2. Meta Description Analysis
    desc_el = soup.find("meta", attrs={"name": "description"})
    if not desc_el:
        desc_el = soup.find("meta", attrs={"property": "og:description"})
    desc = desc_el.get("content", "").strip() if desc_el else None
    desc_len = len(desc) if desc else 0
    if not desc:
        score -= 20
    elif desc_len < 120 or desc_len > 160:
        score -= 5  # Sub-optimal meta description length
        
    # 3. Headings structure
    h1s = soup.find_all("h1")
    h1_count = len(h1s)
    h2s = soup.find_all("h2")
    h2_count = len(h2s)
    
    if h1_count == 0:
        score -= 15
    elif h1_count > 1:
        score -= 5  # More than one h1 is not ideal for accessibility/SEO
        
    headings = [h.text.strip() for h in soup.find_all(["h1", "h2", "h3"]) if h.text]
    
    # 4. Canonical Link
    canonical_el = soup.find("link", rel="canonical")
    canonical = canonical_el.get("href") if canonical_el else None
    if not canonical:
        score -= 5
        
    # 5. Open Graph tags
    og = {}
    for meta in soup.find_all("meta", property=True):
        prop = meta["property"]
        if prop.startswith("og:"):
            og[prop] = meta.get("content", "")
            
    # 6. Structured Data
    ld_json = soup.find_all("script", type="application/ld+json")
    has_structured_data = len(ld_json) > 0
    if not has_structured_data:
        score -= 5
        
    # 7. Image Alt tags
    imgs = soup.find_all("img")
    imgs_total = len(imgs)
    imgs_no_alt = 0
    for img in imgs:
        if not img.get("alt"):
            imgs_no_alt += 1
            
    if imgs_total > 0 and imgs_no_alt > 0:
        pct_no_alt = imgs_no_alt / imgs_total
        score -= int(pct_no_alt * 10)  # Max 10 pts deduction
        
    # 8. Link Profile
    parsed_base = urlparse(url)
    base_netloc = parsed_base.netloc
    
    internal_count = 0
    external_count = 0
    for a in soup.find_all("a", href=True):
        href = a["href"]
        parsed_href = urlparse(href)
        # Check if internal or external
        if not parsed_href.netloc or parsed_href.netloc == base_netloc:
            internal_count += 1
        else:
            external_count += 1
            
    # 9. Robots.txt and Sitemap.xml detection
    has_robots = False
    has_sitemap = False
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            robots_url = urljoin(url, "/robots.txt")
            robots_res = await client.head(robots_url, follow_redirects=True)
            has_robots = robots_res.status_code == 200
        except Exception as e:
            logger.debug(f"Error fetching robots.txt: {e}")
            
        try:
            sitemap_url = urljoin(url, "/sitemap.xml")
            sitemap_res = await client.head(sitemap_url, follow_redirects=True)
            has_sitemap = sitemap_res.status_code == 200
        except Exception as e:
            logger.debug(f"Error fetching sitemap.xml: {e}")
            
    if not has_robots:
        score -= 5
    if not has_sitemap:
        score -= 5
        
    # Final clamping
    score = max(0, min(100, score))
    
    details = SEODetails(
        title=title,
        title_length=title_len,
        meta_description=desc,
        meta_description_length=desc_len,
        h1_count=h1_count,
        h2_count=h2_count,
        headings=headings[:15],  # limit size for storage
        canonical_url=canonical,
        has_sitemap=has_sitemap,
        has_robots=has_robots,
        open_graph=og,
        structured_data_detected=has_structured_data,
        internal_links_count=internal_count,
        external_links_count=external_count,
        images_without_alt=imgs_no_alt,
        images_total=imgs_total
    )
    
    return details, score
