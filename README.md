# Companion Module Worker
Generate a JSON files from the current module base used in companion.


# update secret in k8s
```
kubectl -n bitfocus create secret generic bitfocus-companion-worker-modules --from-literal=api-secret=<new secret>
```
