import fs from "node:fs/promises";
import core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { redirectErrorsToConsole } from "@oliversalzburg/js-utils/errors/console.js";
import { LabelManager } from "./LabelManager.js";

const isMainModule = import.meta.url.endsWith(process.argv[1]);

/**
 * Execute the label manager action.
 */
export const main = async (): Promise<void> => {
  try {
    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error("Missing GITHUB_REPOSITORY");
    }

    const token = core.getInput("repo-token", { required: true });
    const labelManager = new LabelManager({
      context,
      core,
      force: core.getInput("force") === "true",
      labelsYaml: await fs.readFile(".github/labels.yml", "utf8"),
      octokit: getOctokit(token),
    });

    await labelManager.main();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
};

if (isMainModule) {
  main().catch(redirectErrorsToConsole(console));
}
