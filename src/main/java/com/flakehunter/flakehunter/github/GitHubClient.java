package com.flakehunter.flakehunter.github;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Component
public class GitHubClient {

    private final RestClient rest;
    private final String token;
    // Redirects handled by hand: the download link redirects to storage, which must not receive our token
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER).build();

    public GitHubClient(@Value("${github.token:}") String token) {
        this.token = token;
        this.rest = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Authorization", "Bearer " + token)
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listRuns(String repo, int page) {
        Map<String, Object> body = rest.get()
                .uri("/repos/" + repo + "/actions/runs?per_page=50&status=completed&page=" + page)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        return (List<Map<String, Object>>) body.get("workflow_runs");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listArtifacts(String repo, long runId) {
        Map<String, Object> body = rest.get()
                .uri("/repos/" + repo + "/actions/runs/" + runId + "/artifacts?per_page=100")
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        return (List<Map<String, Object>>) body.get("artifacts");
    }

    public byte[] downloadArtifact(String repo, long artifactId) throws Exception {
        HttpRequest first = HttpRequest.newBuilder(URI.create(
                        "https://api.github.com/repos/" + repo + "/actions/artifacts/" + artifactId + "/zip"))
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/vnd.github+json")
                .build();
        HttpResponse<Void> r1 = http.send(first, HttpResponse.BodyHandlers.discarding());
        if (r1.statusCode() / 100 != 3) {
            throw new IllegalStateException("Expected a redirect but got HTTP " + r1.statusCode());
        }
        String location = r1.headers().firstValue("Location").orElseThrow();
        HttpResponse<byte[]> r2 = http.send(
                HttpRequest.newBuilder(URI.create(location)).build(),
                HttpResponse.BodyHandlers.ofByteArray());
        return r2.body();
    }
}