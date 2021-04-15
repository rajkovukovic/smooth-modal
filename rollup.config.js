import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import typescript from "@rollup/plugin-typescript";
import typescriptCompiler from "typescript";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import sveltePreprocessor from "svelte-preprocess";

import { preprocessOptions } from "./svelte.config";

const IS_DEV_MODE = process.env.ROLLUP_WATCH;

const plugins = [
  svelte({
    compilerOptions: {
      ...preprocessOptions,
    },
    extensions: [".svelte"],
    preprocess: sveltePreprocessor(),
    emitCss: true,
  }),
  typescript({ typescript: typescriptCompiler }),
  commonjs({ include: "node_modules/**" }),
  resolve(),
  IS_DEV_MODE && serve({
    contentBase: "demo",
    open: true,
    port: 3000,
  }),
  IS_DEV_MODE && livereload({ watch: "./demo" }),
  !IS_DEV_MODE && terser(),
];

const webComponentPackages = [
  {
    input: "src/index.ts",
    output: "smooth-modal",
  },
];

const buildConfigs = webComponentPackages.map((webComponentPackage) => {
  const output = [
    {
      file: `demo/lib/${webComponentPackage.output}.js`,
      format: "esm",
      name: webComponentPackage.output.split("-").join(""),
      sourcemap: false,
    },
  ];
  output.push({
    file: `dist/${webComponentPackage.output}/index.js`,
    format: "esm",
    sourcemap: false,
  });
  return {
    input: webComponentPackage.input,
    output,
    plugins,
  };
});

export default buildConfigs;
