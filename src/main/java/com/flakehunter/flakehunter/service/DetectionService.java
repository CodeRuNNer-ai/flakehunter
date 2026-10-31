package com.flakehunter.flakehunter.service;

import com.flakehunter.flakehunter.repository.TestResultRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DetectionService {

    public record FlakyReport(String testName, String verdict, long runs,
                              long failures, double failureRatePercent, long flakyCommits) {}

    private final TestResultRepository repository;

    public DetectionService(TestResultRepository repository) {
        this.repository = repository;
    }

    public List<FlakyReport> analyze(String repo) {
        return repository.statsForRepo(repo).stream()
                .map(s -> {
                    long total = s.getTotal();
                    long failures = s.getFailures();
                    long flakyCommits = s.getFlakyCommits();

                    String verdict;
                    if (flakyCommits > 0)        verdict = "FLAKY";        // mixed results on the same commit
                    else if (failures == 0)      verdict = "STABLE";
                    else if (failures == total)  verdict = "BROKEN";       // fails every time
                    else                         verdict = "INCONCLUSIVE"; // changed only across commits

                    double rate = total == 0 ? 0 : Math.round(1000.0 * failures / total) / 10.0;
                    return new FlakyReport(s.getTestName(), verdict, total, failures, rate, flakyCommits);
                })
                .sorted(Comparator.comparing((FlakyReport r) -> !r.verdict().equals("FLAKY"))
                        .thenComparing(Comparator.comparingDouble(FlakyReport::failureRatePercent).reversed()))
                .toList();
    }
}