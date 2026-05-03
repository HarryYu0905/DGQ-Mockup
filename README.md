# DGQ Redesign Prototype

Interactive student prototype for an academic redesign of a digital legal help intake flow.

This fixed version includes prioritised triage routing:
- SCT is one possible result only, not the fallback/default result.
- Urgent/safety, property-agent, non-residential, uncertain scope, longer-tenancy, and amount-limit issues are routed away from default SCT.
- The fallback result is “More information needed — possible routes.”

This is an illustrative mockup only. It does not reproduce or represent an official Singapore Courts page.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
