'use client';

import { useCompletion } from 'ai/react';

export default function Home() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/summarize',
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          AI Document Summarizer
        </h1>
        <p className="text-slate-400 mt-2">
          Paste long text or articles below to generate instant summaries.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste your text or document contents here..."
          rows={8}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Summarizing...' : 'Summarize Text'}
        </button>
      </form>

      {completion && (
        <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Summary Result</h2>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-300">
            {completion}
          </div>
        </section>
      )}
    </main>
  );
}
