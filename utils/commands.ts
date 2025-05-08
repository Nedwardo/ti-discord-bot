import fs from 'fs/promises';
import path from 'path';
import { Collection} from 'discord.js';
import Command from './command.js'
import { fileURLToPath } from 'url';

async function getCommands(){
    const commands = new Collection<String, Command>();
    const dirname = path.parse(path.dirname(fileURLToPath(import.meta.url))).dir
    const commandsPath = path.join(dirname, 'commands')

    
    const commandFiles = (await fs.readdir(commandsPath)).map((filename: string) => filename.replace('/\.ts$/', '.js'))

    for (const commandFile of commandFiles){
        const filePath = path.join(commandsPath, commandFile);

        const commandModule = await import(`file://${filePath}`);
        const command = commandModule.default as Command;
        console.log("Loading command: " + command.data.name + " from " + filePath)

        commands.set(command.data.name, command);
    }

    return commands;
}


export default getCommands;