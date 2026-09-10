# PROMPT_LOG.md — AI Usage Log

Project: Tip Calculator (1st midterm — web dev)
AI tool used (Prompts 1-9): Devin (CLI agent, GLM-5.3 Flash Max)

---

## Prompt 1 — Wire up the calculator

**Prompt:**
> "do u see the index html thing. i wanna extract all of this and give it functionality in js"

**Raw code generated (`script.js`, first version):**
- Grabbed all elements by id (`bill-input`, `people-input`, `custom-tip`, `tip-amount`, `total-amount`, `people-error`) plus all `.tip-button`s.
- `getTipPercent()`: reads the selected `.tip-button.is-selected`'s `data-tip`, otherwise parses the custom input.
- `update()`: reads bill + people, computes `tipTotal = bill * tipPercent / 100`, writes `tipTotal / people` and `(bill + tipTotal) / people` into the two `<output>` elements.
- Click listeners on the 5 preset % buttons, `input` listeners on bill / people / custom tip.
- `reset` listener on the form clears selection and zeros the outputs.
- Also added `<script src="./script.js"></script>` before `</body>` in `index.html`.

**How I adapted it:**
- Changed `[...document.querySelectorAll('.tip-button')]` to `Array.from(document.querySelectorAll('.tip-button'))` — same result, style I prefer.
- Read every line; can explain the math (tip % → total tip → divide by people) and why the `reset` listener is on the form, not the button.

---

## Prompt 2 — Simplify the code

**Prompt:**
> "get rid of the currency thing, dont make it too complicated. please use a simple if statement rather than fancy toggle parameters"

**What changed:**
- Removed `Intl.NumberFormat` currency formatter → simple `'$' + amount.toFixed(2)`.
- Replaced two-argument `classList.toggle('is-visible', condition)` with plain if/else using `classList.add` / `classList.remove`.

**My audit:** reloaded the page in the browser, confirmed $0.00 defaults, 2-decimal output, and that the "Can't be zero" error still shows/hides correctly.

---

## Prompt 3 — Custom tip highlight, cent rounding, funny errors

**Prompt:**
> "when using a custom tip pls make sure it is highlighted as selected. make sure to round up the cent(s). also do something funny or give a funny error message (u may modify html to add this/these msg(s)) when someone inputs a negative number of bill or people. same 1-line error style"

**What changed:**
- Typing in the Custom field now gives it `.is-selected` (and clears it from the % buttons); clicking a % button clears the custom field instead.
- Added `roundUpCents()`: `Math.ceil(amount * 100 - 0.000001) / 100` — always rounds cents UP. The tiny `- 0.000001` guards against float error (e.g. `4.2 * 100` is actually `420.00000000000006` in JS, which would wrongly ceil to 421).
- Added a new error element to `index.html` (bill section got a `.label-row` like the people section):
  `<p class="error-message" id="bill-error">Negative bill? So the restaurant pays you?</p>`
- Negative people swaps the error text to "Negative people? Ghosts don't tip."
- Results show `$0.00` while bill or people is negative.

**My audit:** tested in the browser — negative bill and negative people each show their error, errors clear when fixed, RESET clears everything (inputs, highlight, errors, outputs).

---

## Prompt 4 — Negative tip error, error wrap fix, gray-out

**Prompt:**
> "same thing with negative tip percentage. also, the ghost message overflows into 2 lines when displayed in desktop. can u make it already wrap into 2 lines so it doesn't mess with 'Number of People'. also, when in an invalid state, can u make the output card gray out or the output numbers gray out?"

**What changed:**
- New error element in `index.html` tip section: `<p class="error-message" id="tip-error">Negative tip? Even ghosts tip more.</p>` (shown when custom tip < 0).
- CSS wrap fix: `.label-row .form-label { white-space: nowrap; }` so labels like "Number of People" can't get squeezed, and `.error-message` got `max-width: 55%; text-align: right;` so long messages wrap inside their own space instead of pushing the layout.
- Invalid state (negative bill / tip, or people ≤ 0) adds `.is-invalid` to `.results-panel`; CSS turns the output numbers from cyan to gray (`--grayish-cyan`). RESET clears it.

**My audit:** tested each invalid input in the browser — errors show on their own line-wrapped row, numbers gray out, everything clears on RESET.

---

## Prompt 5 — Shorten error messages

**Prompt:**
> "the error messages, although funny, are too long and wrap around... they result in extra height and move the input label as well, so i can either make them boring and small or somehow easily and minimally fix this vertical movement"

**What changed:** shortened the three messages so each fits on one line (a 1-line error is smaller than the label, so row height never changes and nothing shifts vertically). No CSS/layout changes.
- Bill: "Negative bill? Nice try."
- Tip: "Even ghosts tip more."
- People (negative): "Ghosts don't tip."

**My audit:** confirmed in the browser that each message stays on one line and the labels no longer move when errors appear.

---

## Prompt 6 — Fractional people + boring consistent messages

**Prompt:**
> "another unintended use case is fractional people. let's turn all messages into boring 'Can't be noninteger' or similar vibes... have the error messages consistently in html rather than split between javascript and html, and make sure you only display one at a time fundamentally... if it's a negative noninteger value, have 1 error have precedence over the other"

