<img width="200" height="180" alt="FasTest Logo" src="https://github.com/user-attachments/assets/87316b08-92d2-4c94-8bae-798219c54921" />

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&duration=2000&pause=1000&color=E43AEB&width=435&lines=Testing+that+moves+fast+as+you+do)](https://git.io/typing-svg)

We built **FasTest**, a project that was completed at DubHacks 2025. It is exactly how it sounds: Fast + Testing. FasTest is automated testing platform that allows you to spend more time building rather than staring at failing tests. 

FasTest help automate tests for fast-paced teams. Developers can define each test in a single sentence, then run them as a concrete test script. This makes tests stable and dependable, while allowing developers to regenerate tests in a single click to match updated UIs. Our goal was to match the natural developer workflow, which is why we integrated with Jira, allowing us to instantly notify developers for failing tests with live bug reporting.

To build FasTest, we combined OpenAPI agents and the playwright MCP to allow an LLM to analyze test situations in depth, and then save concrete playwright tests based on their exploration. We deploy a containerized service to run these playwright tests remotely so that our developers never spend time setting up test environments. These tests stay in sync with Jira, creating issues for each failing test case to integrate directly into the developer workflow. Finally, we send these test results to our frontend, along with screenshots of failing test states and natural language descriptions of each failing test step.


