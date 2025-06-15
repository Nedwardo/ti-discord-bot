import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import { dump_state_as_buffer } from '../utils/data_utils/persistent_store.js';


const fetch_data_command: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	admin_only_command: true,
	command_metadata: new SlashCommandBuilder()
		.setName('fetch_data')
		.setDescription('Gets state of the ti bot as a zip file'),
	async execute(interaction) {
        const state_result = dump_state_as_buffer()
        if (state_result._tag == "Failure"){
            console.error(state_result.error)
            interaction.reply({
                content: "Failed to zip state, tell <@99778758059237376> to check logs"
            })
            return
        }
        interaction.reply({
            files: [new AttachmentBuilder(state_result.data, { name: "state.zip"})]
        })
	}
};

export default fetch_data_command;
