import { Button, Dropdown, Flex } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';

const onMenuClick: MenuProps['onClick'] = (e) => {
  console.log('click', e);
};

const items = [
  {
    key: '1',
    label: '1st item',
  },
  {
    key: '2',
    label: '2nd item',
  },
  {
    key: '3',
    label: '3rd item',
  },
];

const App: React.FC = () => (
  <Flex align="flex-start" gap="small" vertical>
    <Button type="primary">primary</Button>
    <Button>secondary</Button>
    <Dropdown.Button menu={{ items, onClick: onMenuClick }}>Actions</Dropdown.Button>
  </Flex>
);

export default App;
