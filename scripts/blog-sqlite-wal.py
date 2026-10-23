#!/usr/bin/env python3
"""Show what survives in SQLite's database and WAL after a writer exits.

Run: python3 scripts/blog-sqlite-wal.py

All files live in a temporary directory. The child exits after commit without
closing its connection, leaving the uncheckpointed WAL for inspection. The
parent copies files only after that child has stopped. This is a process-exit
and file-set experiment, not a power-failure test or a live-backup procedure.
"""

from contextlib import closing
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
from tempfile import TemporaryDirectory


def writer(database):
    connection = sqlite3.connect(database)
    connection.execute("PRAGMA page_size=4096")
    assert connection.execute("PRAGMA journal_mode=WAL").fetchone()[0] == "wal"
    connection.execute("PRAGMA synchronous=FULL")
    connection.execute("PRAGMA wal_autocheckpoint=0")
    assert connection.execute("PRAGMA synchronous").fetchone()[0] == 2
    assert connection.execute("PRAGMA wal_autocheckpoint").fetchone()[0] == 0
    connection.execute("CREATE TABLE events (id INTEGER PRIMARY KEY, value TEXT)")
    connection.commit()
    assert connection.execute("PRAGMA wal_checkpoint(TRUNCATE)").fetchone()[0] == 0
    connection.execute("INSERT INTO events VALUES (1, 'committed')")
    connection.commit()
    # Skip connection.close(), finalizers, and the last-connection checkpoint.
    os._exit(0)


def row_count(database):
    with closing(sqlite3.connect(database)) as connection:
        return connection.execute("SELECT count(*) FROM events").fetchone()[0]


def experiment():
    with TemporaryDirectory(prefix="whiteye-sqlite-wal-") as temporary:
        directory = Path(temporary)
        source = directory / "source.db"
        subprocess.run(
            [sys.executable, str(Path(__file__).resolve()), "--writer", str(source)],
            check=True,
            timeout=20,
        )
        wal = Path(str(source) + "-wal")
        sizes = {"database": source.stat().st_size, "wal": wal.stat().st_size}

        main_only = directory / "main-only.db"
        with_wal = directory / "with-wal.db"
        shutil.copyfile(source, main_only)
        shutil.copyfile(source, with_wal)
        shutil.copyfile(wal, str(with_wal) + "-wal")
        # The -shm index is deliberately not copied; SQLite can recreate it.
        counts = {"main_only": row_count(main_only),
                  "main_and_wal": row_count(with_wal)}
        assert counts == {"main_only": 0, "main_and_wal": 1}, counts
        return {"sqlite_version": sqlite3.sqlite_version,
                "python_version": sys.version.split()[0],
                "page_size": 4096, "synchronous": "FULL",
                "wal_autocheckpoint": 0, "bytes_before_opening_copies": sizes,
                "rows_after_reopening": counts,
                "copied_shm_index": False}


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--writer":
        writer(sys.argv[2])
    elif len(sys.argv) == 1:
        print(json.dumps(experiment(), indent=2, sort_keys=True))
    else:
        raise SystemExit("Run without arguments to use a temporary database.")
