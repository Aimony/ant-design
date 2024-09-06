import * as React from 'react';

import Slider from '..';
import type { SliderRangeProps } from '..';

describe('Slider.typescript', () => {
  it('single value', () => {
    const value = 0;
    const onChange = (v: number) => v;
    const result = (
      <Slider defaultValue={value} value={value} onChange={onChange} onChangeComplete={onChange} />
    );
    expect(result).toBeTruthy();
  });

  it('range value', () => {
    const value: [number, number] = [0, 1];
    const onChange: SliderRangeProps['onChange'] = (v) => v;
    const result = (
      <Slider
        range
        defaultValue={value}
        value={value}
        onChange={onChange}
        onChangeComplete={onChange}
      />
    );
    expect(result).toBeTruthy();
  });

  it('step can be null value', () => {
    const value = 0;
    const onChange = (v: number) => v;
    const result = (
      <Slider
        defaultValue={value}
        value={value}
        onChange={onChange}
        onChangeComplete={onChange}
        step={null}
      />
    );
    expect(result).toBeTruthy();
  });
});
