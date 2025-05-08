import { REST, Routes, Client, GatewayIntentBits, Events } from 'discord.js';
import { TOKEN, CLIENT_ID } from './env.ts';
import clear_existing_commands from './utils/clear_existing_commands.js'
import getCommands from './utils/commands.js'


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

rest.put(
	Routes.applicationCommands(CLIENT_ID), 
	{body: Array.from(commands.values()).map(command => command.data.toJSON())}).then(
	() =>	console.log('Successfully reloaded application (/) commands.')
).catch(console.error);


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	
	command.execute(interaction);
});

client.login(TOKEN);