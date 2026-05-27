#!/usr/bin/env python3
import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("entrypoint")

def main():
    port = os.getenv("PORT", "8000")
    host = os.getenv("HOST", "0.0.0.0")
    
    try:
        port_int = int(port)
        if not (0 < port_int < 65536):
            raise ValueError(f"Port {port} out of range")
    except ValueError as e:
        logger.error(f"Invalid PORT: {e}")
        sys.exit(1)
    
    logger.info(f"🚀 Starting WebDoctor AI on {host}:{port}")
    
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("⚠️ GROQ_API_KEY not set - AI features disabled")
    
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", host, "--port", port, "--log-level", "info"]
    subprocess.run(cmd, check=False)

if __name__ == "__main__":
    main()