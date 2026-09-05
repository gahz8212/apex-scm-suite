import React from 'react';
import styled from 'styled-components';
import { TrackingShipment } from '../../lib/api/tracking';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shipment: TrackingShipment | null;
};

const VesselMapModal: React.FC<Props> = ({ isOpen, onClose, shipment }) => {
  if (!isOpen || !shipment) return null;

  // IMO or default MMSI for live marine map
  const vesselName = shipment.vessel_name || 'MSC VESSEL';
  const vesselImo = shipment.vessel_imo || '9755933';
  const mapUrl = `https://www.vesselfinder.com/aismap?zoom=4&width=100%25&height=460&names=true&imo=${vesselImo}`;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderLeft>
            <div>
              <TitleRow>
                <TitleText>실시간 선박 위치 추적 (AIS Marine Map)</TitleText>
                <LiveTag>LIVE AIS</LiveTag>
              </TitleRow>
              <SubtitleText>
                모선: <strong>{vesselName}</strong> | IMO: {vesselImo} | 항차: {shipment.voyage} ({shipment.pol} ➔ {shipment.pod})
              </SubtitleText>
            </div>
          </HeaderLeft>
          <CloseButton type="button" onClick={onClose}>
            ✕
          </CloseButton>
        </ModalHeader>

        <MapFrameWrapper>
          <iframe
            title="AIS Vessel Map"
            src={mapUrl}
            width="100%"
            height="460"
            frameBorder="0"
            scrolling="no"
          />
        </MapFrameWrapper>

        <ModalFooter>
          <InfoItem>
            <span className="label">출항일 (ETD):</span>
            <span className="value">{shipment.etd || '-'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">도착예정일 (ETA):</span>
            <span className="value">{shipment.eta || '-'}</span>
          </InfoItem>
          <InfoItem>
            <span className="label">현재 상태:</span>
            <span className="value highlight">{shipment.statusLabel} ({shipment.dDayText})</span>
          </InfoItem>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default VesselMapModal;

/* Styled Components */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 960px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  animation: popIn 0.2s ease-out;

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #0f172a;
  color: #ffffff;
  border-bottom: 1px solid #1e293b;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleText = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

const LiveTag = styled.span`
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const SubtitleText = styled.p`
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 2px 0 0 0;

  strong {
    color: #38bdf8;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MapFrameWrapper = styled.div`
  width: 100%;
  height: 460px;
  background-color: #0f172a;
  position: relative;

  iframe {
    border: none;
    display: block;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.9rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;

  .label {
    color: #64748b;
    font-weight: 500;
  }

  .value {
    color: #0f172a;
    font-weight: 700;

    &.highlight {
      color: #2563eb;
    }
  }
`;
