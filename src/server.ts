import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import chalk from "chalk";
import { RepoCreation, RepoDetailsSchema, RepositorySchema, createIssueSchema, updateIssueSchema, listIssuesSchema, addIssueCommentSchema, getIssueDetailsOutputSchema, getIssueDetailsInputSchema } from "./utils/types.js";
import { changeRepoVisibility, createRepo, deleteRepo, forkRepo, getRepoDetails, listAllRepos, renameRepo, starRepo, unStarRepo, updateRepoDescription } from "./controllers/repo.js";
import { createIssue, closeIssue, updateIssue, listAllIssues, getIssueDetails, addIssueComment } from "./controllers/Issue.js";
import { extractErrorMessage } from "./utils/utility.js";

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
    "update_repo_description",
    {
        title: "Update Repository Description",
        description: "Update the description of the requested repository.",
        inputSchema: z.object({
            repo: z.string().describe("The repository whose description user want to update."),
            desc: z.string().describe("New description of the repository. ")
        }).shape
    }, async ({ repo, desc }) => {
        try {
            await updateRepoDescription(repo, desc);

            return {
                content: [{ type: "text", text: "Repository description updated successfully." }]
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
    "rename_repo",
    {
        title: "Rename a Repository",
        description: "Update the name of an existing repository.",
        inputSchema: z.object({
            repo: z.string().describe("The repository whose name the user wants to change."),
            newName: z.string().describe("New name for the repository.")
        }).shape
    }, async ({ repo, newName }) => {
        try {
            await renameRepo(repo, newName);

            return {
                content: [{ type: "text", text: "Repository renamed successfully." }]
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
            owner: z.string().describe("The user to whom the repository belongs."),
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
            owner: z.string().describe("The owner of the repository."),
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
            owner: z.string().describe("The owner of the repository."),
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
            owner: z.string().describe("The owner of the repository."),
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
