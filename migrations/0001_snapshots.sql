CREATE TABLE snapshots (
  extension_id TEXT NOT NULL,
  date TEXT NOT NULL,
  downloads INTEGER NOT NULL,
  PRIMARY KEY (extension_id, date)
);

CREATE INDEX idx_snapshots_date ON snapshots (date);
