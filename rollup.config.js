import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import pkg from "./package.json";

const mainTsName = "main";

export default [{
    input: `src/ts/${mainTsName}.ts`,
    output: [{
        file: pkg.main,
        format: "umd",
        name: "SimpleTimeline",
    }, {
        file: pkg.module,
        format: 'es',
    }],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
        typescript({
            typescript: require("typescript"),
            useTsconfigDeclarationDir: true,
        }),
        copy({
            targets: [
                {
                    src: "src/css/timeline.css",
                    dest: "dist",
                    rename: `${pkg.name}-${pkg.version}.css`
                },
            ],
            verbose: true,
        }),
    ],
}, {
    input: `dist/types/${mainTsName}.d.ts`,
    output: [{
        file: `dist/${pkg.name}-${pkg.version}.d.ts`,
        format: "umd",
    }],
    plugins: [
        dts(),
        del({
            targets: "dist/types",
            hook: "buildEnd",
            verbose: true,
        }),
    ],
}];