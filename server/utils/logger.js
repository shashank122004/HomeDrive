// Very small file logger. We append plain lines instead of pulling in a
// logging library, since HomeDrive only needs a simple audit trail.
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'activity.log');

export function logEvent(type, message) {
  const line = `[${new Date().toISOString()}] [${type}] ${message}\n`;
  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) console.error('Failed to write log:', err.message);
  });
}
