import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [teams, setTeams] = useState([]);
  const [question, setQuestion] = useState("");
  const [round, setRound] = useState(1);

  // Load everything from LocalStorage on mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('hp_teams');
    const savedQ = localStorage.getItem('hp_question');
    const savedR = localStorage.getItem('hp_round');

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedQ) setQuestion(savedQ);
    if (savedR) setRound(parseInt(savedR));
  }, []);

  // Helper to save and notify other tabs
  const sync = (newTeams, newQ, newR) => {
    localStorage.setItem('hp_teams', JSON.stringify(newTeams));
    localStorage.setItem('hp_question', newQ);
    localStorage.setItem('hp_round', newR.toString());
    // This triggers the 'storage' event in other tabs of the same origin
    window.dispatchEvent(new Event('storage'));
  };

  const addTeam = () => {
    const newTeam = {
      id: Date.now(),
      name: `House ${String.fromCharCode(65 + teams.length)}`,
      score: 0,
      history: []
    };
    const updated = [...teams, newTeam]; // Adds to bottom
    setTeams(updated);
    sync(updated, question, round);
  };

  const updatePoints = (id, pts) => {
    const val = parseInt(pts);
    if (isNaN(val)) return;
    const updated = teams.map(t => t.id === id ?
      { ...t, score: t.score + val, history: [...t.history, val].slice(-5) } : t
    );
    setTeams(updated);
    sync(updated, question, round);
  };

  const deleteTeam = (id) => {
    const updated = teams.filter(t => t.id !== id);
    setTeams(updated);
    sync(updated, question, round);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-amber-100 p-8 font-serif">
      <a href="/">
        <button className='bg-amber-50'> hello</button>
      </a>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-amber-900 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold italic text-amber-500">Ministry of Points Control</h1>
          <button onClick={addTeam} className="bg-amber-700 hover:bg-amber-600 text-black px-4 py-2 rounded font-bold">
            + Summon New Team
          </button>
        </header>

        <section className="bg-slate-900 p-6 rounded border border-amber-900 shadow-xl">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase text-amber-700">Active Round</label>
              <input type="number" value={round} onChange={(e) => { setRound(e.target.value); sync(teams, question, e.target.value) }}
                className="w-full bg-black border border-amber-900 p-2 rounded" />
            </div>
          </div>
          <label className="text-xs uppercase text-amber-700">Active Question</label>
          <textarea value={question} onChange={(e) => { setQuestion(e.target.value); sync(teams, e.target.value, round) }}
            className="w-full bg-black border border-amber-900 p-3 rounded h-24 italic" />
        </section>

        // Inside the AdminPanel.jsx map function:

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-slate-900 p-4 border border-amber-900/40 rounded flex flex-col gap-3 shadow-lg">
              <div className="flex justify-between items-center">
                {/* EDITABLE NAME FIELD */}
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => {
                    const updated = teams.map(t =>
                      t.id === team.id ? { ...t, name: e.target.value } : t
                    );
                    setTeams(updated);
                    sync(updated, question, round);
                  }}
                  className="bg-transparent border-b border-transparent hover:border-amber-900 focus:border-amber-500 focus:ring-0 font-bold text-lg text-amber-100 outline-none transition-all w-2/3"
                />
                <button
                  onClick={() => deleteTeam(team.id)}
                  className="text-red-900 hover:text-red-500 transition-colors"
                  title="Delete Team"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-2 rounded">
                <div>
                  <span className="text-xs uppercase text-amber-700 block">Total Score</span>
                  <span className="text-amber-500 font-mono text-xl">{team.score}</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-amber-800 italic">Award:</label>
                  <input
                    type="number"
                    placeholder="+/-"
                    className="w-20 bg-slate-800 border border-amber-700 rounded px-2 py-1 text-center text-amber-100 focus:ring-1 focus:ring-amber-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updatePoints(team.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;