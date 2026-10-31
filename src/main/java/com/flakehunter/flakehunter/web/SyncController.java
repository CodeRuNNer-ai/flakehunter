package com.flakehunter.flakehunter.web;

import com.flakehunter.flakehunter.service.SyncService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync")
    public Map<String, Object> sync(@RequestParam String repo) throws Exception {
        return Map.of("imported", syncService.sync(repo));
    }
}