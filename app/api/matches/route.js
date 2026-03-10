import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Match from '../../../models/Match';

export async function GET() {
  try {
    await connectDB();

    const matches = await Match.find({}).sort({ date: -1 }).limit(100).lean();

    // Aggregate stats
    const total = matches.length;
    const wins = matches.filter((m) => m.result === 'W').length;
    const totalGoals = matches.reduce((sum, m) => sum + m.myGoals, 0);
    const totalShots = matches.reduce((sum, m) => sum + m.shots, 0);
    const totalShotsOnTarget = matches.reduce((sum, m) => sum + m.shotsOnTarget, 0);
    const totalRating = matches.reduce((sum, m) => sum + (m.matchRating || 0), 0);
    const ratedMatches = matches.filter((m) => m.matchRating != null).length;

    // Best team by wins
    const teamWins = {};
    matches.forEach((m) => {
      if (m.result === 'W') {
        teamWins[m.myTeam] = (teamWins[m.myTeam] || 0) + 1;
      }
    });
    const bestTeam = Object.entries(teamWins).sort(([, a], [, b]) => b - a)[0]?.[0] || '—';

    // Goals by team for chart
    const teamGoals = {};
    matches.forEach((m) => {
      teamGoals[m.myTeam] = (teamGoals[m.myTeam] || 0) + m.myGoals;
    });
    const chartData = Object.entries(teamGoals)
      .map(([team, goals]) => ({ team, goals }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);

    return NextResponse.json({
      matches: matches.map((m) => ({
        ...m,
        _id: m._id.toString(),
        date: m.date,
      })),
      stats: {
        totalMatches: total,
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        avgGoals: total > 0 ? (totalGoals / total).toFixed(1) : '0.0',
        shotAccuracy:
          totalShots > 0
            ? Math.round((totalShotsOnTarget / totalShots) * 100)
            : 0,
        avgRating:
          ratedMatches > 0 ? (totalRating / ratedMatches).toFixed(1) : '—',
        bestTeam,
        chartData,
      },
    });
  } catch (error) {
    console.error('GET /api/matches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const match = new Match({
      date: body.date ? new Date(body.date) : new Date(),
      myTeam: body.myTeam,
      opponent: body.opponent,
      myGoals: Number(body.myGoals),
      opponentGoals: Number(body.opponentGoals),
      shots: Number(body.shots) || 0,
      shotsOnTarget: Number(body.shotsOnTarget) || 0,
      possession: Number(body.possession) || 50,
      matchRating: body.matchRating ? Number(body.matchRating) : null,
    });

    await match.save();

    return NextResponse.json({
      success: true,
      match: { ...match.toObject(), _id: match._id.toString() },
    });
  } catch (error) {
    console.error('POST /api/matches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
