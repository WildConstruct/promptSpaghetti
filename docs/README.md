**Prompt Spaghetti Documentation Governance**  
**Date: 16 March 2026**  
**Authoritative Source:** This index defines what governs what.

**Status Legend**  
- **Canonical / Governs Scope**: Binding for implementation priorities, sprint planning, and roadmap. Everyone must align here first.  
- **Narrative / Non-Authoritative**: Founder vision and commercial framing. Useful for demos, marketing, and inspiration. Not for technical scoping.  
- **Appendix / Candidate Implementation Path**: Speculative references only. Vendor-specific and replaceable. Use after abstract interfaces exist.

**Documents & Authority**  
1. **Canonical Product/Dev Brief** – Canonical / Governs Scope  
   (Single source of truth for beta scope and sequencing.)

2. **Launch Narrative Memo** – Narrative / Non-Authoritative  
   (Commercial hook and “why this matters” story.)

3. **Implementation Appendices** – Appendix / Candidate Implementation Path  
   (Krea, ControlNet, etc. — vendor-specific and replaceable. Not committed until the abstract preview interface is built.)

4. **ArtCraft Validation Spike** – Narrative / Non-Authoritative  
   (Bounded validation harness for comprehension testing only. Does not change
   mainline scope or product truth.)

5. **April 2 Phase 2 Gate Criteria** – Canonical / Governs Decision  
   (Decision rubric for whether the ArtCraft spike advances into Phase 2
   planning. Does not override the Canonical Product/Dev Brief for mainline
   implementation work.)

**Current Operating Rule**

- Track A = Prompt Spaghetti mainline. This remains authoritative and continues
  shipping regardless of any parallel spike work.
- Track B = ArtCraft validation spike. This is a timeboxed comprehension test,
  not a product pivot.
- Any conflict about implementation priorities still resolves in favor of the
  Canonical Product/Dev Brief.

Any conflict: the Canonical Brief wins. Updates to this index require founder + dev sign-off.
