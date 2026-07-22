import { AppEnv } from '@/types/env';
import {Hono} from 'hono'

const route = new Hono<AppEnv>() 