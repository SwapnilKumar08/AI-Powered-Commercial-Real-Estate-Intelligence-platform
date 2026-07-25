"""Authorised professional-data and email enrichment adapters."""

from __future__ import annotations

import csv
import io
import os
from dataclasses import dataclass

import httpx


@dataclass(frozen=True)
class ProfessionalProfile:
    full_name: str
    company: str
    title: str
    source: str
    source_record_id: str


def parse_authorised_linkedin_export(csv_text: str) -> list[ProfessionalProfile]:
    """Parse a user-provided LinkedIn export; never logs in or scrapes pages."""
    records = []
    for index, row in enumerate(csv.DictReader(io.StringIO(csv_text))):
        first = row.get("First Name", "").strip()
        last = row.get("Last Name", "").strip()
        if not first and not last:
            continue
        records.append(
            ProfessionalProfile(
                full_name=f"{first} {last}".strip(),
                company=row.get("Company", "").strip(),
                title=row.get("Position", "").strip(),
                source="linkedin-user-export",
                source_record_id=f"export-row-{index + 2}",
            )
        )
    return records


async def hunter_email_finder(
    first_name: str,
    last_name: str,
    domain: str,
) -> dict:
    api_key = os.environ["HUNTER_API_KEY"]
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            "https://api.hunter.io/v2/email-finder",
            params={
                "domain": domain,
                "first_name": first_name,
                "last_name": last_name,
                "api_key": api_key,
            },
        )
        response.raise_for_status()
        payload = response.json()["data"]
    return {
        "email": payload.get("email"),
        "score": payload.get("score", 0),
        "verification": payload.get("verification", {}).get("status", "unknown"),
        "source": "hunter.io",
    }

