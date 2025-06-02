import { REST, Routes, Client, GatewayIntentBits, Events, Interaction } from 'discord.js';
import { TOKEN, CLIENT_ID } from './env.js';
import clear_existing_commands from './utils/clear_existing_commands.js';
import getCommands from './utils/commands.js';
import {AutoCompleteCommand} from './utils/types/command.js'
import admins from "./data/admins.json" with {type: "json"}


const rest = new REST().setToken(TOKEN);
await clear_existing_commands(rest);


const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent,
] });
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const commands = await getCommands();
await rest.put(
	Routes.applicationCommands(CLIENT_ID),
	{ body: Array.from(commands.values()).map(command => command.command_metadata.toJSON()) }).then(
	() =>	console.log('Successfully reloaded application (/) commands.'),
).catch(console.error);


client.on(Events.InteractionCreate, async interaction => {
	if (!admins.includes(interaction.user.id)) return;
	if (interaction.isChatInputCommand()){
		const command = commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (!command.interaction_type_checker(interaction)){
			console.error(`Type of interaction was incorrect, `);
		}
		try{
			command.execute(interaction);
		} catch (error){
			console.error(error)
		}
	}
	else if (interaction.isAutocomplete()){
		const command = commands.get(interaction.commandName ?? "");
		if (!command){
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (!command.interaction_type_checker(interaction)){
			console.error(`Type of interaction was incorrect, `);
		}
		// console.log(interaction.command)
		// console.log(interaction.command?.name)
		// console.log(interaction.commandName)
		try{
			(command as AutoCompleteCommand<Interaction>).auto_complete_update(interaction);
		} catch (error){
			console.error(error)
		}

	}

});

client.login(TOKEN);

// Events.MessageUpdate