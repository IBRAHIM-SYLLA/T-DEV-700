import * as configDotenv from 'dotenv';
import path from "node:path";
import app from './index';
import { testConnection } from './config/database';

configDotenv.config({ path: path.resolve(process.cwd(), ".env") });
app.listen(process.env.PORT || 3000, async () => {
    console.log('🚀 Serveur prêt sur http://localhost:3000');
    await testConnection();
});