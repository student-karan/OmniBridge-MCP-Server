import { logInteraction } from "../db/db.js";
import { github, repo_owner } from "../lib/github.js";
import {  CreatePullRequestType,  PullRequestSummarySchema,  ListPullRequestsType,  GetPullRequestType,  MergePullRequestType,   ClosePullRequestType,   AddPullRequestCommentType} from "../utils/types.js";
import repoExists, { extractErrorMessage } from "../utils/utility.js";

// Function to create a pull request.
export async function createPullRequest(args: CreatePullRequestType) {
    const logInput = `The user wants to create a pull request for ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.pulls.create(args);

        await logInteraction(
            "create_pull_request",
            logInput,
            `The pull request with number : ${data.number} is successfully created.`,
            "success",
            repo_owner,
            targetRepo
        )
        return PullRequestSummarySchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "create_pull_request",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to merge a pull request
export async function mergePullRequest(args: MergePullRequestType) {
    const logInput = `The user wants to merge PR #${args.pull_number} in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const { data } = await github.rest.pulls.merge(args);

        await logInteraction(
            "merge_pull_request",
            logInput,
            `Pull request with number : ${args.pull_number} is successfully merged with the repo ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        )
        return data; // Merging returns a message/sha, not the full PR object
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "merge_pull_request",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to close a pull request
export async function closePullRequest(args: ClosePullRequestType) {
    const logInput = `The user wants to close PR #${args.pull_number} in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        
        const { data } = await github.rest.pulls.update({
            ...args,
            state: "closed"
        });

        await logInteraction(
            "close_pull_request",
            logInput,
            `Pull request with number : ${args.pull_number} is successfully closed in the repo ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        )
        return PullRequestSummarySchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "close_pull_request",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to list pull requests
export async function listPullRequests(args: ListPullRequestsType) {
    const logInput = `The user wants to list pull requests for ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (repository) targetRepo = BigInt(repository.id);

        const { data } = await github.rest.pulls.list(args);

        await logInteraction(
            "list_pull_requests",
            logInput,
            `Successfully fetched ${data.length} pull requests from ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );

        return data.map(pr => PullRequestSummarySchema.parse(pr));
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "list_pull_requests",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get pull request details
export async function getPullRequest(args: GetPullRequestType) {
    const logInput = `The user wants to get details for PR #${args.pull_number} in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (repository) targetRepo = BigInt(repository.id);

        const { data } = await github.rest.pulls.get(args);

        await logInteraction(
            "get_pull_request",
            logInput,
            `Successfully fetched details for PR #${args.pull_number} in ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );

        return PullRequestSummarySchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "get_pull_request",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to add a comment to a pull request
export async function addPullRequestComment(args: AddPullRequestCommentType) {
    const logInput = `The user wants to add a comment to PR #${args.pull_number} in ${args.owner}/${args.repo}.`;
    let targetRepo: bigint | null = null;
    try {
        const repository = await repoExists(args.owner, args.repo);
        if (!repository) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(repository.id);

        // GitHub PR comments are handled via the Issues API
        const { data } = await github.rest.issues.createComment({
            owner: args.owner,
            repo: args.repo,
            issue_number: args.pull_number,
            body: args.body
        });

        await logInteraction(
            "add_pr_comment",
            logInput,
            `Successfully added a comment to PR #${args.pull_number} in ${args.repo}.`,
            "success",
            repo_owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "add_pr_comment",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}