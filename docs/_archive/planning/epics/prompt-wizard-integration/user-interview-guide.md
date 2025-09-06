# User Interview Guide - Prompt Wizard Validation

**Product Manager:** John 📋  
**Research Type:** Problem Validation  
**Target Participants:** 5-8 current Randomizer users  
**Interview Length:** 30 minutes

---

## Interview Objectives

1. Validate that manual preset creation is actually painful
2. Understand current workflows for prompt randomization
3. Test reaction to auto-parsing concept
4. Identify must-have vs nice-to-have features
5. Uncover unknown needs or concerns

---

## Participant Screener

**Recruit participants who:**
- ✅ Use the Randomizer at least weekly
- ✅ Create prompts in external tools (docs, notes, etc.)
- ✅ Have created at least 3 presets manually
- ✅ Represent our target personas (artists, directors, designers)

**Nice to have mix:**
- 2-3 power users (daily use)
- 2-3 regular users (weekly use)  
- 2-3 newer users (<3 months)

---

## Interview Script

### Opening (2 min)

"Hi [Name], thanks for joining! I'm exploring ways to improve how people create randomizable prompts. There are no wrong answers - I just want to understand your current workflow and pain points. This will take about 30 minutes. Mind if I record for notes?"

### Current State Discovery (10 min)

**Understanding their workflow:**

1. "Walk me through the last time you created a randomizable preset. Start from your initial idea."
   - *Listen for: Where they write prompts, how they identify variables*

2. "How long does it typically take you to go from prompt idea to working preset?"
   - *Listen for: Time investment, frustration points*

3. "What's the most frustrating part of creating presets today?"
   - *Listen for: Specific pain points to solve*

4. "How do you decide what parts of a prompt should vary vs stay fixed?"
   - *Listen for: Mental models, decision criteria*

5. "Have you ever given up on creating a preset? Why?"
   - *Listen for: Barriers, complexity issues*

### Problem Validation (5 min)

**Testing our assumptions:**

6. "On a scale of 1-10, how painful is manually creating nodes and connections?"
   - *Follow up: "What would make it a 10? What would make it a 1?"*

7. "If you could wave a magic wand and fix one thing about preset creation, what would it be?"
   - *Listen for: Whether parsing is even the right solution*

8. "How often do you reuse prompts from other sources (colleagues, internet, etc.)?"
   - *Listen for: Paste behavior frequency*

### Solution Exploration (10 min)

**Testing the concept:**

9. "Imagine you could paste a prompt and it automatically highlighted parts that could vary. What's your reaction?"
   - *Listen for: Excitement, skepticism, concerns*

10. "Would you trust an AI to identify the variable parts, or prefer full manual control?"
    - *Follow up: "What would make you trust it more?"*

11. [Show rough mockup if available] "Here's a rough idea - you paste, we highlight segments, you click to toggle lock/random. Thoughts?"
    - *Listen for: Comprehension, missing elements*

12. "What if the parser got it wrong 30% of the time but you could easily fix it?"
    - *Listen for: Tolerance for imperfection*

### Feature Prioritization (5 min)

**Understanding priorities:**

13. "Rank these features from most to least valuable:"
    - Auto-detect variable segments
    - Search and bind assets to segments
    - Keyboard shortcuts for everything
    - See live preview of variations
    - Save as reusable template
    - *Listen for: What actually matters*

14. "What features would you NOT want? What would make it worse?"
    - *Listen for: Anti-features to avoid*

15. "Would you prefer this as a wizard/assistant or integrated directly in the canvas?"
    - *Listen for: UX preferences*

### Closing Questions (3 min)

16. "What haven't I asked about that I should understand?"
    - *Listen for: Blind spots*

17. "Would you use this if it saved you 50% of preset creation time?"
    - *Follow up: "What about 30%? 70%?"*

18. "Who else struggles with this that I should talk to?"
    - *Listen for: Other user types*

---

## Key Hypotheses to Test

Rate each as: ✅ Validated | ⚠️ Partially | ❌ Invalidated

- [ ] Users spend >10 minutes creating presets manually
- [ ] Identifying variable parts is a significant pain point
- [ ] Users frequently paste prompts from external sources
- [ ] 50% parse accuracy would still be valuable
- [ ] Auto-parsing is preferred over template library
- [ ] Asset binding is expected/desired
- [ ] Keyboard shortcuts are important for efficiency
- [ ] Live preview is necessary for confidence

---

## Observation Guide

**During the interview, note:**

### Behavioral Cues
- Do they light up when describing the concept?
- Do they immediately start suggesting features?
- Do they mention colleagues who need this?
- Do they ask when it will be available?

### Language Patterns
- How do they describe their prompts? (recipes, templates, formulas?)
- What terminology do they use for variable parts?
- Do they think in "locks" and "randomizers"?

### Concerns/Objections
- Privacy/security mentions?
- Learning curve worries?
- Integration concerns?
- Performance expectations?

---

## Analysis Framework

### After each interview, score:

**Problem Severity (1-5):**
- How painful is manual preset creation?

**Solution Fit (1-5):**
- How well does auto-parsing solve their problem?

**Adoption Likelihood (1-5):**
- How likely are they to use this?

**Feature Priorities:**
- Rank mentioned features by frequency

**Quotes to Remember:**
- Capture verbatim impactful statements

---

## Red Flags to Watch For

**Stop and pivot if you hear:**
- "I actually like the manual process"
- "I don't trust AI with my creative work"
- "This seems more complex than what we have"
- "I never paste prompts, I always build from scratch"
- "Speed isn't the issue, it's [other thing]"

---

## Interview Synthesis Template

**After all interviews:**

### Key Insights
1. Most surprising learning:
2. Strongest validation:
3. Biggest concern:

### Feature Priority Matrix
| Feature | Requests | Priority |
|---------|----------|----------|
| Auto-parse | X/8 | P0/P1/P2 |
| Asset binding | X/8 | P0/P1/P2 |
| Preview | X/8 | P0/P1/P2 |
| Keyboard nav | X/8 | P0/P1/P2 |

### Persona Patterns
- Power users want: 
- Regular users want:
- New users want:

### Go/No-Go Recommendation
- Build as planned
- Build with modifications: [specify]
- Don't build, instead: [alternative]

---

## Logistics Checklist

- [ ] Recruit 5-8 participants
- [ ] Schedule 30-min slots with 15-min buffer
- [ ] Prepare mockup/wireframe (optional)
- [ ] Set up recording tool
- [ ] Create synthesis spreadsheet
- [ ] Book synthesis session with team
- [ ] Send thank you + follow-up to participants

---

## Sample Email Invite

Subject: 30 min chat about improving Randomizer - $25 gift card

Hi [Name],

I'm John from the product team. We're exploring ways to make creating randomizable presets faster and easier. 

Since you're an active Randomizer user, I'd love to get your input in a casual 30-minute video chat. There's no preparation needed - just want to hear about your experience and test some ideas.

As a thank you, you'll receive a $25 Amazon gift card.

Available times this week:
- [Time slots]

Interested? Just reply with what works for you.

Thanks!
John

---

## Remember

- Listen more than you talk (80/20 rule)
- Ask "why" and "tell me more" often
- Don't lead the witness
- Embrace awkward silence
- Focus on problems, not solutions
- Take notes on emotions, not just words