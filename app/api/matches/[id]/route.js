import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '../../../models/Match';
// get single match by id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await Match.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
