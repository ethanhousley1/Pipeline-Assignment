"use server";

import { exec } from "child_process";
import path from "path";

export async function runScoringAction(): Promise<{ success: boolean; message: string; output?: string }> {
  return new Promise((resolve) => {
    // Navigate out of web/ to the root of Pipeline-Assignment, where jobs/ might be
    const projectRoot = path.join(process.cwd(), "..");
    
    // We attempt to run the python command
    const command = "python jobs/run_inference.py || python3 jobs/run_inference.py";
    
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error("Scoring Python Script Error:", error);
        resolve({
          success: false,
          message: `Execution failed: ${error.message}`,
          output: stderr || stdout
        });
        return;
      }
      
      resolve({
        success: true,
        message: "Scoring executed successfully.",
        output: stdout
      });
    });
  });
}
