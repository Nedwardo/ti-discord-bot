import getCommands from "./commands.js";
import { AutoCompleteSlashCommand, SlashCommand } from "../types/command.js";
import Result from "../types/result.js";
import { DB, is_admin } from "../../db/db_interactions.js";
import { APIApplicationCommandAutocompleteInteraction, APIChatInputApplicationCommandInteraction, APIInteraction, APIInteractionResponse, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import { verifyKey, verifyKeyMiddleware } from "discord-interactions";


export async function validate_discord_request(request: Request, discord_token: string): Promise<Result<number, string>>{
    if (request.method !== 'POST') {
        return {
            _tag: "Failure",
            error: "Method not allowed"
        };
    }
    verifyKeyMiddleware(discord_token);
    console.log("Successfully verified key middleware, whatever that means")

    const signature = request.headers.get('x-signature-ed25519')?? "";
    const timestamp = request.headers.get('x-signature-timestamp')?? "";
    const body = await request.clone().arrayBuffer();

    // Verify Discord signature
    console.log("Verifying key with body:\n" + body + "\n\nsignature:\n" + signature + "\n\ntimestamp:\n" + timestamp)
    const isValidRequest = await verifyKey(body, signature, timestamp, discord_token);
    console.log("valid request = " + isValidRequest)
    if (isValidRequest){
        return {
            _tag: "Success",
            data: 200
        }
    }
    return {
        _tag: "Failure",
        error: "Could not validate request as coming from discord"
    }
}

export async function handle_discord_commands(request: Request, token: string, db: DB): Promise<Result<APIInteractionResponse, string>>{
    const valid_request = await validate_discord_request(request, token);

    if (valid_request._tag === "Failure") {
        return valid_request;
    }

    const interaction: APIInteraction = await request.json();

    if (interaction.type === InteractionType.Ping) {
        return {
            _tag: "Success",
            data: {
                type: InteractionResponseType.Pong
        }}
    }
    if (interaction.type === InteractionType.ApplicationCommand) {
        return handle_slash_command(interaction as APIChatInputApplicationCommandInteraction, db);
    }

    else if (interaction.type === InteractionType.ApplicationCommandAutocomplete){
        return handle_autocomplete_command(interaction, db);
    }
    return {
        _tag: "Failure",
        error: "Unknown find interaction type " + interaction.type
    }
}

export async function handle_slash_command(interaction: APIChatInputApplicationCommandInteraction, db: DB): Promise<Result<APIInteractionResponse, string>> {
    if (!interaction.user){
        return {
            _tag: "Failure",
            error: "No user was found on the interaction: " + interaction
        }
    }
    const admin = is_admin(interaction.user.id, db);
    const commands = await getCommands();
    if (!interaction.data){
        return {
            _tag: "Failure",
            error: "No data was found on the interaction: " + interaction
        }
    }
    const command = commands.get(interaction.data.name);

    var error_message: null | string = null;
    if (!command) {
        error_message = `No command matching ${interaction.data.name} was found.`
    }
    else if (command.admin_only_command && !admin){
        error_message = "Sorry my ass is too lazy to make this app work 90% of the time, so only an admin can use it.\nPlease ask Ed to become an admin"
    }
    else{
        try{
            return (command as SlashCommand).execute(interaction, db);
        } catch (error){
            error_message = "" + error
        }
    }

    return{
        _tag: "Failure",
        error: error_message
    };
        

}

export async function handle_autocomplete_command(interaction:  APIApplicationCommandAutocompleteInteraction, db: DB): Promise<Result<APIInteractionResponse, string>> {
    const commands = await getCommands();
    const command = commands.get(interaction.data.name);

    if (!command){
        return {
            _tag: "Failure",
            error: `No command matching ${interaction.data.name} was found.`
        }
    }
    if (!command.interaction_types.includes(InteractionType.ApplicationCommandAutocomplete)){
        return {
            _tag: "Failure",
            error: `No command matching ${interaction.data.name} has an autocomplete functionality.`
        }
    }
    try{
        return (command as AutoCompleteSlashCommand).auto_complete_update(interaction, db);
    } catch (error){
        return {
            _tag: "Failure",
            error: "" + error
        }
    }
}
