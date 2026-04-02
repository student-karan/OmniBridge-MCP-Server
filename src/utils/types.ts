import { z } from "zod";

export type visibility = "private" | "public";

export const RepositorySchema = z.object({
    id: z.number().int().nonnegative().describe("The unique GitHub ID of the repository."),
    name: z.string().describe("The name of the repository."),
    full_name: z.string().describe("The full name of the repository (owner/repo)."),
    html_url: z.string().url().describe("The direct URL to the repository on GitHub."),
    private: z.boolean().describe("Whether the repository is private or public."),
    description: z.string().nullable().optional().describe("The description of the repository."),
});

export const RepoCreation = z.object({
    repo: z.string().describe("The name of the repository to create."),
    desc: z.string().optional().describe("A short description for the new repository."),
    visibility: z.enum(["public", "private"]).describe("The visibility status of the new repository.")
});

export const RepoDetailsSchema = z.object({
    id: z.number().int().nonnegative().describe("The unique GitHub ID of the repository."),
    name: z.string().describe("The name of the repository."),
    full_name: z.string().describe("The full name of the repository (owner/repo)."),
    html_url: z.string().url().describe("The direct URL to the repository on GitHub."),
    private: z.boolean().describe("Whether the repository is private or public."),
    description: z.string().nullish().describe("The description of the repository."),
    owner: z.object({
        login: z.string().describe("The GitHub username of the owner."),
        email: z.string().nullish().optional().describe("The email of the owner (if public)."),
    }).describe("Details about the owner of the repository.")
});

export const createIssueSchema = z.object({
    owner: z.string().describe("The owner of the repository (username or organization)."),
    repo: z.string().describe("The name of the repository."),
    title: z.string().describe("The title of the issue."),
    body: z.string().optional().describe("The detailed description or body of the issue."),
    assignees: z.array(z.string()).optional().describe("List of GitHub usernames to assign to the issue."),
    labels: z.array(z.string()).optional().describe("List of label names to apply to the issue.")
});

export type createIssueInput = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = z.object({
    owner: z.string().describe("The owner of the repository."),
    repo: z.string().describe("The name of the repository."),
    issue_number: z.number().int().nonnegative().describe("The number of the issue to update."),
    title: z.string().optional().describe("The new title for the issue."),
    body: z.string().optional().describe("The new body content for the issue."),
    state: z.enum(["open", "closed"]).optional().describe("The target state of the issue."),
    assignees: z.array(z.string()).optional().describe("New list of assignees (overwrites existing)."),
    labels: z.array(z.string()).optional().describe("New list of labels (overwrites existing).")
});

export type updateIssueInput = z.infer<typeof updateIssueSchema>;

export const listIssuesSchema = z.object({
    owner: z.string().describe("The owner of the repository."),
    repo: z.string().describe("The name of the repository."),
    state: z.enum(["open", "closed", "all"]).optional().describe("Filter issues by state (default: open)."),
    labels: z.array(z.string()).optional().describe("Filter issues by a list of comma-separated labels."),
    assignee: z.string().optional().describe("Filter issues assigned to a specific user (use '*' for any, 'none' for none)."),
    creator: z.string().optional().describe("Filter issues created by a specific user."),
    sort: z.enum(["created", "updated", "comments"]).optional().describe("What to sort results by (default: created)."),
    direction: z.enum(["asc", "desc"]).optional().describe("The direction of the sort (default: desc)."),
});

export type listIssuesInput = z.infer<typeof listIssuesSchema>;

export const getIssueDetailsInputSchema = z.object({
    owner: z.string().describe("The owner of the repository."),
    repo: z.string().describe("The name of the repository."),
    issue_number: z.number().int().nonnegative().describe("The number of the specific issue to fetch.")
});

export const getIssueDetailsOutputSchema = z.object({
    id: z.number().int().nonnegative(),
    number: z.number().int().nonnegative(),
    title: z.string(),
    state: z.enum(["closed", "open"]),
    creator: z.string().nullable().optional(),
    url: z.string().url(),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
})

export const addIssueCommentSchema = z.object({
    owner: z.string().describe("The owner of the repository."),
    repo: z.string().describe("The name of the repository."),
    issue_number: z.number().int().nonnegative().describe("The number of the issue to comment on."),
    comment: z.string().describe("The text content of the comment.")
});
