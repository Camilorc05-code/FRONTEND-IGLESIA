import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(0);

    const t1 = setTimeout(() => setProgress(60), 80);
    const t2 = setTimeout(() => setProgress(85), 300);
    const t3 = setTimeout(() => setProgress(100), 500);
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div
        className="h-1 bg-gold transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
