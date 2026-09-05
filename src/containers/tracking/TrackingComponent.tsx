import React from 'react';
import styled from 'styled-components';
import { TrackingShipment } from '../../lib/api/tracking';
import TrackingStepper from './TrackingStepper';

type Props = {
  shipments: TrackingShipment[];
  selectedShipment: TrackingShipment | null;
  onSelectShipment: (shipment: TrackingShipment) => void;
  filterTab: 'in-transit' | 'delivered';
  onChangeFilterTab: (tab: 'in-transit' | 'delivered') => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  loading: boolean;
  onRefresh: () => void;
  onOpenMap: () => void;
};

const TrackingComponent: React.FC<Props> = ({
  shipments,
  selectedShipment,
  onSelectShipment,
  filterTab,
  onChangeFilterTab,
  searchQuery,
  onChangeSearchQuery,
  loading,
  onRefresh,
  onOpenMap,
}) => {
  // Filter shipments by search query and tab
  const filteredShipments = shipments.filter((s) => {
    const isCompleted = s.step === 5 || s.statusKey === 'DELIVERED';
    const matchesTab = filterTab === 'delivered' ? isCompleted : !isCompleted;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesTab;

    const matchesQuery =
      (s.export_no && s.export_no.toLowerCase().includes(query)) ||
      (s.vessel_name && s.vessel_name.toLowerCase().includes(query)) ||
      (s.voyage && s.voyage.toLowerCase().includes(query)) ||
      (s.pod && s.pod.toLowerCase().includes(query));

    return matchesTab && matchesQuery;
  });

  const inTransitCount = shipments.filter((s) => s.step < 5).length;
  const deliveredCount = shipments.filter((s) => s.step === 5).length;

  return (
    <PageWrapper>
      <PageHeader>
        <HeaderInfo>
          <PageTitle>출고 화물 실시간 트래킹 (Shipment Tracking)</PageTitle>
          <PageSubtitle>
            출고넘버(EK-...)를 기반으로 선사(MSC) 마감일정 및 운항일정을 실시간 비교하여 현재 진행 상태를 자동 추적합니다.
          </PageSubtitle>
        </HeaderInfo>
        <HeaderActions>
          <RefreshButton type="button" onClick={onRefresh} disabled={loading}>
            {loading ? '동기화 중...' : '새로고침'}
          </RefreshButton>
        </HeaderActions>
      </PageHeader>

      <DashboardLayout>
        {/* Left: Shipment List Sidebar */}
        <Sidebar>
          {/* Search Box */}
          <SearchBoxWrapper>
            <SearchInput
              type="text"
              placeholder="출고넘버 (예: EK-260901) 또는 선박명 검색"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
            />
          </SearchBoxWrapper>

          {/* Filter Tabs */}
          <FilterTabs>
            <TabButton
              type="button"
              active={filterTab === 'in-transit'}
              onClick={() => onChangeFilterTab('in-transit')}
            >
              운송/진행 중 ({inTransitCount})
            </TabButton>
            <TabButton
              type="button"
              active={filterTab === 'delivered'}
              onClick={() => onChangeFilterTab('delivered')}
            >
              도착 완료 ({deliveredCount})
            </TabButton>
          </FilterTabs>

          {/* Shipment Card List */}
          <ShipmentList>
            {loading && shipments.length === 0 ? (
              <EmptyNotice>트래킹 데이터를 불러오는 중...</EmptyNotice>
            ) : filteredShipments.length > 0 ? (
              filteredShipments.map((s) => {
                const isSelected = selectedShipment?.export_no === s.export_no;
                return (
                  <ShipmentItemCard
                    key={s.export_no}
                    selected={isSelected}
                    onClick={() => onSelectShipment(s)}
                  >
                    <CardTopRow>
                      <ExportNoText>{s.export_no}</ExportNoText>
                      <DDayChip step={s.step}>{s.dDayText}</DDayChip>
                    </CardTopRow>

                    <CardVesselRow>
                      <CarrierBadge>{s.carrier || 'MSC'}</CarrierBadge>
                      <VesselNameText>
                        {s.vessel_name} / {s.voyage}
                      </VesselNameText>
                    </CardVesselRow>

                    <CardRouteRow>
                      <RoutePort>{s.pol || 'KRPUS'}</RoutePort>
                      <RouteArrow>➔</RouteArrow>
                      <RoutePort>{s.pod || 'USLGB'}</RoutePort>
                    </CardRouteRow>

                    <CardStatusRow>
                      <StepBadge step={s.step}>{s.statusLabel}</StepBadge>
                      <DateText>
                        {s.step >= 4 ? `ETA: ${s.eta || '-'}` : `ETD: ${s.etd || '-'}`}
                      </DateText>
                    </CardStatusRow>
                  </ShipmentItemCard>
                );
              })
            ) : (
              <EmptyNotice>
                {searchQuery ? '검색 결과가 없습니다.' : '해당 탭의 출고 건이 없습니다.'}
              </EmptyNotice>
            )}
          </ShipmentList>
        </Sidebar>

        {/* Right: Selected Shipment Detail */}
        <MainContent>
          {selectedShipment ? (
            <>
              {/* Top Banner */}
              <DetailBanner>
                <BannerLeft>
                  <BannerExportNo>{selectedShipment.export_no}</BannerExportNo>
                  <ShipperConsignee>
                    송하인: <strong>{selectedShipment.shipper || 'NEXUS ELECTRONICS'}</strong> ➔ 수하인:{' '}
                    <strong>{selectedShipment.consignee || 'GLOBAL DYNAMICS'}</strong>
                  </ShipperConsignee>
                </BannerLeft>
                <BannerRight>
                  <LiveMapButton type="button" onClick={onOpenMap}>
                    실시간 선박 위치 (AIS 맵)
                  </LiveMapButton>
                </BannerRight>
              </DetailBanner>

              {/* 5-Step Progress Stepper */}
              <TrackingStepper shipment={selectedShipment} />

              {/* Info Cards Grid */}
              <CardsGrid>
                {/* Vessel & Voyage Info Card */}
                <InfoCard>
                  <CardTitle>선박 및 운항 일정 (Vessel Schedule)</CardTitle>
                  <InfoList>
                    <InfoRow>
                      <InfoKey>운항 선박</InfoKey>
                      <InfoVal highlight>{selectedShipment.vessel_name}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>항차 번호 (Voyage)</InfoKey>
                      <InfoVal>{selectedShipment.voyage}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>선사 (Carrier)</InfoKey>
                      <InfoVal>{selectedShipment.carrier || 'MSC'}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>선박 식별 IMO</InfoKey>
                      <InfoVal>{selectedShipment.vessel_imo || '9755933'}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>출항일 (ETD)</InfoKey>
                      <InfoVal>{selectedShipment.etd || '-'} ({selectedShipment.pol})</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>도착일 (ETA)</InfoKey>
                      <InfoVal>{selectedShipment.eta || '-'} ({selectedShipment.pod})</InfoVal>
                    </InfoRow>
                  </InfoList>
                </InfoCard>

                {/* Deadlines & Summary Card */}
                <InfoCard>
                  <CardTitle>마감 기한 및 출하 내역 (Deadlines & Export)</CardTitle>
                  <InfoList>
                    <InfoRow>
                      <InfoKey>서류 마감 (S/I Cut-off)</InfoKey>
                      <InfoVal alert>
                        {selectedShipment.doc_closing_date
                          ? selectedShipment.doc_closing_date.replace('T', ' ').slice(0, 16)
                          : '선사 협의'}
                      </InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>CY 반입 마감 (Cargo Cut-off)</InfoKey>
                      <InfoVal alert>
                        {selectedShipment.cargo_closing_date
                          ? selectedShipment.cargo_closing_date.replace('T', ' ').slice(0, 16)
                          : '선사 협의'}
                      </InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>출하 품목 내역</InfoKey>
                      <InfoVal>{selectedShipment.item_summary || '등록된 출하 내역 없음'}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>출발항 / 도착항</InfoKey>
                      <InfoVal>
                        {selectedShipment.pol || 'KRPUS'} ➔ {selectedShipment.pod || 'USLGB'}
                      </InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>자동 판정 상태</InfoKey>
                      <InfoVal highlight>{selectedShipment.statusLabel}</InfoVal>
                    </InfoRow>
                  </InfoList>
                </InfoCard>
              </CardsGrid>
            </>
          ) : (
            <NoSelectionBox>
              <p>좌측 목록에서 출고넘버를 선택하여 트래킹 상태를 확인하세요.</p>
            </NoSelectionBox>
          )}
        </MainContent>
      </DashboardLayout>
    </PageWrapper>
  );
};

