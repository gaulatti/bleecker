import React from 'react';
import { BroadcastHeader } from './broadcast-header';
import { ChyronHolder } from './chyron-holder';
import { LiveIndicator } from './live-indicator';
import { QRCodeWidget } from './qr-code-widget';
import { Ticker } from './ticker';

export interface BroadcastLayoutProps {
  children?: React.ReactNode;
  headerTitle?: string;
  headerDate?: string;
  hashtag?: string;
  url?: string;
  chyronText?: string;
  showChyron?: boolean;
  qrCodeUrl?: string;
  qrCodeContent?: string;
  /** The clock, top left. The host supplies it: it owns where the time comes from. */
  clock?: React.ReactNode;
  showLiveIndicator?: boolean;
}

/** The fixed 1920x1080 broadcast frame: header, clock, QR code, live indicator, content, chyron and ticker. */
export const BroadcastLayout: React.FC<BroadcastLayoutProps> = ({
  children,
  headerTitle,
  headerDate,
  hashtag,
  url,
  chyronText,
  showChyron = false,
  qrCodeUrl,
  qrCodeContent,
  clock,
  showLiveIndicator = true
}) => {
  return (
    <div className='broadcast-layout'>
      <BroadcastHeader title={headerTitle} date={headerDate} />
      {clock}
      {qrCodeUrl || qrCodeContent ? <QRCodeWidget qrCodeUrl={qrCodeUrl} content={qrCodeContent} /> : null}
      {showLiveIndicator && <LiveIndicator />}
      <div className='broadcast-content'>{children}</div>
      <ChyronHolder text={chyronText} show={showChyron} />
      <Ticker hashtag={hashtag} url={url} />
    </div>
  );
};
