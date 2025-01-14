export async function onExit(
  callback: (
    options: { exit?: boolean; cleanup?: boolean },
    code: number,
  ) => void,
) {
  // from https://stackoverflow.com/a/14032965

  // so the program will not close instantly
  process.stdin.resume();

  function exitHandler(
    options: { exit?: boolean; cleanup?: boolean },
    exitCode: number,
  ) {
    callback && callback(options, exitCode);

    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }

  // do something when app is closing
  process.on('exit', exitHandler.bind(null, { cleanup: true }));

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}
