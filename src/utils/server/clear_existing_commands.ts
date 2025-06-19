import { REST, Routes } from 'discord.js';
import { CLIENT_ID, GUILD_ID } from '../../config.js';

async function clear_existing_commands(rest: REST) {
	const guild_promise = rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] })
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error);

	const global_promise = rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
		.then(() => console.log('Successfully deleted all application commands.'));

	return Promise.all([guild_promise, global_promise]);
}

export default clear_existing_commands;