import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import { Alert } from '../../src/components/alert';
import { AlertDialog } from '../../src/components/alert-dialog';
import { CommandSpotlight } from '../../src/components/command-spotlight';
import { Drawer } from '../../src/components/drawer';
import { Modal } from '../../src/components/modal';
import { Sheet } from '../../src/components/sheet';
import { Sonner } from '../../src/components/sonner';

describe('server rendering of portal-only components', () => {
  test('Alert renders nothing without a document', () => {
    expect(renderToString(<Alert message='hi' onClose={() => undefined} />)).toBe('');
  });

  test('Sonner renders nothing without a document', () => {
    expect(renderToString(<Sonner />)).toBe('');
  });

  test.each([
    ['Modal', <Modal key='m' isOpen onClose={() => undefined} title='t'>x</Modal>],
    ['Sheet', <Sheet key='s' isOpen onClose={() => undefined}>x</Sheet>],
    ['Drawer', <Drawer key='d' isOpen onClose={() => undefined}>x</Drawer>],
    ['AlertDialog', <AlertDialog key='a' isOpen title='t' onConfirm={() => undefined} onCancel={() => undefined} />]
  ])('%s renders nothing without a document', (_name, element) => {
    expect(renderToString(element)).toBe('');
  });

  test('CommandSpotlight renders only its trigger on the server', () => {
    const html = renderToString(<CommandSpotlight actions={[]} open />);
    expect(html).toContain('Open command spotlight');
    expect(html).not.toContain('role="dialog"');
  });
});
