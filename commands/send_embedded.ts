import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChatInputCommandInteraction } from 'discord.js';
import Command from '../utils/types/command.js';

const send_embedded: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	command_metadata: new SlashCommandBuilder()
		.setName('send_embedded')
		.setDescription('sends embedded'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('About Embed Generator')
			.setDescription('Fanny Gash')
			.setColor(0x0000FF) // Use the integer color value
			.addFields(
				{ name: 'Weeeeeee', value: 'me to please😁', inline: true },
			)
			.setAuthor({ name: 'asd', url: 'https://www.google.com', iconURL: 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/22467-uterus' })
			.setURL('https://www.penisland.net')
			.setImage('https://upload.wikimedia.org/wikipedia/en/0/0b/Goonfinalposter.jpg')
			.setThumbnail('https://preview.redd.it/whats-the-deep-philosophical-reason-he-is-called-the-jonkler-v0-4qx1rz0sz0id1.jpeg?width=640&crop=smart&auto=webp&s=280f36b329d24e7ffd0d35650184bcd69a39a96a')
			.setFooter({ text: 'feet', iconURL: 'https://i.redd.it/97yd9pkvfnlb1.jpg' });
		// Libraries often handle timestamp conversion automatically if you provide a Date object.
		// For simplicity, I'm omitting it here, but you can set it if needed.

		// Components (Buttons and Select Menus)
		const row1 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('goon_time') // Use a custom ID for interactions
					.setLabel('Goon time')
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('🤮')
					.setDisabled(false),
				new ButtonBuilder()
					.setURL('https://example.com') // Use URL style for the second button
					.setLabel('Gash  time')
					.setStyle(ButtonStyle.Link) // Use Link style for URL buttons
					.setEmoji('😋'),
			);

		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('wee_wee_select') // Use a custom ID for interactions
					.setPlaceholder('Wee wee')
					.addOptions([
						{
							label: 'Pee Pee',
							description: 'My pee',
							value: 'pee_pee',
							emoji: '🍆',
						},
					]),
			);

		await interaction.reply({
			content: 'willy bum bum',
			embeds: [embed],
			components: [row1, row2],
		});
	},
};

export default send_embedded;