import { logInteraction } from "../../db/db.js";
import { github, repo_owner } from "../../lib/github.js";
import { getRepoCloneCountInput, getRepoViewsInput, TrafficandStatsType } from "../../utils/types.js";
import repoExists, { extractErrorMessage, simplifiedContributerStatsData, sleep } from "../../utils/utility.js";

// Function to get the view count of a repository 
export async function getRepoViews({ owner = repo_owner, repo, per }: getRepoViewsInput) {
    const logInput = `User wants the view count of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.repos.getViews({ owner, repo, per });

        await logInteraction(
            "get_repo_views",
            logInput,
            `View count of repo : ${owner}/${repo} is successfully fetched.`,
            "success",
            owner,
            targetRepo
        );
        return data;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";

        await logInteraction(
            "get_repo_views",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get the clone count of a repository 
export async function getRepoCloneCount({ owner = repo_owner, repo, per }: getRepoCloneCountInput) {
    const logInput = `User wants the clone count of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.repos.getClones({ owner, repo, per });

        await logInteraction(
            "get_repo_clone_count",
            logInput,
            `clone count of repo : ${owner}/${repo} is successfully fetched.`,
            "success",
            owner,
            targetRepo
        );
        return data;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";

        await logInteraction(
            "get_repo_clone_count",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get the top Referrers of a repository 
export async function getTopReferrers({ owner = repo_owner, repo }: TrafficandStatsType) {
    const logInput = `User wants the top referrers of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.repos.getTopReferrers({ owner, repo });

        await logInteraction(
            "get_top_referrers",
            logInput,
            `Top Referrers of repo : ${owner}/${repo} are successfully fetched.`,
            "success",
            owner,
            targetRepo
        );
        return data;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";

        await logInteraction(
            "get_top_referrers",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get the top paths of a repository 
export async function getRepoTopPaths({ owner = repo_owner, repo }: TrafficandStatsType) {
    const logInput = `User wants the top paths of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.repos.getTopPaths({ owner, repo });
        await logInteraction(
            "get_top_paths",
            logInput,
            `Top paths of repo : ${owner}/${repo} are successfully fetched.`,
            "success",
            owner,
            targetRepo
        )
        return data;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";

        await logInteraction(
            "get_top_paths",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get the contributor statistics of a repository
export async function getRepoContributorStats({ owner = repo_owner, repo }: TrafficandStatsType) {
    const logInput = `User wants the contributor stats of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);

        let data;
        let retries = 3;
        while (retries > 0) {
            const response = await github.rest.repos.getContributorsStats({ owner, repo });
            if (response.status === 200) {
                data = response.data;
                break;
            }
            // If 202, wait 1.5 seconds and retry
            await sleep(1500);
            retries--;
        }

        if (!data) {
            throw new Error("Statistics are still being calculated by GitHub. Please try again in a moment.");
        }

        await logInteraction(
            "get_contributor_stats",
            logInput,
            `Contributor stats of repo : ${owner}/${repo} are successfully fetched.`,
            "success",
            owner,
            targetRepo
        );
        return data
            .filter((contributor) => contributor.author && contributor.author.login)
            .map((contributor) => simplifiedContributerStatsData(contributor));
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "get_contributor_stats",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get the weekly commit activity of a repository
export async function getRepoCommitActivity({ owner = repo_owner, repo }: TrafficandStatsType) {
    const logInput = `User wants the weekly commit activity of the repository : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);

        let data;
        let retries = 3;
        while (retries > 0) {
            const response = await github.rest.repos.getCommitActivityStats({ owner, repo });
            if (response.status === 200) {
                data = response.data;
                break;
            }
            await sleep(1500);
            retries--;
        }

        if (!data) {
            throw new Error("Commit activity stats are still being calculated. Please try again in a moment.");
        }

        await logInteraction(
            "get_commit_activity",
            logInput,
            `Commit activity of repo : ${owner}/${repo} is successfully fetched.`,
            "success",
            owner,
            targetRepo
        );
        return data.map((weekly_data) => {
            return {
                daily_commits: weekly_data.days,
                total_commits: weekly_data.total,
                week_start: new Date(weekly_data.week * 1000).toISOString().split('T')[0]
            }
        });
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "get_commit_activity",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}
