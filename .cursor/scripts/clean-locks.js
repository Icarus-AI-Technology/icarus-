// Clean expired locks
import { cleanExpired } from './utils/lock-manager.js';

const ttlArg = Number(process.argv[2]);
const ttl = Number.isFinite(ttlArg) && ttlArg > 0 ? ttlArg : undefined;

await cleanExpired(ttl);
console.log('Locks expirados limpos.');


