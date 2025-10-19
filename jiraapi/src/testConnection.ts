import { Version3Client } from 'jira.js';
import 'dotenv/config';

async function testConnection() {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  console.log('Testing Jira connection...\n');
  console.log('Configuration:');
  console.log(`Host: ${host}`);
  console.log(`Email: ${email}`);
  console.log(`Project Key: ${projectKey}`);
  console.log(`API Token: ${apiToken ? '***' + apiToken.slice(-4) : 'not set'}\n`);

  if (!host || !email || !apiToken || !projectKey) {
    console.error('Missing required environment variables.');
    console.error('Please create a .env file with:');
    console.error('- JIRA_HOST');
    console.error('- JIRA_EMAIL');
    console.error('- JIRA_API_TOKEN');
    console.error('- JIRA_PROJECT_KEY');
    process.exit(1);
  }

  const client = new Version3Client({
    host,
    authentication: {
      basic: {
        email,
        apiToken,
      },
    },
  });

  try {
    console.log('Testing authentication...');
    const myself = await client.myself.getCurrentUser();
    console.log(`Authenticated as: ${myself.displayName} (${myself.emailAddress})`);

    console.log('\nTesting project access...');
    const project = await client.projects.getProject({
      projectIdOrKey: projectKey
    });
    console.log(`Project found: ${project.name} (${project.key})`);
    console.log(`Project ID: ${project.id}`);

    console.log('\nFetching available issue types...');
    const issueTypes = await client.issueTypes.getIssueAllTypes();
    console.log('Available issue types:');
    issueTypes.forEach((type: any) => {
      console.log(`  - ${type.name} (${type.id})`);
    });

    console.log('\nConnection test successful!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('\nConnection test failed:', error.message);
      if ('response' in error && error.response) {
        const response = error.response as any;
        console.error('Status:', response.status);
        console.error('Details:', JSON.stringify(response.data, null, 2));
      }
    }
    process.exit(1);
  }
}

testConnection();
