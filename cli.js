#!/usr/bin/env bun

import { resolve } from 'node:path';
import shared from './index.js';

const { argv } = process;

let main, worker, pool;

for (let i = 1; i < argv.length; i++) {
  const arg = argv[i];
  const eq = arg.indexOf('=');
  if (eq < 0) {
    switch (arg) {
      case '--help': help();
      case '--main':
        main = argv[++i];
        break;
      case '--worker':
        worker = argv[++i];
        break;
      case '--pool':
        pool = parseInt(argv[++i], 10);
        break;
    }
  }
  else {
    switch (arg.slice(0, eq)) {
      case '--main':
        main = arg.slice(eq + 1);
        break;
      case '--worker':
        worker = arg.slice(eq + 1);
        break;
      case '--pool':
        pool = parseInt(arg.slice(eq + 1), 10);
        break;
    }
  }
}

if (!main || !worker) help();

main = resolve(main);
worker = resolve(worker);

shared({ main, worker, pool });

function help() {
  console.log('');
  console.log('\x1b[1muptake\x1b[0m 🙃 \x1b[2mrun a Bun cluster with a shared "worker" module\x1b[0m');
  console.log('');
  console.log(' \x1b[2m  usage:\x1b[0m shared --main=main.js --worker=worker.js [--pool=amount]');
  console.log(' \x1b[2m ... or:\x1b[0m shared --main main.js --worker worker.js [--pool amount]');
  console.log('');
  console.log(' \x1b[2moptions:\x1b[0m');
  console.log('   --main\x1b[0m \x1b[2m  - main module to run across multiple CPU cores\x1b[0m');
  console.log('   --worker\x1b[0m \x1b[2m- worker module shared across main scripts\x1b[0m');
  console.log('   --pool\x1b[0m \x1b[2m  - amount of main scripts (default: CPU cores - 1)\x1b[0m');
  console.log('   --help\x1b[0m \x1b[2m  - show this help message and exit\x1b[0m');
  console.log('');
  console.log(' © \x1b[2mAndrea Giammarchi - \x1b[0m@webreflection\x1b[2m - MIT License\x1b[0m');
  console.log('');
  process.exit(0);
}
