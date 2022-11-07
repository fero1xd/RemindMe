import 'dotenv/config';
import {
  Client,
  Collection,
  IntentsBitField,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import { ICommand } from './types';
import { registerCommands } from './utils';
import redisManager from './utils/redisManager';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, ICommand>;
  }
}

const BOT_TOKEN = process.env.BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID!;

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
registerCommands(client, commands);

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    await redisManager.runPeningReminders(client);
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, DEV_GUILD_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );

    // Make the bot login
    client.login(BOT_TOKEN);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('Bot logged In!');
});

client.on('interactionCreate', (intercation) => {
  if (!intercation.isChatInputCommand()) return;
  const { commandName } = intercation;
  const command = client.commands.get(commandName);

  if (command) {
    command.execute(intercation);
  }
});
