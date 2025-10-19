import { Version3Client } from 'jira.js';
import 'dotenv/config';

interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

interface CreateIssueParams {
  summary: string;
  description?: string;
  issueType?: string;
  priority?: string;
  labels?: string[];
  assignee?: string;
}

function getConfig(): JiraConfig {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!host || !email || !apiToken || !projectKey) {
    throw new Error(
      'Missing required environment variables. Please ensure JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY are set.'
    );
  }

  return { host, email, apiToken, projectKey };
}

async function createIssue(params: CreateIssueParams) {
  const config = getConfig();

  const client = new Version3Client({
    host: config.host,
    authentication: {
      basic: {
        email: config.email,
        apiToken: config.apiToken,
      },
    },
  });

  try {
    console.log('Verifying project access...');
    const project = await client.projects.getProject({
      projectIdOrKey: config.projectKey
    });
    console.log(`Project found: ${project.name} (${project.key})`);

    console.log('\nCreating issue...');
    const issueData: any = {
      fields: {
        summary: params.summary,
        project: { key: config.projectKey },
        issuetype: { name: params.issueType || 'Task' },
      },
    };

    if (params.description) {
      issueData.fields.description = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: params.description,
              },
            ],
          },
        ],
      };
    }

    if (params.priority) {
      issueData.fields.priority = { name: params.priority };
    }

    if (params.labels && params.labels.length > 0) {
      issueData.fields.labels = params.labels;
    }

    if (params.assignee) {
      issueData.fields.assignee = { accountId: params.assignee };
    }

    const newIssue = await client.issues.createIssue(issueData);

    console.log(`\nIssue created successfully!`);
    console.log(`Issue ID: ${newIssue.id}`);
    console.log(`Issue Key: ${newIssue.key}`);
    console.log(`URL: ${config.host}/browse/${newIssue.key}`);

    return newIssue;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating issue:', error.message);
      if ('response' in error && error.response) {
        const response = error.response as any;
        console.error('Response status:', response.status);
        console.error('Response data:', JSON.stringify(response.data, null, 2));
      }
    }
    throw error;
  }
}

async function main() {
  try {
    await createIssue({
      summary: 'Test issue created via jira.js',
      description: 'This is a test issue created using the jira.js TypeScript library.',
      issueType: 'Task',
      labels: ['automated', 'test'],
    });
  } catch (error) {
    console.error('Failed to create issue');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createIssue, CreateIssueParams };
