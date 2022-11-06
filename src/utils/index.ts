import {
  Client,
  Collection,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import fs from 'fs';
import { ICommand } from '../types';
import path from 'path';

export const registerCommands = (
  client: Client,
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) => {
  const commandsDir = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsDir);
  client.commands = new Collection();

  for (const file of files) {
    const command = require(path.join(commandsDir, file)) as ICommand;
    client.commands.set(command.data.name!, command);
    commands.push(command.data.toJSON());
  }
};