export default TrackingComponent;

/* Styled Components */

const PageWrapper = styled.div`
  width: 92%;
  max-width: 1400px;
  margin: calc(126px + 0.75rem) auto 4rem auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const RefreshButton = styled.button`
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: #f8fafc;
    border-color: #94a3b8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
`;

const SearchBoxWrapper = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.82rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }
`;

const FilterTabs = styled.div`
  display: flex;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 8px;
  font-size: 0.8rem;
  font-weight: ${(props) => (props.active ? '700' : '500')};
  color: ${(props) => (props.active ? '#1d4ed8' : '#64748b')};
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? '#2563eb' : 'transparent')};
  background: ${(props) => (props.active ? '#ffffff' : 'transparent')};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

const ShipmentList = styled.div`
  max-height: 650px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #f1f5f9;
`;

const ShipmentItemCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  background-color: ${(props) => (props.selected ? '#eff6ff' : '#ffffff')};
  border-left: 4px solid ${(props) => (props.selected ? '#2563eb' : 'transparent')};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${(props) => (props.selected ? '#eff6ff' : '#f8fafc')};
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const ExportNoText = styled.span`
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
`;

const DDayChip = styled.span<{ step: number }>`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  background-color: ${(props) => (props.step === 5 ? '#dcfce7' : '#fef3c7')};
  color: ${(props) => (props.step === 5 ? '#15803d' : '#b45309')};
`;

const CardVesselRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const CarrierBadge = styled.span`
  background-color: #0f172a;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
`;

const VesselNameText = styled.span`
  font-size: 0.8rem;
  color: #334155;
  font-weight: 600;
`;

const CardRouteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 8px;
`;

const RoutePort = styled.span`
  font-weight: 600;
`;

const RouteArrow = styled.span`
  color: #94a3b8;
`;

const CardStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StepBadge = styled.span<{ step: number }>`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${(props) => (props.step === 5 ? '#059669' : '#2563eb')};
`;

const DateText = styled.span`
  font-size: 0.72rem;
  color: #64748b;
`;

const EmptyNotice = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const DetailBanner = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const BannerLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BannerExportNo = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const ShipperConsignee = styled.p`
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;

  strong {
    color: #334155;
  }
`;

const BannerRight = styled.div`
  display: flex;
  gap: 8px;
`;

const LiveMapButton = styled.button`
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #1e293b;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
`;

const InfoKey = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const InfoVal = styled.span<{ highlight?: boolean; alert?: boolean }>`
  color: ${(props) => (props.alert ? '#dc2626' : props.highlight ? '#2563eb' : '#0f172a')};
  font-weight: 700;
  text-align: right;
`;

const NoSelectionBox = styled.div`
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 4rem 1rem;
  text-align: center;
  color: #94a3b8;

  p {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
  }
`;
