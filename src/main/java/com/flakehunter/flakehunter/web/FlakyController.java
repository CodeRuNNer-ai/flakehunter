package com.flakehunter.flakehunter.web;

import com.flakehunter.flakehunter.service.DetectionService;
import com.flakehunter.flakehunter.service.DetectionService.FlakyReport;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FlakyController {

    private final DetectionService detectionService;

    public FlakyController(DetectionService detectionService) {
        this.detectionService = detectionService;
    }

    @GetMapping("/flaky-tests")
    public List<FlakyReport> flakyTests(@RequestParam String repo,
                                        @RequestParam(defaultValue = "10") double rerunMinutes) {
        double safe = Math.max(0, Math.min(rerunMinutes, 1000));
        return detectionService.analyze(repo, safe);
    }
}