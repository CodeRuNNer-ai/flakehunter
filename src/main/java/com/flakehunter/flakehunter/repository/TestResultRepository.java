package com.flakehunter.flakehunter.repository;

import com.flakehunter.flakehunter.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    boolean existsByRepoAndRunId(String repo, Long runId);

    @Query(nativeQuery = true, value = """
        WITH per_commit AS (
            SELECT test_name, commit_sha,
                   SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) AS passes,
                   SUM(CASE WHEN status IN ('FAILED', 'ERROR') THEN 1 ELSE 0 END) AS fails
            FROM test_result
            WHERE repo = :repo AND status <> 'SKIPPED'
            GROUP BY test_name, commit_sha
        )
        SELECT test_name AS "testName",
               CAST(SUM(passes + fails) AS BIGINT) AS "total",
               CAST(SUM(fails) AS BIGINT) AS "failures",
               CAST(SUM(CASE WHEN passes > 0 AND fails > 0 THEN 1 ELSE 0 END) AS BIGINT) AS "flakyCommits"
        FROM per_commit
        GROUP BY test_name
        """)
    List<TestStats> statsForRepo(@Param("repo") String repo);
}