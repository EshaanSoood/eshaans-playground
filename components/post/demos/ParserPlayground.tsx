'use client'

import { useState } from 'react'
import {
  parserPlaygroundRegistry,
  type ParserPlaygroundDefinition,
} from '@/lib/parser-playground-registry'

interface ParserPlaygroundProps {
  demo: string
  title?: string
  description?: string
}

function formatOutput(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value, null, 2)
}

function MissingDemo({ demo }: { demo: string }) {
  return (
    <section className="my-10 rounded-[1.75rem] border border-orange-main/20 bg-orange-soft/25 p-6 shadow-paper">
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-orange-deep">Missing demo</p>
      <h2 className="mb-3 text-2xl">No parser playground is registered for "{demo}".</h2>
      <p className="m-0 text-base leading-8 text-text-secondary">
        Add a matching entry to `lib/parser-playground-registry.ts` and point it at your parser
        package or in-repo transform.
      </p>
    </section>
  )
}

export function ParserPlayground({ demo, title, description }: ParserPlaygroundProps) {
  const definition = parserPlaygroundRegistry[demo]
  const [input, setInput] = useState(definition?.sampleInput || '')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  if (!definition) {
    return <MissingDemo demo={demo} />
  }

  const resolvedTitle = title || definition.title
  const resolvedDescription = description || definition.description

  const runDemo = async (config: ParserPlaygroundDefinition) => {
    setIsRunning(true)
    setError(null)

    try {
      const result = await config.parse(input)
      setOutput(formatOutput(result))
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Failed to parse input.')
      setOutput('')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="my-10 rounded-[1.75rem] border border-border-light bg-white/75 p-5 shadow-paper sm:p-6">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-blue-deep/15 bg-blue-soft/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
            Interactive demo
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-text-light">{demo}</span>
        </div>
        <div>
          <h2 className="mb-2 text-2xl">{resolvedTitle}</h2>
          <p className="m-0 text-base leading-8 text-text-secondary">{resolvedDescription}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <label htmlFor={`parser-playground-${demo}`} className="text-sm font-medium text-text-secondary">
            Input
          </label>
          <textarea
            id={`parser-playground-${demo}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={definition.placeholder}
            className="min-h-[14rem] rounded-[1.25rem] border border-border-light bg-white/90 px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-deep/35 focus:ring-4 focus:ring-blue-deep/10"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => runDemo(definition)}
              disabled={isRunning}
              className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run parser'}
            </button>
            {definition.sampleInput ? (
              <button
                type="button"
                onClick={() => setInput(definition.sampleInput || '')}
                className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-blue-deep/30 hover:text-text-main"
              >
                Load sample
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="mb-0 text-xl">Output</h3>
          <div className="min-h-[14rem] rounded-[1.25rem] border border-border-light bg-blue-soft/12 p-4">
            {error ? (
              <p className="m-0 text-sm leading-7 text-orange-deep">{error}</p>
            ) : output ? (
              <pre className="m-0 overflow-auto rounded-none border-none bg-transparent p-0">
                <code>{output}</code>
              </pre>
            ) : (
              <p className="m-0 text-sm leading-7 text-text-light">
                Run the parser to inspect its structured output here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
