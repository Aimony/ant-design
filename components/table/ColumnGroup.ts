import type * as React from 'react';

import type { AnyObject } from '../_util/type';
import type { ColumnProps } from './Column';
import type { ColumnType } from './interface';

export interface ColumnGroupProps<RecordType = AnyObject>
  extends Omit<ColumnType<RecordType>, 'children'> {
  children:
    | React.ReactElement<ColumnProps<RecordType>>
    | React.ReactElement<ColumnProps<RecordType>>[];
}

const ColumnGroup = <RecordType extends AnyObject>(_: ColumnGroupProps<RecordType>) => null;

export default ColumnGroup;
