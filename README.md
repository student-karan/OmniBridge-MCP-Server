# 🌉 OmniBridge-MCP

OmniBridge-MCP is a production-grade Model Context Protocol (MCP) server that connects AI agents to your GitHub and Discord ecosystem. This project features a sophisticated multi-tool architecture and a persistent MySQL logging system for auditing AI actions.

---

## 🏛 Architectural Decision: Why MySQL?
Initially, this project considered SQLite for its simplicity. However, for a production-level MCP server handling multiple simultaneous tool calls, **MySQL/MariaDB** was chosen because:
1. **Concurrency:** MySQL handles multiple write locks better than SQLite during heavy logging.
2. **Security:** Supports the **Principle of Least Privilege**, separating database administration from application logic. This is an industry-standard security practice.
3. **Auditability:** Provides a persistent, high-performance audit trail that survives server restarts.

---

## 🛠 One-Minute Setup

### 1. Install MySQL
- **Windows:** [Download MySQL Installer](https://dev.mysql.com/downloads/installer/) (Choose "Developer Default").
- **macOS/Linux:** Use your package manager (`brew` or `apt`).

### 2. Prepare the Database
Log into your MySQL Command Line Client and run:
```sql
CREATE DATABASE omnibridge_db;
```
*Note: This one-time setup step ensures the application operates within its own secured namespace, following the "Least Privilege" security principle.*

---

## 🔑 How to Get Your Tokens

### 🐙 GitHub Personal Access Token (PAT)
1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Select `repo`, `workflow`, and `user` scopes.
4. Copy the token immediately.

### 💬 Discord Bot Token & Channel ID
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a **New Application** and go to the **Bot** tab to "Reset Token" and copy it.
3. **Channel ID:** In Discord Settings > Advanced, enable **Developer Mode**. Then, right-click any channel and select **Copy Channel ID**.

---

## ⚙️ Claude Desktop Configuration

Add this to your `claude_desktop_config.json`. This configuration ensures the server has all necessary credentials for GitHub API, Discord integration, and MySQL logging.

```json
{
  "mcpServers": {
    "omnibridge": {
      "command": "npx",
      "args": ["-y", "omnibridge-mcp"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_pat",
        "GITHUB_REPO_OWNER": "your_github_username",
        "DATABASE_HOST": "localhost",
        "DATABASE_PORT": "3306",
        "DATABASE_USER": "root",
        "DATABASE_PASSWORD": "your_password",
        "DATABASE_NAME": "omnibridge_db",
        "DATABASE_URL": "mysql://root:your_password@localhost:3306/omnibridge_db",
        "DISCORD_BOT_TOKEN": "your_discord_bot_token",
        "DISCORD_CHANNEL_ID": "your_channel_id"
      }
    }
  }
}
```

---

## 🧰 Full Tool Catalog (40+ Tools)

### 🐙 GitHub Repository Management
- `create_repo`: Creates a new public or private repository from scratch.
- `delete_repo`: Permanently deletes a repository (use with caution).
- `update_repo_metadata`: Allows renaming a repository or updating its description.
- `change_repo_visibility`: Toggles a repository between 'public' and 'private' modes.
- `list_all_repos`: Retrieves a list of all repository names owned by the authenticated user.
- `get_repo_details`: Fetches full metadata, including clone URLs, size, and primary language.
- `fork_repo`: Creates a personal fork of any public repository to your account.
- `star_repo`: Adds the repository to the user's starred list.
- `unstar_repo`: Removes the repository from the user's starred list.

### 📝 Issue Tracking & Collaboration
- `create_issue`: Opens a new issue with a title, detailed body, and optional labels.
- `close_issue`: Marks an existing issue as closed.
- `update_issue`: Allows editing the title, body, or state of an existing issue.
- `list_all_issues`: Fetches all issues in a repository with advanced filtering.
- `get_issue_details`: Retrieves the full conversation thread and status of a specific issue.
- `add_issue_comment`: Appends a new comment to an existing issue discussion.

### 📈 Traffic, Analytics & Insights
- `get_repo_views`: Returns detailed traffic data, including total views and unique visitors.
- `get_repo_clone_count`: Tracks how many times the repository has been cloned.
- `get_top_referrers`: identifies the websites (e.g., Google, Twitter) driving traffic to the repo.
- `get_top_paths`: Lists the most frequently visited files and directories in the repository.
- `get_contributor_stats`: Provides a breakdown of commits, additions, and deletions per contributor.
- `get_commit_activity`: Displays the "heartbeat" of the repository (commits per week) over the last year.

### 🌿 Branch & Pull Request Management
- `create_branch`: Generates a new git branch from a specified source branch.
- `delete_branch`: Deletes a branch from the remote repository.
- `list_branches`: Lists all branches available in the repository.
- `get_branch`: Fetches detailed information about a specific branch.
- `create_pull_request`: Proposes code changes from one branch to another for review.
- `merge_pull_request`: Merges an approved pull request into the base branch.
- `close_pull_request`: Closes a pull request without merging the changes.
- `list_pull_requests`: Lists all open or closed pull requests for a repository.
- `get_pull_request`: Retrieves detailed information about a specific PR.
- `add_pr_comment`: Allows reviewers to post comments directly on a pull request.

### 👤 User Profile & Notifications
- `get_my_profile`: Fetches complete information about the current user's GitHub account.
- `get_user`: Retrieves public information about any GitHub user by their username.
- `list_followers`: Lists all GitHub users who follow the current user.
- `list_following`: Lists all users that the current user is following.
- `list_notifications`: Retrieves the latest activity notifications from the user's GitHub inbox.
- `mark_notification_read`: Clears specific notifications by marking them as read.

### 💬 Discord Integration & Logging
- `send_discord_message`: Sends a message to a pre-configured Discord channel.
- `list_recent_discord_messages`: Fetches the history of messages sent via OmniBridge from the database.
- `get_logging_data`: Provides a searchable log of all AI-to-tool interactions stored in MySQL.

---

## 📄 License & Credits
Developed for **GTBIT (GGSIPU)** as a major college project.
**Project Lead:** [Your Name]
**Architecture:** Node.js, Prisma V7, MariaDB/MySQL.
