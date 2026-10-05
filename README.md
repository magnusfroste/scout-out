# ScoutOut — Research & Outreach

> **Now part of [Flowwink](https://www.flowwink.com).** ScoutOut was the prototype that proved the concept; it lives on as the **Outreach** module in Flowwink, the open-source Business Operating System — operable by any agent. New work happens there: [github.com/magnusfroste/flowwink](https://github.com/magnusfroste/flowwink).

ScoutOut tested one question: can AI take a salesperson from *"who is this company?"* to *"here is a message worth sending"* in minutes?

- **Prospect research** — AI-generated company research, discovery questions and value propositions
- **Personalized outreach** — tailored emails sent from your own mailbox (Microsoft 365 / Graph)
- **Workflow automation** — research and proposal steps orchestrated through n8n webhooks and MCP connections

What worked became the Outreach module in Flowwink, where an autonomous agent can run the same flow end to end.

## Run the prototype

React · TypeScript · Vite · Supabase

```bash
npm install
npm run dev
```

Set `VITE_USE_MOCK_DATA=true` in `.env.development` to use the built-in mock company data (`src/mocks/companySearchMock.ts`) instead of paid API calls. Webhook formats are documented in [WEBHOOK_API_SPECIFICATION.md](WEBHOOK_API_SPECIFICATION.md).

## License

MIT
