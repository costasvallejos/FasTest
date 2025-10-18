PLAYWRIGHT_GUIDELINES = r"""
# Playwright Test Writing Guidelines

Tuned for modern Playwright Test (JavaScript), robust waiting, stable selectors, and low‑flake CI. 

---

## 1) Selector strategy (most stable → least)

* Prefer **role-based** and **accessible name** locators:

  ```ts
  page.getByRole('button', { name: 'Submit' })
  ```
* If available, prefer a **data-testid** (or `data-test`) attribute:

  ```ts
  page.getByTestId('checkout-submit')
  ```
* For text, use **exact** or **/i** regex, but only when unique:

  ```ts
  page.getByText('Profile').click()
  // or
  page.getByText(/profile/i)
  ```
* Avoid brittle CSS/XPath, nth-child, dynamic IDs, and long DOM chains.
* If a visible label differs from the programmatic name, consider **locator filters** (`hasText`, `has`, `filter`).

## 2) Waiting & navigation (no manual sleeps)

* Rely on **auto-waiting** for locator actions & assertions; never use `waitForTimeout()` unless testing a real timing contract.
* Prefer assertion-based navigation waits:

  ```ts
  await page.getByRole('link', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/login$/);
  ```
* If a click opens a new tab/window, **wait for the popup**:

  ```ts
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Open Docs' }).click(),
  ]);
  await expect(popup).toHaveURL(/docs/);
  ```
* For downloads:

  ```ts
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /export/i }).click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();
  ```

## 3) Assertions that reflect UX

* Assert **what the user sees**, not internal implementation details:

  * ✅ `await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()`
  * ✅ `await expect(page).toHaveURL(/dashboard/)`
  * ❌ Asserting on CSS classes/internal attributes unless they’re a contract
* Prefer: `toHaveURL`, `toHaveTitle`, `toBeVisible`, `toBeEnabled/Disabled`, `toHaveText`, `toHaveValue`, `toHaveAttribute`.
* For async content, use **`expect.poll`** when you need computed values:

  ```ts
  await expect.poll(async () => {
    const count = await page.getByTestId('cart-count').textContent();
    return Number(count);
  }).toBeGreaterThan(0);
  ```

## 4) Test isolation & data

* Each test must be **independent and idempotent**; no reliance on prior tests.
* If auth is required, use **storage state** or a **login fixture**:

  ```ts
  // global setup example
  // await page.context().storageState({ path: 'storageState.json' })
  // playwright.config.ts: use: { storageState: 'storageState.json' }
  ```
* Prefer creating/cleaning **test data** via API (faster, less flaky) rather than UI setup flows.

## 5) Flake reduction patterns

* Interact with **locators**, not raw selectors:

  ```ts
  const email = page.getByPlaceholder('Email');
  await email.fill('user@example.com');
  await expect(email).toHaveValue('user@example.com');
  ```
* Stabilize dynamic lists with exact matches or **`locator.first()`** when appropriate (this is important as not doing this will cause errors):

  ```ts
  await page.getByRole('listitem', { name: 'My Item' }).click();
  // or
  await page.getByRole('listitem').first().click();
  ```
* When something appears after an async action, use an **assertion to wait** (`toBeVisible`, `toContainText`) instead of `waitForSelector` unless you need custom options.

## 6) Events: new tabs, dialogs, navigation, network

* **Popups**: see §2.
* **Dialogs**:

  ```ts
  page.once('dialog', async d => { await d.accept(); });
  await page.getByRole('button', { name: 'Delete' }).click();
  ```
* **API verification** (optional): assert via `page.route`/`request` fixtures or verify post-UI state. Prefer **UI assertions** unless API contract is the target.

## 7) Robustness with time & animation

* If the app uses spinners/transitions, assert on the **post-state**, not the spinner:

  ```ts
  await expect(page.getByTestId('spinner')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  ```
* Don’t hardcode animation timings; let Playwright’s auto-wait handle visibility/attachment.

## 8) Test structure & readability

* One **clear scenario per test**; use `test.step()` to label phases:

  ```ts
  await test.step('Navigate to Login', async () => { /* ... */ });
  await test.step('Submit credentials', async () => { /* ... */ });
  await test.step('Verify dashboard', async () => { /* ... */ });
  ```
* Keep **arrange → act → assert** obvious; avoid interleaving many assertions with actions unless they stabilize the flow.

## 9) CI friendliness

* Avoid `test.describe.serial` unless truly necessary.
* Use **retries** sparingly; fix selectors/waits first.
* Capture diagnostics on failure (set once in config):

  ```ts
  // playwright.config.ts
  use: { trace: 'retain-on-failure', video: 'retain-on-failure', screenshot: 'only-on-failure' }
  ```
* When exploring with MCP, keep **screenshot quality low** unless zooming into fine details to save tokens.

## 10) Security & privacy

* Never commit or log real credentials/secrets. Use env vars/CI secrets.
* Prefer **test accounts** and sanitized fixtures for auth flows.

## 11) Anti-patterns to avoid

* `page.waitForTimeout(…)` as a sync mechanism.
* Chained CSS like `.container > div:nth-child(2) span`.
* Clicking before an element is ready (let locators **auto-wait**).
* Assertions on transient spinners/loaders as “success”.
* Tests that require a specific run order.

## 12) Handy snippets

**Wait for network + UI state via assertion (preferred):**

```ts
await page.getByRole('button', { name: 'Search' }).click();
await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
await expect(page.getByTestId('result-count')).toHaveText(/^\d+$/);
```

**Open in new tab and assert content:**

```ts
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: /privacy policy/i }).click(),
]);
await popup.waitForLoadState('domcontentloaded');
await expect(popup.getByRole('heading', { name: /privacy/i })).toBeVisible();
```

**File upload:**

```ts
await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample.pdf');
await expect(page.getByText('sample.pdf')).toBeVisible();
```

**API-assisted setup (faster & stable):**

```ts
// using request fixture
test('user sees created item', async ({ request, page }) => {
  const { id } = await (await request.post('/api/items', { data: { name: 'X' } })).json();
  await page.goto(`/items/${id}`);
  await expect(page.getByRole('heading', { name: 'X' })).toBeVisible();
});
```

**Stable date/time behavior:** If UI depends on time, inject a **fixed clock** or mock server responses; avoid “current time” flake.

---

### Avoiding Playwright Strict-Mode Errors 

* **Always act on a single element.** Before clicking/filling, ensure uniqueness:

  ```ts
  const btn = page.getByRole('button', { name: /^sign in$/i });
  await expect(btn).toHaveCount(1);
  await btn.click();
  ```

* **Disambiguate when multiple matches exist.** Use one of:

  * `.first()` or `.nth(i)` when the order is intentional and stable:

    ```ts
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    ```
  * **Scope to a container** (card/row/section) and then find within:

    ```ts
    const card = page.getByRole('article', { name: /pro plan/i });
    await card.getByRole('button', { name: /^choose plan$/i }).click();
    ```
  * **Filter the locator** by text or nested element:

    ```ts
    await page.getByRole('button').filter({ hasText: /^continue$/i }).click();
    // or
    const row = page.getByRole('row', { name: /invoice #12345/i });
    await row.getByRole('button', { name: /view/i }).click();
    ```

* **Prefer stable selectors (in this order):**

  1. `getByRole(role, { name })`
  2. `getByTestId('...')` (use `data-testid` in app code when needed)
  3. Semantic attributes (`aria-*`, labels) via `locator()`

  > Avoid brittle CSS/XPath, `nth-child` chains, dynamic IDs.

* **Wait for readiness using assertions (not timeouts):**

  ```ts
  const email = page.getByRole('textbox', { name: /email/i }).first();
  await expect(email).toBeVisible();
  await email.fill('user@example.com');
  ```

* **Password field fallback** when accessible name is absent:

  ```ts
  const pwdByName = page.getByRole('textbox', { name: /password/i }).first();
  const pwd = (await pwdByName.count()) ? pwdByName : page.locator('input[type="password"]').first();
  await expect(pwd).toBeVisible();
  await pwd.fill('P@ssw0rd');
  ```

* **Assert uniqueness when it’s a contract** (catches regressions early):

  ```ts
  await expect(page.getByRole('link', { name: /^profile$/i })).toHaveCount(1);
  ```

* **Anti-patterns to avoid:**

  * Using `getByText()` without scoping (often returns many nodes).
  * Clicking before visibility/attachment checks.
  * `waitForTimeout()` instead of assertion-driven waits (`toBeVisible`, `toHaveURL`, etc.).


### Rule for this prompt

Only generate tests **after** using the Playwright MCP to confirm selectors, navigation targets, and resulting UI states. **No placeholders**; resolve all URLs, names, and locators precisely **before** writing the test.

"""
