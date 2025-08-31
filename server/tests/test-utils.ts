import { spawn, ChildProcess } from 'child_process';

let server: ChildProcess;

export const startServer = () => {
  return new Promise<void>((resolve, reject) => {
    console.log('Attempting to start server...');
    server = spawn('yarn', ['dev'], { cwd: '/app/server', detached: true });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Server stdout: ${output}`);
      if (output.includes('Ready in')) {
        console.log('Server started successfully.');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`Server stderr: ${errorOutput}`);
    });

    server.on('error', (err) => {
      console.error('Failed to start server process:', err);
      reject(err);
    });

    server.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  });
};

export const stopServer = () => {
  if (server) {
    process.kill(-server.pid);
  }
};
