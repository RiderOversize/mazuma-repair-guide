import { getSubCategories } from '../lib/sheets-db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

getSubCategories().then(sc => console.log(sc.slice(0, 10))).catch(console.error);
