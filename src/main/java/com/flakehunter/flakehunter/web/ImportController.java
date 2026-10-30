package com.flakehunter.flakehunter.web;

import com.flakehunter.flakehunter.model.TestResult;
import com.flakehunter.flakehunter.parser.JUnitXmlParser;
import com.flakehunter.flakehunter.repository.TestResultRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ImportController {

    private final JUnitXmlParser parser;
    private final TestResultRepository repository;

    public ImportController(JUnitXmlParser parser, TestResultRepository repository) {
        this.parser = parser;
        this.repository = repository;
    }

    @PostMapping("/import")
    public Map<String, Object> importReport(@RequestParam MultipartFile file,
                                            @RequestParam String repo,
                                            @RequestParam String commitSha,
                                            @RequestParam(required = false) Long runId)
            throws Exception {
        List<TestResult> results = parser.parse(file.getInputStream(), repo, runId, commitSha);
        repository.saveAll(results);
        return Map.of("imported", results.size());
    }
}