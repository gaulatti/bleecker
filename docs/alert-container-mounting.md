# AlertContainer mounting

`showAlert(message, type)` queues an alert and `<AlertContainer />` renders the
alerts. The API and what consumers pass are unchanged; this note records when a
container shows an alert.

## Contract

- **Raised before any container is mounted:** the alert waits. The first
  container to mount shows it. A page that renders its container only after
  loading, and reports a failed load with `showAlert`, now shows that error.
- **Raised while containers are mounted:** the first mounted container shows
  it. Two mounted containers (a page and a component that brings its own) do
  not show it twice.
- **Shown once:** an alert stays with the container that showed it until it
  closes or that container unmounts. A container that mounts later does not
  show it again, and the next alert does not bring it back.
- **React StrictMode:** the simulated unmount and remount in development keeps
  the alerts the container already claimed; they are dropped only when the
  container really unmounts.

## Before

The container started with an empty list and learned of alerts only through a
listener added after it mounted. An alert raised before that was kept in the
queue but not shown; it appeared beside the next unrelated alert instead, and an
alert left open when a container unmounted came back the same way. With two
containers mounted, every alert showed twice.

## Checks

`tests/unit/alert.test.tsx` ("AlertContainer mounting") covers each case above:
an alert raised before mount, the StrictMode remount, an alert shown once across
a remount, and two containers. Each failed before this change.
