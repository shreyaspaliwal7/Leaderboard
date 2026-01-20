import React, { useState, useEffect } from 'react';
const Leaderboard = () => {
  const [data, setData] = useState({ teams: [], question: "", round: 1 });
  const [highlightedId, setHighlightedId] = useState(null);

  const load = () => {
    const t = localStorage.getItem('hp_teams');
    const q = localStorage.getItem('hp_question');
    const r = localStorage.getItem('hp_round');

    if (t) {
      const newTeamsRaw = JSON.parse(t);

      setData(prev => {
        // 1. Find the team whose score changed
        const updatedTeam = newTeamsRaw.find(nt => {
          const oldTeam = prev.teams.find(ot => ot.id === nt.id);
          // If the team exists and its score is different than before
          return oldTeam && oldTeam.score !== nt.score;
        });

        // 2. If someone's score changed, highlight them
        if (updatedTeam) {
          setHighlightedId(updatedTeam.id);

          // Play Sound (Optional: logic for positive/negative can go here)
          const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3");
          audio.play();

          // 3. Clear highlight after 8 seconds
          setTimeout(() => {
            setHighlightedId(null);
          }, 8000);
        }

        // 4. Return the new state (sorted by score)
        return {
          teams: [...newTeamsRaw].sort((a, b) => b.score - a.score),
          question: q || "",
          round: r || 1
        };
      });
    }
  };


  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  return (
    <div className="min-h-screen  text-white p-10 font-serif">
      <img className='fixed top-0 left-0 w-full h-screen bg-center bg-cover -z-40 ' src="public\thumb_1654601227_834365.jpg" alt="" />
      <a href="/admin">
        <button className='h-1 w-1 bg-amber-50'></button>
      </a>
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900 border-4 border-double rounded-2xl border-amber-900 p-10 mb-12 rounded-lg text-center shadow-2xl">
          <p className="text-amber-600 uppercase tracking-widest mb-2">Round {data.round}</p>
          <h2 className="text-5xl italic text-amber-200">"{data.question}"</h2>
        </div>

        <table className="w-full border-separate border-spacing-y-4">
          <tbody>
            {data.teams.map((team, idx) => (
              <tr
                key={team.id}
                className={`
        transition-all duration-700 border-l-4
        ${highlightedId === team.id
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] scale-[1.01]'
                    : 'bg-slate-900 border-transparent shadow-none scale-100'
                  }
      `}
              >
                <td className="p-6 text-amber-600 font-bold w-24">#{idx + 1}</td>
                <td className="p-6 text-amber-100 font-semibold">{team.name}</td>
                <td className="p-6">
                  <div className="flex gap-2">
                    {team.history.map((h, i) => (
                      <span key={i} className={`text-sm px-3 py-1 rounded-full ${h >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {h > 0 ? `+${h}` : h}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-6 text-right font-mono text-4xl text-amber-400">{team.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Leaderboard;