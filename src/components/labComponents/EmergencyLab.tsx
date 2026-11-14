import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  DoorClosed,
  Info,
  Leaf,
  MoveRight,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Siren,
  Sun,
  Users,
  Wind,
  Zap,
} from 'lucide-react';
import { LabTransitionOverlay } from '../LabTransition';
import { useLabTransition } from '../../hooks/useLabTransition';
import './EmergencyLab.css';

type ActionId =
  | 'pause-eva'
  | 'guide-shelter'
  | 'check-dosimeter'
  | 'check-weather'
  | 'protect-power'
  | 'brief-crew'
  | 'count-crew'
  | 'seal-module'
  | 'check-pressure'
  | 'pause-harvest'
  | 'isolate-garden'
  | 'log-observation';

type MissionAction = {
  id: ActionId;
  title: string;
  detail: string;
  feedback: string;
  icon: typeof Shield;
};

type EmergencyMission = {
  id: string;
  title: string;
  signal: string;
  description: string;
  sceneLabel: string;
  crewStatus: string;
  hazardStatus: string;
  science: string;
  source: string;
  sourceUrl: string;
  actions: MissionAction[];
};

function shuffleActions(actions: MissionAction[], previousOrder?: MissionAction[]) {
  const shuffled = [...actions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (
    shuffled.length > 1 &&
    previousOrder?.length === shuffled.length &&
    shuffled.every((action, index) => action.id === previousOrder[index].id)
  ) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

const MISSIONS: EmergencyMission[] = [
  {
    id: 'radiation',
    title: 'The Sun Sends a Warning',
    signal: 'SPACE WEATHER ALERT',
    description: 'A radiation monitor sends a warning while two crew members are getting ready for an outside task.',
    sceneLabel: 'LUNAR BASE / EXTERIOR ACTIVITY PAUSED',
    crewStatus: 'Crew near the airlock',
    hazardStatus: 'Radiation alert',
    science: 'NASA monitors the space radiation environment and uses crew dosimeters to help assess exposure. Actual mission teams follow vehicle- and mission-specific plans.',
    source: 'NASA Space Radiation',
    sourceUrl: 'https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/',
    actions: [
      { id: 'pause-eva', title: 'Pause the spacewalk', detail: 'Hold the outside task for now.', feedback: 'Outside activity is paused. The crew has time to follow the mission plan.', icon: DoorClosed },
      { id: 'guide-shelter', title: 'Guide crew to the safe room', detail: 'Move the crew to the planned protected area.', feedback: 'Crew is together in the designated safe area.', icon: Users },
      { id: 'check-dosimeter', title: 'Check the radiation monitor', detail: 'Review the monitor and crew dosimeter status.', feedback: 'Monitor status checked. Mission Control has the latest information.', icon: Activity },
    ],
  },
  {
    id: 'storm',
    title: 'Storm Watch at Mission Control',
    signal: 'SOLAR STORM WATCH',
    description: 'A space-weather update arrives. Your crew needs a clear plan while Mission Control watches for new information.',
    sceneLabel: 'MISSION CONTROL / STAY ALERT',
    crewStatus: 'Crew awaiting update',
    hazardStatus: 'Space weather watch',
    science: 'NASA’s Space Radiation Analysis Group monitors radiation conditions and supports flight operations. Space-weather response depends on the latest information and the mission plan.',
    source: 'NASA Space Radiation',
    sourceUrl: 'https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/',
    actions: [
      { id: 'check-weather', title: 'Open the space-weather feed', detail: 'Bring the latest monitoring update to the console.', feedback: 'Update received. Mission Control can make decisions using monitored conditions.', icon: Sun },
      { id: 'protect-power', title: 'Protect essential systems', detail: 'Flag life support and communications as priority systems.', feedback: 'Essential systems are marked for protection. The outpost keeps its lifelines in view.', icon: Zap },
      { id: 'brief-crew', title: 'Send a crew briefing', detail: 'Tell the crew what is happening and what to expect next.', feedback: 'Crew has been briefed and knows to follow the mission plan.', icon: Radio },
    ],
  },
  {
    id: 'pressure',
    title: 'The Habitat Pressure Puzzle',
    signal: 'HABITAT SENSOR / PRESSURE CHANGE',
    description: 'A sensor notices a pressure change in one room. The crew is in the neighboring module.',
    sceneLabel: 'HABITAT / MODULE CHECK',
    crewStatus: 'Crew in neighboring module',
    hazardStatus: 'Pressure sensor warning',
    science: 'The ISS is a pressurized research outpost made of connected modules. This fictional training activity emphasizes crew communication and following the correct vehicle checklist.',
    source: 'NASA International Space Station',
    sourceUrl: 'https://www.nasa.gov/reference/international-space-station/',
    actions: [
      { id: 'count-crew', title: 'Check in with every crewmate', detail: 'Use the radio to confirm everyone is in a safe area.', feedback: 'Crew check complete. Mission Control knows where everyone is.', icon: Users },
      { id: 'seal-module', title: 'Secure the affected module', detail: 'Use the training control to close the module hatch.', feedback: 'The training module is isolated. The crew remains together in the neighboring area.', icon: DoorClosed },
      { id: 'check-pressure', title: 'Read the pressure sensors', detail: 'Compare the module reading with the habitat status panel.', feedback: 'Sensor readings are logged for the team to review.', icon: Wind },
    ],
  },
  {
    id: 'garden',
    title: 'Mystery in the Space Garden',
    signal: 'GARDEN SENSOR / CHECK PLANTS',
    description: 'A plant-growth camera spots something unusual in the space garden. The crew has not touched it yet.',
    sceneLabel: 'SPACE GARDEN / OBSERVATION MODE',
    crewStatus: 'Crew ready to inspect',
    hazardStatus: 'Unknown plant change',
    science: 'NASA’s Veggie plant-growth system helps researchers study plants in microgravity and provides fresh food for astronauts. This activity is a fictional learning scenario, not a crop-contamination procedure.',
    source: 'NASA Veggie',
    sourceUrl: 'https://science.nasa.gov/mission/veggie/',
    actions: [
      { id: 'pause-harvest', title: 'Pause garden work', detail: 'Ask the crew to stop handling plants for a moment.', feedback: 'Garden work is paused while the crew checks the unusual patch.', icon: Leaf },
      { id: 'isolate-garden', title: 'Mark the garden zone', detail: 'Keep the observation area separate in the training map.', feedback: 'The garden zone is marked so the observation can be checked calmly.', icon: ShieldAlert },
      { id: 'log-observation', title: 'Save a plant photo and note', detail: 'Record what the camera spotted for the science team.', feedback: 'Observation saved. Good science starts with careful notes.', icon: ClipboardList },
    ],
  },
];

export default function EmergencyLab() {
  const { activeSection: activeTab, isRocketFlying, transitionTo: handleTabChange } =
    useLabTransition<'guide' | 'simulation'>('guide');
  const [missionIndex, setMissionIndex] = useState(0);
  const [finishedActions, setFinishedActions] = useState<Record<string, ActionId[]>>({});
  const [displayedActions, setDisplayedActions] = useState<Record<string, MissionAction[]>>(() =>
    Object.fromEntries(MISSIONS.map((mission) => [mission.id, shuffleActions(mission.actions)]))
  );
  const [failedMissions, setFailedMissions] = useState<Record<string, string>>({});
  const [lastAction, setLastAction] = useState<MissionAction | null>(null);

  const mission = MISSIONS[missionIndex];
  const missionActions = finishedActions[mission.id] ?? [];
  const missionDisplayActions = displayedActions[mission.id] ?? mission.actions;
  const nextAction = mission.actions[missionActions.length];
  const missionFailure = failedMissions[mission.id];
  const completedMissions = MISSIONS.filter((item) =>
    item.actions.every((action) => (finishedActions[item.id] ?? []).includes(action.id))
  ).length;
  const isMissionComplete = mission.actions.every((action) => missionActions.includes(action.id));
  const isMissionFailed = Boolean(missionFailure);
  const crewMoved = missionActions.includes('guide-shelter') || missionActions.includes('count-crew');
  const systemSecured = missionActions.includes('protect-power') || missionActions.includes('seal-module') || missionActions.includes('isolate-garden');
  const statusValue = Math.round((missionActions.length / mission.actions.length) * 100);

  function performAction(action: MissionAction) {
    if (isMissionFailed || isMissionComplete) return;
    if (!nextAction) return;
    if (action.id !== nextAction.id) {
      setFailedMissions((previous) => ({
        ...previous,
        [mission.id]: `That tool was used too soon. The crew needed “${nextAction.title}” first.`,
      }));
      setLastAction(null);
      return;
    }

    setFinishedActions((previous) => ({
      ...previous,
      [mission.id]: [...(previous[mission.id] ?? []), action.id],
    }));
    setLastAction(action);
  }

  function selectMission(index: number) {
    setMissionIndex(index);
    setLastAction(null);
  }

  function retryMission() {
    setFinishedActions((previous) => ({ ...previous, [mission.id]: [] }));
    setDisplayedActions((previous) => ({
      ...previous,
      [mission.id]: shuffleActions(mission.actions, previous[mission.id]),
    }));
    setFailedMissions((previous) => {
      const next = { ...previous };
      delete next[mission.id];
      return next;
    });
    setLastAction(null);
  }

  function restartAllMissions() {
    setFinishedActions({});
    setDisplayedActions((previous) => Object.fromEntries(
      MISSIONS.map((item) => [item.id, shuffleActions(item.actions, previous[item.id])])
    ));
    setFailedMissions({});
    setMissionIndex(0);
    setLastAction(null);
  }

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-red-500/30 bg-slate-950 p-6 text-cyan-400 shadow-2xl">
      <LabTransitionOverlay visible={isRocketFlying} />

      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-cyan-800/50 pb-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-white">🚨 EMERGENCY RESPONSE LAB</h2>
          <p className="text-xs text-slate-400">Help the crew through a NASA-informed outpost adventure</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('guide')}
            aria-pressed={activeTab === 'guide'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === 'guide' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <BookOpen className="h-4 w-4" /> Mission Briefing
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('simulation')}
            aria-pressed={activeTab === 'simulation'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === 'simulation' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Play className="h-4 w-4" /> Rescue Mission
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-xl border border-red-500/30 bg-slate-900/80 p-5">
            <Info className="mt-1 h-6 w-6 shrink-0 text-red-400" />
            <div>
              <h3 className="mb-1 text-lg font-bold text-white">Mission Control needs you!</h3>
              <p className="text-sm text-slate-300">
                This is not a quiz. You are the junior mission controller: use the console tools to help the crew, protect their habitat, and complete each mini-adventure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MISSIONS.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <span className="font-mono text-[10px] text-red-300">ADVENTURE 0{index + 1}</span>
                </div>
                <h4 className="mb-2 text-base font-bold text-white">{item.title}</h4>
                <p className="mb-3 text-xs text-slate-400">{item.description}</p>
                <a className="text-xs text-cyan-300 underline underline-offset-2" href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Science link: {item.source} ↗
                </a>
              </article>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => handleTabChange('simulation')} className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-500">
              Enter Mission Control <Play className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="emergency-adventure">
          <div className="emergency-adventure-heading">
            <div>
              <span className="emergency-adventure-kicker"><Siren aria-hidden="true" /> JUNIOR MISSION CONTROL</span>
              <h3>Your crew needs a helper!</h3>
              <p>Choose the best tool for the situation. A rushed move can fail the drill, but you can always retry.</p>
            </div>
            <div className="emergency-patch-count" aria-label={`${completedMissions} of ${MISSIONS.length} adventure patches earned`}>
              <span>MISSION PATCHES</span>
              <strong>{'★'.repeat(completedMissions)}<span>{'☆'.repeat(MISSIONS.length - completedMissions)}</span></strong>
            </div>
          </div>

          <div className="emergency-adventure-layout">
            <nav className="emergency-adventure-map" aria-label="Choose an adventure">
              <span className="emergency-map-title">MISSION MAP</span>
              {MISSIONS.map((item, index) => {
                const done = item.actions.every((action) => (finishedActions[item.id] ?? []).includes(action.id));
                const failed = Boolean(failedMissions[item.id]);
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-current={missionIndex === index ? 'step' : undefined}
                    className={`${missionIndex === index ? 'active' : ''} ${done ? 'done' : ''} ${failed ? 'failed' : ''}`}
                    onClick={() => selectMission(index)}
                  >
                    <span>{done ? <Check aria-hidden="true" /> : failed ? '!' : `0${index + 1}`}</span>
                    <strong>{item.title}</strong>
                  </button>
                );
              })}
              {completedMissions > 0 && (
                <button type="button" className="emergency-map-restart" onClick={restartAllMissions}>
                  <RotateCcw aria-hidden="true" /> Start a new adventure
                </button>
              )}
            </nav>

            <section className={`emergency-adventure-main${isMissionFailed ? ' failed' : ''}`} aria-live="polite">
              <div className={`emergency-space-scene scene-${mission.id}`}>
                <span className="emergency-scene-stars" aria-hidden="true" />
                <span className="emergency-scene-label">{mission.sceneLabel}</span>
                <span className="emergency-scene-hazard">{mission.id === 'radiation' || mission.id === 'storm' ? <Sun aria-hidden="true" /> : mission.id === 'pressure' ? <Wind aria-hidden="true" /> : <Leaf aria-hidden="true" />}</span>
                <div className={`emergency-scene-crew${crewMoved ? ' moved' : ''}`} aria-label={mission.crewStatus}>
                  <span>👩‍🚀</span><span>👨‍🚀</span>
                </div>
                <div className={`emergency-scene-base${systemSecured ? ' secured' : ''}`} aria-hidden="true">
                  <span className="emergency-base-window" />
                  <span className="emergency-base-door" />
                  <span className="emergency-base-panel">●</span>
                </div>
                <div className={`emergency-scene-shelter${crewMoved ? ' active' : ''}`} aria-hidden="true">
                  <Shield aria-hidden="true" />
                  <span>SAFE ZONE</span>
                </div>
                <div className="emergency-scene-status">
                  <span><i className="emergency-status-dot" />{mission.hazardStatus}</span>
                  <span><Users aria-hidden="true" />{crewMoved ? 'Crew together' : mission.crewStatus}</span>
                  <span><Zap aria-hidden="true" />{systemSecured ? 'Systems secured' : 'Systems online'}</span>
                </div>
              </div>

              <div className="emergency-adventure-story">
                <span className="emergency-transmission"><Radio aria-hidden="true" /> INCOMING TRANSMISSION</span>
                <p>{lastAction?.feedback ?? mission.description}</p>
              </div>

              <div className="emergency-action-heading">
                <div>
                  <span>MISSION CONTROL CONSOLE</span>
                  <p>Think about what the crew needs first, then choose a tool.</p>
                </div>
                <span>{missionActions.length} / {mission.actions.length} tasks</span>
              </div>

              <div className="emergency-action-console">
                {missionDisplayActions.map((action) => {
                  const done = missionActions.includes(action.id);
                  const ActionIcon = action.icon;
                  return (
                    <button
                      type="button"
                      key={action.id}
                      disabled={done || isMissionFailed || isMissionComplete}
                      className={`emergency-console-action${done ? ' complete' : ''}`}
                      onClick={() => performAction(action)}
                    >
                      <span className="emergency-console-icon">{done ? <CheckCircle2 aria-hidden="true" /> : <ActionIcon aria-hidden="true" />}</span>
                      <span className="emergency-console-copy">
                        <strong>{action.title}</strong>
                        <small>{done ? 'DONE!' : action.detail}</small>
                      </span>
                      {!done && <MoveRight className="emergency-console-arrow" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {isMissionFailed ? (
                <div className="emergency-adventure-failed" role="alert">
                  <span className="emergency-failed-icon"><AlertTriangle aria-hidden="true" /></span>
                  <div>
                    <strong>MISSION FAILED</strong>
                    <p>{missionFailure} Follow the highlighted order and try again.</p>
                  </div>
                  <button type="button" onClick={retryMission}><RotateCcw aria-hidden="true" /> RETRY MISSION</button>
                </div>
              ) : isMissionComplete ? (
                <div className="emergency-adventure-complete">
                  <span className="emergency-complete-stars" aria-hidden="true">★</span>
                  <div><strong>MISSION COMPLETE!</strong><p>{mission.title} is complete in the correct order. You earned one mission patch!</p></div>
                  {missionIndex < MISSIONS.length - 1 ? (
                    <button type="button" onClick={() => selectMission(missionIndex + 1)}>NEXT ADVENTURE <MoveRight aria-hidden="true" /></button>
                  ) : (
                    <button type="button" onClick={restartAllMissions}>PLAY AGAIN <RotateCcw aria-hidden="true" /></button>
                  )}
                </div>
              ) : (
                <div className="emergency-task-progress">
                  <span>TASK PROGRESS</span>
                  <span className="emergency-task-track"><i style={{ width: `${statusValue}%` }} /></span>
                  <strong>{statusValue}%</strong>
                  <small>mission actions complete</small>
                </div>
              )}

              <div className="emergency-adventure-science">
                <BookOpen aria-hidden="true" />
                <p><strong>SPACE FACT</strong>{mission.science} <a href={mission.sourceUrl} target="_blank" rel="noreferrer">Explore {mission.source} ↗</a></p>
              </div>
            </section>
          </div>

          <p className="emergency-adventure-note"><AlertTriangle aria-hidden="true" /> This is a fictional learning game, not a real emergency procedure. Mission meters are game progress only; real crews follow approved mission-control guidance.</p>
        </div>
      )}
    </div>
  );
}
