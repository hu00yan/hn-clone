# Manual Database Setup

If you encounter issues with the `wrangler d1 create` command, you can create the database manually through the Cloudflare dashboard:

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/)
2. Navigate to Workers & Pages
3. In the D1 section, click "Create database"
4. Enter "hn-clone-db" as the database name
5. Select a region closest to your users
6. Click "Create"
7. After creation, note the database ID from the database details page
8. Update your `backend/wrangler.toml` file with the actual database ID:

```toml
[[ d1_databases ]]
binding = "DB"
database_name = "hn-clone-db"
database_id = "your-actual-database-id-here"
```