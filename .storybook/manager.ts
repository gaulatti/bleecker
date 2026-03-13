import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

import logo from '../src/assets/logo.svg';

addons.setConfig({
  theme: create({
    base: 'light',
    brandImage: logo,
    brandTarget: '_self',
    brandTitle: 'bleecker',
    brandUrl: '/'
  })
});
