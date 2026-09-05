import React from 'react';
import styled from 'styled-components';
import { TrackingShipment } from '../../lib/api/tracking';

type Props = {
  shipment: TrackingShipment;
};

const STEPS = [
  { num: 1, key: 'PENDING_DOCS', title: '01 서류 마감', sub: 'S/I Cut-off' },
  { num: 2, key: 'TRUCKING_GATE_IN', title: '02 CY 반입', sub: 'Gate In' },
  { num: 3, key: 'LOADED', title: '03 선적 완료', sub: '출항 대기' },
  { num: 4, key: 'IN_TRANSIT', title: '04 해상 운송', sub: 'In Transit' },
  { num: 5, key: 'DELIVERED', title: '05 도착 완료', sub: 'Delivered' },
];

const TrackingStepper: React.FC<Props> = ({ shipment }) => {
  const currentStep = shipment.step || 1;

  const getStepDate = (num: number) => {
    switch (num) {
      case 1:
        return shipment.doc_closing_date ? shipment.doc_closing_date.split('T')[0] : '-';
      case 2:
        return shipment.cargo_closing_date ? shipment.cargo_closing_date.split('T')[0] : '-';
      case 3:
      case 4:
        return shipment.etd ? shipment.etd : '-';
      case 5:
        return shipment.eta ? shipment.eta : '-';
      default:
        return '-';
    }
  };

  return (
    <StepperCard>
      <StepperHeader>
        <HeaderLeft>
          <StatusBadge currentStep={currentStep}>{shipment.statusLabel}</StatusBadge>
          <DDayBadge>{shipment.dDayText}</DDayBadge>
        </HeaderLeft>
      </StepperHeader>

      <StepsTrack>
        {STEPS.map((step, idx) => {
          const isCompleted = step.num < currentStep;
          const isActive = step.num === currentStep;
          const isUpcoming = step.num > currentStep;
          const stepDate = getStepDate(step.num);

          return (
            <StepItem key={step.num} active={isActive} completed={isCompleted}>
              {/* Connector line */}
              {idx > 0 && <Connector completed={step.num <= currentStep} />}

              {/* Step Circle */}
              <StepCircle active={isActive} completed={isCompleted} upcoming={isUpcoming}>
                {isCompleted ? '✓' : step.num}
              </StepCircle>

              {/* Step Info */}
              <StepContent>
                <StepTitle active={isActive} completed={isCompleted}>
                  {step.title}
                </StepTitle>
                <StepSub>{step.sub}</StepSub>
                <StepDate active={isActive}>{stepDate}</StepDate>
                {isActive && <CurrentIndicator>현재 진행 단계</CurrentIndicator>}
              </StepContent>
            </StepItem>
          );
        })}
      </StepsTrack>

      <StatusDescBanner>
        <span>{shipment.statusDesc}</span>
      </StatusDescBanner>
    </StepperCard>
  );
};

export default TrackingStepper;

/* Styled Components */

const StepperCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StepperHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.span<{ currentStep: number }>`
  font-size: 0.95rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  background-color: ${(props) => (props.currentStep === 5 ? '#ecfdf5' : '#eff6ff')};
  color: ${(props) => (props.currentStep === 5 ? '#059669' : '#1d4ed8')};
  border: 1px solid ${(props) => (props.currentStep === 5 ? '#a7f3d0' : '#bfdbfe')};
`;

const DDayBadge = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 14px;
  background-color: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
`;


const StepsTrack = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  padding: 0 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.25rem;
  }
`;

const StepItem = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  text-align: center;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }
`;

const Connector = styled.div<{ completed: boolean }>`
  position: absolute;
  top: 20px;
  right: 50%;
  width: 100%;
  height: 3px;
  background-color: ${(props) => (props.completed ? '#2563eb' : '#e2e8f0')};
  z-index: -1;
  transition: background-color 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean; upcoming: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => (props.completed ? '1.2rem' : '1.1rem')};
  font-weight: 700;
  margin-bottom: 8px;
  transition: all 0.25s ease;

  ${(props) =>
    props.completed &&
    `
    background-color: #10b981;
    color: #ffffff;
    border: 3px solid #d1fae5;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  `}

  ${(props) =>
    props.active &&
    `
    background-color: #2563eb;
    color: #ffffff;
    border: 3px solid #bfdbfe;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    transform: scale(1.12);
  `}

  ${(props) =>
    props.upcoming &&
    `
    background-color: #f1f5f9;
    color: #94a3b8;
    border: 2px solid #e2e8f0;
  `}
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const StepTitle = styled.span<{ active: boolean; completed: boolean }>`
  font-size: 0.85rem;
  font-weight: ${(props) => (props.active ? '800' : '600')};
  color: ${(props) => (props.active ? '#1d4ed8' : props.completed ? '#0f172a' : '#94a3b8')};
`;

const StepSub = styled.span`
  font-size: 0.7rem;
  color: #64748b;
`;

const StepDate = styled.span<{ active: boolean }>`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${(props) => (props.active ? '#2563eb' : '#64748b')};
  margin-top: 2px;
`;

const CurrentIndicator = styled.span`
  margin-top: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  background-color: #eff6ff;
  color: #2563eb;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
`;

const StatusDescBanner = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #334155;
  font-weight: 500;
`;
