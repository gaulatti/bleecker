# AuthShell is the required authentication shell

`AuthShell` is the required outer layout for every Gaulatti and Fifthbell
React-DOM product login experience. Products customize it only through its
existing API and supplied children; they must not maintain a bespoke replacement
page shell.

## The rule

- Every React-DOM product login, session-loading, unavailable-auth, and
  login-error state renders inside `AuthShell`, directly or through a thin
  product wrapper that itself renders `AuthShell`.
- Product customization is limited to the supported props and child content:
  `layout` (`centered` or `split`), `side` (`start` or `end`), `brand`, `aside`,
  `asideLabel`, `footer`, `className`, and product-owned form and status
  content passed as `children`.
- Consumers must not duplicate `AuthShell` page grids, background composition,
  responsive shell behavior, or structural layout in product code.
- `AuthShell` is not expanded to reproduce a bespoke consumer composition;
  consumers adapt to the supported API.

## Product-owned, not shell-owned

Authentication providers, redirects, return paths, test-auth behavior, error
handling, authorization, product copy, and provider buttons stay in the product.
Moving a login into `AuthShell` changes only the surrounding page layout.

## Out of scope

React Native, SwiftUI, Android/TV and other non-DOM interfaces cannot consume this
React-DOM component and follow their own platform layout contracts. Registration,
password recovery and protected-page redesigns are separate decisions.

## Reference

The **Layout/AuthShell** Storybook stories show the split sign-in, centered
recovery, and the loading, unavailable and error states inside the shell.

Back to the [README](../README.md).
