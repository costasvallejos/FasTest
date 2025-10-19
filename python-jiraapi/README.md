# Python Jira API Integration

A Python script to create Jira issues using the `jira` package and Personal Access Token (PAT) authentication.

## Setup

1. Install dependencies using `uv`:
```bash
uv sync
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Fill in your Jira credentials in `.env`:
   - `JIRA_URL`: Your Jira instance URL (e.g., `https://your-company.atlassian.net`)
   - `JIRA_PAT`: Your Personal Access Token
   - `JIRA_PROJECT_KEY`: The project key where issues will be created

### Getting a Jira Personal Access Token

1. Log in to your Jira instance
2. Go to Account Settings > Security > API tokens
3. Click "Create API token"
4. Give it a name and copy the generated token
5. Use this token as `JIRA_PAT` in your `.env` file

## Usage

Run the script with `uv`:
```bash
uv run python main.py
```

This will create a test issue in your specified Jira project and output the issue key and URL.

## Customization

To customize the issue being created, modify the `issue_data` dictionary in `main.py`:

```python
issue_data = {
    "project": {"key": project_key},
    "summary": "Your issue summary",
    "description": "Your issue description",
    "issuetype": {"name": "Task"},  # Can be Task, Bug, Story, etc.
}
```

You can add additional fields as needed based on your Jira project configuration.
