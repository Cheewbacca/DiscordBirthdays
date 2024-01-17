const { client } = require('../discordSetup');
const { BIRTHDAY_MAN, MAIN_TEXT, CARD_DETAILS } = require('../constants/modal');
const { users } = require('../config.json');
const { mongo } = require('../mongoSetup');
const console = require('../logger');

const submitPrompt = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

    console.log('Prompt submitted');

    const userName = interaction.user.username;
    const userId = interaction.user.id;

    const { fields } = interaction.fields;

    if ((!fields) instanceof Map || !userName || !userId) {
        interaction.reply({
            content: 'Bad request',
        });

        return;
    }

    const mappedKeys = [BIRTHDAY_MAN, MAIN_TEXT, CARD_DETAILS];

    const valuesAsArray = mappedKeys.map((key) => fields.get(key)?.value).filter(Boolean);

    if (valuesAsArray.length !== mappedKeys.length) {
        interaction.reply({
            content: 'Missing required fields',
        });

        return;
    }

    const [birthdayId, text, cardDetails] = valuesAsArray;

    const usersWithoutBirthdayMan = users.filter(({ id }) => id !== birthdayId);

    console.dir(usersWithoutBirthdayMan);

    if (usersWithoutBirthdayMan.length === users.length) {
        interaction.reply({
            content: 'Wrong id was provided! Try one more time',
        });

        return;
    }

    await mongo.connect().catch(() => {
        interaction.reply({
            content: 'Failed connection to db',
        });
    });

    const db = mongo.db('ExpoBirthdays');

    const collectionName = `confirms_${birthdayId}_${new Date().getFullYear()}`;

    console.log('collectionName: ', collectionName);

    const collection = await db.collections({ name: collectionName });

    if (!collection.length) {
        await db.createCollection(collectionName);
    }

    return Promise.allSettled(
        usersWithoutBirthdayMan.map(({ id }) =>
            client.users
                .fetch(id, false)
                .then((user) => {
                    console.log(`${user} has received message`);
                    user.send(`${text}\n\n${cardDetails}`);
                    return Promise.resolve(user);
                })
                .catch((err) => {
                    console.error(err);
                }),
        ),
    )
        .then(() => {
            interaction.reply({
                content: `All users received their notifications! \n\n ${usersWithoutBirthdayMan
                    .map(({ name }) => name)
                    .join(', ')}`,
            });
        })
        .then(() =>
            db.collection('events').insertOne({
                collectionName,
                timeStamp: Number(new Date()),
            }),
        )
        .catch((err) => {
            interaction.reply({
                content: err.message ?? 'Something went wrong',
            });
        })
        .finally(() => {
            mongo.close();
        });
};

module.exports = {
    submitPrompt,
};
