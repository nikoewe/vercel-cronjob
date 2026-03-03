export interface Logger {
  info: (message: string) => void;
  error: (message: string, ...args: unknown[]) => void;
}

export const defaultLogger: Logger = {
  info: (message) => console.log(message),
  error: (message, ...args) => console.error(message, ...args),
};
