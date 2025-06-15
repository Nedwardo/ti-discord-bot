import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import  data from '../utils/data_utils/persistent_store.js';
import Result from '../utils/types/result.js';

const add_admin_command: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	admin_only_command: true,
	command_metadata: build_add_admin_slash_command(),
	async execute(interaction) {
        const admin_id = interaction.options.getUser("admin_name", true).id
        const result = save_new_admin(admin_id)
        if (result._tag == "Success"){
            await interaction.reply({
                content: result.data
            })
        }
        else{
            await interaction.reply({
                content: result.error
            })
        }
	},
};

function build_add_admin_slash_command(): SlashCommandBuilder{
    var add_admin_slash_command = new SlashCommandBuilder()
		.setName('add_new_admin')
		.setDescription('Adds a new admin')
    add_admin_slash_command.addUserOption(admin_name_option =>
        admin_name_option.setName("admin_name")
            .setDescription("Admin's discord handle")
            .setRequired(true)
    );
    return add_admin_slash_command
}

function save_new_admin(new_admin_id: string | undefined): Result<string, string>{
    if (new_admin_id === undefined){
         return {
            _tag: "Failure",
            error: "Admin id was undefined, idk how you got here, Summoning <@99778758059237376>"
        };
    }

    var admin_ids = data.admins.get()
    if (admin_ids.includes(new_admin_id)){
         return {
            _tag: "Failure",
            error: "Admin: <@" + new_admin_id + "> is already an admin"
        };
    }

    admin_ids.push(new_admin_id)
    data.admins.set(admin_ids)
    return {
        _tag: "Success",
        data: "Admin: <@" + new_admin_id + "> added"
    };
}

export default add_admin_command;
