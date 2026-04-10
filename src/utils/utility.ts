import { github } from "../lib/github.js";
import { RequestError } from "@octokit/request-error";
import { ZodError } from "zod";
import { ContributorStat } from "./types.js";

export default async function repoExists(owner: string, repo: string) {
    try {
        const repository = await github.rest.repos.get({ owner, repo });
        return repository.data;
    } catch (err: any) {
        if (err.status === 404) return null;
        throw err;
    }
}

export function extractErrorMessage(err: unknown): string | null {
    if (err instanceof RequestError) {
        return `${err.status}: ${err.message}`;
    }
    if (err instanceof ZodError) {
        return err.message;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return null;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const simplifiedContributerStatsData = (contributor: ContributorStat) => {
    // Calculate total additions and deletions across all weeks
    const totalAdditions = contributor.weeks.reduce((sum: number, w: any) => sum + w.a, 0);
    const totalDeletions = contributor.weeks.reduce((sum: number, w: any) => sum + w.d, 0);

    return {
        user: contributor.author?.login,
        total_commits: contributor.total,
        total_additions: totalAdditions,
        total_deletions: totalDeletions,
        // Only return the last 4 weeks of activity
        recent_weekly_activity: contributor.weeks.slice(-4).map((w: any) => ({
            week_start: new Date(w.w * 1000).toISOString().split('T')[0],
            additions: w.a,
            deletions: w.d,
            commits: w.c
        }))
    }
}