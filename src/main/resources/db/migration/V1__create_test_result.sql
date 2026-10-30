CREATE TABLE test_result (
    id            BIGSERIAL PRIMARY KEY,
    repo          VARCHAR(255) NOT NULL,
    run_id        BIGINT,
    commit_sha    VARCHAR(64)  NOT NULL,
    test_name     VARCHAR(500) NOT NULL,
    status        VARCHAR(16)  NOT NULL,
    duration_ms   BIGINT,
    error_message TEXT,
    executed_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_test_result_name_time ON test_result (repo, test_name, executed_at);
CREATE INDEX idx_test_result_commit    ON test_result (repo, commit_sha, test_name);