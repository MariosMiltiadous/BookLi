import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any[];
  source?: string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private currentLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogHistory = 1000; // Keep last 1000 log entries

  constructor() {
    // Set log level based on environment
    // Currently there is no prod env, but can be added in future
    this.currentLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  }

  // Log an error message
  error(message: string, ...data: any[]): void;
  error(message: string, source?: string, ...data: any[]): void;
  error(message: string, sourceOrData?: string | any, ...data: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const { source, actualData } = this.parseParams(sourceOrData, data);
      const entry = this.createLogEntry(LogLevel.ERROR, message, source, actualData);

      console.error(this.formatMessage(entry), ...actualData);
      this.storeLog(entry);
    }
  }

  // Log a warning message
  warn(message: string, ...data: any[]): void;
  warn(message: string, source?: string, ...data: any[]): void;
  warn(message: string, sourceOrData?: string | any, ...data: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const { source, actualData } = this.parseParams(sourceOrData, data);
      const entry = this.createLogEntry(LogLevel.WARN, message, source, actualData);

      console.warn(this.formatMessage(entry), ...actualData);
      this.storeLog(entry);
    }
  }

  // Log an info message
  info(message: string, ...data: any[]): void;
  info(message: string, source?: string, ...data: any[]): void;
  info(message: string, sourceOrData?: string | any, ...data: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const { source, actualData } = this.parseParams(sourceOrData, data);
      const entry = this.createLogEntry(LogLevel.INFO, message, source, actualData);

      console.info(this.formatMessage(entry), ...actualData);
      this.storeLog(entry);
    }
  }

  // Log a debug message
  debug(message: string, ...data: any[]): void;
  debug(message: string, source?: string, ...data: any[]): void;
  debug(message: string, sourceOrData?: string | any, ...data: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const { source, actualData } = this.parseParams(sourceOrData, data);
      const entry = this.createLogEntry(LogLevel.DEBUG, message, source, actualData);

      console.log(this.formatMessage(entry), ...actualData);
      this.storeLog(entry);
    }
  }

  // Set the current log level
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
    this.info(`Log level changed to: ${LogLevel[level]}`);
  }

  // Get the current log level
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  // Get recent log entries
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = this.logs.filter((log) => log.level <= level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return [...filteredLogs]; // Return copy to prevent external modification
  }

  // Clear log history
  clearLogs(): void {
    this.logs = [];
    this.debug('Log history cleared');
  }

  // Log HTTP request/response for debugging
  logHttpRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    error?: any
  ): void {
    const message = `HTTP ${method.toUpperCase()} ${url}`;
    const data = { status, duration, error };

    if (error || (status && status >= 400)) {
      this.error(message, 'HTTP', data);
    } else if (status && status >= 300) {
      this.warn(message, 'HTTP', data);
    } else {
      this.debug(message, 'HTTP', data);
    }
  }

  //Log component lifecycle events - likde delete
  logComponentEvent(componentName: string, event: string, data?: any): void {
    this.debug(`${componentName} - ${event}`, 'Component', data);
  }

  //  Log service operations
  logServiceEvent(serviceName: string, operation: string, data?: any): void {
    this.debug(`${serviceName}.${operation}`, 'Service', data);
  }

  // Export logs as JSON (useful for debugging)
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Private helper methods
  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private parseParams(
    sourceOrData?: string | any,
    data?: any[]
  ): { source?: string; actualData: any[] } {
    if (typeof sourceOrData === 'string') {
      return { source: sourceOrData, actualData: data || [] };
    } else {
      return { actualData: sourceOrData ? [sourceOrData, ...(data || [])] : [] };
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    source?: string,
    data?: any[]
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      source,
      data: data?.length ? data : undefined,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level].padEnd(5);
    const source = entry.source ? ` [${entry.source}]` : '';

    return `${timestamp} ${levelName}${source} - ${entry.message}`;
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the most recent logs to prevent memory issues
    if (this.logs.length > this.maxLogHistory) {
      this.logs = this.logs.slice(-this.maxLogHistory);
    }
  }
}
