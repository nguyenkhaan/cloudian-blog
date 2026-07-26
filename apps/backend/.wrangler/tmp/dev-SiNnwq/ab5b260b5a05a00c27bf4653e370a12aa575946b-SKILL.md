---
name: search
description: Guidelines for query expansion, pagination, handling empty results, and tag/collection filtering.
---

This skill guides the agent on how to search the blog database effectively, refine empty results, and use tags/collections.

## Core Directives
- **Relentless**: If a search query returns no results, do not stop. Expand the search using synonyms, broader keywords, or translate English/Vietnamese terms.
- **Structured Selection**: Proactively list categories/tags to find correct parameters instead of guessing IDs or names.

## Steps
1. Execute search query.
2. If results are empty, analyze query terms and rewrite using synonyms or broader terms (e.g. "deploy" -> "deployment", "Workers" -> "Cloudflare").
3. Use `list_collections` or `list_tags` to cross-reference category names and filter by collection/tag if keyword search remains empty.

## Completion Criterion
The search task is complete when at least one relevant article is retrieved, or all query combinations and tag/collection mappings have been exhausted.
