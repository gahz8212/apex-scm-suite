import React from 'react';
import CartonExcelComponent from './CartonExcelComponent';
import {
    generateCartonPackingExcel,
    CartonPackingItem,
    PalletDataType,
} from '../../../lib/services/excel/cartonService';

type Props = {
    packingData: CartonPackingItem[] | undefined;
    palletData: PalletDataType;
};

const CartonExcelContainer: React.FC<Props> = ({ packingData, palletData }) => {
    const makeCartonPacking = async (type: string) => {
        try {
            await generateCartonPackingExcel(type, packingData, palletData);
        } catch (e) {
            console.error('Failed to generate carton packing excel:', e);
        }
    };

    return (
        <div>
            <CartonExcelComponent
                makeCartonPacking={makeCartonPacking}
            />
        </div>
    );
};

export default CartonExcelContainer;