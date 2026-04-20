import { logInteraction } from "../db/db.js";
import { github, repo_owner } from "../lib/github.js";
import { RepoDetailsSchema, RepositorySchema, visibility } from "../utils/types.js";
import repoExists, { extractErrorMessage } from "../utils/utility.js";

// Function to create a new Repo
export async function createRepo(repo: string, visibility: visibility, desc?: string) {
    let logInput = `User want to create a repo with name : ${repo} with ${visibility} visibility.`;
    try {
        const check = await repoExists(repo_owner, repo);
        if (check) {
            throw new Error("Repository with this name already exists.");
        }
        const repository = await github.rest.repos.createForAuthenticatedUser({
            name: repo,
            description: desc,
            private: visibility === "private"
        });
        await logInteraction(
            "create_repo",
            logInput,
            `Repository with name : ${repo} was successfully created`,
            "success",
            repo_owner,
            BigInt(repository.data.id)
        );
        return RepositorySchema.parse(repository.data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while creating the repository.";

        await logInteraction(
            "create_repo",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            null
        );
        throw err;
    }
}

// Function to delete a Repo 
export async function deleteRepo(repo: string) {
    let logInput = `User want to delete a repo with name : ${repo}.`;
    try {
        const check = await repoExists(repo_owner, repo);
        if (!check) {
            throw new Error("Repository requested to delete doesn't exist.");
        }
        await github.rest.repos.delete({
            owner: repo_owner,
            repo: repo
        });
        await logInteraction(
            "delete_repo",
            logInput,
            `Repository with name : ${repo} was successfully deleted`,
            "success",
            repo_owner,
            BigInt(check.id)
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while deleting the repository.";
        
        await logInteraction(
            "delete_repo",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            null
        );
        throw err;
    }
}

// Function to update a Repo metadata
export async function updateRepoMetadata(repo: string, newName? : string, desc?: string) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to update the metadata of repo ${repo}`;
    try {
        const check = await repoExists(repo_owner, repo);
        if (!check) {
            throw new Error("Repository requested to update doesn't exist.");
        }
        targetRepo = BigInt(check.id);
        await github.rest.repos.update({
            owner: repo_owner,
            repo,
            ...(newName && { name: newName }),
            description: desc
        });
        await logInteraction(
            "update_repo_metadata",
            logInput,
            `Metadata of repository with name : ${repo} was successfully updated.`,
            "success",
            repo_owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while updating the repository description.";

        await logInteraction(
            "update_repo_metadata",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to change the repository visibility 
export async function changeRepoVisibility(repo: string, visibility: visibility) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to change visibility of repo : ${repo} to : ${visibility}.`;
    try {
        const check = await repoExists(repo_owner, repo);
        if (!check) {
            throw new Error("Repository requested to update doesn't exist.");
        }
        targetRepo = BigInt(check.id);

        await github.rest.repos.update({
            owner: repo_owner,
            repo,
            visibility: visibility
        });
        await logInteraction(
            "change_repo_visibility",
            logInput,
            `Repository visibility of : ${repo} was successfully changed to : ${visibility}`,
            "success",
            repo_owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while updating the repository visibility.";

        await logInteraction(
            "change_repo_visibility",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            targetRepo
        );
        throw err;
    }
}

// Function to list all repositories
export async function listAllRepos() {
    let logInput = `User want to list all repositories.`;
    try {
        const repos = await github.rest.repos.listForAuthenticatedUser({
            visibility: "all",
            affiliation: "owner",
            sort: "updated",
            direction: "desc"
        });
        const repoNames = repos.data.map(repo => repo.name);
        await logInteraction(
            "list_all_repos",
            logInput,
            `Found ${repoNames.length} repositories.`,
            "success",
            repo_owner,
            null
        );
        return repoNames;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while listing the repositories.";

        await logInteraction(
            "list_all_repos",
            logInput,
            errorMsg,
            "error",
            repo_owner,
            null
        );
        throw err;
    }
}

// Function Get the details of a specific repo
export async function getRepoDetails(owner : string = repo_owner, repo: string) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to get details of repo : ${owner}/${repo}.`;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        await logInteraction(
            "get_repo_details",
            logInput,
            `Details of repository : ${owner}/${repo} fetched successfully.`,
            "success",
            owner,
            targetRepo
        );
        return RepoDetailsSchema.parse(repository);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while fetching the repository details.";

        await logInteraction(
            "get_repo_details",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to fork a Repo
export async function forkRepo(owner: string = repo_owner, repo: string, my_fork_name: string) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to fork ${owner}/${repo} as ${my_fork_name}.`;
    try {
        const response = await github.rest.repos.createFork({
            owner,
            repo,
            name: my_fork_name,
            default_branch_only: false
        });
        targetRepo = BigInt(response.data.id);
        await logInteraction(
            "fork_repo",
            logInput,
            `Successfully forked ${owner}/${repo}.`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while forking a repository.";

        await logInteraction(
            "fork_repo",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to star a Repo
export async function starRepo(owner: string = repo_owner, repo: string) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to star ${owner}/${repo}.`;
    try {
        // We might want to get the repo first to get the ID for the log
        const repoData = await repoExists(owner, repo);
        if (!repoData) {
            throw new Error("Repository not found.");
        }
        targetRepo = BigInt(repoData.id);

        await github.rest.activity.starRepoForAuthenticatedUser({
            owner,
            repo
        });
        await logInteraction(
            "star_repo",
            logInput,
            `Successfully starred ${owner}/${repo}.`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while starring a repository.";

        await logInteraction(
            "star_repo",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to unstar a Repo
export async function unStarRepo(owner: string = repo_owner, repo: string) {
    let targetRepo: null | bigint = null;
    let logInput = `User want to unstar ${owner}/${repo}.`;
    try {
        const fullRepo = await repoExists(owner, repo);
        if (!fullRepo) {
            throw new Error("Repository not found.");
        }
        targetRepo = BigInt(fullRepo.id);

        await github.rest.activity.unstarRepoForAuthenticatedUser({
            owner,
            repo
        });
        await logInteraction(
            "unstar_repo",
            logInput,
            `Successfully unstarred ${owner}/${repo}.`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while un-starring a repository.";

        await logInteraction(
            "unstar_repo",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}