# EZ Slack Poll

Small and lightweight node.js app written to replace Slack's most popular (but restricted) polling app, Simple Poll.

## Formatting

Once the app is [hosted](https://api.slack.com/docs/hosting) and [installed](https://slack.com/help/articles/202035138-Add-apps-to-your-Slack-workspace) in slack, you can create a poll with the slash command `/ezpoll`, followed by your question (in quotes), and then each subsequent option (also in quotes). It supports between 2 and 10 options.

### `/ezpoll "Where should we go for lunch?" "Chipotle" "Popeyes" "Wendy's" "Smash Burger"`

