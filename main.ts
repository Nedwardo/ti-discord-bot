import { REST, Routes, Client, GatewayIntentBits, Events, Interaction } from 'discord.js';
import { TOKEN, CLIENT_ID, GUILD_ID } from './env.js';
import clear_existing_commands from './utils/server/clear_existing_commands.js';
import getCommands from './utils/server/commands.js';
import {AutoCompleteCommand} from './utils/types/command.js'
import { read_admins } from './utils/data_utils/persistent_store.js';


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
	Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
	{ body: Array.from(commands.values()).map(command => command.command_metadata.toJSON()) }).then(
	() =>	console.log('Successfully reloaded application (/) commands.'),
).catch(console.error);

client.on(Events.InteractionCreate, async interaction => {
	const admin = read_admins().includes(interaction.user.id);
	if (interaction.isChatInputCommand()){
		const command = commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (!command.interaction_type_checker(interaction)){
			console.error(`Type of interaction was incorrect, how did you do this??? Summoning <@99778758059237376>`);
			return;
		}
		if (command.admin_only_command && !admin){
			interaction.reply({
				content: "Sorry my ass is too lazy to make this app work 90% of the time, so only an admin can use it.\nPlease ask Ed to become an admin"
			});
			return;
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
		try{
			(command as AutoCompleteCommand<Interaction>).auto_complete_update(interaction);
		} catch (error){
			console.error(error)
		}

	}

});

client.login(TOKEN);

// Events.MessageUpdate