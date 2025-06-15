import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import { load_state_from_buffer } from '../utils/data_utils/persistent_store.js';


const upload_data_command: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	admin_only_command: true,
	command_metadata: new SlashCommandBuilder()
		.setName('upload_data')
		.setDescription('Sets the state of the ti bot as a zip file, see fetch data for the expected file layout')
        .addAttachmentOption(file_option =>
            file_option.setName("state_file")
                .setDescription("The zip file for the bot's state")
                .setRequired(true)
        ),
	async execute(interaction) {
        const state_file = interaction.options.getAttachment("state_file", true)
        const array_buffer = await fetch(state_file.url).then(value => value.arrayBuffer());
        const state_result = load_state_from_buffer(Buffer.from(array_buffer))
        if (state_result._tag == "Failure"){
            console.error(state_result.error)
            interaction.reply({
                content: "Failed to set state, tell <@99778758059237376> to check logs"
            })
            return
        }
        interaction.reply({
            content: "New state set!"
        })
	}
};

export default upload_data_command;
