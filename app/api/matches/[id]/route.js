import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '../../../models/Match';

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await Match.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
