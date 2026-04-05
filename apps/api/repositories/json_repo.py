import json
import os
from pathlib import Path
from typing import TypeVar, Type

T = TypeVar("T")

DATA_DIR = Path(os.getenv("DATA_DIR", "../../data")).resolve()


def data_path(filename: str) -> Path:
    return DATA_DIR / filename


def read_json(filename: str) -> list | dict:
    fp = data_path(filename)
    if not fp.exists():
        return []
    content = fp.read_text(encoding="utf-8").strip()
    if not content:
        return []
    return json.loads(content)


def write_json(filename: str, data: list | dict) -> None:
    fp = data_path(filename)
    fp.parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(str(fp) + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(fp)  # replace() works atomically on Windows; rename() fails if destination exists
