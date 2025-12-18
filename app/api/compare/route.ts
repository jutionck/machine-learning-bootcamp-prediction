import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { constants as fsConstants } from "fs"
import os from "os"
import path from "path"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file_data, target_column, algorithms } = body

    if (!file_data || !algorithms || algorithms.length === 0) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 })
    }

    // 1. Write file_data to temp file
    // Assuming file_data is the raw CSV string content
    const tmpFilePath = path.join(os.tmpdir(), `ml_compare_${Date.now()}.csv`)
    await fs.writeFile(tmpFilePath, file_data)

    const projectRoot = process.cwd()
    const scriptPath = path.join(projectRoot, "scripts", "run_comparison_trainer.py")

    // 2. Determine Python Path (env -> venv -> system)
    let pyCmd = process.env.PYTHON_PATH
    if (!pyCmd) {
      const venvPython = path.join(
        projectRoot,
        ".venv",
        process.platform === "win32" ? "Scripts" : "bin",
        process.platform === "win32" ? "python.exe" : "python",
      )
      try {
        await fs.access(venvPython, fsConstants.X_OK)
        pyCmd = venvPython
      } catch {
        // ignore
      }
    }
    if (!pyCmd) pyCmd = "python3"

    // 3. Execute Script
    const algCsv = Array.isArray(algorithms) ? algorithms.join(",") : algorithms
    const args = [
      scriptPath,
      "--data_path", tmpFilePath,
      "--target_column", target_column || "class",
      "--algorithms", algCsv
    ]

    const { stdout, stderr } = await execFileAsync(pyCmd, args, { cwd: projectRoot })

    if (stderr) {
      console.warn("[compare stderr]", stderr)
    }

    // 4. Parse Results
    const results = JSON.parse(stdout)

    if (results.error) {
      throw new Error(results.error)
    }

    // Clean up temp file
    // await fs.unlink(tmpFilePath).catch(() => {}) 

    return NextResponse.json({
      success: true,
      results: results,
      message: "Successfully ran comparison analysis"
    })

  } catch (error: any) {
    console.error("Comparison error:", error)
    return NextResponse.json({ success: false, error: "Comparison failed", message: error.message }, { status: 500 })
  }
}
