// this file is loaded by wise-ci preprocessor
import { SourcePreprocessor as SP } from "../wise-ci/src/src-preprocessor";

export const hooks: SP.Hook [] = [
    // ensure store type safety in vue components:
    SP.hooks.regexpReplace(SP.filters.hasExtension(".vue"), /(?<!s\()(this\.\$store)/gmui, "s($1)")
];
export const data = {
    repository: {
        name: "wise-hub"
    }
};
export const excludes = [ "dist", ".vscode", "coverage" ];
