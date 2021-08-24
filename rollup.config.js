import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy-watch";
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
                    rename: `${pkg.name}.css`
                },
            ],
            watch: "src/css",
            verbose: true,
        }),
    ],
}, {
    input: pkg.main,
    output: [
        { file: minifiedName(pkg.main), format: "umd" },
        { file: minifiedName(pkg.module), format: "es" },
    ],
    plugins: [terser()],
}, {
    input: `dist/types/${mainTsName}.d.ts`,
    output: [{
        file: `dist/${pkg.name}.d.ts`,
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

function minifiedName(name) {
    const parts = name.split(".");
    parts.splice(parts.length - 1, 0, "min");
    return parts.join(".");
}
