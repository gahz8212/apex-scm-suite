import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ScheduleItem, searchSchedules, PortOption, getSchedulePorts } from '../../lib/api/schedule';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (schedule: ScheduleItem) => void;
  initialPol?: string;
  initialPod?: string;
};

const ScheduleSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  initialPol = 'KRPUS',
  initialPod = 'USLGB',
}) => {
  const [pol, setPol] = useState(initialPol);
  const [pod, setPod] = useState(initialPod);
  const [customToken, setCustomToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [portOptions, setPortOptions] = useState<{
    pols: PortOption[];
    pods: PortOption[];
  }>({
    pols: [
      { code: 'KRPUS', name: '부산 (KRPUS)' },
      { code: 'KRINC', name: '인천 (KRINC)' },
      { code: 'CNSHA', name: '상하이 (CNSHA)' },
    ],
    pods: [
      { code: 'USLGB', name: '롱비치 (USLGB)' },
      { code: 'USLAX', name: 'LA (USLAX)' },
      { code: 'USSEA', name: '시애틀 (USSEA)' },
      { code: 'NLRTM', name: '로테르담 (NLRTM)' },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch available ports on open
      getSchedulePorts()
        .then((res) => {
          if (res && res.pols && res.pods) {
            setPortOptions(res);
          }
        })
        .catch(() => {});

      // Auto-search on first open if not searched yet
      if (!hasSearched) {
        handleSearch(pol, pod);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSearch = async (targetPol = pol, targetPod = pod) => {
    if (!targetPol || !targetPod) {
      setErrorMsg('출발항(POL)과 도착항(POD)을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await searchSchedules({
        pol: targetPol,
        pod: targetPod,
        token: customToken.trim() || undefined,
      });

      setSchedules(res.data || []);
      setIsFallbackData(res.isFallback || false);
      setHasSearched(true);
    } catch (err: any) {
      console.error('스케줄 조회 에러:', err);
      setErrorMsg(err.response?.data?.message || '스케줄 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTransitDays = (etdStr: string | null, etaStr: string | null) => {
    if (!etdStr || !etaStr) return null;
    const etd = new Date(etdStr);
    const eta = new Date(etaStr);
    const diffTime = eta.getTime() - etd.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <div>
            <TitleRow>
              <TitleText>선박 스케줄 실시간 조회 (MSC)</TitleText>
              <LiveBadge isFallback={isFallbackData}>
                {isFallbackData ? '모의/캐시 데이터' : 'MSC 실시간 연동'}
              </LiveBadge>
            </TitleRow>
            <SubtitleText>
              선사 공식 운항 일정을 실시간 조회하여 출고 화면의 Vessel/Voy 및 서류에 자동 입력합니다.
            </SubtitleText>
          </div>
          <CloseButton type="button" onClick={onClose}>
            ✕
          </CloseButton>
        </ModalHeader>

        {/* Search Controls */}
        <SearchSection>
          <FormRow>
            {/* POL */}
            <FormGroup>
              <Label>출발항 (POL)</Label>
              <PortInputRow>
                <Select
                  value={pol}
                  onChange={(e) => {
                    setPol(e.target.value);
                  }}
                >
                  {portOptions.pols.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                  {!portOptions.pols.some((p) => p.code === pol) && (
                    <option value={pol}>{pol}</option>
                  )}
                </Select>
                <ChipGroup>
                  {portOptions.pols.map((p) => (
                    <Chip
                      key={p.code}
                      type="button"
                      active={pol === p.code}
                      onClick={() => {
                        setPol(p.code);
                        handleSearch(p.code, pod);
                      }}
                    >
                      {p.code}
                    </Chip>
                  ))}
                </ChipGroup>
              </PortInputRow>
            </FormGroup>

            <ArrowIcon>➔</ArrowIcon>

            {/* POD */}
            <FormGroup>
              <Label>도착항 (POD)</Label>
              <PortInputRow>
                <Select
                  value={pod}
                  onChange={(e) => {
                    setPod(e.target.value);
                  }}
                >
                  {portOptions.pods.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                  {!portOptions.pods.some((p) => p.code === pod) && (
                    <option value={pod}>{pod}</option>
                  )}
                </Select>
                <ChipGroup>
                  {portOptions.pods.map((p) => (
                    <Chip
                      key={p.code}
                      type="button"
                      active={pod === p.code}
                      onClick={() => {
                        setPod(p.code);
                        handleSearch(pol, p.code);
                      }}
                    >
                      {p.code}
                    </Chip>
                  ))}
                </ChipGroup>
              </PortInputRow>
            </FormGroup>

            {/* Submit Button */}
            <SearchButton
              type="button"
              disabled={loading}
              onClick={() => handleSearch(pol, pod)}
            >
              {loading ? (
                <>
                  <Spinner />
                  조회 중...
                </>
              ) : (
                '스케줄 조회'
              )}
            </SearchButton>
          </FormRow>

          {/* Optional Token Accordion */}
          <TokenToggleRow>
            <TokenToggleBtn
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
            >
              {showTokenInput ? '인증 쿠키 설정 닫기' : 'MSC 세션 쿠키 수동 설정 (선택)'}
            </TokenToggleBtn>
          </TokenToggleRow>

          {showTokenInput && (
            <TokenInputWrapper>
              <TokenInputLabel>
                MSC 세션 쿠키 또는 Bearer Token (미입력 시 서버 환경변수 기본값 사용)
              </TokenInputLabel>
              <TokenTextArea
                rows={2}
                placeholder="F12 Network 탭에서 복사한 MSC 쿠키 (msccargo#lang=ko-KR; ...)"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
              />
            </TokenInputWrapper>
          )}
        </SearchSection>

        {/* Error message */}
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

        {/* Results List */}
        <ResultsContainer>
          {loading ? (
            <LoadingBox>
              <BigSpinner />
              <LoadingText>MSC 선사로부터 실시간 최신 스케줄을 수집 중입니다...</LoadingText>
              <LoadingSub>선사 사이트의 보안 통신 및 노선 데이터를 처리하고 있습니다.</LoadingSub>
            </LoadingBox>
          ) : schedules.length > 0 ? (
            <ScheduleGrid>
              {schedules.map((item, idx) => {
                const transitDays = calculateTransitDays(item.etd, item.eta);
                return (
                  <ScheduleCard key={`${item.vesselName}-${item.voyage}-${idx}`}>
                    <CardHeader>
                      <VesselBlock>
                        <CarrierTag>{item.carrier || 'MSC'}</CarrierTag>
                        <VesselTitle>{item.vesselName}</VesselTitle>
                        <VoyageTag>Voy: {item.voyage}</VoyageTag>
                      </VesselBlock>
                      <LineText>{item.line}</LineText>
                    </CardHeader>

                    <CardBody>
                      <RouteRow>
                        <PortBox>
                          <PortType>출발 (POL)</PortType>
                          <PortName>{item.pol}</PortName>
                          <PortDate>ETD: {item.etd || '-'}</PortDate>
                        </PortBox>

                        <RouteDivider>
                          <TransitBadge>
                            {transitDays ? `${transitDays}일 소요` : '직항'}
                          </TransitBadge>
                          <DividerLine />
                        </RouteDivider>

                        <PortBox className="right">
                          <PortType>도착 (POD)</PortType>
                          <PortName>{item.pod}</PortName>
                          <PortDate>ETA: {item.eta || '-'}</PortDate>
                        </PortBox>
                      </RouteRow>

                      {/* Cut-off deadlines */}
                      <CutOffSection>
                        <CutOffTitle>마감 기한 (Cut-off Deadlines)</CutOffTitle>
                        <CutOffGrid>
                          <CutOffItem>
                            <CutOffLabel>서류 마감 (S/I)</CutOffLabel>
                            <CutOffValue highlight>
                              {item.docClosingDate ? item.docClosingDate : '선사 문의'}
                            </CutOffValue>
                          </CutOffItem>
                          <CutOffItem>
                            <CutOffLabel>CY 반입 마감</CutOffLabel>
                            <CutOffValue>
                              {item.cargoClosingDate ? item.cargoClosingDate : '선사 문의'}
                            </CutOffValue>
                          </CutOffItem>
                          <CutOffItem>
                            <CutOffLabel>VGM 마감</CutOffLabel>
                            <CutOffValue>
                              {item.metadata?.vgmCutOff
                                ? item.metadata.vgmCutOff.replace('T', ' ').slice(0, 16)
                                : '반입 전'}
                            </CutOffValue>
                          </CutOffItem>
                        </CutOffGrid>
                      </CutOffSection>
                    </CardBody>

                    <CardFooter>
                      <SelectBtn
                        type="button"
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        이 스케줄 선택 (적용)
                      </SelectBtn>
                    </CardFooter>
                  </ScheduleCard>
                );
              })}
            </ScheduleGrid>
          ) : hasSearched ? (
            <EmptyBox>
              <p>해당 구간({pol} ➔ {pod})에 검색된 운항 스케줄이 없습니다.</p>
              <span>출발/도착 항구를 변경하거나 잠시 후 다시 시도해 주세요.</span>
            </EmptyBox>
          ) : null}
        </ResultsContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default ScheduleSearchModal;

/* Styled Components */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.97);
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
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  background: #0f172a;
  color: #ffffff;
  border-bottom: 1px solid #1e293b;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const TitleText = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

const LiveBadge = styled.span<{ isFallback: boolean }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${(props) => (props.isFallback ? '#f59e0b' : '#10b981')};
  color: #ffffff;
  margin-left: 6px;
`;

const SubtitleText = styled.p`
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SearchSection = styled.div`
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const FormRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
`;

const PortInputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Select = styled.select`
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }
`;

const ChipGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const Chip = styled.button<{ active: boolean }>`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.active ? '#2563eb' : '#e2e8f0')};
  background-color: ${(props) => (props.active ? '#eff6ff' : '#ffffff')};
  color: ${(props) => (props.active ? '#1d4ed8' : '#64748b')};
  font-weight: ${(props) => (props.active ? '700' : '500')};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #94a3b8;
  }
`;

const ArrowIcon = styled.div`
  padding: 0 4px 10px 4px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #94a3b8;

  @media (max-width: 768px) {
    text-align: center;
    padding: 0;
  }
`;

const SearchButton = styled.button`
  height: 38px;
  padding: 0 1.25rem;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.15s ease;
  white-space: nowrap;
  margin-bottom: 24px;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

const TokenToggleRow = styled.div`
  margin-top: 8px;
`;

const TokenToggleBtn = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  padding: 2px 0;
  text-decoration: underline;

  &:hover {
    color: #2563eb;
  }
`;

const TokenInputWrapper = styled.div`
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
`;

const TokenInputLabel = styled.div`
  font-size: 0.72rem;
  color: #64748b;
  margin-bottom: 4px;
`;

const TokenTextArea = styled.textarea`
  width: 100%;
  padding: 6px;
  font-size: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  resize: vertical;
  box-sizing: border-box;
  font-family: monospace;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 8px 1.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-bottom: 1px solid #fca5a5;
`;

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  max-height: 520px;
  background-color: #f1f5f9;
`;

const ScheduleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ScheduleCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
`;

const VesselBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CarrierTag = styled.span`
  background-color: #0f172a;
  color: #f8fafc;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
`;

const VesselTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const VoyageTag = styled.span`
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
`;

const LineText = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RouteRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 10px 14px;
`;

const PortBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  &.right {
    align-items: flex-end;
  }
`;

const PortType = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
`;

const PortName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
`;

const PortDate = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
`;

const RouteDivider = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 0 1rem;
`;

const TransitBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  background-color: #e2e8f0;
  color: #475569;
  padding: 1px 8px;
  border-radius: 10px;
`;

const DividerLine = styled.div`
  width: 100%;
  height: 2px;
  background: repeating-linear-gradient(to right, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 8px);
`;

const CutOffSection = styled.div`
  background: #fdfdfd;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
`;

const CutOffTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
`;

const CutOffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CutOffItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const CutOffLabel = styled.span`
  font-size: 0.65rem;
  color: #64748b;
`;

const CutOffValue = styled.span<{ highlight?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => (props.highlight ? '#dc2626' : '#334155')};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`;

const SelectBtn = styled.button`
  background-color: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 12px;
`;

const LoadingText = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const LoadingSub = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;

  p {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 6px 0;
  }

  span {
    font-size: 0.75rem;
  }
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const BigSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
