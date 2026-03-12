# Security Posture Pre-Beta

## Purpose

This document captures the current security posture after Phase 0 through Phase 2 hardening.

It defines what is currently verified in application code versus what still depends on external infrastructure, especially Supabase policy configuration.

## Attack Surface Map

- Admin surface
- LLM routes
- Agent routes
- PSG routes
- File storage routes
- Graph and project persistence
- External provider integrations

## Verified Protections

- Admin and debug exposure in deployable legacy `api/` paths is disabled.
- Admin surfaces are opt-in and gated behind explicit configuration and auth.
- Mock authentication utilities are quarantined from production-like environments.
- LLM, agent, PSG, and file routes enforce explicit server-side access policy.
- File storage has a server-enforced owner boundary.
- Basic per-user quotas and capability checks exist on authenticated cloud routes.
- Server logging has been reviewed to avoid accidental provider payload or project-content leakage in active beta-facing paths.

## External Dependencies Not Yet Verified

- Cloud saved graph isolation currently depends on Supabase row-level security and storage policies that are not defined in this repository.
- Deployed Supabase project policies have not yet been verified through policy audit or live cross-user access tests.
- Full tenant isolation across all persisted cloud objects therefore remains an external verification step.

## Beta Verification Gate

Before wider beta or paid API exposure, the deployed Supabase environment must be verified for:

- RLS policy review for graphs, projects, presets, and related tables
- Storage policy review for uploaded assets
- Live cross-user access tests confirming read, update, and delete isolation

## Non-Goals For This Phase

- This phase does not implement full billing-aware capability enforcement.
- This phase does not redesign the auth system.
- This phase does not introduce enterprise-grade tenant partitioning.

The goal of this phase was to remove obvious exposures and establish explicit server boundaries before external verification.

## Current Confidence Level

The application runtime now enforces explicit server-side access boundaries.

Remaining isolation questions are confined primarily to external Supabase configuration rather than application code.
