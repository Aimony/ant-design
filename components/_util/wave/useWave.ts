import { useEvent } from 'rc-util';
import raf from 'rc-util/lib/raf';
import * as React from 'react';

import { ConfigContext } from '../../config-provider';
import useToken from '../../theme/useToken';
import showWaveEffect from './WaveEffect';
import { TARGET_CLS } from './interface';
import type { ShowWave, WaveComponent } from './interface';

const useWave = (
  nodeRef: React.RefObject<HTMLElement>,
  className: string,
  component?: WaveComponent,
) => {
  const { wave } = React.useContext(ConfigContext);
  const [, token, hashId] = useToken();

  const showWave = useEvent<ShowWave>((event) => {
    const node = nodeRef.current!;

    if (wave?.disabled || !node) {
      return;
    }

    const targetNode = node.querySelector<HTMLElement>(`.${TARGET_CLS}`) || node;

    const { showEffect } = wave || {};

    // Customize wave effect
    (showEffect || showWaveEffect)(targetNode, { className, token, component, event, hashId });
  });

  const rafId = React.useRef<number>();

  // Merge trigger event into one for each frame
  const showDebounceWave: ShowWave = (event) => {
    raf.cancel(rafId.current!);

    rafId.current = raf(() => {
      showWave(event);
    });
  };

  return showDebounceWave;
};

export default useWave;
