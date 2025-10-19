import os
import re
import base64
import httpx
from bs4 import BeautifulSoup

BASE = os.environ.get("CONFLUENCE_BASE_URL", "").rstrip("/")
EMAIL = os.environ.get("ATLASSIAN_EMAIL")
TOKEN = os.environ.get("ATLASSIAN_API_TOKEN")


def _auth_headers() -> dict:
    if not (BASE and EMAIL and TOKEN):
        raise RuntimeError("Confluence env vars missing: CONFLUENCE_BASE_URL, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN")
    tok = base64.b64encode(f"{EMAIL}:{TOKEN}".encode()).decode()
    return {"Authorization": f"Basic {tok}", "Accept": "application/json"}


async def get_page_by_id(page_id: str) -> dict:
    url = f"{BASE}/rest/api/content/{page_id}?expand=title,body.storage"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, headers=_auth_headers())
        r.raise_for_status()
        return r.json()


def parse_storage_html(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)

    # url: first http(s) link
    url_match = re.search(r"https?://\S+", text)
    url = url_match.group(0) if url_match else ""

    # description: first non-trivial paragraph
    paragraphs = [p.get_text(strip=True) for p in soup.find_all(["p"]) if p.get_text(strip=True)]
    description = next((p for p in paragraphs if len(p) > 8), "")

    # steps: ordered lists, fallback to numbered/markdown-like lines
    steps: list[str] = []
    for ol in soup.find_all("ol"):
        lis = [li.get_text(" ", strip=True) for li in ol.find_all("li")]
        if lis:
            steps.extend(lis)

    if not steps:
        numbered = [ln for ln in text.splitlines() if re.match(r"^(\d+\.|Step\s+\d+:|\*|-)\s+", ln)]
        steps = [re.sub(r"^(\d+\.|Step\s+\d+:|\*|-)\s+", "", ln).strip() for ln in numbered]

    return {"url": url, "description": description, "steps": steps[:50]}


