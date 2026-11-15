import { useEffect, useRef, useState } from 'react';

export function useLabTransition<T extends string>(initialSection: T) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isRocketFlying, setIsRocketFlying] = useState(false);
  const isTransitioning = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
  }, []);

  function transitionTo(targetSection: T) {
    if (targetSection === activeSection || isTransitioning.current) return;

    isTransitioning.current = true;
    setIsRocketFlying(true);

    timers.current.push(window.setTimeout(() => {
      setActiveSection(targetSection);
    }, 300));

    timers.current.push(window.setTimeout(() => {
      setIsRocketFlying(false);
      isTransitioning.current = false;
      timers.current = [];
    }, 700));
  }

  return { activeSection, isRocketFlying, transitionTo };
}
