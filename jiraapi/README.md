# Jira Issue Creator

A TypeScript script to create issues in Jira using the jira.js library.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your Jira credentials in `.env`:
   - `JIRA_HOST`: Your Jira instance URL (e.g., https://your-domain.atlassian.net)
   - `JIRA_EMAIL`: Your Jira account email
   - `JIRA_API_TOKEN`: Your Jira API token (create one at https://id.atlassian.com/manage-profile/security/api-tokens)
   - `JIRA_PROJECT_KEY`: The project key where issues will be created

## Usage

Run the script to create a test issue:
```bash
npm run create-issue
```

## Features

The script supports creating issues with:
- Summary (required)
- Description (optional)
- Issue type (default: Task)
- Priority (optional)
- Labels (optional)
- Assignee by account ID (optional)

## Error Handling

The script includes comprehensive error handling with detailed error messages and response data logging for troubleshooting.
