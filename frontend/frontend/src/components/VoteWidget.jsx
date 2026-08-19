import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TeamPostService } from '../services/teamPostService';

/** Widget vote naik/turun ala forum. Optimistic update dengan rollback jika request gagal. */
export default function VoteWidget({ teamPostId, score, myVote, onChange }) {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const vote = async (value) => {
    if (!isLoggedIn) {
      window.location.hash = '#/auth';
      return;
    }
    if (loading) return;
    setLoading(true);

    const prev = { score, myVote };
    let nextScore = score;
    let nextMyVote = myVote;
    if (myVote === value) {
      nextScore = score - value;
      nextMyVote = null;
    } else if (myVote) {
      nextScore = score - myVote + value;
      nextMyVote = value;
    } else {
      nextScore = score + value;
      nextMyVote = value;
    }
    onChange({ score: nextScore, myVote: nextMyVote });

    try {
      const result = await TeamPostService.vote(teamPostId, value);
      onChange(result);
    } catch (e) {
      onChange(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 shrink-0 w-11">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        title="Naikkan"
        aria-pressed={myVote === 1}
        className={
          'w-9 h-8 flex items-center justify-center rounded-[3px] border-[1.5px] cursor-pointer transition-colors text-[13px] leading-none disabled:opacity-60 ' +
          (myVote === 1 ? 'bg-green border-green text-white' : 'bg-transparent border-navy text-navy hover:bg-navy hover:text-cream')
        }
      >
        ▲
      </button>
      <span className="font-mono text-[13px] font-semibold text-navy tabular-nums">{score}</span>
      <button
        onClick={() => vote(-1)}
        disabled={loading}
        title="Turunkan"
        aria-pressed={myVote === -1}
        className={
          'w-9 h-8 flex items-center justify-center rounded-[3px] border-[1.5px] cursor-pointer transition-colors text-[13px] leading-none disabled:opacity-60 ' +
          (myVote === -1 ? 'bg-red border-red text-white' : 'bg-transparent border-navy text-navy hover:bg-navy hover:text-cream')
        }
      >
        ▼
      </button>
    </div>
  );
}
