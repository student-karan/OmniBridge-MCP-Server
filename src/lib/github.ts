import "dotenv/config";
import { Octokit } from "@octokit/rest";

(() => {
    const requiredEnvVars = ['GITHUB_PAT', 'GITHUB_REPO_OWNER'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error("Missing Environment variables " + missing.join(" , "));
    }
})();

export const repo_owner = process.env.GITHUB_REPO_OWNER as string;
export const github = new Octokit({auth : process.env.GITHUB_PAT});
