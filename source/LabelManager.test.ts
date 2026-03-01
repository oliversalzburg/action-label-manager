import { beforeEach, it } from "node:test";
import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { Moctokit } from "@kie/mock-github";
import { LabelManager } from "./LabelManager.js";

beforeEach(() => {
  process.env.GITHUB_REPOSITORY = "kitten-science/test";
});

it("runs", async () => {
  const moctokit = new Moctokit();

  moctokit.rest.issues
    .listLabelsForRepo()
    .reply({ data: [{ color: "000000", name: "dependencies" }, { name: "foo" }], status: 200 });

  moctokit.rest.issues
    .createLabel({
      description: "A new label",
      name: "new-label",
      owner: "kitten-science",
      repo: "test",
    })
    .reply({ data: { name: "new-label" }, status: 201 });

  moctokit.rest.issues
    .updateLabel({
      name: "dependencies",
      owner: "kitten-science",
      repo: "test",
    })
    .reply({ data: { name: "dependencies" }, status: 200 });

  const labelManager = new LabelManager({
    context,
    core,
    labelsYaml: `
labels:
  dependencies:
    color: "BFD4F2"
    description: Pull requests that update a dependency file
  new-label:
    description: A new label
  `,
    octokit: getOctokit("invalid-token", { request: { fetch } }),
  });

  await labelManager.main();
});
