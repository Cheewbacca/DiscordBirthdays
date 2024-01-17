const { SlashCommandBuilder } = require('discord.js');
const { mongo } = require('../../mongoSetup');
const { users } = require('../../config.json');

const usersMap = users.reduce((acc, user) => ({ ...acc, [user.id]: user.name }), {});

const getList = async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    await mongo.connect().catch(() => {
        interaction.reply({
            content: 'Failed connection to db',
        });
    });

    const db = mongo.db('ExpoBirthdays');

    const currentEvent = await db.collection('events').findOne({}, { sort: { $natural: -1 } });

    const { collectionName } = currentEvent || {};

    if (!collectionName) {
        await mongo.close();

        return interaction.reply({
            content: 'Something went wrong !',
        });
    }

    const list = await db.collection(collectionName).find({}).toArray();

    await mongo.close();

    return interaction.reply({
        content: list
            .map(({ userId }) => usersMap[userId])
            .filter(Boolean)
            .join(', '),
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Call this command to get list of confirmed users'),
    async execute(interaction) {
        return getList(interaction);
    },
};
