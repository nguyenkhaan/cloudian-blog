---
name: research
description: Guidelines for analyzing article content, synthesizing facts, and formatting precise citations and links.
---

This skill governs how the agent processes retrieved article content to synthesize answers accurately and cite sources.

## Core Directives
- **Grounded**: Base every claim, fact, or summary strictly on the text returned by the tools. If a detail is not in the text, treat it as unknown. Do not formulate answers using external assumptions.
- **Synthesis over Duplication**: Combine information from multiple articles when answering general queries. Avoid summarizing each post in isolation; instead, group them by theme or compare them using structured tables or bullet points.

## Steps
1. Parse the retrieved article content to extract key facts matching the user's question.
2. Structure the comparison or summary logically, grouping common points.
3. Verify that every stated fact is grounded in the retrieved text.

## Completion Criterion
The work is complete when every assertion is backed by a markdown link in the format `[Post Title](slug)` using the exact title and slug from the tool results.
