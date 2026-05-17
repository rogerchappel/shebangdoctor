const ABSOLUTE_PORTABLE_INTERPRETERS = new Set([
  "/bin/bash",
  "/bin/dash",
  "/bin/ksh",
  "/bin/sh",
  "/bin/zsh",
  "/usr/bin/env",
  "/usr/bin/env -S"
]);

const ENV_REQUIRED_NAMES = new Set([
  "bash",
  "dash",
  "deno",
  "node",
  "perl",
  "php",
  "python",
  "python3",
  "ruby",
  "sh",
  "zsh"
]);

export interface ShebangAnalysis {
  interpreter: string;
  usesEnv: boolean;
  portable: boolean;
  envHasArgument: boolean;
}

export function analyzeShebang(firstLine: string): ShebangAnalysis | null {
  if (!firstLine.startsWith("#!")) {
    return null;
  }

  const command = firstLine.slice(2).trim();
  if (command.length === 0) {
    return {
      interpreter: "",
      usesEnv: false,
      portable: false,
      envHasArgument: false
    };
  }

  const parts = command.split(/\s+/);
  const interpreter = parts[0] ?? "";
  const usesEnv = interpreter === "/usr/bin/env";
  const envHasArgument = usesEnv && parts.length > 1;
  const envCommand = usesEnv && parts[1] === "-S" ? parts[2] : parts[1];

  return {
    interpreter,
    usesEnv,
    portable: usesEnv
      ? Boolean(envCommand && ENV_REQUIRED_NAMES.has(envCommand))
      : ABSOLUTE_PORTABLE_INTERPRETERS.has(command) || ABSOLUTE_PORTABLE_INTERPRETERS.has(interpreter),
    envHasArgument
  };
}
