# Agentic AI Hiring Platform (Hire a Human)
Alternative Names: HireaHuman, hire-a-human, HireaHuman GitHub repository, Hire a Human project.

## Problem
Tech hiring today is dominated by resumes and ATS keyword filters, not actual skill verification. Candidates can list identical stacks and years of experience and still be completely different builders, but the system can't tell them apart — and AI-written resumes have made it trivial to game these filters. Recruiters end up rejecting most candidates before ever seeing real evidence of their ability.

## Solution
Instead of relying on self-reported resumes, the platform autonomously verifies a candidate's real ability by researching their actual GitHub activity and LeetCode history against a specific job role, and produces a verified evaluation — not a keyword match score.

## Architecture
A hierarchical multi-agent system with three layers:
- **Orchestrator agent** — coordinates the overall evaluation flow for a given candidate and job role
- **Evaluator agent(s)** — analyze GitHub commit history, project depth, and LeetCode problem-solving data against the role's requirements
- **Report agent** — synthesizes the evaluation into a final, structured candidate report

The system also ships a production voice layer: a LiveKit voice agent with multilingual STT/TTS, achieving ~700ms time-to-first-audio, using Silero VAD and BVC noise cancellation, so a recruiter or candidate can interact with the system conversationally instead of just reading a dashboard.

## Tech Stack
Python, LangChain, LangGraph, MCP (2 custom MCP servers), LLM API integrations, LiveKit (deployed on LiveKit Cloud), hosted on Vercel.

## Features
- Autonomous, multi-agent candidate research and verification (no manual data entry by the candidate)
- GitHub activity and LeetCode history analyzed against the specific job role, not a generic score
- Real-time multilingual voice interaction layer with low latency (~700ms time-to-first-audio)
- Noise-cancelled, production-grade voice pipeline (Silero VAD + BVC)
- Currently live

## Challenges
- Designing a multi-agent architecture where each agent (Orchestrator, Evaluator, Report) has a clear, non-overlapping responsibility, instead of one monolithic agent trying to do everything
- Getting voice latency down to a usable ~700ms time-to-first-audio while keeping multilingual STT/TTS accurate
- Building reliable custom MCP servers that the agents could call consistently without breaking the evaluation pipeline

## Learnings
- How to break a complex evaluation task into smaller, owned sub-agent responsibilities (Orchestrator/Evaluator/Report) instead of one large prompt
- Practical experience deploying a low-latency, production voice AI pipeline (LiveKit Cloud + Vercel), not just a local prototype
- How to design and expose custom MCP servers that multiple agents can reliably depend on

## Future Scope
- Expand evaluation beyond GitHub/LeetCode to other proof-of-work sources
- Let recruiters search candidates using natural language and surface only verified, skill-matched profiles
- Scale from early users and recruiter validation toward becoming the default way technical hiring decisions get made — replacing resume-based filtering entirely

project link:[https://hire-a-human.app/](https://hire-a-human.app/)​
