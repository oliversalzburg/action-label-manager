# Label Manager Action

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
                      repo_token: ${{ secrets.GITHUB_TOKEN }}
    ```

## Release Process

```shell
yarn build:export
git add --all
npm version patch
git push
```
