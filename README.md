# JAC: Jira Wiki Markup - Atlassian Doc Format Converter
> A simple converter for Jira Markup & ADF

## Instructions
(Assuming you have [pnpm](https://pnpm.io/installation) installed):
1. `pnpm i`
2. `pnpm run dev`
3. Open a browser and navigate to `http://localhost:5173/`

## Known issues
- Markup 'block' components (e.g., `{panel}`, `{color}`) have issues rendering in the Live Preview. Simply typing just above the opening tag(s) fixes the issue for all blocks
