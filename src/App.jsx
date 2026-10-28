import React, { useState, useEffect } from 'react';
import './App.css';
// Helper to load/save from localStorage
const STORAGE_KEY = 'fitlink_routines_v1';

const DEFAULT_ROUTINES = [
  {
    id: '1',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    exercises: [
      {
        id: 'e1',
        name: 'Barbell Bench Press',
        sets: [
          { id: 's1', weight: 135, reps: 10, completed: false },
          { id: 's2', weight: 155, reps: 8, completed: false },
          { id: 's3', weight: 155, reps: 6, completed: false }
        ]
      },
      {
        id: 'e2',
        name: 'Overhead Press',
        sets: [
          { id: 's4', weight: 95, reps: 10, completed: false },
          { id: 's5', weight: 95, reps: 8, completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Pull Day (Back & Biceps)',
    exercises: [
      {
        id: 'e3',
        name: 'Lat Pulldown',
        sets: [
          { id: 's6', weight: 120, reps: 12, completed: false },
          { id: 's7', weight: 130, reps: 10, completed: false }
        ]
      }
    ]
  }
];

export default function App() {
  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_ROUTINES;
  });

  const [activeRoutineId, setActiveRoutineId] = useState(routines[0]?.id || '');
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newExerciseNames, setNewExerciseNames] = useState({});

  // Save to localStorage automatically on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

  // Routine Actions
  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    const newRoutine = {
      id: Date.now().toString(),
      name: newRoutineName.trim(),
      exercises: []
    };
    setRoutines([...routines, newRoutine]);
    setActiveRoutineId(newRoutine.id);
    setNewRoutineName('');
  };

  const handleDeleteRoutine = (id) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    if (activeRoutineId === id) {
      setActiveRoutineId(updated[0]?.id || '');
    }
  };

  // Exercise Actions
  const handleAddExercise = (routineId, e) => {
    e.preventDefault();
    const name = newExerciseNames[routineId];
    if (!name || !name.trim()) return;

    const updated = routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: [
            ...r.exercises,
            {
              id: Date.now().toString(),
              name: name.trim(),
              sets: [{ id: Date.now() + '-s1', weight: 0, reps: 10, completed: false }]
            }
          ]
        };
      }
      return r;
    });

    setRoutines(updated);
    setNewExerciseNames({ ...newExerciseNames, [routineId]: '' });
  };

  const handleDeleteExercise = (routineId, exerciseId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.filter(e => e.id !== exerciseId)
        };
      }
      return r;
    }));
  };

  // Set Actions
  const handleAddSet = (routineId, exerciseId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exerciseId) {
              const lastSet = ex.sets[ex.sets.length - 1];
              return {
                ...ex,
                sets: [
                  ...ex.sets,
                  {
                    id: Date.now().toString(),
                    weight: lastSet ? lastSet.weight : 0,
                    reps: lastSet ? lastSet.reps : 10,
                    completed: false
                  }
                ]
              };
            }
            return ex;
          })
        };
      }
      return r;
    }));
  };

  const handleDeleteSet = (routineId, exerciseId, setId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                sets: ex.sets.filter(s => s.id !== setId)
              };
            }
            return ex;
          })
        };
      }
      return r;
    }));
  };

  const handleUpdateSet = (routineId, exerciseId, setId, field, value) => {
    const numVal = value === '' ? '' : Number(value);
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                sets: ex.sets.map(s => {
                  if (s.id === setId) {
                    return { ...s, [field]: numVal < 0 ? 0 : numVal };
                  }
                  return s;
                })
              };
            }
            return ex;
          })
        };
      }
      return r;
    }));
  };

  const handleToggleComplete = (routineId, exerciseId, setId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                sets: ex.sets.map(s => {
                  if (s.id === setId) {
                    return { ...s, completed: !s.completed };
                  }
                  return s;
                })
              };
            }
            return ex;
          })
        };
      }
      return r;
    }));
  };

  return (
    <div className="fitlink-container">
      <header className="fitlink-header">
        <h1>FitLink Workout Tracker</h1>
        <p>Your routines auto-save locally in your browser.</p>
      </header>

      {/* Routine Navigation Tabs */}
      <div className="routine-tabs">
        {routines.map(r => (
          <button
            key={r.id}
            className={`tab-btn ${r.id === activeRoutine?.id ? 'active' : ''}`}
            onClick={() => setActiveRoutineId(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Create Routine Form */}
      <form onSubmit={handleAddRoutine} className="create-routine-form">
        <input
          type="text"
          placeholder="New Routine Name (e.g. Leg Day)..."
          value={newRoutineName}
          onChange={(e) => setNewRoutineName(e.target.value)}
        />
        <button type="submit" className="btn primary-btn">+ Add Routine</button>
      </form>

      {/* Active Routine Details */}
      {activeRoutine && (
        <div className="routine-card">
          <div className="routine-header">
            <h2>{activeRoutine.name}</h2>
            {routines.length > 1 && (
              <button 
                onClick={() => handleDeleteRoutine(activeRoutine.id)} 
                className="btn danger-btn text-sm"
              >
                Delete Routine
              </button>
            )}
          </div>

          {/* Add Exercise Form */}
          <form 
            onSubmit={(e) => handleAddExercise(activeRoutine.id, e)} 
            className="add-exercise-form"
          >
            <input
              type="text"
              placeholder="Add exercise (e.g. Squats, Pull-ups)..."
              value={newExerciseNames[activeRoutine.id] || ''}
              onChange={(e) => setNewExerciseNames({
                ...newExerciseNames, 
                [activeRoutine.id]: e.target.value 
              })}
            />
            <button type="submit" className="btn secondary-btn">Add Exercise</button>
          </form>

          {/* Exercises List */}
          {activeRoutine.exercises.length === 0 ? (
            <p className="empty-text">No exercises added to this routine yet. Add one above!</p>
          ) : (
            <div className="exercises-list">
              {activeRoutine.exercises.map(exercise => (
                <div key={exercise.id} className="exercise-box">
                  <div className="exercise-header">
                    <h3>{exercise.name}</h3>
                    <button 
                      onClick={() => handleDeleteExercise(activeRoutine.id, exercise.id)}
                      className="text-btn delete-text"
                    >
                      Remove Exercise
                    </button>
                  </div>

                  {/* Sets Table Header */}
                  <div className="sets-table">
                    <div className="set-row header-row">
                      <span>Set</span>
                      <span>Weight (lbs/kg)</span>
                      <span>Reps</span>
                      <span>Done</span>
                      <span></span>
                    </div>

                    {exercise.sets.map((set, index) => (
                      <div key={set.id} className={`set-row ${set.completed ? 'completed-set' : ''}`}>
                        <span className="set-num">#{index + 1}</span>
                        <div className="input-group">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleUpdateSet(activeRoutine.id, exercise.id, set.id, 'weight', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleUpdateSet(activeRoutine.id, exercise.id, set.id, 'reps', e.target.value)}
                          />
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked={set.completed}
                            onChange={() => handleToggleComplete(activeRoutine.id, exercise.id, set.id)}
                            className="checkbox-input"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => handleDeleteSet(activeRoutine.id, exercise.id, set.id)}
                            className="icon-btn"
                            title="Delete Set"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddSet(activeRoutine.id, exercise.id)}
                    className="btn add-set-btn"
                  >
                    + Add Set
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}