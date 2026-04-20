import { logInteraction } from "../db/db.js";
import { github, repo_owner } from "../lib/github.js";
import { CreateBranchType,   DeleteBranchType,   ListBranchesType,   GetBranchType,   BranchSummarySchema } from "../utils/types.js";
import repoExists, { extractErrorMessage } from "../utils/utility.js";

// Function to create a new branch
export async function createBranch(args: CreateBranchType) {
    const logInput = `The user wants to create branch '${args.branch}' from '${args.from_branch}' in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) throw new Error("Repository not found.");
        targetRepo = BigInt(repository.id);

        // 1. Get the SHA of the source branch
        const { data: sourceBranch } = await github.rest.repos.getBranch({
            owner: args.owner,
            repo: args.repo,
            branch: args.from_branch,
        });

        // 2. Create the new reference
        const { data } = await github.rest.git.createRef({
            owner: args.owner,
            repo: args.repo,
            ref: `refs/heads/${args.branch}`,
            sha: sourceBranch.commit.sha,
        });

        await logInteraction(
            "create_branch",
            logInput,
            `Branch '${args.branch}' successfully created in ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "create_branch",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to delete a branch
export async function deleteBranch(args: DeleteBranchType) {
    const logInput = `The user wants to delete branch '${args.branch}' in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) throw new Error("Repository not found.");
        targetRepo = BigInt(repository.id);

        await github.rest.git.deleteRef({
            owner: args.owner,
            repo: args.repo,
            ref: `heads/${args.branch}`,
        });

        await logInteraction(
            "delete_branch",
            logInput,
            `Branch '${args.branch}' successfully deleted from ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );

        return { message: `Branch '${args.branch}' deleted successfully.` };
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "delete_branch",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to list branches
export async function listBranches(args: ListBranchesType) {
    const logInput = `The user wants to list branches in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (repository) targetRepo = BigInt(repository.id);

        const { data } = await github.rest.repos.listBranches(args);

        await logInteraction(
            "list_branches",
            logInput,
            `Successfully fetched ${data.length} branches from ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );

        return data.map(branch => BranchSummarySchema.parse(branch));
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "list_branches",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get specific branch details
export async function getBranch(args: GetBranchType) {
    const logInput = `The user wants to get details for branch '${args.branch}' in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (repository) targetRepo = BigInt(repository.id);

        const { data } = await github.rest.repos.getBranch(args);

        await logInteraction(
            "get_branch",
            logInput,
            `Successfully fetched details for branch '${args.branch}' in ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );

        return BranchSummarySchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "get_branch",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}