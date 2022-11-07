import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { scheduleJob } from 'node-schedule';
import { ICommand } from '../types';
import redisManager from '../utils/redisManager';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Sets a reminder')

    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The message that you want to give to yourself')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('Number of seconds')
        .setRequired(true)
        .setMaxValue(60)
    )
    .addIntegerOption((option) =>
      option
        .setName('hours')
        .setDescription('Number of hours')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('minutes')
        .setDescription('Number of minutes')
        .setMaxValue(60)
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const seconds = interaction.options.getInteger('seconds')!;
    const minutes = interaction.options.getInteger('minutes')!;
    const hours = interaction.options.getInteger('hours')!;

    const message = interaction.options.getString('message')!;
    const user = interaction.user;

    const createdAt = new Date();
    const executionDate = new Date(createdAt.getTime() + 1000 * seconds);
    executionDate.setMinutes(executionDate.getMinutes() + minutes);
    executionDate.setHours(executionDate.getHours() + hours);

    await redisManager.setReminder(createdAt, executionDate, user, message);

    scheduleJob(executionDate, () => {
      interaction.user.send(`Hi ${user.username}. Your reminder - ${message}`);
    });

    interaction.reply({
      content: 'Reminder set successfully',
      ephemeral: true,
    });
  },
} as ICommand;
