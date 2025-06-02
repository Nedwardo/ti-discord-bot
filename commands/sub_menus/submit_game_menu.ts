import { ChatInputCommandInteraction, SlashCommandBuilder, User} from "discord.js";
import {AutoCompleteCommand} from "../../utils/types/command.js";
import factions from "../../data/factions.json" with {type: "json"}
import PlayerGameData from "../../utils/types/player_game_data.js";
import is_string_numeric from "../../utils/is_string_numeric.js";
import Result from "../../utils/types/result.js";
import add_game_data_to_data from "../../utils/add_game_data_to_data.js";
import { parse } from 'date-fns';

function submit_game_slash_command(player_count: number): SlashCommandBuilder {
    const command = new SlashCommandBuilder()
        .setName("submit_" + player_count+"_player_game")
        .setDescription('Submits a game with ' + player_count + ' players, to the record');

    command.addStringOption(
        game_date => game_date.setName("game_date")
        .setDescription("Date of the game in DD-MM-YY format")
        // .setRequired(true)
    )
    for (let player_index = 1; player_index <= player_count; player_index++) {
        command.addUserOption(
            player_select => player_select.setName("player_"+player_index+"_discord_name")
            .setDescription("Choose the discord account of the player in this position")
            // .setRequired(true)
        );

        command.addStringOption(player_position =>
            player_position.setName("player_" + player_index + "_metrics")
                .setDescription("The player's ranking at the end of the game, their points scored, their T0 speaker order")
                // .setRequired(true)
        );

        command.addStringOption(faction_choice =>
            faction_choice.setName("player_" + player_index + "_faction_choice")
                .setDescription("The faction the player is using please use emoji as discord is cringe")
                // .setChoices(...get_reduced_faction_list(factions))
                .setAutocomplete(true)
                // .setRequired(true)
        )
    }
    return command
}


function get_reduced_faction_list(faction_list: {name: string, emoji: string}[], sub_string: string = "", max_length: number = 25): {name: string, value: string}[] {
    return faction_list.filter(element => element.name.includes(sub_string))
        .map(faction => {return {name: faction.name, value: faction.emoji}})
        .filter((_element, index) => (index % Math.ceil(factions.length / max_length)) == 0)
}

function generate_execute_method(player_count: number): (interaction: ChatInputCommandInteraction) => void {
    return (interaction: ChatInputCommandInteraction) => {
        const game_data_result = get_game_data_from_command_input(interaction, player_count);
        if (game_data_result._tag == "Failure"){
            interaction.reply({
                content: "Bad data was submitted, error message:\n" + game_data_result.error + "\n\ncomplain to <@99778758059237376>"
            })
            return;
        }

        add_game_data_to_data(game_data_result.data);
        interaction.reply({
            content: "wowee, you didn't fuck it up (still doesn't work yet)",
            // components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(submit_game_select_menu(player_count))]
        });
    }
}

function get_game_data_from_command_input(interaction: ChatInputCommandInteraction, player_count: number): Result<{player_data: PlayerGameData[], date: Date}, string> {
    const player_data: PlayerGameData[] = [];
    var player: User | null;
    var faction: string | null;
    var metrics: string | null;
    var list_metrics: string[] = []
    var list_numerical_metrics: number[] = []
    // var faction = "";

    const date_string =  interaction.options.getString("game_date")
    if (!date_string){
        return {
            _tag: "Failure",
            error: "Null date for was submitted, full response object:\n```" + interaction.options + "```"
        }
    }
    const date = parse(date_string, "dd-MM-yy", Date())
    if (!date){
        return {
            _tag: "Failure",
            error: "Invalid date format player was specified, expected dd-MM-yy, received " + date_string
        }
    }

    for (let player_index = 1; player_index <= player_count; player_index++) {
        metrics = interaction.options.getString("player_" + player_index + "_metrics")
        if (!metrics){
            return {
                _tag: "Failure",
                error: "Null metrics for player " + player_index + " was submitted, full response object:\n```" + interaction.options + "```"
            }
        }

        list_metrics = metrics.split(", ")
        if (!list_metrics.map(is_string_numeric).reduce((previousValue, currentValue) => previousValue && currentValue))
            return {
                _tag: "Failure",
                error: "some of the metrics were not numbers"
            }
        list_numerical_metrics = list_metrics.map(Number)

        player = interaction.options.getUser("player_"+player_index+"_discord_name")
        if (!player){
            return {
                _tag: "Failure",
                error: "Null player for player " + player_index + " was submitted, full response object:\n```" + interaction.options + "```"
            }
        }
        
        faction = interaction.options.getString("player_"+player_index+"_discord_name")
        if (!faction){
            return {
                _tag: "Failure",
                error: "Null metrics for faction " + player_index + " was submitted, full response object:\n```" + interaction.options + "```"
            }
        }
        
        // TODO add better metrics and faction validation
        player_data.push({
            player: player,
            faction: faction,
            T0_speaker_order: list_numerical_metrics[2] as number,
            ranking: list_numerical_metrics[0] as number,
            points: list_numerical_metrics[1] as number
        })

    }
    return {
        _tag: "Success",
        data: {player_data: player_data, date: date}
    }
}



export default function submit_game_menu(player_count: number): AutoCompleteCommand<ChatInputCommandInteraction> {
    return {
        interaction_type_checker: (interaction) => {
            console.log(interaction);
            return interaction.isChatInputCommand() || interaction.isAutocomplete();
        },
        command_metadata: submit_game_slash_command(player_count),
        execute: generate_execute_method(player_count),
        async auto_complete_update(interaction) {
            const focused_value = interaction.options.getFocused();
            const reduced_factions = get_reduced_faction_list(factions, focused_value)
            await interaction.respond(reduced_factions)
        }
    }
}