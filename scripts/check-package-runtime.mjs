import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Drawer, Sheet, Modal, AlertDialog, CommandSpotlight } from '../dist/index.js';

const noop = () => {};
for (const Component of [Drawer, Sheet, Modal, AlertDialog]) {
  for (const isOpen of [false, true]) {
    assert.doesNotThrow(() => renderToString(React.createElement(Component, {
      isOpen,
      title: 'Fictional review',
      onClose: noop,
      onCancel: noop,
      onConfirm: noop
    }, 'Fictional content')));
  }
}
for (const open of [false, true]) {
  assert.doesNotThrow(() => renderToString(React.createElement(CommandSpotlight, {
    open,
    actions: [],
    onOpenChange: noop
  })));
}
console.log('[check-package-runtime] Root import and five modal SSR contracts passed.');
