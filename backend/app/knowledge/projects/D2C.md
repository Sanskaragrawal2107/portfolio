# D2C AI Employee (D2C Intelligence Platform)

## Problem
D2C founders run their business across disconnected platforms — Shopify (orders), Razorpay (payments), Shiprocket (logistics), and Meta Ads (advertising) — with no single system showing whether the business is actually profitable. Founders manually cross-check each dashboard, export to Excel, and calculate true profit by hand, often missing hidden margin leaks like high return-to-origin (RTO) rates or uncollected payment gaps.

## Solution
An autonomous agentic system that continuously monitors all four platforms at once and proactively flags margin leaks — with every flagged issue backed by row-level citations tracing directly back to the source data, so a founder can trust and verify every claim instead of taking an AI's word for it.

## Architecture
A two-phase anti-hallucination architecture designed specifically to prevent the AI from inventing numbers:
- **Phase 1 (deterministic):** Fast SQL aggregations run against 6 defined KPI thresholds — pure Python, zero LLM cost. This phase does all the actual math.
- **Phase 2 (LLM, conditional):** An LLM is only called when Phase 1 detects a threshold breach, to explain *why* it matters in plain language — not to compute numbers.
- A `validate_recommendations` function cross-checks every LLM output against the DB-computed values and silently drops any output that doesn't match, so the AI can never present a number it didn't actually verify.

The system exposes 8 MCP tools via FastMCP, each returning citation arrays that map every aggregated stat back to its source row reference — enabling a chat layer where a founder can ask "why is my ROAS dropping?" and get a verifiable, row-level answer instead of a vague summary.

## Tech Stack
Python, FastAPI, LangChain, LLM API integrations, FastMCP, Supabase.

## Features
- Simultaneous monitoring of Shopify, Razorpay, Shiprocket, and Meta Ads
- Automatic detection of margin leaks (e.g. high RTO rates, uncollected payment gaps)
- Every flagged issue includes row-level citations back to source data — fully auditable, not a black box
- Two-phase architecture that separates deterministic computation (Python/SQL) from LLM explanation, eliminating hallucinated numbers
- Conversational query layer (e.g. "why is my ROAS dropping?") answered with verifiable evidence via 8 exposed MCP tools

## Challenges
- Preventing the LLM from hallucinating financial numbers — solved by never letting the LLM compute anything; it only explains numbers Python already calculated and verified
- Keeping LLM costs low by only invoking the model when a real threshold breach occurs, instead of running it on every data refresh
- Designing citation arrays that map every aggregated stat back to an exact source row, so every claim is independently checkable

## Learnings
- How to architect AI systems for high-stakes financial use cases, where being wrong is worse than being silent — leading to the deterministic-first, LLM-second design
- Practical patterns for building verifiable, citation-backed AI outputs rather than trusting raw LLM responses
- How to expose a multi-tool agentic system (8 MCP tools) cleanly via FastMCP so a chat layer can compose them into real answers

## Future Scope
- Add inventory forecasting and revenue forecasting on top of the existing KPI monitoring
- Expand from flagging issues to recommending and eventually executing specific corrective actions (e.g. auto-pausing underperforming ad campaigns)
- Grow toward the long-term vision of an AI Chief Operating Officer for D2C businesses — one that founders can fully delegate day-to-day financial monitoring to

[project link:https://d2caiemployee.netlify.app/login](https://d2caiemployee.netlify.app/login)​
