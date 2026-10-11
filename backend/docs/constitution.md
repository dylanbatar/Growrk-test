# Constitution

1. **Simple stack:** Use Node.js, TypeScript, Express, and Zod. Document the need for every added runtime dependency.
2. **Spec before code:** Every behavior change must match an agreed specification; update the specification before changing that behavior.
3. **Clear boundaries:** Validate requests with Zod middleware before controllers; keep validation schemas outside controllers. Controllers handle HTTP, services enforce business rules, and repositories handle storage.
4. **Tests required:** Test each behavior separately; do not combine create, update, and delete checks in one test. Cover new behavior and run the existing suite after every task. Report results and any incomplete verification.
5. **Unrelated failures:** Stop and report failures outside the task. Wait for the user's direction before fixing them.
6. **Replaceable persistence:** Access storage through repository interfaces. Use JSON initially; changing storage must not require changes to business rules.
