import { z } from "zod";
import { repo_owner } from "../lib/github.js";
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
});
export const addIssueCommentSchema = z.object({
    owner: z.string().describe("The owner of the repository."),
    repo: z.string().describe("The name of the repository."),
    issue_number: z.number().int().nonnegative().describe("The number of the issue to comment on."),
    comment: z.string().describe("The text content of the comment.")
});
export const RepoViewsInputSchema = z.object({
    owner: z.string().optional().describe("The owner of the repository (defaults to the configured GITHUB_REPO_OWNER)."),
    repo: z.string().describe("The name of the repository."),
    per: z.enum(["day", "week"]).describe("Specifies whether repository views should be grouped by 'day' or 'week'.").optional()
});
export const RepoCloneCountInputSchema = z.object({
    owner: z.string().optional().describe("The owner of the repository (defaults to the configured GITHUB_REPO_OWNER)."),
    repo: z.string().describe("The name of the repository."),
    per: z.enum(["day", "week"]).describe("Specifies whether repository views should be grouped by 'day' or 'week'.").optional()
});
const trafficSchema = z.object({
    timestamp: z.string().describe("Timestamp of the view data (ISO format)"),
    count: z.number().describe("Total views for the given time period"),
    uniques: z.number().describe("Unique visitors for the given time period"),
});
export const RepoViewsOutputSchema = z.object({
    count: z.number().describe("Total number of views"),
    uniques: z.number().describe("Total number of unique visitors"),
    views: z.array(trafficSchema).describe("Breakdown of views over time"),
});
export const RepoCloneCountOutputSchema = z.object({
    count: z.number().describe("Total number of clones"),
    uniques: z.number().describe("Total number of unique visitors"),
    clones: z.array(trafficSchema).describe("Breakdown of clones over time"),
});
export const TrafficandStatsSchema = z.object({
    owner: z.string().optional().describe("The owner of the repository (defaults to configured GITHUB_REPO_OWNER)."),
    repo: z.string().describe("The name of the repository."),
});
// Schema for Simplified Contributor Statistics
export const ContributorStatsOutputSchema = z.array(z.object({
    user: z.string().describe("The GitHub username of the contributor."),
    total_commits: z.number().describe("Total number of commits authored by this user."),
    total_additions: z.number().describe("Total number of lines added by this user (over the last year)."),
    total_deletions: z.number().describe("Total number of lines deleted by this user (over the last year)."),
    recent_weekly_activity: z.array(z.object({
        week_start: z.string().describe("The start date of the week (YYYY-MM-DD)."),
        additions: z.number().describe("Lines added in this week."),
        deletions: z.number().describe("Lines deleted in this week."),
        commits: z.number().describe("Commits made in this week.")
    })).describe("The last 4 weeks of activity for this contributor.")
}));
// Schema for Simplified Weekly Commit Activity
export const CommitActivityOutputSchema = z.array(z.object({
    week_start: z.string().describe("The start date of the week (YYYY-MM-DD)."),
    total_commits: z.number().describe("The total number of commits for this week."),
    daily_commits: z.array(z.number()).length(7).describe("Number of commits per day, starting from Sunday.")
})).describe("The last 12 weeks of repository commit activity.");
// Schema to capture the user profile core data
export const UserProfileSchema = z.object({
    login: z.string().describe("The GitHub username."),
    id: z.number().int().nonnegative(),
    avatar_url: z.string().url(),
    html_url: z.string().url(),
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string().nullable(),
    location: z.string().nullable(),
    email: z.string().email().nullable(),
    bio: z.string().nullable(),
    public_repos: z.number().int().nonnegative(),
    followers: z.number().int().nonnegative(),
    following: z.number().int().nonnegative(),
    created_at: z.string().datetime(),
});
export const FollowingSchema = z.object({
    per_page: z.number().int().positive().describe("Number of followers to return per page.").optional(),
    page: z.number().int().nonnegative().describe("Page number of the results to fetch.").optional()
});
export const NotificationSchema = z.object({
    id: z.string().describe("The unique ID of the notification thread."),
    unread: z.boolean(),
    reason: z.string().describe("The reason for the notification (e.g., 'mention', 'assign', 'author')."),
    updated_at: z.string().datetime(),
    subject: z.object({
        title: z.string(),
        url: z.string().url().describe("The API URL for the subject (e.g., the Issue or PR)."),
        type: z.string().describe("The type of subject (e.g., 'Issue', 'PullRequest')."),
    }),
    repository: z.object({
        name: z.string(),
        full_name: z.string(),
        owner: z.object({ login: z.string() }),
    }),
});
export const ListNotificationsInputSchema = z.object({
    all: z.boolean().optional().describe("If true, show notifications that have already been read.").optional(),
    participating: z.boolean().optional().describe("If true, only show notifications you are directly involved in.").optional(),
    since: z.string().datetime().optional().describe("Only show notifications updated after this time (ISO 8601).").optional(),
    before: z.string().datetime().optional().describe("Only show notifications updated before this time (ISO 8601).").optional(),
    per_page: z.number().int().positive().optional().describe("Number of notifications to return per page (max 100).").optional(),
    page: z.number().int().positive().optional().describe("Page number of the results to fetch.").optional(),
});
export const CreatePullRequestSchema = z.object({
    owner: z.string().describe("The owner of the target repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    title: z.string().describe("The title of the pull request."),
    head: z.string().describe("The name of the branch where your changes are implemented (e.g., 'my-feature-branch' or 'username:branch')."),
    base: z.string().describe("The name of the branch you want the changes pulled into (e.g., 'main')."),
    body: z.string().optional().describe("The contents of the pull request description."),
});
export const ListPullRequestsSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    state: z.enum(["open", "closed", "all"]).optional().describe("Filter PRs by state (default: open)."),
    head: z.string().optional().describe("Filter PRs by head user and branch name in the format 'user:branch-name'."),
    base: z.string().optional().describe("Filter PRs by base branch name (e.g., 'main')."),
    sort: z.enum(["created", "updated", "popularity", "long-running"]).optional().describe("What to sort results by (default: created)."),
    direction: z.enum(["asc", "desc"]).optional().describe("The direction of the sort (default: desc)."),
});
export const GetPullRequestSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    pull_number: z.number().int().describe("The number of the pull request to fetch."),
});
export const MergePullRequestSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    pull_number: z.number().int().describe("The number of the pull request to merge."),
    merge_method: z.enum(["merge", "squash", "rebase"]).optional().describe("The merge method to use (default:'merge')."),
    commit_title: z.string().optional().describe("Title for the automatic commit message."),
    commit_message: z.string().optional().describe("Extra detail to append to automatic commit message."),
});
export const ClosePullRequestSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    pull_number: z.number().int().describe("The number of the pull request to close."),
});
export const AddPullRequestCommentSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    pull_number: z.number().int().describe("The number of the pull request to comment on."),
    body: z.string().describe("The text content of the comment."),
});
export const PullRequestSummarySchema = z.object({
    id: z.number(),
    number: z.number(),
    state: z.enum(["open", "closed"]),
    title: z.string(),
    user: z.object({ login: z.string() }),
    html_url: z.string().url(),
    created_at: z.string().datetime(),
});
export const CreateBranchSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    branch: z.string().describe("The name of the new branch."),
    from_branch: z.string().describe("The name of the source branch to create from (e.g., 'main').").default("main"),
});
export const DeleteBranchSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    branch: z.string().describe("The name of the branch to delete."),
});
export const ListBranchesSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    protected: z.boolean().optional().describe("Filter branches by protection status."),
});
export const GetBranchSchema = z.object({
    owner: z.string().describe("The owner of the repository.").default(repo_owner),
    repo: z.string().describe("The name of the repository."),
    branch: z.string().describe("The name of the branch to fetch."),
});
export const BranchSummarySchema = z.object({
    name: z.string(),
    commit: z.object({
        sha: z.string(),
        url: z.string().url(),
    }),
    protected: z.boolean(),
});
export const GetLoggingDataInputSchema = z.object({
    toolName: z.string().describe("The name of the tool for which you want to fetch logs."),
    limit: z.number().int().positive().default(10).describe("The number of logs to fetch (default: 10)."),
    lastseenid: z.number().int().nonnegative().optional().describe("The ID of the last log seen (for pagination).")
});
export const ToolInteractionSchema = z.object({
    id: z.number(),
    toolName: z.string(),
    targetOwner: z.string().nullable(),
    targetRepo: z.string().nullable(), // BigInt becomes string in JSON
    input: z.string(),
    output: z.string(),
    status: z.enum(["success", "error"]),
    executedAt: z.string().datetime(),
});
// --- Discord Schemas ---
export const SendDiscordMessageSchema = z.object({
    text: z.string().min(1).max(2000).describe("The content of the message to send to Discord (max 2000 characters)."),
});
export const DiscordMessageResponseSchema = z.object({
    id: z.string().describe("The unique ID of the sent Discord message."),
    channelId: z.string().describe("The ID of the channel where the message was sent."),
    content: z.string().describe("The content of the sent message."),
});
