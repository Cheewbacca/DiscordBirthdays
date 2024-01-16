const { SlashCommandBuilder } = require('discord.js');
const { mongo } = require('../../mongoSetup');

const confirmCommand = async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const userName = interaction.user.username;
    const userId = interaction.user.id;

    await mongo.connect().catch(() => {
        interaction.reply({
            content: 'Failed connection to db',
        });
    });

    const db = mongo.db('ExpoBirthdays');

    const currentEvent = await db.collection('events').findOne({}, { sort: { $natural: -1 } });

    const { collectionName } = currentEvent;

    if (!collectionName) {
        interaction.reply({
            content: 'Something went wrong with your confirmation',
        });
    }

    await db
        .collection(collectionName)
        .insertOne({
            userName,
            userId,
        })
        .catch(() => {
            interaction.reply({
                content: 'Something went wrong with your confirmation',
            });
        });

    await mongo.close();

    return interaction.reply({
        content: 'Thanks !',
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confirm')
        .setDescription('Call this command to confirm your participation'),
    async execute(interaction) {
        return confirmCommand(interaction);
    },
};
