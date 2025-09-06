## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)

## Related Issues
Closes #(issue number)
Related to #(issue numbers)

## Changes Made
- List the main changes
- Be specific about what was modified
- Include any architectural decisions

## Testing
- [ ] Unit tests pass locally (`pnpm test`)
- [ ] Integration tests pass (`pnpm test:integration`)
- [ ] Manual testing completed
- [ ] Performance tests pass (`pnpm test:performance-only`)
- [ ] Security tests pass (`pnpm test:security`)

### Test Coverage
- Current coverage: X%
- Coverage change: +/- X%
- [ ] New code has tests
- [ ] All tests are passing

## Screenshots/Videos
If applicable, add screenshots or videos to demonstrate the changes.

## Checklist
### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have run `pnpm lint` and fixed any issues
- [ ] I have run `pnpm typecheck` with no errors

### Documentation
- [ ] I have updated the documentation accordingly
- [ ] I have updated CLAUDE.md if there are agent-relevant changes
- [ ] I have added/updated JSDoc comments for new functions
- [ ] I have updated the README if needed

### Security
- [ ] I have not introduced any security vulnerabilities
- [ ] I have not committed any secrets or API keys
- [ ] All user inputs are properly validated and sanitized
- [ ] I have followed the security checklist in SECURITY.md

### Performance
- [ ] My changes do not negatively impact performance
- [ ] I have run performance benchmarks if applicable
- [ ] Large operations are properly optimized (pagination, virtualization, etc.)

### Epic/Story Specific (if applicable)
- [ ] This aligns with the acceptance criteria in the story document
- [ ] I have updated the story status if needed
- [ ] Parser changes include updated golden tests (`packages/eval/goldens/`)
- [ ] LLM changes have been evaluated against regression thresholds

## Breaking Changes
List any breaking changes and migration steps required.

## Deployment Notes
Any special deployment considerations or configuration changes needed.

## Reviewer Notes
Anything specific you'd like reviewers to focus on?

## Post-Merge Actions
- [ ] Update documentation site
- [ ] Notify team in Discord
- [ ] Update project board
- [ ] Create follow-up issues if needed

---
**By submitting this PR, I confirm that my contribution is made under the terms of the project's license.**