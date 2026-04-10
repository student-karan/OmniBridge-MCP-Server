import { logInteraction } from "../db/logger.js";
import { github, repo_owner } from "../lib/github.js";
import { NotificationSchema, ListNotificationsInputType } from "../utils/types.js";
import { extractErrorMessage } from "../utils/utility.js";

// Function to get all the GitHub notifications of the current user.
export async function listNotifications(args: ListNotificationsInputType) {
    const logInput = "List all notifications for the current user.";
    try {
        const { data } = await github.rest.activity.listNotificationsForAuthenticatedUser(args);
        await logInteraction(
            "list_notifications",
            logInput,
            `Notifications for the ${repo_owner} are successfully fetched.`,
            "success",
            repo_owner
        );
        return data.map(notification => NotificationSchema.parse(notification));
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occured."
        await logInteraction(
            "list_notifications",
            logInput,
            errorMsg,
            "error",
            repo_owner
        )
        throw err;
    }
}

// Function to mark user specific notification as read.
export async function MarkNotificationRead({ thread_id }: { thread_id: number }) {
    const logInput = `User wants to mark the notification with id : ${thread_id} as read.`;
    try {
        const { data } = await github.rest.activity.markThreadAsRead({thread_id});

        await logInteraction(
            "mark_notification_read",
            logInput,
            `${repo_owner} Notification ${thread_id} is successfully marked as read.`,
            "success",
            repo_owner
        );
    } catch (err) {
        let errorMsg = extractErrorMessage(err) || "An unknown error occured."

        await logInteraction(
            "mark_notification_read",
            logInput,
            errorMsg,
            "error",
            repo_owner
        )
        throw err;
    }
}