import type { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import * as SolidIcons from 'react-native-heroicons/solid';
import * as OutlineIcons from 'react-native-heroicons/outline';

type IconName = keyof typeof SolidIcons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  variant = 'solid',
  style,
}) => {
  const IconComponent = variant === 'outline' ? OutlineIcons[name] : SolidIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ${variant} set.`);
    return null;
  }

  return <IconComponent size={size} color={color} style={style} />;
};
