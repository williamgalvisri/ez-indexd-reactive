import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/lib/index.ts',
    output: [
        {
          file: 'dist/index.js',  // El archivo compilado
          format: 'esm',          // Formato ES módulo
          sourcemap: true,
        },
    ],
    plugins: [
        resolve({
            extensions: [".ts", ".js"], // Esto permite que resuelva archivos .ts
        }),
        typescript({ tsconfig: './tsconfig.json' }),
    ],
    external: ["rxjs"],
};
