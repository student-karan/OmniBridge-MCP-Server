import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import chalk from "chalk";
import { RepoCreation, RepoDetailsSchema, RepositorySchema, createIssueSchema, updateIssueSchema, listIssuesSchema, addIssueCommentSchema, getIssueDetailsOutputSchema, getIssueDetailsInputSchema, RepoViewsInputSchema, RepoViewsOutputSchema, RepoCloneCountInputSchema, RepoCloneCountOutputSchema, TrafficandStatsSchema, ContributorStatsOutputSchema, CommitActivityOutputSchema, UserProfileSchema } from "./utils/types.js";
import { changeRepoVisibility, createRepo, deleteRepo, forkRepo, getRepoDetails, listAllRepos, starRepo, unStarRepo, updateRepoMetadata } from "./controllers/Repo.js";
import { createIssue, closeIssue, updateIssue, listAllIssues, getIssueDetails, addIssueComment } from "./controllers/Issue.js";
import { extractErrorMessage } from "./utils/utility.js";
import { getRepoCloneCount, getTopReferrers, getRepoViews, getRepoTopPaths, getRepoContributorStats, getRepoCommitActivity } from "./controllers/traffic&analytics.js";
import { getMyProfile, getUser, listFollowers, listFollowing } from "./controllers/users&profile.js";

// Polyfill for BigInt serialization in JSON.stringify (Required for GitHub IDs)
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const server = new McpServer({
    name: "OmniBridge-MCP",
    version: "1.0.0"
});

