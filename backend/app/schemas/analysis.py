from pydantic import BaseModel, HttpUrl, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

# Scan Request
class ScanRequest(BaseModel):
    url: str = Field(..., description="The website URL to analyze (e.g., https://example.com)")

# Sub-component metrics
class SEODetails(BaseModel):
    title: Optional[str] = None
    title_length: int = 0
    meta_description: Optional[str] = None
    meta_description_length: int = 0
    h1_count: int = 0
    h2_count: int = 0
    headings: List[str] = []
    canonical_url: Optional[str] = None
    has_sitemap: bool = False
    has_robots: bool = False
    open_graph: Dict[str, str] = {}
    structured_data_detected: bool = False
    internal_links_count: int = 0
    external_links_count: int = 0
    images_without_alt: int = 0
    images_total: int = 0

class PerformanceDetails(BaseModel):
    response_time_ms: float = 0.0
    ttfb_ms: float = 0.0
    page_size_kb: float = 0.0
    lighthouse_score: Optional[int] = None
    largest_contentful_paint_s: float = 0.0
    first_contentful_paint_s: float = 0.0
    speed_index_s: float = 0.0
    total_blocking_time_ms: float = 0.0
    cumulative_layout_shift: float = 0.0

class SecurityDetails(BaseModel):
    https_enabled: bool = False
    hsts_enabled: bool = False
    csp_enabled: bool = False
    x_frame_options: Optional[str] = None
    referrer_policy: Optional[str] = None
    xss_protection: Optional[str] = None
    missing_headers: List[str] = []
    secure_cookies: bool = True

class AccessibilityDetails(BaseModel):
    score: int = 100
    missing_alt_tags: int = 0
    contrast_issues_suspected: bool = False
    aria_labels_present: bool = True
    html_lang_present: bool = True

class DomainDetails(BaseModel):
    registrar: Optional[str] = "Unknown"
    creation_date: Optional[str] = "Unknown"
    expiration_date: Optional[str] = "Unknown"
    domain_age_days: Optional[int] = 0

# Core Response format
class ScanResponse(BaseModel):
    id: Optional[str] = None
    url: str
    overall_score: int
    seo_score: int
    performance_score: int
    security_score: int
    accessibility_score: int
    technology_score: int
    
    # Simple requested fields
    technology: List[str] = []
    issues: List[str] = []
    recommendations: List[str] = []
    
    # SaaS Dashboard details
    seo_details: SEODetails
    performance_details: PerformanceDetails
    security_details: SecurityDetails
    accessibility_details: AccessibilityDetails
    technology_details: List[str] = []
    domain_details: DomainDetails
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
