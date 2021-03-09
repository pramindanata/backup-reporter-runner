import { config } from '@/config';
import axios from 'axios';

const instance = axios.create({
  baseURL: config.bot.url,
  headers: {
    token: config.report.authToken,
  },
});

export { instance as axios };
