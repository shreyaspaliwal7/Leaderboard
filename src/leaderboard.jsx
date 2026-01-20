import React, { useState, useEffect } from 'react';
const Leaderboard = () => {
  const [data, setData] = useState({ teams: [], question: "", round: 1 });
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightType, setHighlightType] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const calculateTime = () => {
    const endTime = localStorage.getItem('hp_timer_end');
    const isRunning = localStorage.getItem('hp_timer_running') === 'true';

    if (!endTime) {
      setTimeLeft(60); // Default if no timer set
      return;
    }

    if (isRunning) {
      const remaining = Math.max(0, Math.floor((parseInt(endTime) - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Auto-play buzzer if it just hit zero
      if (remaining === 0) {
        new Audio("/buzzer.mp3").play();
        localStorage.setItem('hp_timer_running', 'false');
      }
    }
  };

  const load = () => {
    const t = localStorage.getItem('hp_teams');
    const q = localStorage.getItem('hp_question');
    const r = localStorage.getItem('hp_round');

    if (t) {
      const newTeamsRaw = JSON.parse(t);

      setData(prev => {
        let changeType = null;
        const updatedTeam = newTeamsRaw.find(nt => {
          const oldTeam = prev.teams.find(ot => ot.id === nt.id);
          if (oldTeam && oldTeam.score !== nt.score) {
            // Determine if points were added or removed
            changeType = nt.score > oldTeam.score ? 'positive' : 'negative';
            return true;
          }
          return false;
        });

        if (updatedTeam) {
          setHighlightedId(updatedTeam.id);
          setHighlightType(changeType);

          // 1. Determine path based on point direction
          // Note: Standard web paths use "/" and assume "public" is the root
          const soundPath = changeType === 'negative'
            ? "/buzzer_og.mp3"
            : "/correct_cut.mp3";


          // 2. Create the audio instance
          const audio = new Audio(soundPath);

          // 3. Play the sound
          // It will naturally play until the file ends and then stop.
          audio.play().catch(error => {
            console.error("Playback failed. Please click on the page once to enable audio:", error);
          });

          // 4. Reset the VISUAL highlight after your 8-second rule
          // (The audio timing is now independent of this timer)
          setTimeout(() => {
            setHighlightedId(null);
            setHighlightType(null);
          }, 8000);
        }

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

  useEffect(() => {
  // Check every second to update the countdown
  const timerInterval = setInterval(calculateTime, 1000);
  
  // Also listen for manual Start/Stop/Reset from Admin
  window.addEventListener('storage', calculateTime);
  
  return () => {
    clearInterval(timerInterval);
    window.removeEventListener('storage', calculateTime);
  };
}, []);


  return (
    <div className="min-h-screen  text-white p-10 font-serif">
      <img className='fixed top-0 left-0 w-full h-screen bg-center bg-cover -z-40 ' src="public\thumb_1654601227_834365.jpg" alt="" />
      <a href="/admin">
        <button className='h-1 w-1 bg-amber-50'></button>
      </a>
      <div className="max-w-6xl mx-auto h-auto">
        {/* <div className="bg-[#362121ef] border-4 border-double rounded-2xl border-[#FABE33] p-10 mb-12 rounded-lg text-center shadow-2xl"> */}
        <div className='text-center italic bg-[#362121ef] border-4 border-double rounded-2xl border-[#FABE33] p-10 mb-12
    text-2xl md:text-4xl lg:text-5xl
    whitespace-pre-wrap break-words w-full h-auto' >
          {/* <p className="text-amber-600 text-3xl uppercase tracking-widest mb-5">Round {data.round}</p> */}
          <div className="flex items-center justify-between w-full mb-4 px-2">
            <div className="text-[#FABE33] text-2xl font-bold italic">
              Round {data.round}
            </div>

            <div className="flex items-center gap-3 bg-black/40 px-4 py-1 rounded-full border border-[#FABE33]/30">
              <span className="text-[#FABE33]/60 text-[10px] uppercase tracking-tighter">Time Left</span>
              <span className={`text-3xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#FABE33]'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <h2 className="text-5xl italic text-[#FABE33]">{data.question}</h2>
        </div>

        <table className="w-full border-separate border-spacing-y-4">
          <tbody>
            {data.teams.map((team, idx) => (
              <tr
                key={team.id}
                className={`
    transition-all duration-700 border-l-8 rounded-lg mb-2
    ${highlightedId === team.id
                    ? highlightType === 'positive'
                      ? 'bg-emerald-900/80 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-[1.02] z-10'
                      : 'bg-rose-900/80 border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.4)] scale-[1.02] z-10'
                    : 'bg-[#362121ef] border-transparent scale-100 z-0'
                  }
  `}
              >
                <td className="p-6 text-amber-600 rounded-l-xl font-bold w-24">#{idx + 1}</td>
                <td className="p-6 text-[#FABE33] text-3xl font-semibold">{team.name}</td>
                <td className="p-6">
                  <div className="flex gap-2">
                    {team.history.map((h, i) => (
                      <span key={i} className={`text-sm px-3 py-1 rounded-full ${h >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {h > 0 ? `+${h}` : h}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-6 text-right font-mono text-5xl rounded-r-xl text-amber-400">{team.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  );
};
export default Leaderboard;