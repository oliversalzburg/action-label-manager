import type core from "@actions/core";
import { Context } from "@actions/github/lib/context.js";
import { type GitHub } from "@actions/github/lib/utils.js";
import YAML from "yaml";

/**
 * The options for the action.
 */
export interface LabelManagerOptions {
  /**
   * The Context we're executing in.
   */
  context: Context;

  /**
   * A GitHub Actions Code instance.
   */
  core: typeof core;

  /**
   * Should we force destructive operations, like deleting unmanaged labels?
   */
  force?: boolean;

  /**
   * The YAML definition of labels on the project.
   */
  labelsYaml: string;

  /**
   * An OctoKit instance to use to communicate with GitHub.
   */
  octokit: InstanceType<typeof GitHub>;
}

/**
 * Main implementation of the action.
 */
export class LabelManager {
  #options: LabelManagerOptions;

  /**
   * Constructs a new LabelManager instance.
   * @param options - The options for the action.
   */
  constructor(options: LabelManagerOptions) {
    this.#options = options;
  }

  /**
   * Execute the action.
   */
  async main() {
    const labelsYaml = this.#options.labelsYaml;
    const config = YAML.parse(labelsYaml) as {
      labels: Record<string, { color?: string; description?: string }>;
    };

    this.#options.core.debug("Configured labels:");
    for (const [name, label] of Object.entries(config.labels)) {
      this.#options.core.debug(name);
      if (label.color) {
        this.#options.core.debug(`  Color: ${label.color}`);
      }
      if (label.description) {
        this.#options.core.debug(`  Descr: ${label.description}`);
      }
    }

    const octokit = this.#options.octokit;

    const existingLabels = await octokit.rest.issues.listLabelsForRepo({
      owner: this.#options.context.repo.owner,
      per_page: 100,
      repo: this.#options.context.repo.repo,
    });
    this.#options.core.debug("Existing labels:");
    for (const label of existingLabels.data) {
      this.#options.core.debug(label.name);
      if (label.color) {
        this.#options.core.debug(`  Color: ${label.color}`);
      }
      if (label.description) {
        this.#options.core.debug(`  Descr: ${label.description}`);
      }
    }

    this.#options.core.summary.addRaw("Updating labels...\n");
    const labelResults = {
      created: new Array<string>(),
      updated: new Array<string>(),
    };

    for (const [name, label] of Object.entries(config.labels)) {
      const existingLabel = existingLabels.data.find(existing => existing.name === name);
      if (existingLabel) {
        if (
          existingLabel.color === label.color &&
          existingLabel.description === (label.description ?? null)
        ) {
          this.#options.core.summary.addRaw(`Label '${name}' is up-to-date. Skipping.\n`);
          continue;
        }

        this.#options.core.summary.addRaw(
          `Label '${name}' exists with different attributes. Updating...\n`,
        );
        existingLabel.color = label.color ?? "888888";
        existingLabel.description = label.description ?? null;
        await octokit.rest.issues.updateLabel({
          color: label.color,
          description: label.description,
          name: existingLabel.name,
          owner: this.#options.context.repo.owner,
          repo: this.#options.context.repo.repo,
        });
        continue;
      }

      this.#options.core.summary.addRaw(`Creating new label '${name}'...\n`);
      await octokit.rest.issues.createLabel({
        color: label.color,
        description: label.description,
        name: name,
        owner: this.#options.context.repo.owner,
        repo: this.#options.context.repo.repo,
      });
      labelResults.created.push(name);
    }

    for (const label of existingLabels.data) {
      const labelIsConfigured = Object.keys(config.labels).includes(label.name);
      if (!labelIsConfigured) {
        if (this.#options.force) {
          this.#options.core.summary.addRaw(
            `:x: Label '${label.name}' is not configured in labels.yml. Deleting...\n`,
          );
          await octokit.rest.issues.deleteLabel({
            name: label.name,
            owner: this.#options.context.repo.owner,
            repo: this.#options.context.repo.repo,
          });
          continue;
        }

        this.#options.core.summary.addRaw(
          `:heavy_exclamation_mark: Label '${label.name}' is not configured in \`labels.yml\`. It should be deleted.\n`,
        );
      }
    }

    this.#options.core.setOutput("label_created", labelResults.created);
    this.#options.core.setOutput("label_updated", labelResults.updated);

    this.#options.core.summary.addRaw("Done.");
  }
}
