import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from 'discord.js';

export type ICommand = {
  data: any;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
};

export type Reminder = {
  createdAt: Date;
  executionDate: Date;
  user: User;
  message: string;
};
