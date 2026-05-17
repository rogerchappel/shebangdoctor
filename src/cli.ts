#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, helpText } from "./args.js";
import { formatJson, formatText } from "./format.js";
import { scan } from "./scan.js";

async function main(argv: string[]): Promise<number> {
  const options = parseArgs(argv);

  if (options.help) {
    console.log(helpText());
    return 0;
  }

  if (options.version) {
    console.log(await readVersion());
    return 0;
  }

  const report = await scan(options);
  console.log(options.json ? formatJson(report) : formatText(report));

  if (report.issues.length === 0 || options.fix) {
    return 0;
  }

  return 1;
}

async function readVersion(): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const packagePath = path.resolve(here, "../../package.json");
  const pkg = JSON.parse(await readFile(packagePath, "utf8")) as { version?: string };
  return pkg.version ?? "0.0.0";
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`shebangdoctor: ${message}`);
  process.exitCode = 2;
});
