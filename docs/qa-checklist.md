# QA Testing Checklist - Epic 4 Alpha Release

This checklist validates all features and ensures quality standards for the v0.1.0-alpha release.

## Pre-Testing Setup

### Environment Preparation

- [ ] Development environment running (pnpm dev)
- [ ] All dependencies installed (pnpm install)
- [ ] All tests passing (pnpm test)
- [ ] Linting passing (pnpm lint)
- [ ] Build successful (pnpm build)

### Test Data Preparation

- [ ] Sample graphs with 5-10 nodes
- [ ] Sample graphs with 100+ nodes (performance testing)
- [ ] Sample graphs with various node types
- [ ] Sample graphs with complex connections
- [ ] Sample graphs with validation errors

## Epic 1 - Foundation & Core Infrastructure

### Story 1.1 - Repo & Monorepo Tooling

- [ ] Repository structure matches specification
- [ ] pnpm workspaces configured correctly
- [ ] All packages can be installed without errors
- [ ] Cross-package imports work correctly
- [ ] ESLint and Prettier configurations active

### Story 1.2 - Dev Container & VS Code Settings

- [ ] DevContainer launches successfully
- [ ] Node 18 and Python 3.11 available
- [ ] pnpm installed and working
- [ ] Ports 3000 and 8000 accessible
- [ ] VS Code extensions loading properly

### Story 1.3 - React-Flow Canvas Skeleton

- [ ] Canvas renders without errors
- [ ] Grid and minimap visible
- [ ] Mouse interactions work (pan, zoom)
- [ ] No console errors on load
- [ ] Responsive on different screen sizes

### Story 1.4 - CI Pipeline

- [ ] GitHub Actions workflow runs on push
- [ ] Linting step executes
- [ ] Tests run with coverage
- [ ] Build process completes
- [ ] Performance tests execute

### Story 1.5 - Preview Deployment

- [ ] Preview URL accessible
- [ ] Application loads correctly
- [ ] All features work in preview
- [ ] No broken assets or styles

## Epic 2 - Editor MVP (Graph Authoring)

### Story 2.1 - Core Node Library UI

- [ ] All 6 node types visible in palette
- [ ] Node icons display correctly
- [ ] Tooltips show on hover
- [ ] Drag and drop works from palette
- [ ] Nodes appear on canvas after drop
- [ ] Node properties display correctly

### Story 2.2 - Node Connections & Validation

- [ ] Can connect nodes with edges
- [ ] Invalid connections highlighted in red
- [ ] Validation errors show in status bar
- [ ] Hover reveals error messages
- [ ] Self-loops prevented
- [ ] Duplicate edges prevented

### Story 2.3 - Node Inspector Forms

- [ ] Selecting node opens inspector
- [ ] Form fields match node schema
- [ ] Changes update graph immediately
- [ ] Field validation works
- [ ] Form resets when selecting different node
- [ ] Required fields properly marked

### Story 2.4 - Preview-5 Modal

- [ ] Preview button triggers modal
- [ ] Modal shows 5 different outputs
- [ ] Seeds displayed with each output
- [ ] Loading spinner during execution
- [ ] Error handling for invalid graphs
- [ ] Modal closes properly

### Story 2.5 - Graph JSON Autosave

- [ ] Graph saves to localStorage automatically
- [ ] Restore prompt appears on reload
- [ ] Restore functionality works
- [ ] Save as JSON downloads file
- [ ] Downloaded file is valid JSON

## Epic 3 - Executor & Integration

### Story 3.1 - Deterministic Graph Executor

- [ ] Same seed produces identical output
- [ ] Different seeds produce different outputs
- [ ] All node types execute correctly
- [ ] Variable context works properly
- [ ] Execution completes in <1 second
- [ ] Memory usage stays under 500MB

### Story 3.2 - CLI Wrapper

- [ ] CLI installs via npm
- [ ] Basic execution works
- [ ] Seed parameter works
- [ ] Help command shows usage
- [ ] Error handling works
- [ ] Exit codes correct

### Story 3.3 - Export to GeneratorBundle

- [ ] Export produces valid bundle
- [ ] Bundle structure matches spec
- [ ] Exported bundle can be imported
- [ ] All node types export correctly
- [ ] Metadata preserved in export

### Story 3.4 - Import Legacy Bundle

- [ ] Can import existing bundles
- [ ] Imported graph displays correctly
- [ ] Round-trip export/import works
- [ ] Edge cases handled gracefully
- [ ] Error messages helpful

### Story 3.5 - Determinism Test Matrix

- [ ] Test runs with multiple seeds
- [ ] Outputs match expected results
- [ ] No random variations
- [ ] Performance within limits
- [ ] Memory usage stable

### Story 3.6 - Preview API Endpoint

- [ ] API endpoint responds correctly
- [ ] Returns proper JSON format
- [ ] Error handling works
- [ ] CORS headers set
- [ ] Rate limiting works

## Epic 4 - Alpha Hardening & DX Polish

### Story 4.1 - Performance Profiling & Tuning

- [ ] Large graphs (250+ nodes) render smoothly
- [ ] FPS stays above 30 during interactions
- [ ] Memory usage under 500MB
- [ ] React components properly memoized
- [ ] No memory leaks detected
- [ ] Bundle size under 5MB

### Story 4.2 - Corrections Manager Feature Flag

- [ ] Feature flag controls visibility
- [ ] Panel opens and closes correctly
- [ ] Can add/edit/delete rules
- [ ] Rules apply to test text
- [ ] Regex patterns work
- [ ] Default rules load properly

### Story 4.3 - Vercel Production Deploy

