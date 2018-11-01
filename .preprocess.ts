import * as fs from "fs";
// this file is loaded by wise-ci preprocessor
import { SourcePreprocessor as SP } from "../wise-ci/src/src-preprocessor";

const commonTsContents = fs.readFileSync(__dirname + "/common.base.ts", "UTF-8");
console.log(commonTsContents);
export const hooks: SP.Hook [] = [
    // ensure store type safety in vue components:
    SP.hooks.regexpReplace(SP.filters.hasExtension(".vue"), /(?<!s\()(this\.\$store)/gmui, "s($1)"),
    SP.hooks.ensureContents(SP.filters.isFileNamed("common.gen.ts"), commonTsContents)
];
export const data = {
    repository: {
        name: "wise-hub"
    }
};
export const excludes = [ "dist", ".vscode", "coverage" ];

