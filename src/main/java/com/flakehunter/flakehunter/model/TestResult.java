package com.flakehunter.flakehunter.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "test_result")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String repo;
    private Long runId;
    private String commitSha;
    private String testName;

    @Enumerated(EnumType.STRING)
    private TestStatus status;

    private Long durationMs;
    private String errorMessage;

    @Builder.Default
    private Instant executedAt = Instant.now();
}