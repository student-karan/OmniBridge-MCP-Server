import { logInteraction } from "../../db/db.js";
import { github, repo_owner } from "../../lib/github.js";
import { UserProfileSchema } from "../../utils/types.js";
import { extractErrorMessage } from "../../utils/utility.js";

// Function to get the user profile info 
export async function getMyProfile() {
    const logInput = "User wants his profile information."
    try {
        const { data } = await github.rest.users.getAuthenticated();
        await logInteraction(
            "get_my_profile",
            logInput,
            "User profile data is successfully fetched.",
            "success",
            repo_owner
        )
        return UserProfileSchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occured.";
        await logInteraction(
            "get_my_profile",
            logInput,
            errorMsg,
            "error",
            repo_owner
        )
        throw err;
    }
}

// Function to list all of the user followers 
export async function listFollowers({ per_page, page }: { per_page?: number, page?: number }) {
    const logInput = "User wants the list of all his followers."
    try {
        const { data } = await github.rest.users.listFollowersForAuthenticatedUser({ per_page, page });

        await logInteraction(
            "list_followers",
            logInput,
            "User's followers names are successfully fetched.",
            "success",
            repo_owner
        )
        return data.map(user => user.login);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occured.";
        await logInteraction(
            "list_followers",
            logInput,
            errorMsg,
            "error",
            repo_owner
        )
        throw err;
    }
}

// Function to list all Users followed by the user  
export async function listFollowing({ per_page, page }: { per_page?: number, page?: number }) {
    const logInput = "User wants the list of all people he/she is follwing."
    try {
        const { data } = await github.rest.users.listFollowedByAuthenticatedUser({ per_page, page });

        await logInteraction(
            "list_following",
            logInput,
            "The names of the users followed by the user are successfully fetched.",
            "success",
            repo_owner
        )
        return data.map(user => user.login);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occured.";
        await logInteraction(
            "list_following",
            logInput,
            errorMsg,
            "error",
            repo_owner
        )
        throw err;
    }
}

// Option to get the detail of one specific user
export async function getUser({ username }: { username: string }) {
    const logInput = `User wants to fetch the details of ${username}`;
    try {
        const { data } = await github.rest.users.getByUsername({ username });
        await logInteraction(
            "get_user",
            logInput,
            `The details of ${username} are successfully fetched.`,
            "success",
            username
        )
        return UserProfileSchema.parse(data);
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occurred.";
        await logInteraction(
            "get_user",
            logInput,
            errorMsg,
            "error",
            username
        )
        throw err;
    }
} 