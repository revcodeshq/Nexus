# Discord Bot

A multi-purpose Discord bot featuring moderation, ticket system, and auto-mod capabilities.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   Create a `.env` file:
   ```
   DISCORD_TOKEN=
   CLIENT_ID=
   GUILD_ID=
   ```
3. **Configure Settings**
   Update `config.json` with your role and channel IDs.

4. **Deploy Commands**
   ```bash
   npm run deploy
   ```

5. **Start**
   ```bash
   npm start
   ```

## Features

- **Moderation**: Kick, Ban, Timeout (with Mod role guards)
- **Tickets**: Interactive support ticket system
- **Auto-Mod**: Bad word filter and spam protection
- **Logging**: Moderation actions logged to configured channel
