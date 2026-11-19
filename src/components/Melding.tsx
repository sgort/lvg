// An alert box with LUX's look: the same Utrecht/LUX alert classes as LuxAlert, our own icon.
// LuxAlert itself cannot be used: its icon (LuxIcon) renders a <style> element, which the
// strict CSP blocks (plan Task 22). An error is announced; an info box is not.
import type { ReactNode } from 'react';

import { Info } from './icons';
import styles from './Melding.module.scss';

type Props = { type: 'info' | 'error'; children: ReactNode };

export function Melding({ type, children }: Props) {
  return (
    <div className={`utrecht-alert utrecht-alert--${type} lux-alert`}>
      <div className="utrecht-alert__icon">
        <span className="utrecht-icon" aria-hidden="true">
          <Info className={styles.icoon} />
        </span>
      </div>
      <div className="utrecht-alert__content">
        <div className="utrecht-alert__message" role={type === 'error' ? 'alert' : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
