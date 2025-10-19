import os
from jira import JIRA
from dotenv import load_dotenv

load_dotenv()


def create_jira_issue():
    jira_host = os.getenv("JIRA_HOST")
    jira_email = os.getenv("JIRA_EMAIL")
    jira_api_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("JIRA_PROJECT_KEY")

    if not all([jira_host, jira_email, jira_api_token, project_key]):
        raise ValueError(
            "Missing required environment variables: JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY"
        )

    jira = JIRA(server=jira_host, basic_auth=(jira_email, jira_api_token))

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
        print(f"Issue URL: {jira_host}/browse/{new_issue.key}")
        return new_issue
    except Exception as e:
        print(f"Failed to create issue: {str(e)}")
        raise


if __name__ == "__main__":
    create_jira_issue()
