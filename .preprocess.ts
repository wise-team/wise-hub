// this file is loaded by wise-ci preprocessor
import { SourcePreprocessor as SP } from "../wise-ci/src/src-preprocessor";

export const hooks: SP.Hook [] = [
];
export const data = {
    repository: {
        name: "wise-hub"
    }
};
export const excludes = [ "dist", ".vscode", "coverage" ];

