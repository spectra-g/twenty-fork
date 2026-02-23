# Implementation Plan: STORY-012 (SCRUM-288)

## Story Summary
Update `isWorkDomain` function in Twenty CRM to normalize domain input to lowercase before comparison against known non-work domains. This ensures case-insensitive domain matching for uppercase, mixed-case, and lowercase inputs.

## Setup Command
```
mise trust -y && mise install node@24.5 && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 mise exec -- corepack enable && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 mise exec -- yarn install && mise exec -- bash packages/twenty-utils/setup-dev-env.sh
```

## Test Command
```
mise exec -- yarn test
```

## 1. Dependencies to Install

No new dependencies required. This is a modification to existing utility function logic.

## 2. Prisma Schema Changes

None. This story does not involve database changes.

## 3. Files to Create or Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `packages/twenty-shared/src/utils/isWorkDomain.ts` (or similar path) | MODIFY | Add `.toLowerCase()` normalization to domain input before comparison |
| `packages/twenty-shared/src/utils/__tests__/isWorkDomain.test.ts` (or similar) | MODIFY/CREATE | Add test cases for uppercase, mixed-case, and lowercase domain inputs |

**Note:** The exact file path for `isWorkDomain` will be confirmed during implementation. Based on the repo structure, it is likely in `packages/twenty-shared/src/` or `packages/twenty-server/src/`.

## 4. Test Cases

### Test Case 1: Uppercase Non-Work Domain
- **Input:** `isWorkDomain('GMAIL.COM')`
- **Expected Status:** Returns `false`
- **Expected Response:** `false` (gmail.com is a known non-work domain)

### Test Case 2: Mixed-Case Non-Work Domain
- **Input:** `isWorkDomain('Gmail.Com')`
- **Expected Status:** Returns `false`
- **Expected Response:** `false` (gmail.com is a known non-work domain)

### Test Case 3: Lowercase Non-Work Domain (existing behavior)
- **Input:** `isWorkDomain('gmail.com')`
- **Expected Status:** Returns `false`
- **Expected Response:** `false` (gmail.com is a known non-work domain)

### Test Case 4: Uppercase Work Domain
- **Input:** `isWorkDomain('COMPANY.COM')`
- **Expected Status:** Returns `true`
- **Expected Response:** `true` (not in known non-work domain list)

### Test Case 5: Mixed-Case Work Domain
- **Input:** `isWorkDomain('MyCompany.Com')`
- **Expected Status:** Returns `true`
- **Expected Response:** `true` (not in known non-work domain list)

### Test Case 6: Lowercase Work Domain (existing behavior)
- **Input:** `isWorkDomain('company.com')`
- **Expected Status:** Returns `true`
- **Expected Response:** `true` (not in known non-work domain list)

## 5. Implementation Order

1. **Locate the `isWorkDomain` function** in the repository
2. **Write/Update tests first** - Add the 6 test cases above to the test file
3. **Run tests** - Confirm they fail (TDD approach)
4. **Implement the fix** - Add `.toLowerCase()` to normalize domain input
5. **Run tests again** - Confirm all tests pass
6. **Run full test suite** - Ensure no regressions

## 6. Middleware Pipeline

Not applicable. This is a utility function change with no middleware involvement.

## 7. Open Questions or Assumptions

1. **Assumption:** The `isWorkDomain` function compares against a hardcoded list of known non-work domains (e.g., gmail.com, yahoo.com, hotmail.com, etc.).
2. **Assumption:** The function should return `true` for work domains and `false` for non-work domains.
3. **Assumption:** The comparison list of non-work domains is already stored in lowercase format.
4. **Question:** The exact file location of `isWorkDomain` will be determined during implementation by searching the codebase.
