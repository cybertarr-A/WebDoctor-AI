import os
import json
import sqlite3
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("webdoctor")

# Wrap Supabase imports to prevent crashes if library is missing
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError as e:
    logger.warning(f"Supabase library not installed: {e}. Falling back to Local SQLite.")
    create_client = None
    Client = Any  # type fallback
    HAS_SUPABASE = False

# Database client wrapper
class DatabaseBroker:
    def __init__(self):
        self.supabase_client: Optional[Client] = None
        self.sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "webdoctor.db")
        self.use_supabase = False
        
        # Support both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_KEY
        supabase_url = settings.SUPABASE_URL or os.getenv("SUPABASE_URL")
        supabase_key = (
            settings.SUPABASE_SERVICE_ROLE_KEY or 
            os.getenv("SUPABASE_SERVICE_ROLE_KEY") or 
            settings.SUPABASE_KEY or 
            os.getenv("SUPABASE_KEY")
        )
        
        # Determine if we should attempt Supabase connection
        if HAS_SUPABASE and supabase_url and supabase_key:
            try:
                self.supabase_client = create_client(supabase_url, supabase_key)
                self.use_supabase = True
                logger.info("Connected successfully to Supabase Cloud Database.")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase Cloud: {e}. Falling back to Local SQLite.")
                
        if not self.use_supabase:
            logger.info(f"Using local SQLite database at: {self.sqlite_path}")
            self._init_sqlite()

    def _init_sqlite(self):
        """Initializes SQLite database and tables if missing."""
        try:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scans (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    overall_score INTEGER NOT NULL,
                    seo_score INTEGER NOT NULL,
                    performance_score INTEGER NOT NULL,
                    security_score INTEGER NOT NULL,
                    accessibility_score INTEGER NOT NULL,
                    technology_score INTEGER NOT NULL,
                    technology TEXT NOT NULL,
                    issues TEXT NOT NULL,
                    recommendations TEXT NOT NULL,
                    seo_details TEXT NOT NULL,
                    performance_details TEXT NOT NULL,
                    security_details TEXT NOT NULL,
                    accessibility_details TEXT NOT NULL,
                    domain_details TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    user_id TEXT
                )
            """)
            conn.commit()
            conn.close()
            logger.info("Local SQLite tables initialized.")
        except Exception as e:
            logger.error(f"Error initializing SQLite: {e}")

    def save_scan(self, scan_data: Dict[str, Any]) -> str:
        """Saves scan result to database. Returns record ID."""
        scan_id = scan_data.get("id") or str(os.urandom(16).hex())
        scan_data["id"] = scan_id
        
        # Serialize datetime
        created_at = scan_data.get("created_at")
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        elif created_at:
            created_at_str = str(created_at)
        else:
            created_at_str = datetime.utcnow().isoformat()
            
        scan_data["created_at"] = created_at_str

        # If using Supabase
        if self.use_supabase and self.supabase_client:
            try:
                # Format JSON values for postgres jsonb compatibility
                db_payload = {
                    "id": scan_id,
                    "url": scan_data["url"],
                    "overall_score": scan_data["overall_score"],
                    "seo_score": scan_data["seo_score"],
                    "performance_score": scan_data["performance_score"],
                    "security_score": scan_data["security_score"],
                    "accessibility_score": scan_data["accessibility_score"],
                    "technology_score": scan_data["technology_score"],
                    "technology": scan_data["technology"],
                    "issues": scan_data["issues"],
                    "recommendations": scan_data["recommendations"],
                    
                    # Store nested dicts directly as JSON/JSONB
                    "seo_details": scan_data["seo_details"].model_dump() if hasattr(scan_data["seo_details"], "model_dump") else scan_data["seo_details"],
                    "performance_details": scan_data["performance_details"].model_dump() if hasattr(scan_data["performance_details"], "model_dump") else scan_data["performance_details"],
                    "security_details": scan_data["security_details"].model_dump() if hasattr(scan_data["security_details"], "model_dump") else scan_data["security_details"],
                    "accessibility_details": scan_data["accessibility_details"].model_dump() if hasattr(scan_data["accessibility_details"], "model_dump") else scan_data["accessibility_details"],
                    "technology_details": scan_data["technology"],
                    "domain_details": scan_data["domain_details"].model_dump() if hasattr(scan_data["domain_details"], "model_dump") else scan_data["domain_details"],
                    "created_at": created_at_str,
                    "user_id": scan_data.get("user_id")
                }
                
                res = self.supabase_client.table("scans").insert(db_payload).execute()
                logger.info(f"Successfully saved scan {scan_id} to Supabase.")
                return scan_id
            except Exception as e:
                logger.error(f"Failed to insert scan into Supabase ({e}). Storing to local SQLite fallback.")
                
        # SQLite storage fallback/primary
        try:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            
            # Extract nested dicts as strings
            def serialize_val(val):
                if hasattr(val, "model_dump"):
                    return json.dumps(val.model_dump())
                return json.dumps(val)

            cursor.execute(
                """
                INSERT OR REPLACE INTO scans (
                    id, url, overall_score, seo_score, performance_score, security_score, 
                    accessibility_score, technology_score, technology, issues, recommendations, 
                    seo_details, performance_details, security_details, accessibility_details, 
                    domain_details, created_at, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    scan_id,
                    scan_data["url"],
                    scan_data["overall_score"],
                    scan_data["seo_score"],
                    scan_data["performance_score"],
                    scan_data["security_score"],
                    scan_data["accessibility_score"],
                    scan_data["technology_score"],
                    json.dumps(scan_data["technology"]),
                    json.dumps(scan_data["issues"]),
                    json.dumps(scan_data["recommendations"]),
                    serialize_val(scan_data["seo_details"]),
                    serialize_val(scan_data["performance_details"]),
                    serialize_val(scan_data["security_details"]),
                    serialize_val(scan_data["accessibility_details"]),
                    serialize_val(scan_data["domain_details"]),
                    created_at_str,
                    scan_data.get("user_id")
                )
            )
            conn.commit()
            conn.close()
            logger.info(f"Successfully saved scan {scan_id} to SQLite.")
            return scan_id
        except Exception as e:
            logger.error(f"Error writing to SQLite: {e}")
            return scan_id

    def get_scan(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves scan record by ID."""
        if self.use_supabase and self.supabase_client:
            try:
                res = self.supabase_client.table("scans").select("*").eq("id", scan_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase lookup failed for {scan_id}: {e}. Checking SQLite...")
                
        # SQLite lookup
        try:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                res_dict = dict(row)
                # Deserialize strings
                res_dict["technology"] = json.loads(res_dict["technology"])
                res_dict["issues"] = json.loads(res_dict["issues"])
                res_dict["recommendations"] = json.loads(res_dict["recommendations"])
                res_dict["seo_details"] = json.loads(res_dict["seo_details"])
                res_dict["performance_details"] = json.loads(res_dict["performance_details"])
                res_dict["security_details"] = json.loads(res_dict["security_details"])
                res_dict["accessibility_details"] = json.loads(res_dict["accessibility_details"])
                res_dict["domain_details"] = json.loads(res_dict["domain_details"])
                return res_dict
        except Exception as e:
            logger.error(f"Error querying SQLite: {e}")
            
        return None

    def list_recent_scans(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Lists recent scans."""
        if self.use_supabase and self.supabase_client:
            try:
                res = self.supabase_client.table("scans").select("id, url, overall_score, created_at").order("created_at", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase list failed: {e}. Checking SQLite...")
                
        # SQLite list
        try:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, url, overall_score, created_at FROM scans ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Error list SQLite: {e}")
            return []

db_broker = DatabaseBroker()
