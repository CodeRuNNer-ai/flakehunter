package com.flakehunter.flakehunter.repository;

import com.flakehunter.flakehunter.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
}