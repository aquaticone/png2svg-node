<div align="center">
  <h1>png2svg-node</h1>
  <h3>👾 1-stop batch conversion of raster graphics to SVG 👾</h3>
  <p>Inspired by <a href="https://codepen.io/shshaw/pen/XbxvNj">Pixels.svg</a></p>
</div>

## Features

- 💎 High quality pixel-art conversion from PNG to SVG
- 🤖 Batch process entire folders of files with one command
- 🗂 Retain original directory structure with recursive reads and writes
- ✨ Built-in SVG optimization with [svgo](https://github.com/svg/svgo)
- ⚡️ Optional, non-destructive resizing of your original graphics with [sharp](https://github.com/lovell/sharp)

## Installation

- 🚧 npm package soon

## CLI Usage

```sh
# Batch directory conversion
pnpm convert -i ../input/dir -o ../output/dir

# Resize original images before converting to SVG
pnpm convert -i ../input/dir -o ../output/dir -w 24 -h 24

# Resize square graphics
pnpm convert -i ../input/dir -o ../output/dir -w 24
```

## Development Setup

- Clone this repo
- Install dependencies: `pnpm install`
- Run with `pnpm convert` or `node ./index.js`

## Planned Improvements

- Move logging behind `verbose` option
- Improved efficiency when resizing before conversion
- Progress indication / spinners; useful printouts upon completion
- Option for converting individual files
