"""
=========================================================
PREM SEO ENGINE
Stage 1 - SEO Auditor

FastAPI Backend
File: main.py
=========================================================

Purpose:
    Main API entry point for the Prem SEO Engine.

Current responsibilities:
    - Start FastAPI application
    - Provide health check
    - Receive website URL
    - Validate URL
    - Call crawler
    - Return SEO crawl data
    - Handle API errors
    - Enable CORS for frontend communication

Author:
    Premanandhan Narayanan
=========================================================
"""


# =========================================================
# IMPORTS
# =========================================================

from typing import Any
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="Prem SEO Engine",
    description=(
        "Website SEO auditing and optimization platform."
    ),
    version="0.1.0",
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

"""
During development we allow requests from all origins.

Once the application is deployed, we should restrict this
to the actual GitHub Pages domain.
"""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class AuditRequest(BaseModel):
    """
    Request received from the frontend.
    """

    url: HttpUrl


# =========================================================
# URL VALIDATION
# =========================================================

def validate_website_url(url: str) -> str:
    """
    Validate and normalize the submitted website URL.
    """

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError(
            "Only HTTP and HTTPS websites are supported."
        )

    if not parsed.netloc:
        raise ValueError(
            "The website URL is missing a domain name."
        )

    return url.rstrip("/")


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
async def root() -> dict[str, Any]:
    """
    Basic API status endpoint.
    """

    return {
        "status": "online",
        "application": "Prem SEO Engine",
        "version": "0.1.0",
        "stage": "Stage 1 - SEO Auditor",
    }


# =========================================================
# HEALTH API
# =========================================================

@app.get("/api/health")
async def health_check() -> dict[str, Any]:
    """
    Health check endpoint.

    Used to confirm that the FastAPI server is running.
    """

    return {
        "status": "healthy",
        "service": "Prem SEO Engine API",
    }


# =========================================================
# SEO AUDIT ENDPOINT
# =========================================================

@app.post("/api/audit")
async def audit_website(
    request: AuditRequest,
) -> dict[str, Any]:
    """
    Start an SEO audit for a website.

    The frontend sends:

        {
            "url": "https://example.com"
        }

    The crawler will then collect website information.
    """

    try:

        # -------------------------------------------------
        # Validate URL
        # -------------------------------------------------

        website_url = validate_website_url(
            str(request.url)
        )

        print(
            f"[AUDIT] Starting audit for: {website_url}"
        )


        # -------------------------------------------------
        # Import crawler
        # -------------------------------------------------

        try:

            from crawler import crawl_website

        except ImportError as error:

            print(
                "[ERROR] crawler.py is not available yet."
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Crawler module is not available. "
                    "Please create backend/crawler.py."
                ),
            ) from error


        # -------------------------------------------------
        # Run crawler
        # -------------------------------------------------

        crawl_result = await crawl_website(
            website_url
        )


        # -------------------------------------------------
        # Return result
        # -------------------------------------------------

        return {
            "success": True,

            "website": website_url,

            "pages_analysed": (
                crawl_result.get(
                    "pages_analysed",
                    0,
                )
            ),

            "pages": (
                crawl_result.get(
                    "pages",
                    [],
                )
            ),

            "technical": (
                crawl_result.get(
                    "technical",
                    {},
                )
            ),

            "message": (
                "Website crawl completed successfully."
            ),
        }


    # =====================================================
    # HTTP ERRORS
    # =====================================================

    except HTTPException:

        raise


    # =====================================================
    # GENERAL ERRORS
    # =====================================================

    except ValueError as error:

        print(
            f"[ERROR] Invalid URL: {error}"
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


    except Exception as error:

        print(
            f"[ERROR] Audit failed: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The SEO audit could not be completed. "
                f"Reason: {str(error)}"
            ),
        ) from error


# =========================================================
# DEVELOPMENT SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    print()
    print("=" * 60)
    print("PREM SEO ENGINE")
    print("Stage 1 - SEO Auditor")
    print("=" * 60)
    print()
    print("Starting FastAPI server...")
    print()
    print("API:")
    print("http://127.0.0.1:8000")
    print()
    print("Health:")
    print("http://127.0.0.1:8000/api/health")
    print()
    print("Swagger Documentation:")
    print("http://127.0.0.1:8000/docs")
    print()
    print("=" * 60)
    print()

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
