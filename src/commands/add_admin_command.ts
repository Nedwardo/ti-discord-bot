import {SlashCommand} from '../utils/types/command.js';
import  { add_admin, DB, is_admin } from '../db/db_interactions.js';
import Result from '../utils/types/result.js';
import { ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, InteractionType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { get_user_option } from '../utils/get_option_value.js';

const add_admin_command: SlashCommand = {
	admin_only_command: true,
    interaction_types: [InteractionType.ApplicationCommand],
	command_metadata: build_add_admin_slash_command(),
	async execute(interaction, db) {
        const admin_id = get_user_option(interaction.data.options, "admin_name")
        const result = await save_new_admin(admin_id, db)
        if (result._tag === "Failure"){
            return result
        }
        return {
            _tag: "Success",
            data: {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: result.data
                }
            }
        }
	},
};

function build_add_admin_slash_command(): RESTPostAPIApplicationCommandsJSONBody{
    return {
		name: 'add_new_admin',
		description: 'Adds a new admin',
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "admin_name",
            description: "Admin's discord handle",
            type: ApplicationCommandOptionType.User,
            required: true
        }]
    }
}

async function save_new_admin(new_admin_id: string | undefined, db: DB): Promise<Result<string, string>>{
    if (new_admin_id === undefined){
         return {
            _tag: "Failure",
            error: "Admin id was undefined, idk how you got here, Summoning <@99778758059237376>"
        };
    }
    const already_is_admin = await is_admin(new_admin_id, db)
    if (already_is_admin){
         return {
            _tag: "Failure",
            error: "Admin: <@" + new_admin_id + "> is already an admin"
        };
    }

    await add_admin(new_admin_id, db)
    return {
        _tag: "Success",
        data: "Admin: <@" + new_admin_id + "> added"
    };
}

export default add_admin_command;
