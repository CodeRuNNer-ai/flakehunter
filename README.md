# FlakeHunter

**Find the tests you cannot trust.**

FlakeHunter reads test results from your GitHub Actions runs, finds *flaky* tests (tests that both pass and fail on the same commit), ranks them, and shows how much CI time they waste, on a simple dashboard.

![FlakeHunter dashboard](docs/dashboard.png)

## The problem

A flaky test fails randomly without any code change. Teams re-run the pipeline, lose minutes or hours, and slowly stop trusting their tests. The hard part is knowing *which* tests are flaky, because a single run can't tell you. FlakeHunter compares many runs of the same commit to find out.

## How it works

1. **Collect:** your workflow uploads JUnit XML test reports as artifacts. FlakeHunter downloads them through the GitHub REST API.
2. **Store:** every test result (test, status, duration, commit, run) is saved in PostgreSQL.
3. **Detect:** for each test and each commit, it checks whether the test both passed and failed.
4. **Rank:** flaky tests are ordered by estimated wasted time.
5. **Show:** a React dashboard displays verdicts, charts and a sortable table.

### Verdicts

| Verdict | Meaning |
|---|---|
| **Flaky** | Passed and failed on the same commit at least once |
| **Broken** | Fails every time |
| **Stable** | Never failed |
| **Inconclusive** | Failures exist, but results only change across commits, so there is no proof of flakiness |

### Estimated wasted time

For flaky tests only: `failures × rerun cost (minutes)`. The rerun cost is adjustable on the dashboard (default 10 minutes).

## Features

- Sync CI results from any GitHub repository you have access to
- Flaky / Broken / Stable / Inconclusive classification
- Estimated CI time wasted per test and in total
- Dashboard with summary cards, verdict split chart, failure-rate chart and a sortable, filterable table
- Light and dark theme
- Safe XML parsing (protected against XXE)
- GitHub token never sent to artifact storage (manual redirect handling)

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Data JPA (Hibernate), Flyway |
| Database | PostgreSQL 16 (Docker) |
| Frontend | React, Vite, plain CSS |
| CI source | GitHub Actions, GitHub REST API |
| Build | Maven wrapper (`mvnw`) |

## Getting started

### Requirements

- JDK 21
- Node.js 20 or newer
- Docker
- A GitHub fine-grained personal access token with **Actions: Read-only** on the repo you want to analyze

### 1. Start the database

```bash
docker run --name flake-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=flakehunter -p 5432:5432 -d postgres:16
```

Next time, just run `docker start flake-db`.

### 2. Start the backend

Windows (PowerShell):

```powershell
$env:GITHUB_TOKEN="your_token_here"
.\mvnw spring-boot:run
```

macOS / Linux:

```bash
export GITHUB_TOKEN=your_token_here
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080`. Database tables are created automatically by Flyway.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints (usually `http://localhost:5173`).

### 4. Connect a repository

Add this step to the test job of the GitHub Actions workflow in the repo you want to analyze:

```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: surefire-${{ github.run_attempt }}
    path: target/surefire-reports/*.xml
```

If you use a job matrix, include the matrix value in the artifact name so each job gets a unique name (for example `surefire-${{ matrix.attempt }}`).

Then run the workflow several times, enter `owner/repo` in the dashboard and click **Sync from GitHub**, then **Load**.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/flaky-tests?repo=owner/repo&rerunMinutes=10` | Ranked test report with verdicts and wasted time |
| `POST` | `/api/sync?repo=owner/repo` | Download and import new runs from GitHub |
| `POST` | `/api/import` | Import one JUnit XML file (multipart: `file`, `repo`, `commitSha`, `runId`) |

Example response item:

```json
{
  "testName": "com.demo.FlakyTest#sometimesFails",
  "verdict": "FLAKY",
  "runs": 50,
  "failures": 14,
  "failureRatePercent": 28.0,
  "flakyCommits": 5,
  "estimatedWastedMinutes": 140.0
}
```

## Project structure

```
flakehunter/
├── src/main/java/com/flakehunter/flakehunter/
│   ├── github/        GitHub API client
│   ├── model/         JPA entity and enums
│   ├── parser/        JUnit XML parser
│   ├── repository/    Database queries
│   ├── service/       Sync and detection logic
│   └── web/           REST controllers
├── src/main/resources/
│   └── db/migration/  Flyway SQL migrations
└── frontend/          React dashboard (Vite)
```

## Limitations

- Reads JUnit XML only (Maven Surefire, or Gradle with XML reports enabled)
- GitHub Actions only
- Uses one server-side GitHub token and has no user login, so it is meant for local or single-team use
- GitHub deletes artifacts after 90 days by default, so older runs cannot be imported
- Wasted time is an estimate based on a configurable rerun cost, not measured pipeline time

## Roadmap

- [ ] Docker Compose for one-command setup
- [ ] Unit and integration tests, plus CI for this repo
- [ ] Per-test history timeline
- [ ] Quarantine a flaky test with an owner and expiry date
- [ ] Measured pipeline duration from GitHub run timestamps
- [ ] GitHub login and per-user repositories
- [ ] Webhooks for automatic updates

## License

MIT
