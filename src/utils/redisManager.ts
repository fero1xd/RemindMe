import { Client, User } from 'discord.js';
import { scheduleJob } from 'node-schedule';
import { createClient } from 'redis';
import { Reminder } from '../types';

class RedisManager {
  private redis;
  private index = 1;

  constructor() {
    this.redis = createClient();
    this.redis.connect().then(async () => {
      console.log('Redis client connected');
    });
  }

  async getReminders(): Promise<Reminder[]> {
    const keys = await this.redis.keys('*');
    if (!keys.length) {
      return [];
    }

    const values = await this.redis.mGet(keys);

    const result: Reminder[] = values.map((reminder) => {
      const parsed = JSON.parse(reminder!) as Reminder;
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.executionDate = new Date(parsed.executionDate);
      return parsed;
    });
    return result;
  }

  async setReminder(
    createdAt: Date,
    executionDate: Date,
    user: User,
    message: string
  ) {
    const newReminder: Reminder = {
      executionDate,
      createdAt,
      user,
      message,
    };

    const EX = (executionDate.getTime() - createdAt.getTime()) / 1000;

    await this.redis.set(this.index.toString(), JSON.stringify(newReminder), {
      EX,
    });

    this.index++;
  }

  async runPeningReminders(client: Client) {
    const reminders = await this.getReminders();

    for (const reminder of reminders) {
      if (new Date() < reminder.executionDate) {
        scheduleJob(reminder.executionDate, async () => {
          const user = await client.users.fetch(reminder.user.id);
          user.send(
            `Hi ${reminder.user.username}. Your reminder - ${reminder.message}`
          );
        });
      }
    }
  }
}

export default new RedisManager();
