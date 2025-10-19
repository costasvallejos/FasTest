import os
from jira import JIRA
from dotenv import load_dotenv

load_dotenv()


def create_jira_issue():
    jira_url = os.getenv("JIRA_URL")
    jira_pat = os.getenv("JIRA_PAT")
    project_key = os.getenv("JIRA_PROJECT_KEY")

    if not all([jira_url, jira_pat, project_key]):
        raise ValueError(
            "Missing required environment variables: JIRA_URL, JIRA_PAT, JIRA_PROJECT_KEY"
        )

    headers = JIRA.DEFAULT_OPTIONS["headers"].copy()
    headers["Authorization"] = f"Bearer {jira_pat}"

    jira = JIRA(server=jira_url, options={"headers": headers})

    issue_data = {
        "project": {"key": project_key},
        "summary": "Test issue created via Python script",
        "description": "This is a test issue created using the jira Python package with PAT authentication.",
        "issuetype": {"name": "Task"},
    }

    try:
        new_issue = jira.create_issue(fields=issue_data)
        print(f"Issue created successfully!")
        print(f"Issue Key: {new_issue.key}")
        print(f"Issue URL: {jira_url}/browse/{new_issue.key}")
        return new_issue
    except Exception as e:
        print(f"Failed to create issue: {str(e)}")
        raise


if __name__ == "__main__":
    create_jira_issue()
