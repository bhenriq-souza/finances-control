#!/usr/bin/env node
// Confere o contraste WCAG 2 dos pares texto/fundo de docs/design/tokens.json, nos dois temas.
// Uso: node docs/design/check-contrast.mjs   (sai com 1 se algum par ficar abaixo do mínimo)
//
// Os pares vêm das notas de uso dos tokens no Design System: cada cor de texto diz sobre quais
// fundos ela aparece. Texto exige 4,5:1 (AA); borda de controle e anel de foco exigem 3:1.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));

const themes = tokens.color.themes.map((t) => t.id);
const byName = new Map(tokens.color.tokens.map((t) => [t.name, t.value]));

/** Resolve o valor de um token num tema, seguindo aliases `{outro-token}`. */
function resolve(name, theme, depth = 0) {
    if (depth > 16) throw new Error(`alias em ciclo: ${name}`);
    const value = byName.get(name);
    if (value === undefined) throw new Error(`token desconhecido: ${name}`);
    const raw = typeof value === 'string' ? value : (value[theme] ?? value[themes[0]]);
    return raw.startsWith('{') ? resolve(raw.slice(1, -1), theme, depth + 1) : raw;
}

function luminance(hex) {
    const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5;
const MARK = 3;

/** [cor, fundo, mínimo] */
const pairs = [
    ['texto', 'fundo', TEXT],
    ['texto', 'superficie', TEXT],
    ['texto', 'superficie-elevada', TEXT],
    ['texto', 'positivo-fundo', TEXT],
    ['texto', 'negativo-fundo', TEXT],
    ['texto', 'atencao-fundo', TEXT],
    ['texto', 'info-fundo', TEXT],
    ['texto-apoio', 'fundo', TEXT],
    ['texto-apoio', 'superficie', TEXT],
    ['texto-apoio', 'superficie-elevada', TEXT],
    ['acento', 'fundo', TEXT],
    ['acento', 'superficie', TEXT],
    ['sobre-acento', 'acento', TEXT],
    ['sobre-acento', 'acento-hover', TEXT],
    ['positivo', 'fundo', TEXT],
    ['positivo', 'superficie', TEXT],
    ['positivo', 'positivo-fundo', TEXT],
    ['negativo', 'fundo', TEXT],
    ['negativo', 'superficie', TEXT],
    ['negativo', 'negativo-fundo', TEXT],
    ['atencao', 'fundo', TEXT],
    ['atencao', 'superficie', TEXT],
    ['atencao', 'atencao-fundo', TEXT],
    ['info', 'fundo', TEXT],
    ['info', 'superficie', TEXT],
    ['info', 'info-fundo', TEXT],
    ['linha-forte', 'fundo', MARK],
    ['linha-forte', 'superficie', MARK],
    ['foco', 'fundo', MARK],
    ['foco', 'superficie', MARK],
];

let failures = 0;
for (const theme of themes) {
    console.log(`\n${theme}`);
    for (const [fg, bg, min] of pairs) {
        const ratio = contrast(resolve(fg, theme), resolve(bg, theme));
        const ok = ratio >= min;
        if (!ok) failures += 1;
        console.log(
            `  ${ok ? 'ok  ' : 'FAIL'} ${fg.padEnd(14)} sobre ${bg.padEnd(20)} ${ratio.toFixed(2).padStart(6)}:1  (mín. ${min}:1)`,
        );
    }
}

console.log(`\n${pairs.length * themes.length} pares, ${failures} abaixo do mínimo.`);
process.exit(failures === 0 ? 0 : 1);
