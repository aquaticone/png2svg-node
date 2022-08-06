import fs from "fs"
import readdirp from "readdirp"

export async function getAllPaths(dir) {
  const allPaths = []
  const readdirpOptions = {
    fileFilter: "*.png",
    type: "files_directories",
  }
  for await (const entry of readdirp(dir, readdirpOptions)) {
    allPaths.push({ path: entry.path, absPath: entry.fullPath })
  }
  return allPaths
}

export async function cleanDir(dir) {
  const readdirpOptions = {
    type: "files_directories",
    levels: 1,
  }
  const allPaths = []
  for await (const entry of readdirp(dir, readdirpOptions)) {
    allPaths.push({ absPath: entry.fullPath })
  }
  for (let i = 0; i < allPaths.length; i++) {
    const { absPath } = allPaths[i]
    try {
      await fs.promises.rm(absPath, { recursive: true })
    } catch {}
  }
}

export async function isFile(path) {
  const stat = await fs.promises.lstat(path)
  return stat.isFile()
}
