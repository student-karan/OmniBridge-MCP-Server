# 🌉 OmniBridge-MCP

OmniBridge-MCP is a production-grade **Model Context Protocol (MCP)** server that unifies the developer's ecosystem. It acts as a sophisticated bridge connecting AI agents (Claude, ChatGPT, etc.) to **GitHub** and **Discord**, enabling "AI-native" workflows for modern development teams.

Developed for **GTBIT (GGSIPU)** as a major college project.

---

## ✨ Key Features

- **44+ Specialized Tools:** Automate the entire DevOps lifecycle, from repository creation to traffic analytics.
- **Persistent Audit Logging:** Every AI-to-tool interaction is stored in a **MySQL/MariaDB** database, providing a searchable "Black Box" recorder for security and accountability.
- **Corporate Collaboration:** Manage team access with dedicated tools for adding, removing, and auditing repository collaborators.
- **Deep Analytics:** Expose "hidden" GitHub data like traffic views, clone counts, and contributor stats directly to AI agents.
- **Platform Synergy:** Bridge the gap between code and communication by allowing AI to relay updates from GitHub to Discord instantly.
- **Self-Discovery Manifest:** A dedicated `list_available_tools` manifest allows for easy auditing and discovery of the server's full capabilities.

---

## 🏛 Architectural Decision: Why MySQL?
Initially, this project considered SQLite for its simplicity. However, for a production-level MCP server handling concurrent tool calls, **MySQL/MariaDB** was chosen because:
1. **Concurrency:** MySQL handles multiple write locks more efficiently during heavy parallel logging.
2. **Security:** Supports the **Principle of Least Privilege**, separating database administration from application logic.
3. **Enterprise Ready:** Provides a robust, persistent audit trail that survives server restarts and is scalable for large teams.

---

## 🛠 One-Minute Setup

### 1. Install MySQL
- **Windows:** [Download MySQL Installer](https://dev.mysql.com/downloads/installer/).
- **macOS/Linux:** Use `brew install mysql` or `apt install mysql-server`.

### 2. Prepare the Database
Log into your MySQL client and run:
```sql
CREATE DATABASE omnibridge_db;
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
GITHUB_PAT=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username
DATABASE_URL="mysql://user:password@localhost:3306/omnibridge_db"
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_channel_id
```

---

## ⚙️ MCP Client Configuration

Add this to your MCP client configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "omnibridge": {
      "command": "npx",
      "args": ["-y", "omnibridge-mcp@latest"],
      "env": {
        "GITHUB_PAT": "your_github_pat",
        "GITHUB_REPO_OWNER": "your_github_username",
        "DATABASE_HOST": "localhost",
        "DATABASE_PORT": "3306",
        "DATABASE_USER": "root",
        "DATABASE_PASSWORD": "your_password",
        "DATABASE_NAME": "omnibridge_db",
        "DATABASE_URL": "mysql://root:your_password@localhost:3306/omnibridge_db",
        "DISCORD_BOT_TOKEN": "your_discord_bot_token",
        "DISCORD_CHANNEL_ID": "your_discord_channel_id"
      }
    }
  }
}
```

---

## 🧰 Full Tool Catalog (44 Tools)

### 🐙 Repository Management
- `create_repo`: Creates a new public or private repository from scratch.
- `delete_repo`: Permanently deletes a repository (use with caution).
- `update_repo_metadata`: Allows renaming a repository or updating its description.
- `change_repo_visibility`: Toggles a repository between 'public' and 'private' modes.
- `list_all_repos`: Retrieves a list of all repository names owned by the authenticated user.
- `get_repo_details`: Fetches full metadata, including clone URLs, size, and primary language.
- `fork_repo`: Creates a personal fork of any public repository to your account.
- `star_repo`: Adds the repository to the user's starred list.
- `unstar_repo`: Removes the repository from the user's starred list.

### 👥 Collaborator & Team Management
- `add_collaborators`: Invite developers to a repository with specific permissions (`pull`, `push`, `admin`, etc.).
- `remove_collaborators`: Revoke repository access for a specific user.
- `list_collaborators`: Audit all users with access to a repository, including their roles and permissions.

### 📝 Issue Tracking
- `create_issue`: Opens a new issue with a title, detailed body, and optional labels/assignees.
- `close_issue`: Marks an existing issue as closed.
- `update_issue`: Allows editing the title, body, state, or labels of an existing issue.
- `list_all_issues`: Fetches all issues in a repository with advanced filtering (state, labels, assignee).
- `get_issue_details`: Retrieves the full conversation thread and status of a specific issue.
- `add_issue_comment`: Appends a new comment to an existing issue discussion.

### 📈 Traffic & Analytics
- `get_repo_views`: Returns detailed traffic data, including total views and unique visitors over time.
- `get_repo_clone_count`: Tracks how many times the repository has been cloned (daily/weekly).
- `get_top_referrers`: Identifies the websites (e.g., Google, Twitter) driving traffic to the repo.
- `get_top_paths`: Lists the most frequently visited files and directories in the repository.
- `get_contributor_stats`: Provides a breakdown of commits, additions, and deletions per contributor.
- `get_commit_activity`: Displays the weekly "heartbeat" of the repository over the last year.

### 🌿 Branches & Pull Requests
- `create_branch`: Generates a new git branch from a specified source branch (default: `main`).
- `delete_branch`: Deletes a branch from the remote repository.
- `list_branches`: Lists all branches available in the repository, including protection status.
- `get_branch`: Fetches detailed information (SHA, protection) about a specific branch.
- `create_pull_request`: Proposes code changes from one branch to another for review.
- `merge_pull_request`: Merges an approved pull request into the base branch using specified merge methods.
- `close_pull_request`: Closes a pull request without merging the changes.
- `list_pull_requests`: Lists all open or closed pull requests for a repository with filtering.
- `get_pull_request`: Retrieves detailed information about a specific PR.
- `add_pr_comment`: Allows reviewers to post comments directly on a pull request discussion.

### 👤 User Profile & Social
- `get_my_profile`: Fetches complete information about the current user's GitHub account.
- `get_user`: Retrieves public information about any GitHub user by their username.
- `list_followers`: Lists all GitHub users who follow the current user.
- `list_following`: Lists all users that the current user is following.
- `list_notifications`: Retrieves the latest activity notifications from the user's GitHub inbox.
- `mark_notification_read`: Clears specific notifications by marking them as read.

### 💬 Discord Integration
- `send_discord_message`: Sends a message to a pre-configured Discord channel and logs it locally.
- `list_recent_discord_messages`: Fetches the history of messages sent via OmniBridge from the internal database.

### 🛡️ System & Audit
- `get_logging_data`: Provides a searchable log of all AI-to-tool interactions stored in MySQL.
- `list_available_tools`: A self-discovery manifest that provides a categorized overview of all server capabilities.

---

## 📄 License & Credits
**Project Lead:** Jasmeet Singh
**Core Stack:** Node.js, TypeScript, Prisma V7, MySQL, Octokit, Discord.js.
