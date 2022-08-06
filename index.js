import fs from "fs"
import os from "os"
import path from "path"
import sharp from "sharp"
import { optimize } from "svgo"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import * as fsHelpers from "./fsHelpers.js"
import * as imgHelpers from "./imgHelpers.js"
import * as pathHelpers from "./pathHelpers.js"

yargs(hideBin(process.argv))
  .command("$0", "Convert directory of .png to .svg", () => {}, png2svg)
  .option("input", {
    alias: "i",
    type: "string",
    description: "Relative path to input .png files",
  })
  .option("output", {
    alias: "o",
    type: "string",
    description: "Relative path to output .svg files",
  })
  .option("resizeWidth", {
    alias: "w",
    type: "string",
    description: "Width to resize source images to",
  })
  .option("resizeHeight", {
    alias: "h",
    type: "string",
    description: "Height to resize source images to",
  })
  .usage(
    "Usage: $0 -i ../path/to/input/directory -o ../path/to/output/directory"
  )
  .demandOption(["i", "o"])
  .parse()

async function png2svg({ input, output, resizeWidth, resizeHeight }) {
  // clean output directory if needed
  await fsHelpers.cleanDir(output)

  // resolve absolute paths for input and output directoroes
  const inputDir = path.resolve(process.cwd(), input)
  const outputDir = path.resolve(process.cwd(), output)

  // get all paths from input that need to be processed
  let allPaths = await fsHelpers.getAllPaths(inputDir)

  // resize source images if necessary and set allPaths to new tempDir
  if (resizeWidth || resizeHeight) {
    try {
      const tempDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "png2svg-node")
      )
      await processResizing(allPaths, tempDir, resizeWidth, resizeHeight)
      allPaths = await fsHelpers.getAllPaths(tempDir)
    } catch (err) {
      console.log(err)
    }
  }

  // process source images to SVG files
  for (let i = 0; i < allPaths.length; i++) {
    const { path, absPath } = allPaths[i]

    try {
      if (await fsHelpers.isFile(absPath)) {
        // get image data and pass off for conversion + output
        imgHelpers.createImage(absPath, (img) =>
          processImage(img, outputDir, path)
        )
      } else {
        // directory needs to be created in output path
        await fs.promises.mkdir(`${outputDir}/${path}`, { recursive: true })
      }
    } catch (err) {
      console.log(err)
    }
  }
}

async function processResizing(paths, tempDir, width, height) {
  width = Number(width || height)
  height = Number(height || width)

  for (let i = 0; i < paths.length; i++) {
    const { path, absPath } = paths[i]
    const fullTempPath = `${tempDir}/${path}`

    if (await fsHelpers.isFile(absPath)) {
      // resize image and write to tempDir
      console.log(`Resizing image: ${fullTempPath}`)
      await sharp(absPath)
        .png()
        .resize({ width, height, kernel: "nearest" })
        .toFile(fullTempPath)
    } else {
      // directory needs to be created in tempDir
      await fs.promises.mkdir(`${tempDir}/${path}`, { recursive: true })
    }
  }
}

async function processImage(img, outputDir, path) {
  try {
    const imgData = imgHelpers.getImageData(img)
    const colors = pathHelpers.getColors(imgData)
    const paths = pathHelpers.colorsToPaths(colors)
    const svg = imgHelpers.concatSVG(img, paths)

    const outputFile = path.replace(".png", ".svg")
    const fullOutputPath = `${outputDir}/${outputFile}`

    const { data: optimizedSVG } = optimize(svg, {
      path: fullOutputPath,
      multipass: true,
    })

    console.log(`Writing SVG: ${fullOutputPath}`)
    await fs.promises.writeFile(`${outputDir}/${outputFile}`, optimizedSVG)
  } catch (err) {
    console.log(err)
  }
}
