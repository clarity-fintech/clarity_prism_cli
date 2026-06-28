# Primitive & Command Registry

Tier 5 CLRTY CLI resolves every invocation through `@clrt/primitive-registry`.

## Categories

| Category | Commands |
|----------|----------|
| **System** | `clrt prism init`, `clrt prism sync` |
| **Identity** | `clrt prism identity`, `clrt account *` |
| **Commons** | `clrt prism commons get\|put\|discover\|peers` |
| **Registry** | `clrt skill *`, `clrt prism skill list\|run` |
| **Execution** | `clrt prism query\|execute`, `clrt helix *`, `clrt chain *`, `clrt exchange *`, `clrt run` |
| **Governance** | `clrt prism audit`, `clrt partner *`, `clrt settlement *`, `clrt pack *` |

## Global flags

- `--json` — structured output for piping
- `--dry-run` — validate inputs; skip network writes

## Package

`packages/primitive-registry/` — `defaultRegistry.register()`, `resolve(command)`.
