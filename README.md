# AI Document Workbench SaaS

An enterprise-ready AI Document Workbench with a zero-downtime 4-provider failover architecture.

## Tech Stack
* **Framework**: Next.js (App Router), TypeScript, Tailwind CSS
* **Deployment**: Vercel
* **AI Pipeline**: 4-Provider Failover Chain (Groq -> OpenRouter -> Hugging Face -> Gemini)
* **Data Strategy**: Client-side browser localStorage (Zero DB configuration)

## Environment Setup
Create a `.env.local` file in the root directory and add your API keys:
* GROQ_API_KEY
* OPENROUTER_API_KEY
* HF_API_KEY
* GEMINI_API_KEY

## Local Development
* `npm install` - Install dependencies
* `npm run dev` - Launch local dev server
