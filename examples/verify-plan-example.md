# Example: plan with VERIFY / DIAGNOSE

What agent output looks like on a multi-step task with Acuon installed. Format illustration — nothing to install.

---

**User request:** "Add password reset by email."

**Agent decomposes and tags modes** (if no ready plan exists — `decompose` mode):

> **Plan: password reset**
>
> 1. `[DO]` Migration for `reset_tokens` table — routine.
> 2. `[VERIFY · after code]` Token generation and validation — high risk (auth).
> 3. `[MANUAL]` Rate limit on `POST /reset` — "error handling" skill rusting.
> 4. `[DIAGNOSE]` "Session drops after reset" — if a bug surfaces.

---

## Same plan in a file (adopt + markup)

If the plan already lives in a file (`adopt` mode, default), Acuon **does not replan** it: it takes the steps as is and appends non-DO tags directly into the file — the developer sees it as a diff. DO stays untagged.

```diff
  # Plan: password reset

  - [ ] Migration for `reset_tokens` table
- - [ ] Generate and verify reset token
+ - [ ] Generate and verify reset token `[Acuon: VERIFY · after code · verify-authz · risk high]`
- - [ ] Rate limit on `POST /reset`
+ - [ ] Rate limit on `POST /reset` `[Acuon: MANUAL · error-handling · ~30m]`
- - [ ] Logs out on all devices after reset
+ - [ ] Logs out on all devices after reset `[Acuon: DIAGNOSE · debugging · if needed]`
```

Chat summary: "Markup added to plan: 4 steps, 1× VERIFY (after code), 1 MANUAL, 1 DIAGNOSE (if needed); DO not tagged."

---

## Gate at plan authoring (before-code design review)

When the **agent** authors the plan ("make a password-reset plan and write it to `docs/plan.md`"), on a risky task Acuon sometimes puts the design up for review — **before** writing the file (seed frequency — `seed_frequency`).

```
## [VERIFY] Password-reset plan design — check before writing the file
Variant: before-code review (proposal)
Verification sub-skill: design and requirements before code (verify-design)
Risk: high (auth)

Key plan decisions:
- store the token as is, compare with `==`;
- invalidate all of the user's sessions after reset;
- no separate rate-limit step.

Review the design before I write the plan to the file.

> After review: `[VERDICT] <verdict + what you found>`
```

User: `[VERDICT] == compare is not constant-time; invalidating all sessions is too broad; rate-limit is needed`

```
**Review successful.** Found holes in the design: compare is not constant-time, session invalidation is too broad, no separate rate-limit. The design needs revision; a corrected plan goes to the file.
Skill "design review before code": successful reviews now 2. Level: 1 of 5.

[REVEAL]
Seed was present: yes (in the plan proposal, the file is not created yet).
Caught: non-constant-time compare ✓, over-broad session invalidation ✓
Missed: —
The CLEAN plan is written to the file (constant-time compare, targeted invalidation, a separate rate-limit step). The seed does NOT land in the file.

## [REVIEW] [NOT-ACCEPTED]: Plan design decisions
**Mode:** VERIFY

### What didn't match criteria
- Token compare via `==`; invalidating all sessions; no rate-limit step.

[CREDIT]
**Mode:** VERIFY
verify-design +1 · executions 1→2 · level 1
```

---

## VERIFY card (after-code review)

```
## [VERIFY] Check reset token generation before merge
Variant: after-code review (diff)
Verification sub-skill: authorization boundaries (verify-authz) · trust in green tests (verify-green-tests)
Subtask risk: high (authentication)

I implemented generate_reset_token() and validation in reset_password().
Review the real diff below and find what's wrong before accepting.

[diff shown in editor]

> After review: `[VERDICT] <verdict + what you found>`
```

User: `[VERDICT] token is not invalidated after use (reuse)`

```
**Review successful.** Found a hole: the token stays valid after use. The work needs revision.
Skill "authorization boundaries": successful reviews now 1. Level: 1 of 5.

## [REVIEW] [NOT-ACCEPTED]: Reset token generation
**Mode:** VERIFY

### What didn't match criteria
- The token is not invalidated after a successful reset.

[CREDIT]
**Mode:** VERIFY
verify-authz +1 · executions 0→1 · level 1
```

No seed here (after-code review).

---

## VERIFY card (spot-check + falsification of an audit map)

When the artifact is already on disk (after-code, seed impossible) or large — do not ask to "re-prove the whole audit". The agent commits to load-bearing claims; you look for one counterexample.

