import client from './client';

export interface ScheduleItem {
  vesselName: string;
  voyage: string;
  line: string;
  carrier: string;
  pol: string;
  pod: string;
  etd: string | null;
  eta: string | null;
  docClosingDate?: string | null;
  cargoClosingDate?: string | null;
  vesselImo?: string | null;
  isFallback?: boolean;
  metadata?: {
    siCutOff?: string | null;
    cyCutOff?: string | null;
    vgmCutOff?: string | null;
    dangerousCutOff?: string | null;
    reeferCutOff?: string | null;
    originalCarrier?: string;
  };
}

export interface PortOption {
  code: string;
  name: string;
}

export interface PortDataResponse {
  pols: PortOption[];
  pods: PortOption[];
}

export const getSchedulePorts = async (): Promise<PortDataResponse> => {
  const response = await client.get('/schedule/ports');
  return response.data.data;
};

export const searchSchedules = async (params: {
  pol: string;
  pod: string;
  token?: string;
}): Promise<{ data: ScheduleItem[]; isFallback: boolean }> => {
  const response = await client.get('/schedule/search', { params });
  return {
    data: response.data.data,
    isFallback: response.data.isFallback,
  };
};
