// We want to keep `winston` export as it's more readable and easier to understand
// eslint-disable-next-line import/no-named-as-default-member
import winston, {createLogger as winstonCreateLogger} from "winston";
import type {Logger as Winston} from "winston";
import {Logger, LoggerOptions, LogLevel, logLevelNum} from "./interface.js";
import {getFormat} from "./utils/format.js";
import {LogData} from "./utils/json.js";

// # How to configure Winston log level?
//
// - Log level is meant to be configured BY TRANSPORT only
// - There's no native logic that allows different logLevels by metadata.module
// - Transports are shared between child loggers, so a custom transport is required
//
// This is the logic that controls if log or not based on each log message level.
// Winston transport base class TransportStream check its own transport level to decide to format then log
//
// ```ts
// TransportStream.prototype._write = function _write(info, enc, callback) {
//   const level = this.level || (this.parent && this.parent.level);
//   if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
//     transformed = this.format.transform(Object.assign({}, info), this.format.options);
//     return this.log(transformed, callback);
//   }
// };
// ```
// https://github.com/winstonjs/winston-transport/blob/51baf6138753f0766181355fb50b1b0334344c56/index.js#L80
//
// To configure different logLevel per metadata.module the simplest solution is to have a custom Transport
// that overrides the `transport._write` with a lookup on a Map of module -> log level. This is done in
// the CLI package on a special ConsoleTransport that could be set dynamically.

interface DefaultMeta {
  module: string;
}

export function createWinstonLogger(options: Partial<LoggerOptions> = {}, transports?: winston.transport[]): Logger {
  return WinstonLogger.fromOpts(options, transports);
}

export class WinstonLogger implements Logger {
  constructor(protected readonly winston: Winston) {}

  static fromOpts(options: Partial<LoggerOptions> = {}, transports?: winston.transport[]): WinstonLogger {
    return new WinstonLogger(this.createWinstonInstance(options, transports));
  }

  static createWinstonInstance(options: Partial<LoggerOptions> = {}, transports?: winston.transport[]): Winston {
    const defaultMeta: DefaultMeta = {module: options?.module || ""};

    return winstonCreateLogger({
      // Do not set level at the logger level. Always control by Transport, unless for testLogger
      level: options.level,
      defaultMeta,
      format: getFormat(options),
      transports,
      exitOnError: false,
      levels: logLevelNum,
    });
  }

  error(message: string, context?: LogData, error?: Error): void {
    this.createLogEntry(LogLevel.error, message, context, error);
  }

  warn(message: string, context?: LogData, error?: Error): void {
    this.createLogEntry(LogLevel.warn, message, context, error);
  }

  info(message: string, context?: LogData, error?: Error): void {
    this.createLogEntry(LogLevel.info, message, context, error);
  }

  verbose(message: string, context?: LogData, error?: Error): void {
    this.createLogEntry(LogLevel.verbose, message, context, error);
  }

  debug(message: string, context?: LogData, error?: Error): void {
    this.createLogEntry(LogLevel.debug, message, context, error);
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogData, error?: Error): void {
    // Note: logger does not run format.transform function unless it will actually write the log to the transport

    // If winston logger is called with `winston.info(message, context, error)` it triggers the "splat" path
    // while we just need winston to forward an object to the custom formatter. So we call the fn signature below
    // https://github.com/winstonjs/winston/blob/3f1dcc13cda384eb30fe3b941764e47a5a5efc26/lib/winston/logger.js#L221
    this.winston.log(level, {message, context, error});
  }
}
