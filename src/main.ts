import clone from "git-clone/promise";
import fs from "fs";
import { exec, execSync } from "child_process";
import axios from "axios";
import os from "os";

export interface CompanionModulesReport {
  generated_at: Date;
  generated_by: string;
  modules: CompanionModule[];
}

export interface CompanionModule {
  name: string;
  version: string;
  api_version: string;
  manufacturer: string | string[];
  product: string | string[];
  author: string | string[];
}

let errors: [string, any][] = [];

let packages: {
  version: string;
  path: string;
  name: string;
  url: string;
  api_version: string;
  keywords: string[];
  manufacturer: string[] | string;
  product: string | string[];
  shortname: string;
  author: string | string[];
}[] = [];

const main = async () => {
  console.log("[1] Starting");
  
  // delete folder recursive tmp/companion if it exists
  if (fs.existsSync("tmp/companion")) {
    console.log("[1.5] Deleting tmp/companion");
    fs.rmdirSync("tmp/companion", { recursive: true });
  }

  console.log("[2] Cloning companion");
  try {
    const res = await clone(
      "https://github.com/bitfocus/companion",
      "./tmp/companion"
    );
  } catch (err) {
    console.log("[2] Error cloning companion");
    console.log(err);
    //errors.push(["clone", err]);
  }

  // Run yarn in the companion folder
  console.log("[3] Running yarn");
  try {
    execSync("yarn", { cwd: "./tmp/companion" });
  } catch (err) {
    console.log("[3] Error running yarn");
    console.log(err);
    errors.push(["yarn", err]);
  }

  // read package.json in companion folder
  console.log("[4] Reading package.json");
  let package_json: any = {};
  try {
    package_json = JSON.parse(
      fs.readFileSync("./tmp/companion/package.json", "utf8")
    );
  } catch (err) {
    console.log("[4] Error reading package.json");
    console.log(err);
    errors.push(["package.json", err]);
  }

  // create a list of all packages
  if (package_json?.dependencies) {
    Object.keys(package_json.dependencies).forEach((key) => {
      if (key.startsWith("companion-module-")) {
        // read "./tmp/companion/node_modules/" + key + "/package.json"
        let sub_package_json: any = {};
        try {
          sub_package_json = JSON.parse(
            fs.readFileSync(
              "./tmp/companion/node_modules/" + key + "/package.json",
              "utf8"
            )
          );
        } catch (err) {
          console.log(
            "[4] Error reading sub package.json",
            "./tmp/companion/node_modules/" + key + "/package.json"
          );
          console.log(err);
          errors.push(["sub-package.json", err]);
        }

        packages.push({
          version: package_json.dependencies[key].split(/#v?/)[1],
          path: "./tmp/companion/node_modules/" + key,
          name: key.replace("companion-module-", ""),
          url: package_json.dependencies[key],
          api_version: sub_package_json.api_version,
          keywords: sub_package_json.keywords,
          manufacturer: sub_package_json.manufacturer,
          product: sub_package_json.product,
          shortname: sub_package_json.shortname,
          author: sub_package_json.author,
        });
      }
    });
  }

  if (!errors.length) {
    console.log("[5] Writing output");
    let output: CompanionModulesReport = {
      generated_at: new Date(),
      generated_by: "companion-modules-generator @ " + os.hostname(),
      modules: packages,
    };

		// Use axios to POST request output to https://api.bitfocus.io/v1/companion/modules
    axios.post("https://api.bitfocus.io/v1/webhooks/modules", output, {
      headers: {
        secret: process.env.MODULE_CRON_SECRET || 'missing cron secret',
      },
    });

  } else {
		console.error("We have errors");
		console.error(errors);
	}
};

main();
