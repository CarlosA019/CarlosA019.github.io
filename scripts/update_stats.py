"""Update public portfolio stats without exposing credentials in the website."""
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen

GITHUB_USERNAME = "CarlosA019"
LEETCODE_USERNAME = "CarlosA019"
STATS_PATH = Path(__file__).resolve().parents[1] / "stats.json"


def graphql(url, query, variables, headers):
    data = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    request = Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "CarlosA019-portfolio-stats/1.0", **headers}, method="POST")
    with urlopen(request, timeout=25) as response:
        payload = json.load(response)
    if payload.get("errors"):
        raise ValueError(str(payload["errors"]))
    return payload.get("data") or {}


def github_contributions():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN not provided")
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    query = '''query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar { totalContributions }
        }
      }
    }'''
    result = graphql("https://api.github.com/graphql", query, {
        "login": GITHUB_USERNAME,
        "from": start.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "to": end.isoformat(timespec="seconds").replace("+00:00", "Z"),
    }, {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"})
    return result["user"]["contributionsCollection"]["contributionCalendar"]["totalContributions"]


def leetcode_solved():
    query = '''query($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal { acSubmissionNum { difficulty count } }
      }
    }'''
    result = graphql("https://leetcode.com/graphql/", query, {"username": LEETCODE_USERNAME}, {
        "Referer": "https://leetcode.com/",
        "Origin": "https://leetcode.com",
        "Accept": "application/json",
    })
    user = result.get("matchedUser")
    if not user:
        raise ValueError("LeetCode user not found or public profile unavailable")
    counts = user["submitStatsGlobal"]["acSubmissionNum"]
    totals = [item["count"] for item in counts if item["difficulty"].lower() == "all"]
    if len(totals) != 1:
        raise ValueError("Could not find LeetCode All total")
    return totals[0]


def main():
    previous = json.loads(STATS_PATH.read_text(encoding="utf-8")) if STATS_PATH.exists() else {}
    current = dict(previous)
    succeeded = 0
    for key, fetcher in (("githubContributions30d", github_contributions), ("leetcodeSolvedTotal", leetcode_solved)):
        try:
            value = fetcher()
            if type(value) is not int or value < 0:
                raise ValueError(f"Invalid {key}: {value!r}")
            current[key] = value
            print(f"{key}: {value}")
            succeeded += 1
        except Exception as exc:
            print(f"WARNING: {key} refresh failed ({exc}); keeping previous value")
    if succeeded == 0:
        raise RuntimeError("Both sources failed; keeping existing stats.json")
    if current != previous:
        STATS_PATH.write_text(json.dumps(current, indent=2) + "\n", encoding="utf-8")
        print("Updated stats.json")
    else:
        print("No changes to stats.json")


if __name__ == "__main__":
    main()
