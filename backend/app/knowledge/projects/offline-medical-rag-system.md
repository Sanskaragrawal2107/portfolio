# Offline Medical RAG System

## Problem
Medical information needs to be both reliable and private. Standard LLM-based Q&A risks hallucinating medical facts from parametric memory, and sending sensitive medical queries to a cloud API isn't acceptable for a fully private, trustworthy system.

## Solution
A fully offline retrieval-augmented generation (RAG) pipeline built over Harrison's Principles of Internal Medicine (2,000+ pages), where the model is only allowed to answer using retrieved chunks from the actual textbook — with zero data ever leaving the machine and zero reliance on the LLM's own internal/parametric knowledge.

## Architecture
The entire textbook is chunked and embedded using a local embedding model, then stored in ChromaDB as the vector store. At query time, relevant chunks are retrieved from ChromaDB and passed as context to a locally-run LLM (Mistral, via Ollama), which is constrained to answer only from the retrieved context — producing grounded, citation-backed responses instead of relying on the model's own training knowledge.

## Tech Stack
Python, ChromaDB, Mistral (via Ollama), LangChain.

## Features
- Fully offline — no data ever leaves the machine, no cloud API calls
- 2,000+ page medical textbook chunked and embedded into a local vector database
- Local LLM (Mistral via Ollama) constrained to answer only from retrieved chunks
- Citation-backed, grounded responses with no hallucination from the model's parametric memory
- 6 additional custom MCP servers built for personal use (fixit, shanon, leetcode, travel, flight, hotel), refined through LLM feedback loops and iterative prompt tuning

## Challenges
- Getting a local embedding model and local LLM to run efficiently offline without cloud compute
- Chunking a 2,000+ page technical medical textbook in a way that preserved enough context for accurate retrieval
- Constraining the LLM to only use retrieved context and not fall back on its own (potentially wrong) trained medical knowledge

## Learnings
- Hands-on experience building a complete offline RAG pipeline end-to-end — embedding, vector storage, retrieval, and local LLM inference
- How to reduce hallucination risk by strictly grounding responses in retrieved evidence rather than trusting model memory
- Iterative prompt refinement and feedback loops to improve reliability across multiple MCP tools, not just one pipeline

## Future Scope
- Expand the knowledge base beyond a single textbook to additional medical references
- Improve retrieval accuracy with better chunking/embedding strategies for highly technical text
- Explore applying the same fully-offline, citation-grounded RAG pattern to other high-stakes, privacy-sensitive domains​
