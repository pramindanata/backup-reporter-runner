const { env } = process;

export const config = {
  bot: {
    url: env.BOT_URL || 'http://localhost',
  },
  db: {
    host: env.DB_HOST || 'localhost',
    port: (env.DB_PORT && parseInt(env.DB_PORT)) || 5432,
    name: env.DB_NAME || 'db',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || '',
  },
};
