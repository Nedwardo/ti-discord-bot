import fs from 'fs/promises';
import path from 'path';
import { Collection, Interaction } from 'discord.js';
import {Command} from '../types/command.js';
import { fileURLToPath } from 'url';

async function getCommands() {
	const commands = new Collection<string, Command<Interaction>>();
	const commandsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "commands");

	const commandFiles = (await fs.readdir(commandsPath)).filter(
		(filename) => filename.endsWith(".ts") || filename.endsWith(".js")
	).map(
		(filename: string) => filename.replace('/\.ts$/', '.js')
	);

	for (const commandFile of commandFiles) {
		const filePath = path.join(commandsPath, commandFile);

		const commandModule = await import(`file://${filePath}`);
		const command = commandModule.default as Command<Interaction>;

        try{
            console.log('Loading command: ' + command.command_metadata.name + ' from ' + filePath);
		    commands.set(command.command_metadata.name, command);
        } 
        catch{
            console.log("Unable to load command from: " + filePath)
        }
	}

	return commands;
}


export default getCommands;