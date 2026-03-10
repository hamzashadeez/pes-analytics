import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    myTeam: {
      type: String,
      required: true,
      trim: true,
    },
    opponent: {
      type: String,
      required: true,
      trim: true,
    },
    myGoals: {
      type: Number,
      required: true,
      min: 0,
    },
    opponentGoals: {
      type: Number,
      required: true,
      min: 0,
    },
    shots: {
      type: Number,
      default: 0,
      min: 0,
    },
    shotsOnTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    possession: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    matchRating: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },
    result: {
      type: String,
      enum: ['W', 'D', 'L'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate result before saving
MatchSchema.pre('save', function (next) {
  if (this.myGoals > this.opponentGoals) {
    this.result = 'W';
  } else if (this.myGoals < this.opponentGoals) {
    this.result = 'L';
  } else {
    this.result = 'D';
  }
  next();
});

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export default Match;
