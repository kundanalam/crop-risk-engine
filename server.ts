import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Risk Scoring Logic
  const calculateRisk = (data: any) => {
    const { crop, rainfall, temperature, soilMoisture, farmArea, scenario } = data;

    const rain = parseFloat(rainfall) || 0;
    const temp = parseFloat(temperature) || 0;
    const moisture = parseFloat(soilMoisture) || 0;

    // Crop Sensitivity (1-3 scale)
    const cropMap: Record<string, number> = { 
      "Wheat": 1, 
      "Rice": 2, 
      "Corn": 2, 
      "Vegetables": 3, 
      "Fruits": 3 
    };
    const crVal = cropMap[crop] || 2;

    // Rainfall Risk (0-100 scale normalized to 1-3)
    let rVal = 2; // Default Average
    if (rain < 200 || rain > 1200) rVal = 3; // Extreme
    else if (rain >= 400 && rain <= 800) rVal = 1; // Optimal

    // Temperature Risk
    let tVal = 2;
    if (temp < 10 || temp > 35) tVal = 3;
    else if (temp >= 18 && temp <= 28) tVal = 1;

    // Soil Moisture Risk
    let mVal = 2;
    if (moisture < 20 || moisture > 80) mVal = 3;
    else if (moisture >= 40 && moisture <= 60) mVal = 1;

    // Apply Scenarios
    let scenarioImpact = 0;
    if (scenario === "Drought") {
      tVal = Math.min(3, tVal + 1);
      scenarioImpact += 20;
    } else if (scenario === "Rainfall Reduction") {
      rVal = Math.min(3, rVal + 1);
      scenarioImpact += 10;
    } else if (scenario === "Pest Outbreak") {
      scenarioImpact += 25;
    }

    // Weights
    const weights = { rainfall: 30, temperature: 25, moisture: 25, crop: 20 };

    const score = (
      (rVal / 3) * weights.rainfall +
      (tVal / 3) * weights.temperature +
      (mVal / 3) * weights.moisture +
      (crVal / 3) * weights.crop +
      scenarioImpact
    );

    const finalScore = Math.min(100, Math.round(score));
    
    let level = "Low";
    let recommendation = "Basic Insurance Plan";
    let explanation = "Your farm parameters are within safe operational limits. A basic plan covers essential risks.";

    if (finalScore > 70) {
      level = "High";
      recommendation = "Premium Protection Plan";
      explanation = "Critical risk levels detected due to extreme environmental parameters or crop sensitivity. Full coverage is highly recommended.";
    } else if (finalScore > 40) {
      level = "Medium";
      recommendation = "Standard Insurance Plan";
      explanation = "Moderate risk profile. Some parameters are near threshold limits. This plan provides a balanced safety net.";
    }

    return {
      score: finalScore,
      level,
      recommendation,
      explanation,
      contributions: [
        { name: "Rainfall Impact", value: Math.round((rVal / 3) * weights.rainfall) },
        { name: "Temperature Stress", value: Math.round((tVal / 3) * weights.temperature) },
        { name: "Soil Moisture", value: Math.round((mVal / 3) * weights.moisture) },
        { name: "Crop Sensitivity", value: Math.round((crVal / 3) * weights.crop) },
        { name: "Scenario Impact", value: scenarioImpact }
      ]
    };
  };

  // API Routes
  app.post("/api/assess", (req, res) => {
    const result = calculateRisk(req.body);
    res.json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
