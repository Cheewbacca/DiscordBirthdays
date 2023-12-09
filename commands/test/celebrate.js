const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder,
} = require('discord.js');
const { BIRTHDAY_MAN, MAIN_TEXT, CARD_DETAILS } = require('../../constants/modal');

const replyWithModalWindow = async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const modal = new ModalBuilder().setCustomId('myModal').setTitle('Create birthday reminders');

    const whoHasBirthday = new TextInputBuilder()
        .setCustomId(BIRTHDAY_MAN)
        .setLabel('Вкажіть id іменинника')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const funnyText = new TextInputBuilder()
        .setCustomId(MAIN_TEXT)
        .setLabel('Напишіть повідомлення для колег')
        .setPlaceholder('Привіт, скоро в нашого колеги День народження, ...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const cardDetails = new TextInputBuilder()
        .setCustomId(CARD_DETAILS)
        .setLabel('Посилання на банку')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(whoHasBirthday);

    const secondActionRow = new ActionRowBuilder().addComponents(funnyText);

    const thirdActionRow = new ActionRowBuilder().addComponents(cardDetails);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('celebrate')
        .setDescription('Replies with modal window'),
    async execute(interaction) {
        await replyWithModalWindow(interaction);
    },
};
