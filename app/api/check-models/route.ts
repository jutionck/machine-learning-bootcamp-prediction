import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const projectRoot = process.cwd()
    const modelsDir = path.join(projectRoot, "saved_models")

    try {
      await fs.access(modelsDir)
    } catch {
      return NextResponse.json({ available: false, models: [] })
    }

    const files = await fs.readdir(modelsDir)
    // Filter for .joblib files that represent algorithms (exclude scaler/encoders)
    const algorithms = files
      .filter(f => f.endsWith('.joblib'))
      .filter(f => !['scaler.joblib', 'label_encoder.joblib', 'column_encoders.joblib'].includes(f))
      .map(f => f.replace('.joblib', ''))

    return NextResponse.json({
      available: algorithms.length > 0,
      models: algorithms
    })
  } catch (error) {
    return NextResponse.json({ available: false, models: [], error: String(error) })
  }
}