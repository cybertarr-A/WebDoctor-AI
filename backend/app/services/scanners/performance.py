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
    Analyze website performance using Google PageSpeed Insights API.
    Falls back to heuristic simulation if API fails.
    """

    # -----------------------------
    # Page Size Estimation
    # -----------------------------
    html_size_kb = len(html_content.encode("utf-8")) / 1024.0

    js_count = html_content.count("<script")
    css_count = (
        html_content.count('<link rel="stylesheet"')
        + html_content.count('type="text/css"')
    )
    img_count = html_content.count("<img")

    estimated_assets_size_kb = (
        (js_count * 45)
        + (css_count * 20)
        + (img_count * 120)
    )

    page_size_kb = round(
        html_size_kb + estimated_assets_size_kb,
        1
    )

    # -----------------------------
    # Defaults
    # -----------------------------
    lighthouse_score = None
    lcp = 0.0
    fcp = 0.0
    speed_index = 0.0
    tbt = 0.0
    cls = 0.0

    # -----------------------------
    # Google PageSpeed API
    # -----------------------------
    if settings.GOOGLE_PAGESPEED_API_KEY:
        try:
            logger.info(
                "Attempting to fetch Google PageSpeed Insights data..."
            )

            params = {
                "url": url,
                "key": settings.GOOGLE_PAGESPEED_API_KEY,
                "category": "performance"
            }

            async with httpx.AsyncClient(
                timeout=httpx.Timeout(30.0)
            ) as client:

                response = await client.get(
                    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
                    params=params
                )

                logger.info(
                    f"PageSpeed Status Code: {response.status_code}"
                )

                if response.status_code != 200:
                    logger.error(
                        f"PageSpeed Error Response: {response.text}"
                    )
                    response.raise_for_status()

                data = response.json()

                lighthouse_result = data.get(
                    "lighthouseResult",
                    {}
                )

                performance_category = (
                    lighthouse_result
                    .get("categories", {})
                    .get("performance", {})
                )

                score = performance_category.get("score")

                if score is not None:
                    lighthouse_score = int(score * 100)

                    audits = lighthouse_result.get(
                        "audits",
                        {}
                    )

                    lcp = round(
                        audits.get(
                            "largest-contentful-paint",
                            {}
                        ).get("numericValue", 1200)
                        / 1000,
                        2
                    )

                    fcp = round(
                        audits.get(
                            "first-contentful-paint",
                            {}
                        ).get("numericValue", 800)
                        / 1000,
                        2
                    )

                    speed_index = round(
                        audits.get(
                            "speed-index",
                            {}
                        ).get("numericValue", 1500)
                        / 1000,
                        2
                    )

                    tbt = round(
                        audits.get(
                            "total-blocking-time",
                            {}
                        ).get("numericValue", 150),
                        1
                    )

                    cls = round(
                        audits.get(
                            "cumulative-layout-shift",
                            {}
                        ).get("numericValue", 0.05),
                        3
                    )

                    logger.info(
                        f"PageSpeed analysis successful. "
                        f"Score={lighthouse_score}"
                    )

        except Exception as e:
            logger.exception(
                f"PageSpeed API failed: {str(e)}"
            )

    # -----------------------------
    # Fallback Simulation Engine
    # -----------------------------
    if lighthouse_score is None:

        logger.warning(
            "Using simulated performance analysis."
        )

        latency_factor = min(
            3.0,
            max(
                0.5,
                response_time_ms / 400.0
            )
        )

        fcp = round(
            (0.5 * latency_factor)
            + (js_count * 0.05),
            2
        )

        lcp = round(
            (1.2 * latency_factor)
            + (img_count * 0.08)
            + (page_size_kb / 1000.0),
            2
        )

        speed_index = round(
            (1.0 * latency_factor)
            + (js_count * 0.1),
            2
        )

        tbt = round(
            (80 * latency_factor)
            + (js_count * 15),
            1
        )

        cls = round(
            0.01 + (img_count * 0.005),
            3
        )

        cls = min(cls, 0.4)

        score_calc = 100

        if lcp > 2.5:
            score_calc -= int(
                (lcp - 2.5) * 15
            )

        if fcp > 1.8:
            score_calc -= int(
                (fcp - 1.8) * 10
            )

        if tbt > 200:
            score_calc -= int(
                (tbt - 200) / 10
            )

        if cls > 0.1:
            score_calc -= int(
                cls * 50
            )

        lighthouse_score = max(
            10,
            min(99, score_calc)
        )

    # -----------------------------
    # Build Details Object
    # -----------------------------
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

    # -----------------------------
    # Final WebDoctor Score
    # -----------------------------
    response_score = max(
        0,
        min(
            100,
            100 - int(response_time_ms / 15)
        )
    )

    performance_score = int(
        (lighthouse_score * 0.8)
        + (response_score * 0.2)
    )

    performance_score = max(
        0,
        min(100, performance_score)
    )

    return details, performance_score