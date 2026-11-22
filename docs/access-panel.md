# AccessPanel

`<AccessPanel client application />` is the access-management screen shared by Ariston, Monitor and Alcantara (gaulatti/bleecker#546). Each service renders it on its Access page. Pompeii stores everything and makes every decision; the panel only renders.

```tsx
import { AccessPanel, type AccessClient } from '@gaulatti/bleecker';

<AccessPanel client={client} application={{ key: 'monitor', name: 'Monitor' }} />
```

- `application.key` is the application's Pompeii slug; Ariston's is `auburndale`. `name` is what people read.
- `client` implements `AccessClient`: the ten calls to the service's `/access/*` routes. It rejects with `{ status, error }`, where `error` is one of `unauthenticated`, `forbidden`, `invalid_request`, `tokens_off`, `not_found` or `access_unavailable`. That's the contract pinned for gaulatti/pompeii#50.
- `client.listMyPermissions()` is optional. It returns the person's own permission keys in this application, their effective permissions there. When it's present, "Only these" is a searchable picker of exactly those keys; when it's absent, the keys are typed one per line and Pompeii validates them.
- `onCopy` is optional and replaces the browser clipboard when copying a new token.

## What it shows

- **Your tokens**, for anyone signed in:
  - Each token's name and prefix, permissions, created, expires, last used, and **created in** / **last used in**.
  - **New token**: name, expiry (including none), and either all of your permissions here or a chosen set of keys, picked or typed as above.
  - The note "Tokens made here reach only <application>'s permissions, and only the ones you hold."
  - Revoke asks for confirmation.
- **The new token's value** shows once, in a dialog with **Copy** and "You won't see it again." Closing the dialog drops the value from component state; nothing on the page can show it again.
- **Token switch** and **People** appear only when the person holds `<key>:access:manage`. The panel learns that from `listRoles()`, which answers `forbidden` otherwise.
  - People lists role holders. Granting takes a Pompeii user id (people already listed are suggested) and a role. Revoking asks for confirmation and names the person and the role.
  - A bounding refusal (`forbidden`) reads "You can only grant a role whose permissions you all hold yourself."
- **History** shows this application's access changes: when, what, who, on what, and through which service and client. **Show older** pages by time.
- **Not available:** `access_unavailable` from any call shows "Access management is not available yet." with a retry.

## Stories

`Components/AccessPanel` uses an in-memory fake client and covers each state: no tokens, tokens, revoke, just-created value, picking permissions, typing permissions, switch off and on, no manage right, people, bounding refusal and unavailable. Further stories cover every refusal message, cancelled dialogs, history paging, and Pompeii becoming unreachable mid-change. Each story's play test checks its behaviour, and accessibility violations fail these stories (`a11y.test: 'error'`).
