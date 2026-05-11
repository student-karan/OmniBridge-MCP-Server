import { logInteraction } from "../../db/db.js";
import { addCollaboratorsInputtype, removeCollaboratorsInputtype, listCollaboratorsInputtype } from "../../utils/types.js";
import { github } from "../../lib/github.js";
import repoExists, { extractErrorMessage } from "../../utils/utility.js";

// Function to add collaborators in a specific repository 
export async function addCollaborators({ owner, repo, username, permission }: addCollaboratorsInputtype) {
    let targetRepo: bigint | null = null;
    let logInput = `The user wants to add ${username} to repo : ${repo}`;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        await github.rest.repos.addCollaborator({ owner, repo, username, permission });
        await logInteraction(
            "add_collaborators",
            logInput,
            `${username} is successfully added as a collaborator in repo : ${repo}`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || `An error occured while adding ${username} as a collaborator in repo : ${repo}`;
        await logInteraction(
            "add_collaborators",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to remove collaborators from a specific repository 
export async function removeCollaborators({ owner, repo, username }: removeCollaboratorsInputtype) {
    let targetRepo: bigint | null = null;
    let logInput = `The user wants to remove ${username} from repo : ${repo}`;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        await github.rest.repos.removeCollaborator({ owner, repo, username });
        await logInteraction(
            "remove_collaborators",
            logInput,
            `${username} is successfully removed as a collaborator from repo : ${repo}`,
            "success",
            owner,
            targetRepo
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || `An error occured while removing ${username} as a collaborator from repo : ${repo}`;
        await logInteraction(
            "remove_collaborators",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
}

// Function to list all collaborators of a specific repository
export async function listCollaborators({ owner, repo, affiliation }: listCollaboratorsInputtype) {
    let targetRepo: bigint | null = null;
    let logInput = `The user wants to list all collaborators for repo : ${repo} with affiliation : ${affiliation}`;
    try {
        const repository = await repoExists(owner, repo);
        if (!repository) {
            throw new Error("Repository requested doesn't exist.");
        }
        targetRepo = BigInt(repository.id);
        const response = await github.rest.repos.listCollaborators({
            owner,
            repo,
            affiliation
        });

        const collaborators = response.data.map(user => ({
            username: user.login,
            role: user.role_name,
            permissions: user.permissions
        }));

        await logInteraction(
            "list_collaborators",
            logInput,
            `Successfully listed ${collaborators.length} collaborators for repo : ${repo}`,
            "success",
            owner,
            targetRepo
        );
        return collaborators;
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || `An error occurred while listing collaborators for repo : ${repo}`;
        await logInteraction(
            "list_collaborators",
            logInput,
            errorMsg,
            "error",
            owner,
            targetRepo
        );
        throw err;
    }
} 