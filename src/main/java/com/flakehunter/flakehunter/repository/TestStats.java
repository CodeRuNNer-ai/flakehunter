package com.flakehunter.flakehunter.repository;

public interface TestStats {
    String getTestName();
    Long getTotal();
    Long getFailures();
    Long getFlakyCommits();
}