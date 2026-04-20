export interface ParserPlaygroundDefinition {
  title: string
  description: string
  placeholder?: string
  sampleInput?: string
  parse: (input: string) => unknown | Promise<unknown>
}

export const parserPlaygroundRegistry: Record<string, ParserPlaygroundDefinition> = {
  'demo-parser': {
    title: 'Parser Playground',
    description:
      'Replace this placeholder definition with your real parser package import in `lib/parser-playground-registry.ts`.',
    placeholder: 'Paste raw event text here',
    sampleInput: 'focus:start 2026-04-18T08:30:00Z',
    parse(input) {
      return {
        raw: input,
        note: 'Hook your npm library into this registry entry to get a live parser demo in posts.',
      }
    },
  },
}
