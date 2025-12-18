import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { constants as fsConstants } from "fs"
import path from "path"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  try {
    const { participant_data, trained_models } = await request.json()

    if (!participant_data || !trained_models || trained_models.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    // Remap keys to match training data expectations if needed
    // The training data typically uses: logical_test_score, tech_interview_grades, grades, majoring, age, gender (L/P)
    const cleanedData = { ...participant_data };

    // Map 'tech_interview_score' (frontend props) to 'tech_interview_grades' (likely dataset col)
    if (cleanedData.tech_interview_score !== undefined && cleanedData.tech_interview_grades === undefined) {
      cleanedData.tech_interview_grades = cleanedData.tech_interview_score;
    }

    // Convert numeric strings to numbers for safety (though Python handles it via transform, ensuring cleaner JSON is good)
    // Actually, passing strings is fine as the python script casts them in `predict_new_data` or `DataFrame` construction.

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

    // Execute
    const args = [
      scriptPath,
      "--participant", JSON.stringify(cleanedData),
      "--models", trained_models.join(","),
      "--models_dir", path.join(projectRoot, "saved_models")
    ]

    const { stdout, stderr } = await execFileAsync(pyCmd, args, { cwd: projectRoot })

    if (stderr) {
      console.warn("[predict stderr]", stderr)
    }

    const result = JSON.parse(stdout)

    if (result.error) {
      throw new Error(result.error)
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed", message: error.message }, { status: 500 })
  }
}
