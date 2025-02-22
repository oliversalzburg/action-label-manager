# Label Manager Action

[![Pre-Release](https://github.com/oliversalzburg/action-label-manager/actions/workflows/pre-release.yml/badge.svg)](https://github.com/oliversalzburg/action-label-manager/actions/workflows/pre-release.yml)

Maintain the labels on your GitHub repository through a file _in_ your repository.

## Usage

1. Create `.github/labels.yml` in your repository, and define some labels.

   ```yml
   labels:
     metadata:
       color: "EEEEEE"
       description: Relates to package metadata
   ```

1. Call the action in a workflow.

   ```yml
   name: Manage Labels

   on:
     push:
       branches:
         - main
       paths:
         - .github/labels.yml
     workflow_dispatch:

   concurrency: manage-labels

   jobs:
     manage-labels:
       permissions:
         contents: read
         issues: write
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: oliversalzburg/action-label-manager@v0.0.9
           with:
             repo-token: ${{ secrets.GITHUB_TOKEN }}
   ```

## Inputs

<!-- AUTO-DOC-INPUT:START - Do not remove or modify this section -->

| INPUT                                                          | TYPE   | REQUIRED | DEFAULT | DESCRIPTION                                                                                   |
| -------------------------------------------------------------- | ------ | -------- | ------- | --------------------------------------------------------------------------------------------- |
| <a name="input_force"></a>[force](#input_force)                | string | false    |         | If set to `true`, will <br>remove labels that are no <br>longer defined in the configuration. |
| <a name="input_repo-token"></a>[repo-token](#input_repo-token) | string | true     |         | Needs `secrets.GITHUB_TOKEN` to talk to <br>the API.                                          |

<!-- AUTO-DOC-INPUT:END -->

## Release Process

```shell
npm version patch --message "chore: Version bump %s"
```
