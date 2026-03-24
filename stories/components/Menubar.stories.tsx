import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Download, FilePlus, FileText, Printer, Save, Share, Trash2 } from 'lucide-react';

import { Menubar } from '../../src/components/menubar';

const meta = {
  component: Menubar,
  title: 'Components/Menubar',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [showRuler, setShowRuler] = React.useState(true);
    const [showGrid, setShowGrid] = React.useState(false);
    const [theme, setTheme] = React.useState('system');

    return (
      <Menubar
        menus={[
          {
            trigger: 'File',
            items: [
              { type: 'item', label: 'New file', icon: <FilePlus size={14} />, shortcut: '⌘N', onSelect: () => undefined },
              { type: 'item', label: 'Open...', icon: <FileText size={14} />, shortcut: '⌘O', onSelect: () => undefined },
              { type: 'separator' },
              { type: 'item', label: 'Save', icon: <Save size={14} />, shortcut: '⌘S', onSelect: () => undefined },
              { type: 'item', label: 'Save as...', shortcut: '⌘⇧S', onSelect: () => undefined },
              { type: 'separator' },
              { type: 'item', label: 'Print', icon: <Printer size={14} />, shortcut: '⌘P', onSelect: () => undefined }
            ]
          },
          {
            trigger: 'Edit',
            items: [
              { type: 'item', label: 'Copy', icon: <Copy size={14} />, shortcut: '⌘C', onSelect: () => undefined },
              { type: 'item', label: 'Download', icon: <Download size={14} />, shortcut: '⌘D', onSelect: () => undefined },
              { type: 'separator' },
              { type: 'item', label: 'Delete', icon: <Trash2 size={14} />, shortcut: '⌫', onSelect: () => undefined }
            ]
          },
          {
            trigger: 'View',
            items: [
              { type: 'checkbox', label: 'Show ruler', checked: showRuler, onCheckedChange: setShowRuler },
              { type: 'checkbox', label: 'Show grid', checked: showGrid, onCheckedChange: setShowGrid },
              { type: 'separator' },
              {
                type: 'radioGroup',
                value: theme,
                onValueChange: setTheme,
                items: [
                  { type: 'radio', value: 'light', label: 'Light' },
                  { type: 'radio', value: 'dark', label: 'Dark' },
                  { type: 'radio', value: 'system', label: 'System' }
                ]
              }
            ]
          },
          {
            trigger: 'Share',
            items: [
              { type: 'item', label: 'Share link', icon: <Share size={14} />, onSelect: () => undefined },
              {
                type: 'sub',
                label: 'Export as',
                items: [
                  { type: 'item', label: 'PDF', onSelect: () => undefined },
                  { type: 'item', label: 'PNG', onSelect: () => undefined },
                  { type: 'item', label: 'SVG', onSelect: () => undefined }
                ]
              }
            ]
          }
        ]}
      />
    );
  }
};
