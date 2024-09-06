import { ItemGroup } from 'rc-menu';
import type { MenuRef as RcMenuRef } from 'rc-menu';
import * as React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { SiderContext } from '../layout/Sider';
import type { MenuTheme } from './MenuContext';
import MenuDivider from './MenuDivider';
import Item from './MenuItem';
import type { MenuItemProps } from './MenuItem';
import SubMenu from './SubMenu';
import type { SubMenuProps } from './SubMenu';
import type { ItemType, MenuItemType } from './interface';
import InternalMenu from './menu';
import type { MenuProps } from './menu';

export type { MenuDividerProps } from './MenuDivider';
export type { MenuItemGroupProps } from 'rc-menu';
export type { MenuItemProps, MenuProps, MenuTheme, SubMenuProps };

export interface MenuRef {
  menu: RcMenuRef | null;
  focus: (options?: FocusOptions) => void;
}

type ComponentProps = MenuProps & React.RefAttributes<MenuRef>;

type GenericItemType<T = unknown> = T extends infer U extends MenuItemType
  ? unknown extends U
    ? ItemType
    : ItemType<U>
  : ItemType;

type GenericComponentProps<T = unknown> = Omit<ComponentProps, 'items'> & {
  items?: GenericItemType<T>[];
};

type CompoundedComponent = React.ForwardRefExoticComponent<GenericComponentProps> & {
  Item: typeof Item;
  SubMenu: typeof SubMenu;
  Divider: typeof MenuDivider;
  ItemGroup: typeof ItemGroup;
};

interface GenericComponent extends Omit<CompoundedComponent, ''> {
  <T extends MenuItemType>(props: GenericComponentProps<T>): ReturnType<CompoundedComponent>;
}

const Menu = forwardRef<MenuRef, MenuProps>((props, ref) => {
  const menuRef = useRef<RcMenuRef>(null);
  const context = React.useContext(SiderContext);

  useImperativeHandle(ref, () => ({
    menu: menuRef.current,
    focus: (options) => {
      menuRef.current?.focus(options);
    },
  }));
  return <InternalMenu ref={menuRef} {...props} {...context} />;
}) as GenericComponent;

Menu.Item = Item;
Menu.SubMenu = SubMenu;
Menu.Divider = MenuDivider;
Menu.ItemGroup = ItemGroup;

if (process.env.NODE_ENV !== 'production') {
  Menu.displayName = 'Menu';
}

export default Menu;