**What changed:**
- All error text now lives in `index.html` (JS no longer sets `textContent` anywhere). The people field has three error elements in HTML — `#people-zero-error`, `#people-negative-error`, `#people-fraction-error` — and JS only toggles `is-visible` on one of them.
- One-at-a-time is guaranteed by structure: a single `peopleErrorEl` variable picks which error (if any) is shown; all three are hidden first, then at most one is shown.
- Precedence for people: negative wins over non-integer (e.g. -2.5 shows "Can't be negative"). Zero and non-integer can't happen at the same time.
- Messages: "Can't be zero" / "Can't be negative" / "Must be a whole number".
- Manual fix I made first: the old JS used `parseInt`, which silently truncated 2.5 people to 2 — switched to `parseFloat` so the fraction check (`people % 1 !== 0`) actually sees the decimal.

**My audit:** tested 2.5, -3, -2.5, 0, and 0.5 people in the browser — exactly one error shows per field, numbers gray out, RESET clears everything.

---

## Prompt 7 — wipe() refactor + review of my hand edits

**Prompt:**
> "i dont quite get why you're using selected.dataset.tip or why use Number when parseFloat exists. also can u consider making a separate wipe function to use both in the reset and also in the calc func before any errors are added? also i made some changes by hand, make sure i didnt break anything"

**Manual changes I had made by hand (kept):** moved the bill/tip error toggles above the people logic, added an early `return` when `hasError` so the valid math isn't in an `else`.

**What the review found (2 real breaks, both fixed):**
1. I had simplified `roundUpCents` to `Math.ceil(amount * 100) / 100` — dropped the `- 0.000001` float guard and `.toFixed(2)`. That broke two things: JS float noise makes `1.1 * 100` = `110.00000000000001`, so plain ceil turns a $1.10 tip into $1.11; and without `toFixed(2)` a $3.00 result displays as "$3" instead of "$3.00". Restored the original line.
2. My early-`return` refactor dropped the `people > 0` guard, so a filled bill with an empty people field divided by zero and showed "$Infinity". Re-added as a separate `if (people <= 0) return;`.

**AI changes:**
- New `wipe()` helper (hide all 5 error elements, remove `is-invalid`, zero both outputs). `update()` calls it first so it only ever ADDS errors; the reset listener calls it too.
- Explained `dataset.tip` (reads the `data-tip="5"` attribute from the HTML, so JS doesn't have to strip "%" off `value="5%"`) and unified on `parseFloat` instead of `Number` (identical for clean digits; `Number` is stricter, `parseFloat` keeps one conversion idiom across the file).

**What changed:** added a 4-line informal comment above `roundUpCents` explaining the float noise (`1.1 * 100` = `110.00000000000001`, also 2.2 / 4.4 / 8.8) and what `toFixed(2)` does. Decided NOT to add the `isFinite` guard for exotic inputs like `1e999` — overkill for this project.

---

## Prompt 8 — Document the ceil counterexample

**Prompt:**
> "id like to handle edge cases but not that weird of edge cases, so please document your counterexample of my ceil function (it wasnt just 1.1 lol right?), as a very simple informal comment"

**What changed:** added a 4-line informal comment above `roundUpCents` explaining the float noise (`1.1 * 100` = `110.00000000000001`, also 2.2 / 4.4 / 8.8) and what `toFixed(2)` does. Decided NOT to add the `isFinite` guard for exotic inputs like `1e999` — overkill for this project.

---

## Prompt 9 — Replace data-tip with a plain tip attribute

**Prompt:**
> "can u avoid the esoteric dataset property and use smth like tip=10 with tip as a custom attribute? so its just a value? in place of data-tip"

**What changed:** buttons now use `tip="10"` instead of `data-tip="10"`; JS reads it with `getAttribute('tip')` instead of `dataset.tip`. Kept my manual rename of `billInvalid`/`tipInvalid` → `billNegative`/`tipNegative`.

**My audit:** `node --check` passes; all 5 buttons carry `tip="..."` and clicking each still selects correctly in the browser.

**Trade-off to own in the defense:** `data-*` is the official HTML slot for custom data (that's why `dataset` exists); a bare `tip="..."` attribute works in every browser but a validator will flag it as non-standard. Chose simplicity for this project.

---

## Prompt 10 — Pull the project from GitHub (Santiago)

**Used by:** Santiago

**Prompt:**
> "jala de gh"

**What changed:**
- Pulled the current project from the `andres-up-dev/1st-midterm-webdev` GitHub repository into the local workspace.
- Restored the project files so Santiago could continue working from the shared version.

---

## Prompt 11 — Generate the basic HTML scaffold (Andres)

**Used by:** Andres

**Prompt:**
> "Generate quickly the basic structure for the Tip Calculator using only HTML so I can send it to Santi and he can start working on the JavaScript."

**What changed:**
- Generated the basic Tip Calculator HTML structure only.
- Added the form fields, tip controls, result outputs, IDs, and names needed for the later JavaScript work.
- Kept the scope limited to HTML so Andres could send the scaffold to Santiago and he could begin implementing the JS functionality.

**My audit:** confirmed that the HTML scaffold exposed the main elements through stable IDs and names, with no JavaScript included in this initial handoff.
