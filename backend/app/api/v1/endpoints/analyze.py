import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from app.schemas.analysis import ScanRequest, ScanResponse
from app.services.orchestrator import run_diagnostics_pipeline
from app.utils.db import db_broker
from typing import List, Dict, Any

logger = logging.getLogger("webdoctor")
router = APIRouter()

@router.post("/analyze", response_model=ScanResponse)
async def analyze_website(request: Request, payload: ScanRequest):
    """
    Submits a website URL for immediate real-time diagnostics scanning.
    Runs deep SEO, performance, security, technology, and domain analysis with AI recommendations.
    """
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    try:
        # Run synchronous orchestrator pipeline
        scan_result = await run_diagnostics_pipeline(url)
        
        # Save scan to persistence (Supabase / SQLite)
        scan_id = db_broker.save_scan(scan_result.model_dump())
        scan_result.id = scan_id
        
        return scan_result
    except Exception as e:
        logger.error(f"Error executing scan for {url}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling website diagnostics: {str(e)}"
        )

@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_historical_scan(scan_id: str):
    """
    Retrieves a historical website health report by scan ID.
    """
    scan = db_broker.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Requested website report not found")
    return scan

@router.get("/scans/recent", response_model=List[Dict[str, Any]])
async def get_recent_scans():
    """
    Retrieves the 10 most recent website diagnostics scans.
    """
    return db_broker.list_recent_scans(limit=10)

@router.get("/scan/{scan_id}/download")
async def download_report_summary(scan_id: str):
    """
    Generates a high-impact, human-readable markdown file representing the diagnostic report
    for easy printing and PDF saving.
    """
    scan = db_broker.get_scan(scan_id)
    if not scan:
        if scan_id == "demo":
            # Generate a gorgeous default fallback demo report
            scan = {
                "url": "https://example.com",
                "created_at": "2026-05-26T23:55:00Z",
                "overall_score": 88,
                "seo_score": 92,
                "performance_score": 84,
                "security_score": 75,
                "accessibility_score": 95,
                "technology_score": 90,
                "technology": ["Next.js", "React", "Three.js", "Tailwind CSS", "Vercel"],
                "issues": [
                    "Strict-Transport-Security (HSTS) header is missing",
                    "Content-Security-Policy (CSP) is not configured",
                    "Missing image alt tags detected (4 items)",
                    "Speed Index score below optimum: 2.2s"
                ],
                "recommendations": [
                    "Enable Strict-Transport-Security (HSTS) header within server settings",
                    "Deploy a robust script-loading Content-Security-Policy (CSP)",
                    "Inject meaningful alt tag descriptors to all local images",
                    "Optimize and compress large raster static image payloads"
                ],
                "domain_details": {
                    "registrar": "Vercel Registrar Inc",
                    "creation_date": "2025-06-20",
                    "domain_age_days": 340,
                    "expiration_date": "2029-06-20"
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Requested report not found")
        
    url = scan["url"]
    score = scan["overall_score"]
    
    # Construct beautiful markdown report contents
    report_content = f"""# WebDoctor AI - Website Health Report
URL: {url}
Scan Date: {scan["created_at"]}
Overall Health Score: {score}/100

=========================================
SCORES CARD
=========================================
- SEO Score: {scan["seo_score"]}/100
- Performance Score: {scan["performance_score"]}/100
- Security Score: {scan["security_score"]}/100
- Accessibility Score: {scan["accessibility_score"]}/100
- Technology Stack Modernity: {scan["technology_score"]}/100

=========================================
DETECTED ISSUES
=========================================
"""
    for idx, issue in enumerate(scan["issues"], 1):
        report_content += f"{idx}. [!] {issue}\n"
        
    report_content += """
=========================================
AI RECOMMENDATIONS (ACTIONABLE FIXES)
=========================================
"""
    for idx, rec in enumerate(scan["recommendations"], 1):
        report_content += f"{idx}. [FIX] {rec}\n"
        
    report_content += f"""
=========================================
TECHNOLOGY STACK
=========================================
Detected Stack: {", ".join(scan["technology"])}

=========================================
DOMAIN METADATA
=========================================
- Registrar: {scan["domain_details"].get("registrar")}
- Domain Creation Date: {scan["domain_details"].get("creation_date")}
- Domain Expiry Date: {scan["domain_details"].get("expiration_date")}
- Domain Age: {scan["domain_details"].get("domain_age_days")} days

-----------------------------------------
Report generated by WebDoctor AI (c) 2026.
"""

    def iter_content():
        yield report_content.encode("utf-8")
        
    # Return as file stream download
    filename = f"webdoctor_report_{scan_id}.txt"
    return StreamingResponse(
        iter_content(),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
