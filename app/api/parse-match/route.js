import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export const runtime = 'nodejs';
export const maxDuration = 60;

function parseOCRText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  let result = {
    myTeam: '',
    opponent: '',
    myGoals: null,
    opponentGoals: null,
    shots: null,
    shotsOnTarget: null,
    possession: null,
    matchRating: null,
    rawText: text,
  };

  // Score pattern: e.g. "3 - 1", "Arsenal 3-1 Bayern", "3:1"
  const scorePatterns = [
    /(\d+)\s*[-:]\s*(\d+)/g,
    /goals?\s*[:\s]+(\d+)/i,
  ];

  const scoreMatches = [...text.matchAll(/(\d+)\s*[-–:]\s*(\d+)/g)];
  if (scoreMatches.length > 0) {
    // Take first score-like match that looks reasonable (both numbers < 20)
    for (const m of scoreMatches) {
      const a = parseInt(m[1]);
      const b = parseInt(m[2]);
      if (a < 20 && b < 20) {
        result.myGoals = a;
        result.opponentGoals = b;
        break;
      }
    }
  }

  // Possession: look for "Possession" followed by number with %
  const possMatch = text.match(/possession[^\d]*(\d{1,3})\s*%?/i);
  if (possMatch) {
    const val = parseInt(possMatch[1]);
    if (val >= 0 && val <= 100) result.possession = val;
  }

  // Shots on target: must find this BEFORE shots
  const shotTargetMatch = text.match(/shots?\s+on\s+target[^\d]*(\d+)/i) ||
    text.match(/on\s+target[^\d]*(\d+)/i);
  if (shotTargetMatch) {
    result.shotsOnTarget = parseInt(shotTargetMatch[1]);
  }

  // Total shots
  const shotMatch = text.match(/total\s+shots?[^\d]*(\d+)/i) ||
    text.match(/shots?[^\d]*(\d+)/i);
  if (shotMatch) {
    const val = parseInt(shotMatch[1]);
    // Ensure total shots >= shots on target
    if (result.shotsOnTarget === null || val >= result.shotsOnTarget) {
      result.shots = val;
    }
  }

  // Match rating
  const ratingMatch = text.match(/rating[^\d]*(\d+\.?\d*)/i) ||
    text.match(/(\d+\.\d+)\s*\/\s*10/i);
  if (ratingMatch) {
    const val = parseFloat(ratingMatch[1]);
    if (val >= 0 && val <= 10) result.matchRating = val;
  }

  // Team names: look for known team keywords or capitalized words near score
  const teamPatterns = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\d+\s*[-–]\s*\d+\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (teamPatterns) {
    result.myTeam = teamPatterns[1].trim();
    result.opponent = teamPatterns[2].trim();
  }

  return result;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Run Tesseract OCR
    const worker = await createWorker('eng', 1, {
      logger: () => {}, // silence logs
    });

    const { data } = await worker.recognize(buffer);
    await worker.terminate();

    const parsed = parseOCRText(data.text);

    return NextResponse.json({
      success: true,
      parsed,
      confidence: data.confidence,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error.message },
      { status: 500 }
    );
  }
}
