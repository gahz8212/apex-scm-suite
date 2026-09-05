import client from './client';

export interface TrackingEvent {
  step: number;
  title: string;
  date: string;
  completed: boolean;
  active: boolean;
  desc: string;
}

export interface TrackingShipment {
  id?: number;
  export_no: string;
  vessel_name: string;
  voyage: string;
  carrier: string;
  pol: string;
  pod: string;
  etd: string | null;
  eta: string | null;
  doc_closing_date: string | null;
  cargo_closing_date: string | null;
  vessel_imo: string | null;
  shipper?: string;
  consignee?: string;
  item_summary?: string | null;
  step: number; // 1 to 5
  statusKey: 'PENDING_DOCS' | 'TRUCKING_GATE_IN' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED';
  statusLabel: string;
  statusDesc: string;
  dDayText: string;
  events?: TrackingEvent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncExportPayload {
  export_no: string;
  vessel_name?: string;
  voyage?: string;
  carrier?: string;
  pol?: string;
  pod?: string;
  etd?: string | null;
  eta?: string | null;
  doc_closing_date?: string | null;
  cargo_closing_date?: string | null;
  vessel_imo?: string | null;
  item_summary?: string | null;
}

export const getAllShipments = async (): Promise<TrackingShipment[]> => {
  const response = await client.get('/tracking/all');
  return response.data.data;
};

export const getShipmentByExportNo = async (exportNo: string): Promise<TrackingShipment> => {
  const response = await client.get(`/tracking/${encodeURIComponent(exportNo)}`);
  return response.data.data;
};

export const syncExportShipment = async (payload: SyncExportPayload): Promise<TrackingShipment> => {
  const response = await client.post('/tracking/sync-export', payload);
  return response.data.data;
};
