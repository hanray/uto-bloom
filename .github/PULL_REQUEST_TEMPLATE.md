# Pull Request Checklist

Before merging this PR, ensure all items are checked:

## Code Quality
- [ ] Code follows project conventions and style guide
- [ ] No console.log statements in production code
- [ ] All functions have appropriate error handling
- [ ] Code is properly commented with REQ: tags where applicable

## Requirements Traceability
- [ ] Commit messages include `Implements: <ReqID>` for all relevant requirements
- [ ] All new features have corresponding `// REQ: <ID>` tags in code
- [ ] `npm run verify:features` passes without errors
- [ ] STATUS.md has been updated (run verify script)

## Testing
- [ ] All new code has been manually tested
- [ ] Edge cases have been considered
- [ ] No regressions in existing functionality

## Documentation
- [ ] FEATURES.md updated if new requirements added
- [ ] README.md updated if user-facing changes
- [ ] Code comments explain complex logic

## Git Hygiene
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Commits are atomic and well-described
- [ ] No sensitive data (credentials, keys) in commits

## Requirement IDs Addressed
List all requirement IDs this PR implements:
- REQ: 
- REQ: 

## Additional Notes
<!-- Any additional context, screenshots, or information -->

---

**Important**: PRs that fail `npm run verify:features` cannot be merged.
