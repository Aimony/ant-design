import classNames from 'classnames';
import omit from 'rc-util/lib/omit';
import { composeRef } from 'rc-util/lib/ref';
import React, { Children, createRef, useContext, useEffect, useMemo, useState } from 'react';

import { devUseWarning } from '../_util/warning';
import Wave from '../_util/wave';
import { ConfigContext } from '../config-provider';
import DisabledContext from '../config-provider/DisabledContext';
import type { SizeType } from '../config-provider/SizeContext';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/Compact';
import IconWrapper from './IconWrapper';
import LoadingIcon from './LoadingIcon';
import Group, { GroupSizeContext } from './button-group';
import { isTwoCNChar, isUnBorderedButtonType, spaceChildren } from './buttonHelpers';
import type { ButtonHTMLType, ButtonShape, ButtonType } from './buttonHelpers';
import useStyle from './style';
import CompactCmp from './style/compactCmp';

export type LegacyButtonType = ButtonType | 'danger';

export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
  [key: `data-${string}`]: string;
  classNames?: { icon: string };
  styles?: { icon: React.CSSProperties };
}

type MergedHTMLAttributes = Omit<
  React.HTMLAttributes<HTMLElement> &
    React.ButtonHTMLAttributes<HTMLElement> &
    React.AnchorHTMLAttributes<HTMLElement>,
  'type'
>;

export interface ButtonProps extends BaseButtonProps, MergedHTMLAttributes {
  href?: string;
  htmlType?: ButtonHTMLType;
  autoInsertSpace?: boolean;
}

interface LoadingConfigType {
  loading: boolean;
  delay: number;
}

function getLoadingConfig(loading: BaseButtonProps['loading']): LoadingConfigType {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay,
    };
  }

  return {
    loading: !!loading,
    delay: 0,
  };
}

const InternalCompoundedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    loading = false,
    prefixCls: customizePrefixCls,
    type,
    danger = false,
    shape = 'default',
    size: customizeSize,
    styles,
    disabled: customDisabled,
    className,
    rootClassName,
    children,
    icon,
    iconPosition = 'start',
    ghost = false,
    block = false,
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button',
    classNames: customClassNames,
    style: customStyle = {},
    autoInsertSpace,
    ...rest
  } = props;

  // https://github.com/ant-design/ant-design/issues/47605
  // Compatible with original `type` behavior
  const mergedType = type || 'default';

  const { getPrefixCls, direction, button } = useContext(ConfigContext);

  const mergedInsertSpace = autoInsertSpace ?? button?.autoInsertSpace ?? true;

  const prefixCls = getPrefixCls('btn', customizePrefixCls);

  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);

  const disabled = useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;

  const groupSize = useContext(GroupSizeContext);

  const loadingOrDelay = useMemo<LoadingConfigType>(() => getLoadingConfig(loading), [loading]);

  const [innerLoading, setLoading] = useState<boolean>(loadingOrDelay.loading);

  const [hasTwoCNChar, setHasTwoCNChar] = useState<boolean>(false);

  // eslint-disable-next-line react/no-create-ref
  const internalRef = createRef<HTMLButtonElement | HTMLAnchorElement>();

  const buttonRef = composeRef(ref, internalRef);

  const needInserted =
    Children.count(children) === 1 && !icon && !isUnBorderedButtonType(mergedType);

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    if (loadingOrDelay.delay > 0) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        setLoading(true);
      }, loadingOrDelay.delay);
    } else {
      setLoading(loadingOrDelay.loading);
    }

    function cleanupTimer() {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }

    return cleanupTimer;
  }, [loadingOrDelay]);

  useEffect(() => {
    // FIXME: for HOC usage like <FormatMessage />
    if (!buttonRef || !(buttonRef as any).current || !mergedInsertSpace) {
      return;
    }
    const buttonText = (buttonRef as any).current.textContent;
    if (needInserted && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  }, [buttonRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    // FIXME: https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)?.(e);
  };

  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Button');

    warning(
      !(typeof icon === 'string' && icon.length > 2),
      'breaking',
      `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
    );

    warning(
      !(ghost && isUnBorderedButtonType(mergedType)),
      'usage',
      "`link` or `text` button can't be a `ghost` button.",
    );
  }

  const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

  const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };

  const sizeFullName = useSize((ctxSize) => customizeSize ?? compactSize ?? groupSize ?? ctxSize);

  const sizeCls = sizeFullName ? sizeClassNameMap[sizeFullName] || '' : '';

  const iconType = innerLoading ? 'loading' : icon;

  const linkButtonRestProps = omit(rest as ButtonProps & { navigate: any }, ['navigate']);

  const classes = classNames(
    prefixCls,
    hashId,
    cssVarCls,
    {
      [`${prefixCls}-${shape}`]: shape !== 'default' && shape,
      [`${prefixCls}-${mergedType}`]: mergedType,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonType(mergedType),
      [`${prefixCls}-loading`]: innerLoading,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && mergedInsertSpace && !innerLoading,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-dangerous`]: danger,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-icon-end`]: iconPosition === 'end',
    },
    compactItemClassnames,
    className,
    rootClassName,
    button?.className,
  );

  const fullStyle: React.CSSProperties = { ...button?.style, ...customStyle };

  const iconClasses = classNames(customClassNames?.icon, button?.classNames?.icon);
  const iconStyle: React.CSSProperties = {
    ...(styles?.icon || {}),
    ...(button?.styles?.icon || {}),
  };

  const iconNode =
    icon && !innerLoading ? (
      <IconWrapper prefixCls={prefixCls} className={iconClasses} style={iconStyle}>
        {icon}
      </IconWrapper>
    ) : (
      <LoadingIcon existIcon={!!icon} prefixCls={prefixCls} loading={innerLoading} />
    );

  const kids =
    children || children === 0 ? spaceChildren(children, needInserted && mergedInsertSpace) : null;

  if (linkButtonRestProps.href !== undefined) {
    return wrapCSSVar(
      <a
        {...linkButtonRestProps}
        className={classNames(classes, {
          [`${prefixCls}-disabled`]: mergedDisabled,
        })}
        href={mergedDisabled ? undefined : linkButtonRestProps.href}
        style={fullStyle}
        onClick={handleClick}
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        tabIndex={mergedDisabled ? -1 : 0}
      >
        {iconNode}
        {kids}
      </a>,
    );
  }

  let buttonNode = (
    <button
      {...rest}
      type={htmlType}
      className={classes}
      style={fullStyle}
      onClick={handleClick}
      disabled={mergedDisabled}
      ref={buttonRef as React.Ref<HTMLButtonElement>}
    >
      {iconNode}
      {kids}
      {/* Styles: compact */}
      {!!compactItemClassnames && <CompactCmp key="compact" prefixCls={prefixCls} />}
    </button>
  );

  if (!isUnBorderedButtonType(mergedType)) {
    buttonNode = (
      <Wave component="Button" disabled={innerLoading}>
        {buttonNode}
      </Wave>
    );
  }
  return wrapCSSVar(buttonNode);
});

type CompoundedComponent = typeof InternalCompoundedButton & {
  Group: typeof Group;
  /** @internal */
  __ANT_BUTTON: boolean;
};

const Button = InternalCompoundedButton as CompoundedComponent;

Button.Group = Group;
Button.__ANT_BUTTON = true;

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}

export default Button;
