export interface OnError {
  code: number;
  description: string;
}

export function errorToString(error: OnError): string {
  return `[${error.code}] ${error.description}`;
}
