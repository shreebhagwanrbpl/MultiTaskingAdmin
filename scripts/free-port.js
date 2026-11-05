const { execSync } = require('child_process');

const PORT = 3002;

function freePort() {
  try {
    if (process.platform === 'win32') {
      let output = '';
      try {
        output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      } catch (e) {
        // No process found on port
        return;
      }
      const lines = output.trim().split(/\r?\n/);
      const pids = new Set();
      for (const line of lines) {
        if (line.includes('LISTENING') || line.includes(`:${PORT}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[RAJ-BIOSIS-DEV] Automatically freed port ${PORT} (Terminated stale PID ${pid})`);
        } catch (e) {}
      }
    } else {
      try {
        execSync(`lsof -ti :${PORT} | xargs kill -9`, { stdio: 'ignore' });
        console.log(`[RAJ-BIOSIS-DEV] Automatically freed port ${PORT}`);
      } catch (e) {}
    }
  } catch (err) {
    // Ignore any error and proceed to start dev server
  }
}

freePort();

