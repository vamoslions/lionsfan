"""Restore the deployed last-good snapshot before a scheduled fresh checkout.

Scheduled data is deployed as an artifact, not committed to the source branch.
Never replace a newer local snapshot, and never accept invalid/empty HTTP data.
"""
import json
from datetime import datetime
from update_data import ROOT, fetch, atomic_json, read_json

BASE = "https://vamoslions.github.io/lionsfan/data/"


def restore():
    for kind in ("news", "fa"):
        try:
            remote = json.loads(fetch(BASE + kind + ".json"))
            stamp = datetime.fromisoformat(remote["lastSuccessAt"])
            if not isinstance(remote.get("items" if kind == "news" else "players"), list):
                raise ValueError("invalid snapshot")
            path = ROOT / "data" / f"{kind}.json"
            local = read_json(path, {})
            if stamp > datetime.fromisoformat(local.get("lastSuccessAt", "1970-01-01T00:00:00+00:00")):
                atomic_json(path, remote)
                print(f"Restored {kind} last-good snapshot")
        except Exception:
            print(f"{kind}: using checked-in last-good snapshot")
    try:
        remote_status = json.loads(fetch(BASE + "status.json"))
        path = ROOT / "data" / "status.json"
        local_status = read_json(path, {})
        for kind in ("news", "fa"):
            value = remote_status.get(kind, {})
            remote_time = datetime.fromisoformat(value["lastAttemptAt"])
            local_time = datetime.fromisoformat(local_status.get(kind, {}).get(
                "lastAttemptAt", "1970-01-01T00:00:00+00:00"))
            if remote_time > local_time:
                local_status[kind] = value
        atomic_json(path, local_status)
    except Exception:
        print("Using checked-in collection status")


if __name__ == "__main__":
    restore()
