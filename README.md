# Companion Worker: Modules

On https://bitfocus.io, we list out all our connections (companion modules), and this is the worker that generates the JSON file, which then in turn gets stored in memory in redis, ready to be served to the website frontend/api users.

## Where it runs?

This script runs as a cronjob on the Bitfocus' Kubernetes cluster in Oslo once every 24 hours.

## Questions?

Ask @willosof on the Bitfocus slack.

## Release

Release new versions to the production cluster by running `yarn release`

## Misc / note to self

### Set up api secret in k8s

```
kubectl -n bitfocus create secret generic bitfocus-companion-worker-modules --from-literal=api-secret=<new secret>
```

## Author

William Viker (william@bitfocus.io) / Bitfocus AS
