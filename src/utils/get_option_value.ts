import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType } from "discord-api-types/v10";
import { User } from "./types/game_player_data.js";

function get_option_value<ApplicationCommandOptionType>(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string,
  type: ApplicationCommandOptionType
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (!options) return undefined;
  
  const option = options.find(opt => opt.name === name && opt.type === type);
  return option && 'value' in option ? option.value : undefined;
}
export function get_string_option(options: APIApplicationCommandInteractionDataOption[] | undefined, name: string): string | undefined {
  return get_option_value(options, name, ApplicationCommandOptionType.String);
}

export function get_integer_option(options: APIApplicationCommandInteractionDataOption[] | undefined, name: string): number | undefined {
  return get_option_value(options, name, ApplicationCommandOptionType.Integer);
}

export function get_boolean_option(options: APIApplicationCommandInteractionDataOption[] | undefined, name: string): boolean | undefined {
  return get_option_value(options, name, ApplicationCommandOptionType.Boolean);
}

export function get_user_option(options: APIApplicationCommandInteractionDataOption[] | undefined, name: string): User | undefined {
  console.log("Getting user from:\n" + "name: " + name + "\noptions:\n" + JSON.stringify(options))
  return get_option_value(options, name, ApplicationCommandOptionType.User);
}
