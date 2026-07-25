"""PDF/document ingestion pipeline with source-level provenance."""

from __future__ import annotations

import hashlib
import io
import re
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


@dataclass(frozen=True)
class EvidenceChunk:
    id: str
    document_id: str
    page: int
    start_char: int
    end_char: int
    content: str
    source_hash: str
    chunk_hash: str


def extract_pdf(data: bytes) -> list[tuple[int, str]]:
    reader = PdfReader(io.BytesIO(data))
    return [
        (index + 1, (page.extract_text() or "").strip())
        for index, page in enumerate(reader.pages)
    ]


def chunk_pages(
    document_id: str,
    source_hash: str,
    pages: Iterable[tuple[int, str]],
    max_chars: int = 1200,
) -> list[EvidenceChunk]:
    chunks: list[EvidenceChunk] = []
    for page_number, page_text in pages:
        normalized = re.sub(r"[ \t]+", " ", page_text)
        cursor = 0
        while cursor < len(normalized):
            end = min(len(normalized), cursor + max_chars)
            if end < len(normalized):
                boundary = normalized.rfind(". ", cursor, end)
                if boundary > cursor + max_chars // 2:
                    end = boundary + 1
            content = normalized[cursor:end].strip()
            if content:
                chunk_hash = hashlib.sha256(content.encode()).hexdigest()
                chunks.append(
                    EvidenceChunk(
                        id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{document_id}:{page_number}:{cursor}:{chunk_hash}")),
                        document_id=document_id,
                        page=page_number,
                        start_char=cursor,
                        end_char=end,
                        content=content,
                        source_hash=source_hash,
                        chunk_hash=chunk_hash,
                    )
                )
            cursor = max(end, cursor + 1)
    return chunks


def ingest(path: Path) -> dict:
    data = path.read_bytes()
    source_hash = hashlib.sha256(data).hexdigest()
    document_id = str(uuid.uuid5(uuid.NAMESPACE_URL, source_hash))
    pages = extract_pdf(data) if path.suffix.lower() == ".pdf" else [(1, data.decode("utf-8"))]
    chunks = chunk_pages(document_id, source_hash, pages)
    return {
        "document": {
            "id": document_id,
            "filename": path.name,
            "source_hash": source_hash,
            "pages": len(pages),
        },
        "chunks": [asdict(chunk) for chunk in chunks],
    }

