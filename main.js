const { Events } = require('discord.js');
const { token } = require('./config.json');
const { client } = require('./discordSetup');
const { commonCommands } = require('./interactions/common');
const { submitPrompt } = require('./interactions/submitPrompt');

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Execute commands from commands folder
client.on(Events.InteractionCreate, commonCommands);

// on modal submit
client.on(Events.InteractionCreate, submitPrompt);

// Log in to Discord with your client's token
client.login(token);
