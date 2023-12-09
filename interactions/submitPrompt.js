const { client } = require('../discordSetup');
const { BIRTHDAY_MAN, MAIN_TEXT, CARD_DETAILS } = require('../constants/modal');
const { users } = require('../config.json');

const submitPrompt = async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }

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

    if (valuesAsArray.length !== 3) {
        interaction.reply({
            content: 'Missing required fields',
        });

        return;
    }

    const [birthdayId, text, cardDetails] = valuesAsArray;

    const usersWithoutBirthdayMan = users.filter(({ id }) => id !== birthdayId);

    if (usersWithoutBirthdayMan.length === users.length) {
        interaction.reply({
            content: 'Wrong id was provided! Try one more time',
        });

        return;
    }

    return Promise.all(
        usersWithoutBirthdayMan.map(({ id }) =>
            client.users.fetch(id, false).then((user) => user.send(`${text}\n\n${cardDetails}`)),
        ),
    )
        .then(() => {
            interaction.reply({
                content: 'All users received their notifications!',
            });
        })
        .catch((err) => {
            interaction.reply({
                content: err.message ?? 'Something went wrong',
            });
        });
};

module.exports = {
    submitPrompt,
};
