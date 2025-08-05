import {AutoCompleteSlashCommand} from "../../utils/types/command.js";
import GamePlayerData from "../../utils/types/game_player_data.js";
import is_string_numeric from "../../utils/is_string_numeric.js";
import Result from "../../utils/types/result.js";
import { parse } from 'date-fns';
import { DB, get_all_factions, store_game_data } from "../../db/db_interactions.js";
import { APIApplicationCommandInteractionDataOption, APIApplicationCommandOption, APIChatInputApplicationCommandInteraction, APIInteractionResponse, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, InteractionType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { get_string_option, get_user_option } from "../../utils/get_option_value.js";

function submit_game_slash_command(player_count: number, points_to_win: number): RESTPostAPIApplicationCommandsJSONBody {
    const options: APIApplicationCommandOption[] = []

    options.push(
        {
            name: "game_date",
            description: "Date of the game in dd-MM-yy format",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    )
    for (let player_index = 1; player_index <= player_count; player_index++) {
        options.push({
            name: "player_"+player_index+"_discord_name",
            description: "Choose the discord account of the player in this position",
            type: ApplicationCommandOptionType.User,
            required: true
        })

        options.push({
            name: "player_" + player_index + "_metrics",
            description: "The player's ranking at the end of the game, their points scored, their T0 speaker order",
            type: ApplicationCommandOptionType.String,
            required: true
        })

        options.push({
            name: "player_" + player_index + "_faction_choice",
            description: "The faction the player is using please use emoji as discord is cringe",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        })
    }
    return {
        name: "submit_" + points_to_win + "_points_" + player_count+"_player_game",
        description: 'Submits a game with ' + player_count + ' players, to the record',
        type: ApplicationCommandType.ChatInput,
        options: options
    }
}


function get_reduced_faction_list(faction_list: {name: string, emoji: string}[], sub_string: string = "", max_length: number = 25): string[] {
    return faction_list.filter(element => element.name.toLowerCase().includes(sub_string.toLowerCase()))
        .map(faction => faction.name)
        .filter((_element, index) => (index % Math.ceil(faction_list.length / max_length)) == 0)
}

function generate_execute_method(player_count: number, points_to_win: number): (interaction: APIChatInputApplicationCommandInteraction, db: DB) => Promise<Result<APIInteractionResponse, string>> {
    return async (interaction: APIChatInputApplicationCommandInteraction, db: DB) => {
        const game_data_result = get_game_data_from_command_input(interaction, player_count, points_to_win);
        if (game_data_result._tag == "Failure"){
            return game_data_result
        }
        
        await store_game_data(game_data_result.data, db);
        return {
            _tag: "Success",
            data: {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {content: "Data stored??"}
            }
        }
    }
}

function get_game_data_from_command_input(interaction: APIChatInputApplicationCommandInteraction, player_count: number, points_to_win: number): Result<{player_data: GamePlayerData[], date: Date, points_to_win: number}, string> {
    const player_data: GamePlayerData[] = [];
    var player_id: string | undefined;
    var faction: string | undefined;
    var metrics: string | undefined;
    var list_metrics: string[] = []
    var list_numerical_metrics: number[] = []

    console.log("Reading fields from user input")

    if (!interaction.data.options){
        return {
            _tag: "Failure",
            error: "Interaction command has no options, this shouldn't happen <@99778758059237376>"
        }
    }

    console.log("Getting date string")
    const date_string = get_string_option(interaction.data.options, "game_date")
    if (!date_string){
        return {
            _tag: "Failure",
            error: "Date string is invalid, this shouldn't happen <@99778758059237376>"
        }
    }
    const date = parse(date_string, "dd-MM-yy", Date())
    console.log("Game date is " + date)
    if (!date){
        return {
            _tag: "Failure",
            error: "Invalid date format player was specified, expected dd-MM-yy, received " + date_string
        }
    }

    for (let player_index = 1; player_index <= player_count; player_index++) {
        console.log("Getting player " + player_index + "'s metrics")
        metrics = get_string_option(interaction.data.options, "player_" + player_index + "_metrics")
        if (!metrics){
            return {
                _tag: "Failure",
                error: "Player at index " + player_index + " not found, whilst looking up metrics, summoning <@99778758059237376>"
            }
        }

        list_metrics = metrics.replace(" ", "").split(",")
        if (!list_metrics.map(is_string_numeric).reduce((previousValue, currentValue) => previousValue && currentValue))
            return {
                _tag: "Failure",
                error: "some of the metrics were not numbers"
            }
        list_numerical_metrics = list_metrics.map(Number)
        console.log("Player metrics are " + list_numerical_metrics)

        player_id = get_user_option(interaction.data.options, "player_"+player_index+"_discord_name")
        if (!player_id){
            return {
                _tag: "Failure",
                error: "Player at index " + player_index + " not found, summoning <@99778758059237376>"
            }
        }

        console.log("Getting player " + player_index + "'s faction choice")
        faction = get_string_option(interaction.data.options, "player_"+player_index+"_faction_choice")
        if (!faction){
            return {
                _tag: "Failure",
                error: "Player at index " + player_index + " not found, whilst looking up faction choice, summoning <@99778758059237376>"
            }
        }
        const individual_player_data = {
            player: player_id,
            faction: faction,
            t0_speaker_order: list_numerical_metrics[2] as number,
            ranking: list_numerical_metrics[0] as number,
            points: list_numerical_metrics[1] as number
        }
        
        console.log("Player data is:\n" + JSON.stringify(individual_player_data) + "\n")
        player_data.push(individual_player_data)

    }
    console.log("Successfully got all players data")
    return {
        _tag: "Success",
        data: {player_data: player_data, date: date, points_to_win: points_to_win}
    }
}

function get_focused_value(options: APIApplicationCommandInteractionDataOption<InteractionType.ApplicationCommandAutocomplete>[]): string | undefined{
    for (let option of options){
        if ((option.type === ApplicationCommandOptionType.String ||
            option.type === ApplicationCommandOptionType.Integer ||
            option.type === ApplicationCommandOptionType.Number) && option.focused){
            return option.value
        }
    }
    return undefined
}


export default function submit_game_menu(player_count: number, points_to_win: number): AutoCompleteSlashCommand {
    return {
        admin_only_command: true,
        interaction_types: [InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete],
        command_metadata: submit_game_slash_command(player_count, points_to_win),
        execute: generate_execute_method(player_count, points_to_win),
        async auto_complete_update(interaction, db) {
            const focused_value = get_focused_value(interaction.data.options);
            if (!focused_value){
                return {
                    _tag: "Success",
                    data:{
                        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
                        data: {
                            choices: []
                        }
                }}
            }
            const reduced_factions = get_reduced_faction_list(await get_all_factions(db), focused_value)
            return {
                _tag: "Success",
                data:{
                    type: InteractionResponseType.ApplicationCommandAutocompleteResult,
                    data: {
                        choices: reduced_factions.map(faction => ({name: faction, value: ApplicationCommandOptionType.String}))
                }}
            }
        }
    }
}