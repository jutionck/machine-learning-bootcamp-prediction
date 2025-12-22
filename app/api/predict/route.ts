import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { constants as fsConstants } from "fs"
import path from "path"
import { execFile } from "child_process"
import { promisify } from "util"
import os from "os"

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  try {
    const { participant_data, trained_models, csv_data } = await request.json()

    if ((!participant_data && !csv_data) || !trained_models || trained_models.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const projectRoot = process.cwd()
    const scriptPath = path.join(projectRoot, "scripts", "run_predictor.py")

    // Determine Python
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

    const args = [
      scriptPath,
      "--models", trained_models.join(","),
      "--models_dir", path.join(projectRoot, "saved_models")
    ]

    let tempFile = ""

    try {
      if (csv_data) {
        const tempDir = os.tmpdir()
        tempFile = path.join(tempDir, `pred_${Date.now()}.csv`)
        // Write base64 or string? Usually frontend sends string/base64.
        // Assuming csv_data is the raw string content for now.
        // If base64: Buffer.from(csv_data, 'base64')
        await fs.writeFile(tempFile, csv_data)
        args.push("--csv_file", tempFile)
      } else {
        // Remap keys to match backend expectations (if different) or pass through
        // The frontend now sends: grades, tech_interview_result
        // The python script expects standard feature names matching the trained model.
        const cleanedData = { ...participant_data };
        args.push("--participant", JSON.stringify(cleanedData))
      }

      const { stdout, stderr } = await execFileAsync(pyCmd, args, { cwd: projectRoot })

      if (stderr) {
        console.warn("[predict stderr]", stderr)
      }

      const result = JSON.parse(stdout)

      if (result.error) {
        throw new Error(result.error)
      }

      return NextResponse.json(result)
    } finally {
      if (tempFile) {
        fs.unlink(tempFile).catch(() => { })
      }
    }

  } catch (error: any) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed", message: error.message }, { status: 500 })
  }
}
