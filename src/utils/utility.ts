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
};

export const toolList = [
    // Repository Management
    { name: "create_repo", title: "Create Repository", description: "Create a new GitHub repository.", category: "Repository Management" },
    { name: "delete_repo", title: "Delete Repository", description: "Delete a GitHub repository.", category: "Repository Management" },
    { name: "update_repo_metadata", title: "Update Repository Metadata", description: "Update description or name of a repo.", category: "Repository Management" },
    { name: "change_repo_visibility", title: "Change Repository Visibility", description: "Toggle between public and private.", category: "Repository Management" },
    { name: "list_all_repos", title: "List All Repositories", description: "List all repositories owned by the user.", category: "Repository Management" },
    { name: "get_repo_details", title: "Get Repository Details", description: "Fetch full metadata for a specific repo.", category: "Repository Management" },
    { name: "fork_repo", title: "Fork Repository", description: "Create a fork of a repository.", category: "Repository Management" },
    { name: "star_repo", title: "Star Repository", description: "Add a star to a repository.", category: "Repository Management" },
    { name: "unstar_repo", title: "Unstar Repository", description: "Remove a star from a repository.", category: "Repository Management" },

    // Issue Tracking
    { name: "create_issue", title: "Create Issue", description: "Open a new issue in a repository.", category: "Issue Tracking" },
    { name: "close_issue", title: "Close Issue", description: "Close an existing issue.", category: "Issue Tracking" },
    { name: "update_issue", title: "Update Issue", description: "Edit title, body, or state of an issue.", category: "Issue Tracking" },
    { name: "list_all_issues", title: "List All Issues", description: "List issues with advanced filtering.", category: "Issue Tracking" },
    { name: "get_issue_details", title: "Get Issue Details", description: "Fetch thread and status of an issue.", category: "Issue Tracking" },
    { name: "add_issue_comment", title: "Add Issue Comment", description: "Post a new comment on an issue.", category: "Issue Tracking" },

    // Analytics
    { name: "get_repo_views", title: "Get Repo Views", description: "Fetch traffic view statistics.", category: "Traffic & Analytics" },
    { name: "get_repo_clone_count", title: "Get Repo Clone Count", description: "Fetch repository clone statistics.", category: "Traffic & Analytics" },
    { name: "get_top_referrers", title: "Get Top Referrers", description: "Identify sources of repository traffic.", category: "Traffic & Analytics" },
    { name: "get_top_paths", title: "Get Top Paths", description: "List most visited files/directories.", category: "Traffic & Analytics" },
    { name: "get_contributor_stats", title: "Get Contributor Stats", description: "Detailed commit/line stats per user.", category: "Traffic & Analytics" },
    { name: "get_commit_activity", title: "Get Commit Activity", description: "Weekly heartbeat of the repository.", category: "Traffic & Analytics" },

    // Profile & Social
    { name: "get_my_profile", title: "Get My Profile", description: "Fetch details of the authenticated user.", category: "User & Profile" },
    { name: "get_user", title: "Get User", description: "Fetch public info for any GitHub user.", category: "User & Profile" },
    { name: "list_followers", title: "List Followers", description: "List users following the current user.", category: "User & Profile" },
    { name: "list_following", title: "List Following", description: "List users the current user follows.", category: "User & Profile" },

    // Notifications
    { name: "list_notifications", title: "List Notifications", description: "Fetch latest GitHub inbox notifications.", category: "Notifications" },
    { name: "mark_notification_read", title: "Mark Notification Read", description: "Clear specific notifications.", category: "Notifications" },

    // PRs
    { name: "create_pull_request", title: "Create Pull Request", description: "Propose changes between branches.", category: "Pull Requests" },
    { name: "merge_pull_request", title: "Merge Pull Request", description: "Merge an approved PR.", category: "Pull Requests" },
    { name: "close_pull_request", title: "Close Pull Request", description: "Close a PR without merging.", category: "Pull Requests" },
    { name: "list_pull_requests", title: "List Pull Requests", description: "Fetch PRs for a repository.", category: "Pull Requests" },
    { name: "get_pull_request", title: "Get Pull Request", description: "Fetch details for a specific PR.", category: "Pull Requests" },
    { name: "add_pr_comment", title: "Add PR Comment", description: "Post a comment on a PR.", category: "Pull Requests" },

    // Branches
    { name: "create_branch", title: "Create Branch", description: "Create a new branch from a source.", category: "Branch Management" },
    { name: "delete_branch", title: "Delete Branch", description: "Remove a branch from the remote.", category: "Branch Management" },
    { name: "list_branches", title: "List Branches", description: "List all branches in a repo.", category: "Branch Management" },
    { name: "get_branch", title: "Get Branch", description: "Fetch details for a specific branch.", category: "Branch Management" },

    // Collaborators
    { name: "add_collaborators", title: "Add Collaborators", description: "Invite users to a repository.", category: "Collaborator Management" },
    { name: "remove_collaborators", title: "Remove Collaborators", description: "Revoke user access to a repo.", category: "Collaborator Management" },
    { name: "list_collaborators", title: "List Collaborators", description: "Audit users with access to a repo.", category: "Collaborator Management" },

    // Discord
    { name: "send_discord_message", title: "Send Discord Message", description: "Post to a configured Discord channel.", category: "Discord Integration" },
    { name: "list_recent_discord_messages", title: "List Recent Discord Messages", description: "Fetch history of sent messages.", category: "Discord Integration" },

    // System
    { name: "get_logging_data", title: "Get Logging Data", description: "Fetch persistent audit logs from MySQL.", category: "Logging & Audit" },
    { name: "list_available_tools", title: "List Available Tools", description: "Self-discovery tool for server manifest.", category: "Logging & Audit" }
];