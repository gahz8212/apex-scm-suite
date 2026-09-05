import React, { useState, useEffect, useCallback } from 'react';
import { getAllShipments, TrackingShipment } from '../../lib/api/tracking';
import TrackingComponent from './TrackingComponent';
import VesselMapModal from './VesselMapModal';

const TrackingContainer: React.FC = () => {
  const [shipments, setShipments] = useState<TrackingShipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<TrackingShipment | null>(null);
  const [filterTab, setFilterTab] = useState<'in-transit' | 'delivered'>('in-transit');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllShipments();
      setShipments(data || []);

      // If no shipment selected yet, or selected one no longer exists, select first
      if (data && data.length > 0) {
        setSelectedShipment((prev) => {
          if (!prev) return data[0];
          const found = data.find((s) => s.export_no === prev.export_no);
          return found || data[0];
        });
      }
    } catch (err) {
      console.error('트래킹 목록 조회 에러:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleSelectShipment = (shipment: TrackingShipment) => {
    setSelectedShipment(shipment);
  };

  const handleOpenMap = () => {
    setIsMapOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  return (
    <>
      <TrackingComponent
        shipments={shipments}
        selectedShipment={selectedShipment}
        onSelectShipment={handleSelectShipment}
        filterTab={filterTab}
        onChangeFilterTab={setFilterTab}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        loading={loading}
        onRefresh={fetchShipments}
        onOpenMap={handleOpenMap}
      />

      <VesselMapModal
        isOpen={isMapOpen}
        onClose={handleCloseMap}
        shipment={selectedShipment}
      />
    </>
  );
};

export default TrackingContainer;
