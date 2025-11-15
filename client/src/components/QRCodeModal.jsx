import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import logo from '../icons/uto-labs-logo4x.png';
import './QRCodeModal.css';

/**
 * QRCodeModal - Shows QR code for mobile access to AI Assistant
 * Used when device doesn't have webcam or user prefers mobile access
 */
function QRCodeModal({ isOpen, onClose, url }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>×</button>
        
        <div className="qr-modal-header">
          <img src={logo} alt="Uto Labs" className="qr-modal-logo" />
          <h2 className="qr-modal-title">AI Assistant Access</h2>
          <p className="qr-modal-subtitle">Scan to analyze your plant</p>
        </div>

        <div className="qr-modal-body">
          <canvas ref={canvasRef} className="qr-modal-canvas"></canvas>
          <p className="qr-modal-instruction">
            Open your phone camera and scan this QR code to access the AI plant assistant
          </p>
          <div className="qr-modal-url">
            <code>{url}</code>
          </div>
        </div>

        <button className="qr-modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default QRCodeModal;
