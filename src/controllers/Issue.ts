import { logInteraction } from "../db/db.js";
import { github } from "../lib/github.js";
import repoExists, { extractErrorMessage } from "../utils/utility.js";
import { createIssueInput, updateIssueInput, listIssuesInput } from "../utils/types.js";

// Function to create an issue
export async function createIssue(args: createIssueInput) {
    let logInput = `User want to create an issue in repo : ${args.owner}/${args.repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(args.owner, args.repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        const { data } = await github.rest.issues.create(args);
        await logInteraction(
            "create_issue",
            logInput,
            `Issue #${data.number} created in ${args.owner}/${args.repo}`,
            "success",
            args.owner,
            targetRepo
        );
        return {
            id: data.id,
            number: data.number,   
            title: data.title,
            state: data.state,              
            url: data.html_url,   
            created_at: data.created_at
        };
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while creating an issue for the repository.";

        await logInteraction(
            "create_issue",
            logInput,
            errorMsg,
            "error",
            args.owner,
            targetRepo
        );
        throw err;
    }
}

// Function to close an issue 
export async function closeIssue(owner: string, repo: string, issue_number: number) {
    let logInput = `User want to close an issue in repo : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(owner, repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        await github.rest.issues.update({
            owner,
            repo,
            issue_number,
            state: "closed"
        });
        await logInteraction(
            "close_issue",
            logInput,
            `Issue "${issue_number}" closed in ${owner}/${repo}.`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while closing the issue.";

        await logInteraction(
            "close_issue",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to update info of an issue
export async function updateIssue(args: updateIssueInput) {
    let logInput = `User want to update info of issue ${args.issue_number} in repo : ${args.owner}/${args.repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(args.owner, args.repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        await github.rest.issues.update(args);
        await logInteraction(
            "update_issue",
            logInput,
            `Issue "${args.issue_number}" updated in ${args.owner}/${args.repo}.`,
            "success",
            args.owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while updating the issue.";

        await logInteraction(
            "update_issue",
            logInput,
            errorMsg,
            "error",
            args.owner,
            targetRepo
        );
        throw err;
    }
}

// Function to list all issues in a repo
export async function listAllIssues(args: listIssuesInput) {
    let logInput = `User want to list all issues in repo : ${args.owner}/${args.repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(args.owner, args.repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        const { data } = await github.rest.issues.listForRepo({
            ...args,
            labels: args.labels?.join(",")
        });
        const list = data
            .filter(issue => !issue.pull_request)
            .map(issue => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                state: issue.state,
                creator: issue.user?.login,
                url: issue.html_url,
                labels: issue.labels.map(l =>
                    typeof l === "string" ? l : l.name
                ),
                assignees: issue.assignees?.map(a => a.login) ?? [],
                created_at: issue.created_at,
                updated_at: issue.updated_at
            }))

        await logInteraction(
            "list_all_issues",
            logInput,
            `Issues listed from ${args.owner}/${args.repo}.`,
            "success",
            args.owner,
            targetRepo
        );

        return list;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while listing the issues.";

        await logInteraction(
            "list_all_issues",
            logInput,
            errorMsg,
            "error",
            args.owner,
            targetRepo
        );
        throw err;
    }
}

// Function to get details of specific issue
export async function getIssueDetails(owner: string, repo: string, issue_number: number) {
    let logInput = `User want to get the details of issue in repo : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(owner, repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        const { data } = await github.rest.issues.get({
            owner,
            repo,
            issue_number
        });
        await logInteraction(
            "get_issue_details",
            logInput,
            `Issue "${issue_number}" in ${owner}/${repo}. is successfully fetched.`,
            "success",
            owner,
            targetRepo
        );

        return {
            id: data.id,
            number: data.number,
            title: data.title,
            state: data.state,
            creator: data.user?.login,
            url: data.html_url,
            labels: data.labels.map(l =>
                typeof l === "string" ? l : l.name
            ),
            assignees: data.assignees?.map(a => a.login) ?? [],
            created_at: data.created_at,
            updated_at: data.updated_at
        }
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while fetching issue details";

        await logInteraction(
            "get_issue_details",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to add a comment for an issue
export async function addIssueComment(owner: string, repo: string, issue_number: number, comment: string) {
    let logInput = `User want to a comment for an issue ${issue_number} of repo : ${owner}/${repo}`;
    let targetRepo: bigint | null = null;
    try {
        const check = await repoExists(owner, repo);
        if (!check) {
            throw new Error("The repository you're looking for doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        await github.rest.issues.createComment({
            owner,
            repo,
            issue_number,
            body: comment
        });
        await logInteraction(
            "add_issue_comment",
            logInput,
            `Comment added in issue "${issue_number}" of Repo ${owner}/${repo}`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || `An error occurred while creating an comment on an issue of repository ${owner}/${repo} .`;

        await logInteraction(
            "add_issue_comment",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}