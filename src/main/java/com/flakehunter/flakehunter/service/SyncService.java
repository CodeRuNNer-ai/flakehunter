package com.flakehunter.flakehunter.service;

import com.flakehunter.flakehunter.github.GitHubClient;
import com.flakehunter.flakehunter.model.TestResult;
import com.flakehunter.flakehunter.parser.JUnitXmlParser;
import com.flakehunter.flakehunter.repository.TestResultRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class SyncService {

    private final GitHubClient client;
    private final JUnitXmlParser parser;
    private final TestResultRepository repository;

    public SyncService(GitHubClient client, JUnitXmlParser parser, TestResultRepository repository) {
        this.client = client;
        this.parser = parser;
        this.repository = repository;
    }

    public int sync(String repo) throws Exception {
        int imported = 0;
        for (int page = 1; page <= 3; page++) {
            List<Map<String, Object>> runs = client.listRuns(repo, page);
            if (runs == null || runs.isEmpty()) break;

            for (Map<String, Object> run : runs) {
                long runId = ((Number) run.get("id")).longValue();
                String sha = (String) run.get("head_sha");
                if (repository.existsByRepoAndRunId(repo, runId)) continue; // already imported

                for (Map<String, Object> artifact : client.listArtifacts(repo, runId)) {
                    if (Boolean.TRUE.equals(artifact.get("expired"))) continue;
                    long artifactId = ((Number) artifact.get("id")).longValue();
                    byte[] zip = client.downloadArtifact(repo, artifactId);

                    try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zip))) {
                        ZipEntry entry;
                        while ((entry = zis.getNextEntry()) != null) {
                            if (!entry.getName().endsWith(".xml")) continue;
                            byte[] xml = zis.readAllBytes();
                            List<TestResult> results =
                                    parser.parse(new ByteArrayInputStream(xml), repo, runId, sha);
                            repository.saveAll(results);
                            imported += results.size();
                        }
                    }
                }
            }
        }
        return imported;
    }
}