import { github } from "../lib/github.js";
import { RequestError } from "@octokit/request-error";
import { ZodError } from "zod";

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

