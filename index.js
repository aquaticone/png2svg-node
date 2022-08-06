import fs from "fs"
import path from "path"
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

async function png2svg({ input, output }) {
  // clean output directory if needed
  console.log("Cleaning output directory...")
  await fsHelpers.cleanDir(output)

  // resolve absolute paths for input and output directoroes
  const inputDir = path.resolve(process.cwd(), input)
  const outputDir = path.resolve(process.cwd(), output)

  // get all paths from input that need to be processed
  const allPaths = await fsHelpers.getAllPaths(inputDir)

  // start processing paths
  console.log("Processing paths...")
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