- [ ] Application deploys successfully
- [ ] All API endpoints work
- [ ] Static assets load correctly
- [ ] Environment variables set
- [ ] Health check endpoint responds
- [ ] CORS configured properly

### Story 4.4 - Documentation & Onboarding

- [ ] README is comprehensive
- [ ] Architecture docs accurate
- [ ] API documentation complete
- [ ] Code examples work
- [ ] Installation steps clear
- [ ] Troubleshooting guide helpful

### Story 4.5 - QA Sign-off & Release Notes

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Accessibility compliance
- [ ] Security review complete
- [ ] Release notes accurate

## Cross-Browser Testing

### Chrome (Primary)

- [ ] All features work correctly
- [ ] Performance meets targets
- [ ] No console errors
- [ ] Drag and drop works
- [ ] File operations work

### Firefox

- [ ] Application loads correctly
- [ ] Core features functional
- [ ] Performance acceptable
- [ ] No major visual issues
- [ ] Canvas interactions work

### Safari

- [ ] Application loads correctly
- [ ] Core features functional
- [ ] Performance acceptable
- [ ] No major visual issues
- [ ] Canvas interactions work

### Edge

- [ ] Application loads correctly
- [ ] Core features functional
- [ ] Performance acceptable
- [ ] No major visual issues
- [ ] Canvas interactions work

## Accessibility Testing

### WCAG 2.1 AA Compliance

- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on components
- [ ] Color contrast ratios meet standards
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Specific Accessibility Features

- [ ] Canvas navigation with keyboard
- [ ] Node selection with keyboard
- [ ] Form inputs properly labeled
- [ ] Error messages announced
- [ ] Status updates announced
- [ ] Modal dialogs accessible

## Performance Testing

### Load Testing

- [ ] 10-node graph: < 100ms execution
- [ ] 50-node graph: < 500ms execution
- [ ] 100-node graph: < 1s execution
- [ ] 250-node graph: < 2s execution
- [ ] 500-node graph: < 5s execution

### Memory Testing

- [ ] Initial load: < 100MB
- [ ] After 10 minutes use: < 200MB
- [ ] After creating large graph: < 500MB
- [ ] No memory leaks detected
- [ ] Garbage collection working

### Network Testing

- [ ] Works on slow connections
- [ ] Graceful degradation
- [ ] Offline functionality
- [ ] API timeouts handled
- [ ] Retry mechanisms work

## Security Testing

### Input Validation

- [ ] XSS prevention working
- [ ] SQL injection prevention
- [ ] File upload restrictions
- [ ] Rate limiting active
- [ ] CSRF protection enabled

### Authentication & Authorization

- [ ] No sensitive data exposed
- [ ] Environment variables secure
- [ ] API endpoints protected
- [ ] Error messages safe
- [ ] Logs don't contain secrets

## Error Handling

### User Experience

- [ ] Friendly error messages
- [ ] Graceful degradation
- [ ] Recovery mechanisms
- [ ] Progress indicators
- [ ] Timeout handling

### Technical Errors

- [ ] Network failures handled
- [ ] Invalid data handled
- [ ] Edge cases covered
- [ ] Logging comprehensive
- [ ] Monitoring alerts work

## Integration Testing

### End-to-End Scenarios

- [ ] Complete graph creation workflow
- [ ] Export/import round trip
- [ ] CLI execution workflow
- [ ] API integration testing
- [ ] Cross-component interactions

### Data Flow Testing

- [ ] Graph validation pipeline
- [ ] Execution context passing
- [ ] State management consistency
- [ ] Event handling reliability
- [ ] Error propagation

## Deployment Testing

### Development Environment

- [ ] Local development setup works
- [ ] Hot reload functional
- [ ] Debug tools accessible
- [ ] Environment variables loaded
- [ ] All services running

### Production Environment

- [ ] Vercel deployment successful
- [ ] All endpoints accessible
- [ ] Static assets cached
- [ ] Environment variables set
- [ ] Monitoring active

## Regression Testing

### Previous Features

- [ ] Epic 1 features still work
- [ ] Epic 2 features still work
- [ ] Epic 3 features still work
- [ ] No breaking changes
- [ ] Performance maintained

### Data Compatibility

- [ ] Old graphs still load
- [ ] Old exports still work
- [ ] Schema migrations work
- [ ] Backward compatibility maintained
- [ ] Migration path clear

## Final Release Criteria

### Must-Have (Blockers)

- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security review passed
- [ ] Accessibility compliance
- [ ] Cross-browser compatibility

### Should-Have (Important)

- [ ] Documentation complete
- [ ] User experience polished
- [ ] Error handling comprehensive
- [ ] Monitoring in place
- [ ] Rollback plan ready

### Nice-to-Have (Future)

- [ ] Additional optimizations
- [ ] Enhanced features
- [ ] Extended browser support
- [ ] Advanced analytics
- [ ] User feedback integration

## Sign-off

### Technical Lead

- [ ] Code review complete
- [ ] Architecture approved
- [ ] Performance validated
- [ ] Security reviewed
- [ ] Documentation approved

### QA Lead

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance validated
- [ ] Accessibility verified
- [ ] User experience approved

### Product Owner

- [ ] Requirements met
- [ ] User stories complete
- [ ] Acceptance criteria satisfied
- [ ] Release ready
- [ ] Go-live approved

---

**QA Sign-off**: **\*\*\*\***\_**\*\*\*\*** Date: **\*\*\*\***\_**\*\*\*\***

**Technical Sign-off**: **\*\*\*\***\_**\*\*\*\*** Date: **\*\*\*\***\_**\*\*\*\***

**Product Sign-off**: **\*\*\*\***\_**\*\*\*\*** Date: **\*\*\*\***\_**\*\*\*\***
