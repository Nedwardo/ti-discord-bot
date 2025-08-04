
import { DB } from "../../db/db_interactions.js";
import { APIInteractionResponse, APIApplicationCommandAutocompleteResponse, InteractionType, RESTPostAPIApplicationCommandsJSONBody, APIApplicationCommandAutocompleteInteraction, APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import Result from "./result.js";

export type Command = {
	interaction_types: (InteractionType.ApplicationCommand | InteractionType.ApplicationCommandAutocomplete)[],
	admin_only_command: boolean,
}

export type SlashCommand = Command & {
	interaction_types: [InteractionType.ApplicationCommand],
	command_metadata: RESTPostAPIApplicationCommandsJSONBody,
	execute: (interaction: APIChatInputApplicationCommandInteraction, db: DB) => Promise<Result<APIInteractionResponse, string>>
}

export type AutoCompleteSlashCommand = Command & {
	interaction_types: [InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete],
	command_metadata: RESTPostAPIApplicationCommandsJSONBody,
	execute: (interaction: APIChatInputApplicationCommandInteraction, db: DB) => Promise<Result<APIInteractionResponse, string>>
	auto_complete_update: (interaction: APIApplicationCommandAutocompleteInteraction, db: DB) => Promise<Result<APIApplicationCommandAutocompleteResponse, string>>
};