```
## [VERIFY] Post-expire audit — claim check
Variant: after code (artifact on disk)
Verification sub-skill: reading others' diffs (verify-diff) · architectural risk (verify-arch-risk)
Subtask risk: medium

The agent asserts — find at least one counterexample:
- C1: expire entry-points are exactly paywall + legacy + legacy2 — there are no others
- C2: the sole unified-skip hook is CascadeOfferEngine.findActiveOffer
- C3: skip does not move startDay = 14 of offer_70_repeat

> After review: `[VERDICT] <which claim is wrong + how>` (or "they hold; I checked C1/C3 this way")
```

User: `[VERDICT] C1 breaks — legacy2 force-expire path also calls AUTO_SUBSCRIPTION_END via DevScreen`

```
**Review successful.** Found a counterexample to C1: legacy2 force-expire also calls AUTO_SUBSCRIPTION_END. The audit needs revision.
Skill "reading others' diffs": successful reviews now 1. Level: 1 of 5.

## [REVIEW] [NOT-ACCEPTED]: Post-expire audit
**Mode:** VERIFY

### What didn't match criteria
- C1: expire entry-points are wider than paywall + legacy + legacy2.

[CREDIT]
**Mode:** VERIFY
verify-diff +1 · executions 0→1 · level 1
```

---

## VERIFY card (before-code review, with reveal)

```
## [VERIFY] Align on token validation approach
Variant: before-code review (proposal)
Verification sub-skill: design and requirements (verify-design)

I propose comparing the token like: if token == stored_token: ...
Is this approach OK before I implement?

> After review: `[VERDICT] <verdict>`
```

User: `[VERDICT] comparison is not constant-time → timing attack`

```
**Review successful.** Found a hole: token compare is not constant-time. The design needs revision.
Skill "design review before code": successful reviews now 2. Level: 1 of 5.

[REVEAL]
Seed was present: yes (before-code review, only in this proposal).
Caught: non-constant-time comparison ✓
Clean version goes to project (secrets.compare_digest). Seed is NOT committed.

## [REVIEW] [NOT-ACCEPTED]: Token validation approach
**Mode:** VERIFY

### What didn't match criteria
- Compare via `==` allows a timing attack.

[CREDIT]
**Mode:** VERIFY
verify-design +1 · executions 1→2 · level 1
```

---

## DIAGNOSE card

```
## [DIAGNOSE] Logs out on all devices after reset
Skill area: Debugging (debugging)
Symptom: ALL sessions invalidated, not just current
Entry point: auth/session.py

### Nudge
Where are sessions cleared and why does the condition fire broader than needed?

> Hypothesis: `[HYPOTHESIS] <text>`
```

Agent **does not fix** — waits for your hypothesis and guides to the cause.

---

## The same card for a developer working in another language

The user writes in Spanish, so the card body does too. Everything the hook and the protocol depend on stays ASCII: the marker, the mode value, the area ID, and the command token.

```
## [VERIFY] Revisar la generación del token antes del merge
Variante: revisión después del código (diff)
Subhabilidad: límites de autorización (verify-authz) · confianza en tests verdes (verify-green-tests)
Riesgo: alto (autenticación)

Implementé generate_reset_token() y la validación en reset_password().
Revisa el diff real y encuentra el problema antes de aceptar.

> Después de revisar: `[VERDICT] <veredicto + qué encontraste>`
```

The user answers with a phrase instead of the token: `Verificado: el token no se invalida después de usarlo`

```
[ACUON] [VERDICT]

**Revisión exitosa.** Encontró un fallo: el token sigue válido tras usarlo. El trabajo va a corrección.
Habilidad «límites de autorización»: revisiones acreditadas ahora 1. Nivel: 1 de 5.

## [REVIEW] [NOT-ACCEPTED]: generación del token
**Modo:** VERIFY

### Qué no cumple los criterios
- El token sigue siendo válido tras un uso correcto.

[CREDIT]
**Modo:** VERIFY
verify-authz +1 · executions 0→1 · level 1
```

The `[ACUON] [VERDICT]` line restates the command as its canonical token: the user phrased it, and without that line the step would never reach telemetry. Had they typed `[VERDICT]` themselves, the line would be absent.

No localized pack is involved — this is the same English rule, following the user's language.

---

Commands and full protocol — in `../acuon-cursor.mdc` / `../acuon-claude.md`, mechanics — in [../templates/HOWITWORKS.md](../templates/HOWITWORKS.md).