//--- Repository management tools  ---//
server.registerTool(
    "create_repo",
    {
        title: "Create Repository",
        description: "Create a new GitHub repository using MCP.",
        inputSchema: RepoCreation.shape,
        outputSchema: RepositorySchema.shape
    }, async ({ repo, desc, visibility }) => {
        try {
            const repository = await createRepo(repo, visibility, desc);
            return {
                content: [{ type: "text", text: JSON.stringify(repository) }],
                structuredContent: repository
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "delete_repo",
    {
        title: "Delete Repository",
        description: "Delete a GitHub repository using MCP.",
        inputSchema: z.object({
            repo: z.string().describe("The name of the repository to delete.")
        }).shape
    }, async ({ repo }) => {
        try {
            await deleteRepo(repo);

            return {
                content: [{ type: "text", text: "Repository deleted successfully." }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "update_repo_metadata",
    {
        title: "Update Repository Metadata",
        description: "Update the Metadata of the requested repository.",
        inputSchema: z.object({
            repo: z.string().describe("The repository whose description user want to update."),
            desc: z.string().describe("New description of the repository.").optional(),
            newName: z.string().describe("New name for the repository.").optional()
        }).shape
    }, async ({ repo, newName, desc }) => {
        try {
            await updateRepoMetadata(repo, newName, desc);

            return {
                content: [{ type: "text", text: "Repository Metadata updated successfully." }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "change_repo_visibility",
    {
        title: "Change Repository Visibility",
        description: "Change the visibility of an existing repository.",
        inputSchema: z.object({
            repo: z.string().describe("The repository whose visibility user want to change."),
            visibility: z.enum(["private", "public"])
        }).shape
    }, async ({ repo, visibility }) => {
        try {
            await changeRepoVisibility(repo, visibility);

            return {
                content: [{ type: "text", text: "Repository visibility changed successfully." }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "list_all_repos",
    {
        title: "List All repositories",
        description: "List all the repositories belonging to the user.",
        outputSchema: z.object({
            repos: z.array(z.string()).describe("Array Containing the names of all the repositories.")
        }).shape
    }, async () => {
        try {
            const repos = await listAllRepos();

            return {
                content: [{ type: "text", text: JSON.stringify(repos) }],
                structuredContent: { repos }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_repo_details",
    {
        title: "Get Repository Details",
        description: "Fetch the details of the repository user requested.",
        inputSchema: z.object({
            owner: z.string().describe("The user to whom the repository belongs.").optional(),
            repo: z.string().describe("Repository who details the user wants.")
        }).shape,
        outputSchema: RepoDetailsSchema.shape
    }, async ({ owner, repo }) => {
        try {
            const repository = await getRepoDetails(owner, repo);
            return {
                content: [{ type: "text", text: JSON.stringify(repository) }],
                structuredContent: repository
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "fork_repo",
    {
        title: "Fork a repository.",
        description: "Forking a repository user wants.",
        inputSchema: z.object({
            owner: z.string().describe("The owner of the repository.").optional(),
            repo: z.string().describe("The repository user wants to fork."),
            my_fork_name: z.string().describe("The Fork name for the repository.")
        }).shape,
    }, async ({ owner, repo, my_fork_name }) => {
        try {
            await forkRepo(owner, repo, my_fork_name);

            return {
                content: [{ type: "text", text: `Successfully forked ${owner}/${repo}.` }],
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "star_repo",
    {
        title: "Star a repository.",
        description: "Starring a repository user wants.",
        inputSchema: z.object({
            owner: z.string().describe("The owner of the repository.").optional(),
            repo: z.string().describe("The repository user wants to star.")
        }).shape,
    }, async ({ owner, repo }) => {
        try {
            await starRepo(owner, repo);

            return {
                content: [{ type: "text", text: `Successfully starred ${owner}/${repo}.` }],
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "unstar_repo",
    {
        title: "Unstar a repository.",
        description: "Unstarring a repository user wants.",
        inputSchema: z.object({
            owner: z.string().describe("The owner of the repository.").optional(),
            repo: z.string().describe("The repository user wants to unstar.")
        }).shape,
    }, async ({ owner, repo }) => {
        try {
            await unStarRepo(owner, repo);

            return {
                content: [{ type: "text", text: `Successfully unStarred ${owner}/${repo}.` }],
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occurred." }],
                isError: true
            }
        }
    }
);

//--- Issues Management Tools  ---//

server.registerTool(
    "create_issue",
    {
        title: "Create Issue",
        description: "Create a new issue in a GitHub repository.",
        inputSchema: createIssueSchema.shape
    }, async (args) => {
        try {
            const issue = await createIssue(args);
            return {
                content: [{ type: "text", text: `Issue #${issue.number} created successfully.` }],
                structuredContent: issue
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "close_issue",
    {
        title: "Close Issue",
        description: "Close an existing issue in a GitHub repository.",
        inputSchema: z.object({
            owner: z.string().describe("The owner of the repository."),
            repo: z.string().describe("The name of the repository."),
            issue_number: z.number().int().nonnegative().describe("The number of the issue to close.")
        }).shape
    }, async ({ owner, repo, issue_number }) => {
        try {
            await closeIssue(owner, repo, issue_number);
            return {
                content: [{ type: "text", text: `Issue #${issue_number} closed successfully.` }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "update_issue",
    {
        title: "Update Issue",
        description: "Update an existing issue in a GitHub repository.",
        inputSchema: updateIssueSchema.shape
    }, async (args) => {
        try {
            await updateIssue(args);
            return {
                content: [{ type: "text", text: `Issue #${args.issue_number} updated successfully.` }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "list_all_issues",
    {
        title: "List All Issues",
        description: "List all issues in a GitHub repository.",
        inputSchema: listIssuesSchema.shape,
        outputSchema: z.object({
            issues: z.array(getIssueDetailsOutputSchema)
        }).shape
    }, async (args) => {
        try {
            const issues = await listAllIssues(args);
            return {
                content: [{ type: "text", text: JSON.stringify(issues) }],
                structuredContent: { issues }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_issue_details",
    {
        title: "Get Issue Details",
        description: "Fetch the details of a specific issue.",
        inputSchema: getIssueDetailsInputSchema.shape,
        outputSchema: getIssueDetailsOutputSchema.shape
    }, async ({ owner, repo, issue_number }) => {
        try {
            const issue = await getIssueDetails(owner, repo, issue_number);
            return {
                content: [{ type: "text", text: JSON.stringify(issue) }],
                structuredContent: issue
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "add_issue_comment",
    {
        title: "Add Issue Comment",
        description: "Add a comment to an existing issue.",
        inputSchema: addIssueCommentSchema.shape
    }, async ({ owner, repo, issue_number, comment }) => {
        try {
            await addIssueComment(owner, repo, issue_number, comment);
            return {
                content: [{ type: "text", text: `Comment added to issue #${issue_number} successfully.` }]
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

//--- Traffic and Anayltics Tools  ---//
server.registerTool(
    "get_repo_views",
    {
        title: "Get Repo views",
        description: "This tool is used to get the view count of a repository. \n Note : It will only work if you are the owner of the Repository or a collaborator with push access.",
        inputSchema: RepoViewsInputSchema.shape,
        outputSchema: RepoViewsOutputSchema.shape
    }, async (args) => {
        try {
            const view_count = await getRepoViews(args);
            return {
                content: [{ type: "text", text: JSON.stringify(view_count) }],
                structuredContent: view_count
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_repo_clone_count",
    {
        title: "Get Repo clone count",
        description: "This tool is used to get the clone count of a repository. \n Note : It will only work if you are the owner of the Repository or a collaborator with push access.",
        inputSchema: RepoCloneCountInputSchema.shape,
        outputSchema: RepoCloneCountOutputSchema.shape
    }, async (args) => {
        try {
            const clone_count = await getRepoCloneCount(args);
            return {
                content: [{ type: "text", text: JSON.stringify(clone_count) }],
                structuredContent: clone_count
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_top_referrers",
    {
        title: "Get Top Referrers",
        description: "This tool is used to find out Where repo traffic is coming from.",
        inputSchema: TrafficandStatsSchema.shape,
        outputSchema: z.object({
            top_referrers: z.array(z.object({
                referrer: z.string(),
                count: z.number().int().nonnegative(),
                uniques: z.number().int().nonnegative(),
            }))
        }).shape
    }, async (args) => {
        try {
            const top_referrers = await getTopReferrers(args);
            return {
                content: [{ type: "text", text: JSON.stringify(top_referrers) }],
                structuredContent: { top_referrers }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_top_paths",
    {
        title: "Get Top Paths",
        description: "This tool is used to find out the most visited pages in the repo.",
        inputSchema: TrafficandStatsSchema.shape,
        outputSchema: z.object({
            top_paths: z.array(z.object({
                path: z.string(),
                title: z.string(),
                count: z.number().int().nonnegative(),
                uniques: z.number().int().nonnegative(),
            }))
        }).shape
    }, async (args) => {
        try {
            const top_paths = await getRepoTopPaths(args);
            return {
                content: [{ type: "text", text: JSON.stringify(top_paths) }],
                structuredContent: { top_paths }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_contributor_stats",
    {
        title: "Get Contributor Stats",
        description: "This tool gives a detailed breakdown of every person who has ever committed code to the repository.",
        inputSchema: TrafficandStatsSchema.shape,
        outputSchema: z.object({
            contributor_stats: ContributorStatsOutputSchema
        }).shape
    }, async (args) => {
        try {
            const contributor_stats = await getRepoContributorStats(args);
            return {
                content: [{ type: "text", text: JSON.stringify(contributor_stats) }],
                structuredContent: { contributor_stats }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_commit_activity",
    {
        title: "Get Commit Activity",
        description: "This tool gives you the heartbeat of the repository for the last one year (52 weeks).",
        inputSchema: TrafficandStatsSchema.shape,
        outputSchema: z.object({
            commit_activity: CommitActivityOutputSchema
        }).shape
    }, async (args) => {
        try {
            const commit_activity = await getRepoCommitActivity(args);
            return {
                content: [{ type: "text", text: JSON.stringify(commit_activity) }],
                structuredContent: { commit_activity }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

//--- User and Profile Tools  ---//
server.registerTool(
    "get_my_profile",
    {
        title: "Get My Profile",
        description: "This tool gets you all the information about the current user's GitHub account.",
        outputSchema: UserProfileSchema.shape
    }, async () => {
        try {
            const userDetails = await getMyProfile();
            return {
                content: [{ type: "text", text: JSON.stringify(userDetails) }],
                structuredContent: userDetails
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "list_followers",
    {
        title: "List Followers",
        description: "This tool gives you the name of all the Github users who follow the current User.",
        inputSchema : z.object({
            per_page: z.number().int().positive().describe("Number of followers to return per page."),
            page: z.number().int().nonnegative().describe("Page number of the results to fetch.")
        }),
        outputSchema: z.object({
            followers: z.array(z.string())
        }).shape
    }, async (args) => {
        try {
            const followers = await listFollowers(args);
            return {
                content: [{ type: "text", text: JSON.stringify(followers) }],
                structuredContent: { followers }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "list_following",
    {
        title: "List Following",
        description: "This tool gives you the name of all the Github users who are followed by the current User.",
        inputSchema : z.object({
            per_page: z.number().int().positive().describe("Number of followers to return per page."),
            page: z.number().int().nonnegative().describe("Page number of the results to fetch.")
        }),
        outputSchema: z.object({
            followers: z.array(z.string())
        }).shape
    }, async (args) => {
        try {
            const following = await listFollowing(args);
            return {
                content: [{ type: "text", text: JSON.stringify(following) }],
                structuredContent: { following }
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);

server.registerTool(
    "get_user",
    {
        title: "Get User",
        description: "This tool gets information about a specific GitHub user.",
        inputSchema : z.object({
            username: z.string().describe("The username of the GitHub user whose details you want to fetch.")
        }).shape,
        outputSchema: UserProfileSchema.shape
    }, async (args) => {
        try {
            const userDetails = await getUser(args);
            return {
                content: [{ type: "text", text: JSON.stringify(userDetails) }],
                structuredContent: userDetails
            }
        } catch (err) {
            return {
                content: [{ type: "text", text: extractErrorMessage(err) || "An unknown error occured." }],
                isError: true
            }
        }
    }
);


(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})()
    .then((res) => {
        console.error(chalk.bgCyan("MCP Server is Connected."));
    })
    .catch((err) => {
        console.error(chalk.bgRed("An error occured."));
        process.exit(1);
    })
