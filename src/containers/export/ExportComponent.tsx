import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { response } from '../../store/slices/authSlice';
import InvoiceContainer from '../forms/invoiceForm/InvoiceContainer';
import PackingContainer from '../forms/packingListForm/PackingContainer';
import PalletContainer from '../forms/packingListForm/PalletContainer';
import { useDrag } from 'react-use-gesture';
import { calculatePackingData } from '../../lib/utils/calculatePackingData';
import ScheduleSearchModal from '../modals/ScheduleSearchModal';
import { ScheduleItem } from '../../lib/api/schedule';
import { syncExportShipment, confirmDispatch, cancelDispatch } from '../../lib/api/tracking';
import { itemActions } from '../../store/slices/itemSlice';

export const EXPORT_CBM_OPTIONS = ['0.1', '0.15', '0.3', '0.5', '1', '1.2'];

type Props = {
    model: string
    setModel: React.Dispatch<React.SetStateAction<string>>
    onChangeParts: (e: any) => void;
    onChangeOrder: (e: any) => void;
    onChangePicked: (e: any) => void;

    orderInput: React.LegacyRef<HTMLInputElement> | undefined;
    partsInput: React.LegacyRef<HTMLInputElement> | undefined;
    orderData: any[] | null;
    months: string[] | null;

    openInvoiceForm: () => void;
    openPackingForm: () => void;
    openAddItemForm: () => void;
    invoiceForm: { visible: boolean; position: { x: number; y: number } };
    packingForm: { visible: boolean; position: { x: number; y: number } };
    addItemForm: { visible: boolean; position: { x: number; y: number } };
    palletForm: { visible: boolean; position: { x: number; y: number } };
    changePosition: (form: string, position: { x: number, y: number }) => void;
    pickedData: {
        id: number;
        ItemId: number;
        check: boolean;
        itemName: string;
        im_price: number;
        ex_price: number;
        quantity: number;
        CT_qty: number;
        weight: number;
        cbm: number;
    }[] | null
    removePicked: (id: number) => void;
    partPackaging: { [key: number]: {} } | undefined
    setSelect: (select: boolean) => void;
    inputRepairToOrdersheet: (repair: {
        id: number;
        ItemId: number;
        check: boolean;
        itemName: string;
        month: string;
        quantity: number;
        description: string;
        category: string;
        unit: string;
        im_price: number
        ex_price: number;
        sets: string;
        weight: number;
        cbm: number;
        CT_qty: number;
        number1: number;
        use: boolean;

    }[]) => void;
    palletData?: {
        [key: number]: any[];
    };
}
const ExportComponent: React.FC<Props> = ({
    model,
    setModel,
    onChangeParts,
    onChangeOrder,
    orderInput,
    partsInput,
    orderData,
    months,
    invoiceForm,
    packingForm,
    addItemForm,
    palletForm,
    openInvoiceForm,
    openPackingForm,
    openAddItemForm,
    changePosition,
    pickedData,
    removePicked,
    onChangePicked,
    partPackaging,
    setSelect,
    inputRepairToOrdersheet,
    palletData
}) => {
    const [formZIndex, setFormZIndex] = useState<{ [key: string]: number }>({
        invoice: 30,
        packing: 32,
        pallet: 34,
    });

    type MonthShippingInfo = {
        exportNo: string;
        vesselVoy: string;
        selectedSchedule: ScheduleItem | null;
        isSaved: boolean;
        dispatchStatus?: 'TEMP' | 'CONFIRMED' | 'CANCELED';
        subMaterials?: any[];
    };

    const getSavedShippingForMonth = (
        map: { [month: string]: MonthShippingInfo },
        month: string
    ): MonthShippingInfo | undefined => {
        if (!month || !map) return undefined;
        if (map[month]) return map[month];
        const lower = month.toLowerCase();
        const foundKey = Object.keys(map).find(k => k.toLowerCase() === lower);
        return foundKey ? map[foundKey] : undefined;
    };

    const getInitialSubMaterialsForMonth = (
        month: string,
        basePickedData: any[],
        shippingMap: { [month: string]: MonthShippingInfo }
    ) => {
        const saved = getSavedShippingForMonth(shippingMap, month);
        if (saved && saved.isSaved) {
            if (saved.subMaterials && Array.isArray(saved.subMaterials)) {
                // Return ONLY the sub-materials that were saved and checked for this month!
                return saved.subMaterials.filter((item: any) => item.check);
            } else {
                // Legacy saved without subMaterials array: take only checked items from basePickedData for this month
                return (basePickedData || []).filter((p: any) => p.check).map((p: any) => ({
                    ...p,
                    quantity: p.quantity !== undefined && p.quantity !== null ? p.quantity : '',
                    CT_qty: p.CT_qty !== undefined && p.CT_qty !== null ? p.CT_qty : '',
                    weight: p.weight !== undefined && p.weight !== null ? p.weight : '',
                    cbm: p.cbm || '선택',
                }));
            }
        }

        // Unsaved month: do NOT show sub-materials that were already saved in other months!
        const savedItemIdsInOtherMonths = new Set<string>();
        Object.entries(shippingMap).forEach(([m, info]) => {
            if (m !== month && info && info.isSaved && Array.isArray(info.subMaterials)) {
                info.subMaterials.forEach((item: any) => {
                    if (item.check) {
                        savedItemIdsInOtherMonths.add(String(item.ItemId || item.id));
                    }
                });
            }
        });

        // Only include items from Item Master (pickedData) that were NOT already saved in another month
        return (basePickedData || [])
            .filter((p: any) => {
                const id = String(p.ItemId || p.id);
                return !savedItemIdsInOtherMonths.has(id);
            })
            .map((p: any) => ({
                ...p,
                check: true,
                quantity: p.quantity !== undefined && p.quantity !== null && p.quantity !== '' ? p.quantity : 1,
                CT_qty: p.CT_qty !== undefined && p.CT_qty !== null && p.CT_qty !== '' ? p.CT_qty : 1,
                weight: p.weight !== undefined && p.weight !== null && p.weight !== '' ? p.weight : 0,
                cbm: p.cbm && EXPORT_CBM_OPTIONS.includes(String(p.cbm)) ? String(p.cbm) : '선택',
            }));
    };

    const [savedMonthShipping, setSavedMonthShipping] = useState<{ [month: string]: MonthShippingInfo }>(() => {
        try {
            const saved = localStorage.getItem('apex_export_month_shipping');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load month shipping data', e);
        }
        return {};
    });

    const dispatch = useDispatch();
    const { auth } = useSelector(response);
    const isManagerOrAdmin = auth?.role === 'ADMIN' || auth?.role === 'MANAGER';
    const [isDispatching, setIsDispatching] = useState<boolean>(false);
    const [vesselVoy, setVesselVoy] = useState<string>('');
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
    const [exportNo, setExportNo] = useState<string>('');

    // 10번 Pallet(index 9)까지 사용하면 FCL, 아니면 무조건 LCL
    const isFcl = useMemo(() => {
        if (!palletData) return false;
        const pallet10 = palletData[9];
        const isPallet10Used = Array.isArray(pallet10) && pallet10.length > 0;
        const totalUsedPallets = Object.values(palletData).filter((p) => Array.isArray(p) && p.length > 0).length;
        return isPallet10Used || totalUsedPallets >= 10;
    }, [palletData]);

    const containerType = isFcl ? 'FCL' : 'LCL';

    const handleSelectSchedule = (schedule: ScheduleItem) => {
        setSelectedSchedule(schedule);
        setVesselVoy(`${schedule.vesselName} / ${schedule.voyage}`);
    };
    const bringToFront = (form: string) => {
        setFormZIndex(prev => {
            const currentZ = prev[form] || 30;
            const maxZ = Math.max(...Object.values(prev));
            if (currentZ === maxZ) return prev;
            return {
                ...prev,
                [form]: maxZ + 2,
            };
        });
    };
    const invoicePos = useDrag(({ movement: [mx, my], memo = [invoiceForm.position.x, invoiceForm.position.y] }) => {
        bringToFront('invoice');
        const nextX = Math.max(10, Math.min(window.innerWidth - 530, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('invoice', { x: nextX, y: nextY });
        return memo;
    });
    const packingPos = useDrag(({ movement: [mx, my], memo = [packingForm.position.x, packingForm.position.y] }) => {
        bringToFront('packing');
        const nextX = Math.max(10, Math.min(window.innerWidth - 530, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('packing', { x: nextX, y: nextY });
        return memo;
    });
    const palletPos = useDrag(({ movement: [mx, my], memo = [palletForm.position.x, palletForm.position.y] }) => {
        bringToFront('pallet');
        const nextX = Math.max(10, Math.min(window.innerWidth - 660, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('pallet', { x: nextX, y: nextY });
        return memo;
    });
    // const addItemPos = useDrag(params => {
    //     const nextX = Math.max(10, Math.min(window.innerWidth - 400, params.offset[0] + 100));
    //     const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
    //     changePosition('addItem', { x: nextX, y: nextY });
    // });
    // let dragItemKey = '';
    // let dragOverItemKey = ''
    // console.log(pickedData)
    let orderdata;
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const activeMonth = selectedMonth || (months && months.length > 0 ? months[0] : '');

    const productPackingData = useMemo(() => {
        if (!orderData || !activeMonth) return [];
        const packingItems = calculatePackingData(orderData, activeMonth);
        const map = new Map<string, any>();
        packingItems.forEach(p => {
            const existing = map.get(p.itemName);
            if (existing) {
                existing.quantity += p.quantity;
                existing.CT_qty += p.CT_qty;
            } else {
                const orderItem = orderData.find((o: any) => o.itemName === p.itemName);
                map.set(p.itemName, {
                    ...p,
                    itemName: p.itemName,
                    groupName: p.groupName || orderItem?.groupName,
                    quantity: p.quantity,
                    CT_qty: p.CT_qty,
                    weight: p.weight,
                    cbm: p.cbm,
                    moq: p.moq,
                    sets: p.sets,
                    ex_price: p.ex_price || orderItem?.ex_price || 0,
                    category: p.category || orderItem?.category || 'EDT'
                });
            }
        });
        return Array.from(map.values());
    }, [orderData, activeMonth]);

    const getDtName = (prod: any) => {
        if (prod.groupName) return prod.groupName;
        const fromOrder = orderData?.find((o: any) => o.itemName === prod.itemName)?.groupName;
        if (fromOrder) return fromOrder;
        if (prod.itemName) {
            const cleaned = prod.itemName.replace(/\s+(PRO|MINI|SMART)?\s*SET$/i, '').trim();
            if (cleaned) return cleaned;
        }
        return prod.itemName;
    };

    const [checkedProducts, setCheckedProducts] = useState<{ [itemName: string]: boolean }>({});
    const [productOverrides, setProductOverrides] = useState<{
        [itemName: string]: {
            quantity?: number | string;
            CT_qty?: number | string;
            weight?: number | string;
            cbm?: string;
        }
    }>({});

    const [activeSubMaterials, setActiveSubMaterials] = useState<any[]>(() => {
        return getInitialSubMaterialsForMonth(activeMonth, pickedData || [], savedMonthShipping);
    });

    const prevMonthRef = useRef<string | null>(null);
    const prevPickedLengthRef = useRef<number>(0);

    useEffect(() => {
        const monthChanged = prevMonthRef.current !== activeMonth;
        const pickedLoaded = prevPickedLengthRef.current === 0 && (pickedData?.length || 0) > 0;

        if (monthChanged || pickedLoaded) {
            prevMonthRef.current = activeMonth;
            prevPickedLengthRef.current = pickedData?.length || 0;

            setCheckedProducts({});
            setProductOverrides({});

            // 월 변경 시: 저장된 월이면 저장된 출고넘버와 Vessel/Voy 복원, 저장 안 된 월이면 빈칸!
            const savedInfo = getSavedShippingForMonth(savedMonthShipping, activeMonth);
            if (activeMonth && savedInfo && savedInfo.isSaved) {
                setExportNo(savedInfo.exportNo || '');
                setVesselVoy(savedInfo.vesselVoy || '');
                setSelectedSchedule(savedInfo.selectedSchedule || null);
            } else {
                setExportNo('');
                setVesselVoy('');
                setSelectedSchedule(null);
            }

            // 부자재: 저장된 월이면 저장된 부자재 복원, 저장 안 된 월이면 모두 빈칸/체크해제!
            if (activeMonth) {
                const initialSubs = getInitialSubMaterialsForMonth(activeMonth, pickedData || [], savedMonthShipping);
                setActiveSubMaterials(initialSubs);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMonth, savedMonthShipping, pickedData]);

    const savedInfo = getSavedShippingForMonth(savedMonthShipping, activeMonth);

    const isProductChecked = (itemName: string): boolean => {
        return checkedProducts[itemName] !== undefined ? checkedProducts[itemName] : true;
    };

    const handleSubMaterialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, id } = e.target;
        const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        if (isCheckbox || name === 'check') {
            if (!checked) {
                // 체크 해제 시 부자재 목록에서 아예 삭제/제외 처리 ("부자재 체크가 해제되는게 아니라 부자재가 아예 없어져야 하는거야")
                setActiveSubMaterials(prev => prev.filter(item => {
                    const matches = (item.ItemId !== undefined && String(item.ItemId) === String(id)) ||
                                    (item.id !== undefined && String(item.id) === String(id));
                    return !matches;
                }));
                return;
            }
        }

        setActiveSubMaterials(prev => prev.map(item => {
            const matches = (item.ItemId !== undefined && String(item.ItemId) === String(id)) ||
                            (item.id !== undefined && String(item.id) === String(id));
            if (!matches) return item;

            return {
                ...item,
                [name]: value,
            };
        }));
    };

    const handleRemoveSubMaterial = (id: any) => {
        setActiveSubMaterials(prev => prev.filter(item => {
            const matches = (item.ItemId !== undefined && String(item.ItemId) === String(id)) ||
                            (item.id !== undefined && String(item.id) === String(id));
            return !matches;
        }));
    };

    const currentExportData = useMemo(() => {
        if (!activeMonth) return [];

        const checkedProductItems = productPackingData
            .filter(prod => (checkedProducts[prod.itemName] !== undefined ? checkedProducts[prod.itemName] : true))
            .filter(prod => {
                const override = productOverrides[prod.itemName];
                const currentQty = override?.quantity !== undefined ? (override.quantity !== '' ? Number(override.quantity) : 0) : Number(prod.quantity);
                const currentCT = override?.CT_qty !== undefined ? (override.CT_qty !== '' ? Number(override.CT_qty) : 0) : Number(prod.CT_qty || 0);
                return currentQty > 0 || currentCT > 0;
            })
            .map(prod => {
                const override = productOverrides[prod.itemName];
                const currentQty = override?.quantity !== undefined ? (override.quantity !== '' ? Number(override.quantity) : 0) : Number(prod.quantity);
                const currentCT = override?.CT_qty !== undefined ? (override.CT_qty !== '' ? Number(override.CT_qty) : 0) : Number(prod.CT_qty || 0);
                const currentWeight = override?.weight !== undefined ? (override.weight !== '' ? Number(override.weight) : 0) : (prod.CT_qty && prod.weight ? Number((prod.CT_qty * prod.weight).toFixed(1)) : Number(prod.weight || 0));
                const currentCbm = override?.cbm !== undefined ? (Number(override.cbm) > 0 ? Number(override.cbm) : 0) : (Number(prod.cbm) > 0 ? Number(prod.cbm) : 0);
                const unitWeight = currentCT > 0 ? currentWeight / currentCT : (Number(prod.weight) || 0);

                return {
                    ...prod,
                    [activeMonth]: currentQty,
                    quantity: currentQty,
                    CT_qty: currentCT,
                    weight: unitWeight,
                    totalWeight: currentWeight,
                    cbm: currentCbm,
                    ex_price: Number(prod.ex_price) || 0,
                    sets: prod.sets || 'SET',
                    moq: prod.moq || (currentCT > 0 ? currentQty / currentCT : 0),
                    isSubMaterial: false,
                    isDirect: true
                };
            });

        const checkedSubMaterialItems = (activeSubMaterials || [])
            .filter(picked => picked.check)
            .filter(picked => {
                const qty = Number(picked.quantity);
                const ct = Number(picked.CT_qty);
                return (!isNaN(qty) && qty > 0) || (!isNaN(ct) && ct > 0);
            })
            .map(picked => {
                const qty = Number(picked.quantity) || 0;
                const ct = Number(picked.CT_qty) || 0;
                const wt = Number(picked.weight) || 0;
                const unitWeight = ct > 0 ? wt / ct : wt;
                const cbmVal = Number(picked.cbm) > 0 ? Number(picked.cbm) : 0;

                return {
                    ...picked,
                    [activeMonth]: qty,
                    quantity: qty,
                    CT_qty: ct,
                    weight: unitWeight,
                    totalWeight: wt,
                    cbm: cbmVal,
                    ex_price: Number(picked.ex_price) || 0,
                    sets: (picked as any).sets || 'EA',
                    moq: (picked as any).moq || (ct > 0 ? qty / ct : 0),
                    category: 'REPAIR',
                    isSubMaterial: true,
                    isDirect: true
                };
            });

        return [...checkedProductItems, ...checkedSubMaterialItems];
    }, [productPackingData, checkedProducts, productOverrides, activeSubMaterials, activeMonth]);

    const toggleProductCheck = (itemName: string) => {
        setCheckedProducts(prev => ({
            ...prev,
            [itemName]: !isProductChecked(itemName)
        }));
    };

    const handleProductQtyChange = (prod: any, value: string) => {
        if (value === '') {
            setProductOverrides(prev => ({
                ...prev,
                [prod.itemName]: {
                    ...prev[prod.itemName],
                    quantity: '',
                    CT_qty: '',
                    weight: ''
                }
            }));
            return;
        }
        const qty = Number(value);
        const ct = prod.moq > 0 ? Math.ceil(qty / prod.moq) : (prod.CT_qty || 1);
        const wt = prod.weight ? Number((ct * prod.weight).toFixed(1)) : (prod.weight || 0);
        setProductOverrides(prev => ({
            ...prev,
            [prod.itemName]: {
                ...prev[prod.itemName],
                quantity: qty,
                CT_qty: ct,
                weight: wt
            }
        }));
    };

    const handleProductCTChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                CT_qty: value === '' ? '' : Number(value)
            }
        }));
    };

    const handleProductWeightChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                weight: value === '' ? '' : Number(value)
            }
        }));
    };

    const handleProductCbmChange = (itemName: string, value: string) => {
        setProductOverrides(prev => ({
            ...prev,
            [itemName]: {
                ...prev[itemName],
                cbm: value
            }
        }));
    };

    const handleSelectAll = (select: boolean) => {
        setSelect(select);
        const newChecked: { [key: string]: boolean } = {};
        productPackingData.forEach(prod => {
            newChecked[prod.itemName] = select;
        });
        setCheckedProducts(newChecked);
        if (!select) {
            // 전체 취소 시 부자재 목록도 완전히 제거
            setActiveSubMaterials([]);
        } else {
            setActiveSubMaterials(prev => prev.map(item => ({
                ...item,
                check: true
            })));
        }
    };


    // const onDragStart = (index: number, column: number) => {
    //     dragItem.current = index;
    //     dragItemKey = months ? months[column] : '';
    // }
    // const onDragEnter = (index: number, column: number) => {
    //     dragOverItem.current = index;
    //     dragOverItemKey = months ? months[column] : '';
    // }
    // const onDrop = () => {
    //     const copyList: { [key: string]: number | string | null }[] = JSON.parse(JSON.stringify(orderData))
    //     copyList[dragOverItem.current][dragOverItemKey] = copyList[dragItem.current][dragItemKey];
    //     copyList[dragItem.current][dragItemKey] = null
    //     dragItem.current = null;
    //     dragOverItem.current = null;
    //     dispatch(OrderAction.getData(copyList))
    // }

    const filteredOrderData = useMemo(() => {
        if (!orderData) return [];
        if (!months || months.length === 0) return orderData;
        return orderData.filter(data => {
            return months.some(month => {
                const val = Number(data[month]);
                return !isNaN(val) && val > 0;
            });
        });
    }, [orderData, months]);

    orderdata = filteredOrderData?.map((data, tr) =>
        <div className='tr' key={data.id || data.itemName || tr}>
            <div className='td'>{data.itemName}</div>
            {months?.map((month, td) => {
                const val = Number(data[month]);
                return (
                    <div className='td' key={td}>
                        {!isNaN(val) && val > 0 ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                    </div>
                );
            })}
        </div>
    );
    // }
    return (
        <div className='export-wrapper'>
            {invoiceForm.visible && <div onMouseDown={() => bringToFront('invoice')}>
                <div {...invoicePos()} style={{
                    color: 'black',
                    position: 'fixed',
                    top: invoiceForm.position.y,
                    left: invoiceForm.position.x,
                    zIndex: formZIndex.invoice + 1,
                    textAlign: 'center',
                    width: '520px',
                    boxSizing: 'border-box',
                    cursor: 'grab'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: invoiceForm.position.y, left: invoiceForm.position.x, zIndex: formZIndex.invoice }}>
                    <InvoiceContainer
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
                        shippingInfo={selectedSchedule ? {
                            vesselVoy: vesselVoy,
                            carrier: selectedSchedule.carrier || 'MSC',
                            sailingDate: selectedSchedule.etd || undefined,
                            pol: selectedSchedule.pol,
                            pod: selectedSchedule.pod,
                        } : (vesselVoy ? { vesselVoy } : undefined)}
                    />
                </div>
            </div>}
            {packingForm.visible && <div onMouseDown={() => bringToFront('packing')}>
                <div {...packingPos()} style={{
                    color: 'black',
                    width: '520px',
                    position: 'fixed',
                    top: packingForm.position.y,
                    left: packingForm.position.x,
                    zIndex: formZIndex.packing + 1,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    cursor: 'grab'
                }}>
                    <div style={{ width: '520px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: packingForm.position.y, left: packingForm.position.x, zIndex: formZIndex.packing }}>
                    <PackingContainer
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
                    />
                </div>
            </div>}
            {palletForm.visible && <div onMouseDown={() => bringToFront('pallet')}>
                <div {...palletPos()} style={{
                    color: 'black',
                    width: '650px',
                    position: 'fixed',
                    top: palletForm.position.y,
                    left: palletForm.position.x,
                    zIndex: formZIndex.pallet + 1,
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    cursor: 'grab'

                }}>
                    <div style={{
                        width: '650px',
                        padding: '1rem',
                        userSelect: 'none',

                    }}></div>
                </div>
                <div style={{ position: 'fixed', top: palletForm.position.y, left: palletForm.position.x, zIndex: formZIndex.pallet }}>
                    <PalletContainer
                        selectedMonth={activeMonth}
                        exportData={currentExportData}
                    />
                </div>
            </div>}
            {/* {addItemForm.visible && <div>
                <div {...addItemPos()} style={{ color: 'black', position: 'fixed', top: addItemForm.position.y, left: addItemForm.position.x, zIndex: 3, textAlign: 'center', width: '300px' }}>
                    <span style={{ display: 'inline-block', width: '500px', fontWeight: '700', paddingTop: '0.5rem', userSelect: 'none', textAlign: "center" }}>ADD</span>
                </div>
                <div style={{ position: 'fixed', top: addItemForm.position.y, left: addItemForm.position.x, zIndex: 2 }}>
                    <AddItemContainer
                    // selectedMonth={selectedMonth}
                    />
                </div>
            </div>} */}

            {/* 상단 수출 물류 관리 헤더 배너 */}
            <div className="export-header-banner">
                <div className="banner-left">
                    <span className="banner-badge">EXPORT &amp; LOGISTICS</span>
                    <h2 className="banner-title">수출 물류 관리</h2>
                    <p className="banner-subtitle">
                        수주 오더 시트 기반 월별 출고 계획, 선적 명세 및 인보이스/패킹리스트 통합 관리
                    </p>
                </div>
                <div className="banner-right">
                    <div className="info-chip">
                        <span className="chip-label">기준 선적월:</span>
                        <span className="chip-val">{activeMonth || '-'}</span>
                    </div>
                    {savedInfo?.dispatchStatus && (
                        <span className={`dispatch-status-tag ${savedInfo.dispatchStatus}`}>
                            {savedInfo.dispatchStatus === 'CONFIRMED'
                                ? '✅ 출고 확정 완료'
                                : savedInfo.dispatchStatus === 'CANCELED'
                                ? '🚫 출고 취소'
                                : '📝 임시 저장'}
                        </span>
                    )}
                </div>
            </div>

            <div className="export-container">
                <div className="orderSheet">
                    <div className="card-header">
                        <div className="header-title">
                            <span className="material-symbols-outlined icon">table_view</span>
                            <h3>수주 오더 시트 (Order Sheet)</h3>
                            {filteredOrderData && filteredOrderData.length > 0 && (
                                <span className="badge-count">총 {filteredOrderData.length}개 품목</span>
                            )}
                        </div>
                        {isManagerOrAdmin && (
                            <div className="header-actions">
                                <label htmlFor="orders" className="btn-order-excel" title="수주 오더 시트 엑셀 업로드">
                                    <span className="material-symbols-outlined icon">upload_file</span>
                                    <span>Order 입력</span>
                                    <img src='/images/excel_btn.png' alt='excel' />
                                </label>
                                <input
                                    type="file"
                                    name="orders"
                                    id="orders"
                                    onChange={onChangeOrder}
                                    ref={orderInput}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='table'>
                        <div className='thead'>
                            <div className='tr'>
                                <div className='th model'>Item</div>
                                {months?.map((month, idx) => (
                                    <div className={`th ${activeMonth === month ? 'active' : ''}`} key={idx}>{month}</div>
                                ))}
                            </div>
                        </div>
                        <div className='tbody'>
                            {filteredOrderData && filteredOrderData.length > 0 ? (
                                React.Children.toArray(orderdata)
                            ) : (
                                <div className="empty-ordersheet">
                                    <span className="material-symbols-outlined empty-icon">assignment_late</span>
                                    <p>등록된 수주 오더 데이터가 없습니다.</p>
                                    <span>우측 상단의 [Order 입력]을 통해 엑셀 파일을 업로드해 주세요.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="summary">
                    <div className="card-header">
                        <div className="header-title">
                            <span className="material-symbols-outlined icon">local_shipping</span>
                            <h3>월별 선적 &amp; 출고 명세</h3>
                        </div>
                        <div className="header-actions">
                            {orderData && (
                                <>
                                    <button
                                        type="button"
                                        className="btn-doc-action btn-invoice"
                                        onClick={() => {
                                            bringToFront('invoice');
                                            openInvoiceForm();
                                        }}
                                        title="인보이스(Commercial Invoice) 양식 열기"
                                    >
                                        <span className="material-symbols-outlined icon">receipt_long</span>
                                        <span>인보이스 발행</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-doc-action btn-packing"
                                        onClick={() => {
                                            bringToFront('pallet');
                                            bringToFront('packing');
                                            openPackingForm();
                                        }}
                                        title="패킹리스트(Packing List) 및 팔레트 명세 양식 열기"
                                    >
                                        <span className="material-symbols-outlined icon">inventory_2</span>
                                        <span>패킹리스트 발행</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="selector">
                        <span className="selector-title">선적월 선택:</span>
                        <div className="month-pills">
                            {months?.map((month, index) =>
                                <button
                                    key={index}
                                    type="button"
                                    className={`month-pill ${month === activeMonth ? 'active' : ''}`}
                                    onClick={() => setSelectedMonth(month)}
                                >
                                    {month}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="view-mode-tabs">
                        <button
                            type="button"
                            className={`mode-tab ${model === 'parts' ? 'active' : ''}`}
                            onClick={() => setModel('parts')}
                        >
                            <span className="material-symbols-outlined">directions_boat</span>
                            <span>제품 및 출고 정보</span>
                        </button>
                        <button
                            type="button"
                            className={`mode-tab ${model === 'model' ? 'active' : ''}`}
                            onClick={() => setModel('model')}
                        >
                            <span className="material-symbols-outlined">build</span>
                            <span>부자재 명세 ({activeSubMaterials?.filter(p => p.check).length || 0})</span>
                        </button>
                    </div>

                    <div className={`sumTable ${model}`}>
                        <div className="arrow">
                            {<span className="material-symbols-outlined back" title="부자재 명세 보기" onClick={() => {
                                setModel('model')
                            }}>
                                arrow_back_ios
                            </span>}
                            {<span className="material-symbols-outlined forward" title="제품 및 출고 정보 보기" onClick={() => {
                                setModel('parts')
                            }}>
                                arrow_forward_ios
                            </span>}
                        </div>
                        <div className="modelTable">
                            <div className='repairs'>
                                <div className='header'>
                                </div>
                                <div className='body'>
                                    <div className="titles">
                                        <div className='title col-check'></div>
                                        <div className='title col-name'>부자재</div>
                                        <div className='title col-qty'>수량</div>
                                        <div className='title col-ct'>C/T</div>
                                        <div className='title col-weight'>Kg</div>
                                        <div className='title col-cbm'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {activeSubMaterials
                                            ?.filter(p => p.check)
                                            ?.filter(picked => {
                                                const qty = Number(picked.quantity);
                                                const ct = Number(picked.CT_qty);
                                                return (!isNaN(qty) && qty > 0) || (!isNaN(ct) && ct > 0);
                                            })
                                            ?.map((picked, index) => (
                                            <div className="items sub-material-row" key={picked.ItemId || picked.id || index}>
                                                <div className='item col-check'>
                                                    <input type="checkbox" name="check" id={String(picked.ItemId || picked.id)} checked={picked.check}
                                                        onChange={handleSubMaterialChange}
                                                    />
                                                </div>
                                                <div className={`item col-name ${picked.check ? 'selected' : ''}`} title={picked.itemName}>
                                                    <span className="badge-part">부자재</span>
                                                    <span className="name-text">{picked.itemName}</span>
                                                    {isManagerOrAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSubMaterial(picked.ItemId || picked.id);
                                                            }}
                                                            title="부자재 삭제"
                                                            style={{
                                                                marginLeft: 'auto',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#94a3b8',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                padding: '0 4px',
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                                <div className='item col-qty'>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''}
                                                        disabled={!picked.check}
                                                        onChange={handleSubMaterialChange}
                                                        className="input_box input_qty"
                                                    />
                                                </div>
                                                <div className='item col-ct'>
                                                    <input
                                                        type='number'
                                                        name="CT_qty"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.CT_qty !== undefined && picked.CT_qty !== null ? picked.CT_qty : ''}
                                                        disabled={!picked.check}
                                                        onChange={handleSubMaterialChange}
                                                        className='input_box input_ct'
                                                    />
                                                </div>
                                                <div className='item col-weight'>
                                                    <input
                                                        type='number'
                                                        name="weight"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.weight !== undefined && picked.weight !== null ? picked.weight : ''}
                                                        disabled={!picked.check}
                                                        onChange={handleSubMaterialChange}
                                                        className='input_box input_weight'
                                                    />
                                                </div>
                                                <div className='item col-cbm'>
                                                    <select
                                                        className='input_box sel_cbm'
                                                        name='cbm'
                                                        value={picked.cbm || '선택'}
                                                        id={String(picked.ItemId || picked.id)}
                                                        disabled={!picked.check}
                                                        onChange={handleSubMaterialChange}
                                                    >
                                                        <option value="선택">선택</option>
                                                        {EXPORT_CBM_OPTIONS.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="partsTable">

                            <div className='repairs'>
                                <div className='header' >
                                    <div className='input_types'>
                                        <div className='input_type'>
                                            <div>
                                                <label htmlFor='exNo'>출고넘버</label>
                                                {savedInfo?.dispatchStatus && (
                                                    <span className={`dispatch-status-tag ${savedInfo.dispatchStatus}`}>
                                                        {savedInfo.dispatchStatus === 'CONFIRMED'
                                                            ? '[출고확정: 재고차감완료]'
                                                            : savedInfo.dispatchStatus === 'CANCELED'
                                                            ? '[출고취소: 재고원복완료]'
                                                            : '[임시저장]'}
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                name="exNo"
                                                id="exNo"
                                                placeholder='EK-'
                                                value={exportNo}
                                                readOnly={!isManagerOrAdmin}
                                                onChange={(e) => isManagerOrAdmin && setExportNo(e.target.value)}
                                            />
                                        </div>
                                        <div className='input_type vessel_type'>
                                            <div>
                                                <label htmlFor='vess'>Vessel/Voy</label>
                                            </div>
                                            <input
                                                type="text"
                                                name="vess"
                                                id="vess"
                                                placeholder={isManagerOrAdmin ? "클릭하여 스케줄 선택" : "선박 스케줄 (조회 전용)"}
                                                value={vesselVoy}
                                                readOnly={!isManagerOrAdmin}
                                                onClick={() => isManagerOrAdmin && setIsScheduleModalOpen(true)}
                                                onChange={(e) => isManagerOrAdmin && setVesselVoy(e.target.value)}
                                            />
                                            {selectedSchedule && (
                                                <div className="vessel_info_preview" title="선택된 선박 스케줄 정보">
                                                    <span>ETD: {selectedSchedule.etd}</span>
                                                    {selectedSchedule.docClosingDate && (
                                                        <span> | S/I: {selectedSchedule.docClosingDate.split(' ')[0]}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='body'>
                                    <div className="titles">
                                        <div className='title col-check'></div>
                                        <div className='title col-name'>제품/부자재</div>
                                        <div className='title col-qty'>수량</div>
                                        <div className='title col-ct'>C/T</div>
                                        <div className='title col-weight'>Kg</div>
                                        <div className='title col-cbm'>cbm</div>
                                    </div>
                                    <div className="articles">
                                        {/* 1. 제품 목록 (좌측 월 데이터 발주 품목) */}
                                        {productPackingData
                                            ?.filter(prod => {
                                                const override = productOverrides[prod.itemName];
                                                const currentQty = override?.quantity !== undefined
                                                    ? (override.quantity !== '' ? Number(override.quantity) : 0)
                                                    : Number(prod.quantity || 0);
                                                const currentCT = override?.CT_qty !== undefined
                                                    ? (override.CT_qty !== '' ? Number(override.CT_qty) : 0)
                                                    : Number(prod.CT_qty || 0);
                                                return currentQty > 0 || currentCT > 0;
                                            })
                                            ?.map((prod, pIdx) => {
                                            const isChecked = isProductChecked(prod.itemName);
                                            const override = productOverrides[prod.itemName];

                                            const currentQty = override?.quantity !== undefined
                                                ? override.quantity
                                                : prod.quantity;

                                            const currentCT = override?.CT_qty !== undefined
                                                ? override.CT_qty
                                                : prod.CT_qty;

                                            const currentWeight = override?.weight !== undefined
                                                ? override.weight
                                                : (prod.CT_qty && prod.weight ? (prod.CT_qty * prod.weight).toFixed(1) : (prod.weight || 0));

                                            const currentCbm = override?.cbm !== undefined
                                                ? override.cbm
                                                : (prod.cbm ? String(prod.cbm) : '선택');

                                            return (
                                                <div
                                                    className="items product-row"
                                                    key={`prod-${pIdx}`}
                                                >
                                                    <div className='item col-check'>
                                                        <input
                                                            type="checkbox"
                                                            name="check"
                                                            id={`prod-check-${pIdx}`}
                                                            checked={isChecked}
                                                            disabled={!isManagerOrAdmin}
                                                            onChange={() => toggleProductCheck(prod.itemName)}
                                                        />
                                                    </div>
                                                    <div className={`item col-name ${isChecked ? 'selected' : ''}`} title={prod.itemName}>
                                                        <span className="badge-prod">제품</span>
                                                        <span className="name-text">{getDtName(prod)}</span>
                                                    </div>
                                                    <div className='item col-qty'>
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            value={currentQty !== undefined && currentQty !== null ? currentQty : ''}
                                                            disabled={!isChecked || !isManagerOrAdmin}
                                                            onChange={(e) => handleProductQtyChange(prod, e.target.value)}
                                                            className="input_box input_qty"
                                                        />
                                                    </div>
                                                    <div className='item col-ct'>
                                                        <input
                                                            type="number"
                                                            name="CT_qty"
                                                            value={currentCT !== undefined && currentCT !== null ? currentCT : ''}
                                                            disabled={!isChecked || !isManagerOrAdmin}
                                                            onChange={(e) => handleProductCTChange(prod.itemName, e.target.value)}
                                                            className="input_box input_ct"
                                                        />
                                                    </div>
                                                    <div className='item col-weight'>
                                                        <input
                                                            type="number"
                                                            name="weight"
                                                            value={currentWeight !== undefined && currentWeight !== null ? currentWeight : ''}
                                                            disabled={!isChecked || !isManagerOrAdmin}
                                                            onChange={(e) => handleProductWeightChange(prod.itemName, e.target.value)}
                                                            className="input_box input_weight"
                                                        />
                                                    </div>
                                                    <div className='item col-cbm'>
                                                        <select
                                                            className='input_box sel_cbm'
                                                            name='cbm'
                                                            value={currentCbm || '선택'}
                                                            disabled={!isChecked || !isManagerOrAdmin}
                                                            onChange={(e) => handleProductCbmChange(prod.itemName, e.target.value)}
                                                        >
                                                            <option value="선택">선택</option>
                                                            {EXPORT_CBM_OPTIONS.map((opt) => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* 2. 부자재 목록 (Item Master에서 선택한 부자재) */}
                                        {activeSubMaterials
                                            ?.filter(p => p.check)
                                            ?.filter(picked => {
                                                const qty = Number(picked.quantity);
                                                const ct = Number(picked.CT_qty);
                                                return (!isNaN(qty) && qty > 0) || (!isNaN(ct) && ct > 0);
                                            })
                                            ?.map((picked, index) => (
                                            <div className="items sub-material-row" key={picked.ItemId || picked.id || index}>
                                                <div className='item col-check'>
                                                    <input
                                                        type="checkbox"
                                                        name="check"
                                                        id={String(picked.ItemId || picked.id)}
                                                        checked={picked.check}
                                                        disabled={!isManagerOrAdmin}
                                                        onChange={handleSubMaterialChange}
                                                    />
                                                </div>
                                                <div className={`item col-name ${picked.check ? 'selected' : ''}`} title={picked.itemName}>
                                                    <span className="badge-part">부자재</span>
                                                    <span className="name-text">{picked.itemName}</span>
                                                    {isManagerOrAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSubMaterial(picked.ItemId || picked.id);
                                                            }}
                                                            title="부자재 삭제"
                                                            style={{
                                                                marginLeft: 'auto',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#94a3b8',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                padding: '0 4px',
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                                <div className='item col-qty'>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.quantity !== undefined && picked.quantity !== null ? picked.quantity : ''}
                                                        disabled={!picked.check || !isManagerOrAdmin}
                                                        onChange={handleSubMaterialChange}
                                                        className="input_box input_qty"
                                                    />
                                                </div>
                                                <div className='item col-ct'>
                                                    <input
                                                        type='number'
                                                        name="CT_qty"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.CT_qty !== undefined && picked.CT_qty !== null ? picked.CT_qty : ''}
                                                        disabled={!picked.check || !isManagerOrAdmin}
                                                        onChange={handleSubMaterialChange}
                                                        className='input_box input_ct'
                                                    />
                                                </div>
                                                <div className='item col-weight'>
                                                    <input
                                                        type='number'
                                                        name="weight"
                                                        id={String(picked.ItemId || picked.id)}
                                                        value={picked.weight !== undefined && picked.weight !== null ? picked.weight : ''}
                                                        disabled={!picked.check || !isManagerOrAdmin}
                                                        onChange={handleSubMaterialChange}
                                                        className='input_box input_weight'
                                                    />
                                                </div>
                                                <div className='item col-cbm'>
                                                    <select
                                                        className='input_box sel_cbm'
                                                        name='cbm'
                                                        value={picked.cbm || '선택'}
                                                        id={String(picked.ItemId || picked.id)}
                                                        disabled={!picked.check || !isManagerOrAdmin}
                                                        onChange={handleSubMaterialChange}
                                                    >
                                                        <option value="선택">선택</option>
                                                        {EXPORT_CBM_OPTIONS.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                                <div className='btns'>
                                    <button
                                        type='button'
                                        className='btn-select-all'
                                        onClick={() => handleSelectAll(true)}
                                    >
                                        전체 선택
                                    </button>
                                    <button
                                        type='button'
                                        className='btn-select-none'
                                        onClick={() => handleSelectAll(false)}
                                    >
                                        전체 취소
                                    </button>

                                    {/* 작업 권한(MANAGER, ADMIN)이 있을 때만 임시저장 및 출고확정/취소 버튼 노출 */}
                                    {isManagerOrAdmin ? (
                                        <>
                                            {/* 1. 임시저장 버튼 */}
                                            <button
                                        type='button'
                                        className='btn-save-temp'
                                        disabled={isDispatching}
                                        onClick={async () => {
                                            const currentMonth = activeMonth || '';
                                            const trimmedExportNo = exportNo ? exportNo.trim() : '';
                                            if (!trimmedExportNo || trimmedExportNo === 'EK-') {
                                                alert(`${currentMonth ? `[${currentMonth}월] ` : ''}출고넘버를 입력해 주세요. (예: EK-260905)`);
                                                return;
                                            }
                                            if (!vesselVoy || !vesselVoy.trim()) {
                                                alert(`${currentMonth ? `[${currentMonth}월] ` : ''}Vessel/Voy를 선택하거나 입력해 주세요.`);
                                                return;
                                            }

                                            // 부자재 오더시트 반영
                                            const checkedPicked = activeSubMaterials?.filter(data =>
                                                data.check && ((Number(data.quantity) || 0) > 0 || (Number(data.CT_qty) || 0) > 0)
                                            ) || [];
                                            const result = checkedPicked.map(data => ({
                                                id: data.id,
                                                ItemId: data.ItemId,
                                                check: data.check,
                                                itemName: data.itemName,
                                                month: currentMonth,
                                                quantity: data.quantity !== '' ? Number(data.quantity) : 0,
                                                description: '',
                                                category: 'REPAIR',
                                                unit: '$',
                                                im_price: data.im_price || 0,
                                                ex_price: data.ex_price || 0,
                                                sets: 'EA',
                                                weight: data.weight !== '' ? Number(data.weight) : 0,
                                                cbm: data.cbm && data.cbm !== '선택' ? Number(data.cbm) : 0,
                                                CT_qty: data.CT_qty !== '' ? Number(data.CT_qty) : 0,
                                                number1: 9,
                                                use: true,
                                            }));
                                            if (result.length > 0) {
                                                inputRepairToOrdersheet(result);
                                            }

                                            try {
                                                setIsDispatching(true);
                                                let vName = 'MSC VESSEL';
                                                let voy = 'V001';
                                                if (selectedSchedule) {
                                                    vName = selectedSchedule.vesselName;
                                                    voy = selectedSchedule.voyage;
                                                } else if (vesselVoy) {
                                                    const parts = vesselVoy.split('/');
                                                    vName = parts[0].trim() || 'MSC VESSEL';
                                                    voy = parts.length > 1 ? parts[1].trim() : 'V001';
                                                }

                                                const totalCbm = result.reduce((acc, curr) => acc + (Number(curr.cbm) || 0), 0).toFixed(2);
                                                const totalWeight = result.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0).toFixed(1);
                                                const summary = result.length > 0
                                                    ? `출하 임시저장 [${currentMonth}/${containerType}]: ${result.length}개 품목 (${totalCbm} CBM / ${totalWeight} kg)`
                                                    : `출하 등록 [${currentMonth}/${containerType}]: ${vName} (${voy})`;

                                                await syncExportShipment({
                                                    export_no: trimmedExportNo,
                                                    vessel_name: vName,
                                                    voyage: voy,
                                                    carrier: selectedSchedule?.carrier || 'MSC',
                                                    pol: selectedSchedule?.pol || 'KRPUS',
                                                    pod: selectedSchedule?.pod || 'USLGB',
                                                    etd: selectedSchedule?.etd || null,
                                                    eta: selectedSchedule?.eta || null,
                                                    doc_closing_date: selectedSchedule?.docClosingDate || null,
                                                    cargo_closing_date: selectedSchedule?.cargoClosingDate || null,
                                                    vessel_imo: selectedSchedule?.vesselImo || null,
                                                    item_summary: summary
                                                });

                                                if (currentMonth) {
                                                    const prevSaved = savedMonthShipping[currentMonth];
                                                    const updatedMap = {
                                                        ...savedMonthShipping,
                                                        [currentMonth]: {
                                                            exportNo: trimmedExportNo,
                                                            vesselVoy: vesselVoy.trim(),
                                                            selectedSchedule: selectedSchedule,
                                                            isSaved: true,
                                                            dispatchStatus: prevSaved?.dispatchStatus || ('TEMP' as const),
                                                            subMaterials: activeSubMaterials,
                                                        }
                                                    };
                                                    setSavedMonthShipping(updatedMap);
                                                    try {
                                                        localStorage.setItem('apex_export_month_shipping', JSON.stringify(updatedMap));
                                                    } catch (e) {
                                                        console.error('localStorage save error', e);
                                                    }
                                                }

                                                alert(`[${currentMonth}월] 출고 정보가 성공적으로 임시저장되었습니다.\n(출고넘버: ${trimmedExportNo} | 선박: ${vName} / ${voy})`);
                                            } catch (err: any) {
                                                console.error('임시저장 에러:', err);
                                                alert('출고 정보 임시저장 중 오류가 발생했습니다: ' + (err?.response?.data?.message || err.message));
                                            } finally {
                                                setIsDispatching(false);
                                            }
                                        }}
                                    >
                                        임시저장
                                    </button>

                                    {/* 2. 출고 확정 / 출고 취소 분기 버튼 */}
                                    {savedInfo?.dispatchStatus === 'CONFIRMED' ? (
                                        <button
                                            type='button'
                                            className='btn-cancel-dispatch'
                                            disabled={isDispatching}
                                            onClick={async () => {
                                                const currentMonth = activeMonth || '';
                                                const trimmedExportNo = exportNo ? exportNo.trim() : '';
                                                if (!trimmedExportNo) {
                                                    alert('출고 번호가 없습니다.');
                                                    return;
                                                }

                                                const confirmMsg = `[${currentMonth}월 출고 취소]\n출고넘버: ${trimmedExportNo}\n\n출고를 취소하시겠습니까?\nBOM 역전개로 차감되었던 모든 부품 재고가 원래대로 전량 원복(Rollback)됩니다.`;
                                                if (!window.confirm(confirmMsg)) {
                                                    return;
                                                }

                                                try {
                                                    setIsDispatching(true);
                                                    const res = await cancelDispatch(trimmedExportNo);

                                                    if (currentMonth) {
                                                        const updatedMap = {
                                                            ...savedMonthShipping,
                                                            [currentMonth]: {
                                                                ...savedMonthShipping[currentMonth],
                                                                dispatchStatus: 'CANCELED' as const,
                                                            }
                                                        };
                                                        setSavedMonthShipping(updatedMap);
                                                        localStorage.setItem('apex_export_month_shipping', JSON.stringify(updatedMap));
                                                    }

                                                    // 재고 리덕스 최신화
                                                    dispatch(itemActions.getItem());

                                                    alert(`[출고 취소 완료]\n출고가 정상적으로 취소되었습니다.\n(차감되었던 부품 총 ${res.data?.restoredItems?.length || 0}종 재고 전량 원복 완료)\n\n필요시 품목/수량을 수정하신 후 다시 [출고 확정]을 진행하시면 됩니다.`);
                                                } catch (err: any) {
                                                    console.error('출고 취소 에러:', err);
                                                    alert('출고 취소 중 오류가 발생했습니다: ' + (err?.response?.data?.message || err.message));
                                                } finally {
                                                    setIsDispatching(false);
                                                }
                                            }}
                                        >
                                            {isDispatching ? '원복 처리 중...' : '출고 취소 (재고 원복)'}
                                        </button>
                                    ) : (
                                        <button
                                            type='button'
                                            className='btn-confirm-dispatch'
                                            disabled={isDispatching}
                                            onClick={async () => {
                                                const currentMonth = activeMonth || '';
                                                const trimmedExportNo = exportNo ? exportNo.trim() : '';
                                                if (!trimmedExportNo || trimmedExportNo === 'EK-') {
                                                    alert(`${currentMonth ? `[${currentMonth}월] ` : ''}출고넘버를 먼저 입력해 주세요. (예: EK-260905)`);
                                                    return;
                                                }
                                                if (!vesselVoy || !vesselVoy.trim()) {
                                                    alert(`${currentMonth ? `[${currentMonth}월] ` : ''}Vessel/Voy를 먼저 선택하거나 입력해 주세요.`);
                                                    return;
                                                }

                                                // 1. 출고 대상 완제품(SET) 목록 수집
                                                const productsToDispatch = (productPackingData || [])
                                                    .filter(p => isProductChecked(p.itemName))
                                                    .map(p => {
                                                        const override = productOverrides[p.itemName];
                                                        const qty = override?.quantity !== undefined && override?.quantity !== ''
                                                            ? Number(override.quantity)
                                                            : Number(p.quantity) || 0;
                                                        return {
                                                            id: p.id,
                                                            itemName: p.itemName,
                                                            quantity: qty
                                                        };
                                                    })
                                                    .filter(p => p.quantity > 0);

                                                // 2. 출고 대상 부자재 목록 수집
                                                const subsToDispatch = (activeSubMaterials || [])
                                                    .filter(s => s.check)
                                                    .map(s => ({
                                                        id: s.id,
                                                        ItemId: s.ItemId,
                                                        itemName: s.itemName,
                                                        quantity: s.quantity !== '' ? Number(s.quantity) : 0
                                                    }))
                                                    .filter(s => s.quantity > 0);

                                                if (productsToDispatch.length === 0 && subsToDispatch.length === 0) {
                                                    alert('출고할 대상 완제품 또는 부자재가 없습니다.');
                                                    return;
                                                }

                                                const confirmMsg = `[${currentMonth}월 출고 확정 진행]\n출고넘버: ${trimmedExportNo}\n완제품: ${productsToDispatch.length}종 / 부자재: ${subsToDispatch.length}종\n\n출고를 확정하시겠습니까?\nBOM 역전개에 따라 소요되는 모든 원부자재 실물 재고가 자동 차감(Backflush)됩니다.`;
                                                if (!window.confirm(confirmMsg)) {
                                                    return;
                                                }

                                                try {
                                                    setIsDispatching(true);
                                                    const res = await confirmDispatch({
                                                        export_no: trimmedExportNo,
                                                        month: currentMonth,
                                                        products: productsToDispatch,
                                                        subMaterials: subsToDispatch
                                                    });

                                                    if (currentMonth) {
                                                        const updatedMap = {
                                                            ...savedMonthShipping,
                                                            [currentMonth]: {
                                                                exportNo: trimmedExportNo,
                                                                vesselVoy: vesselVoy.trim(),
                                                                selectedSchedule: selectedSchedule,
                                                                isSaved: true,
                                                                dispatchStatus: 'CONFIRMED' as const,
                                                                subMaterials: activeSubMaterials,
                                                            }
                                                        };
                                                        setSavedMonthShipping(updatedMap);
                                                        localStorage.setItem('apex_export_month_shipping', JSON.stringify(updatedMap));
                                                    }

                                                    // 재고 최신화
                                                    dispatch(itemActions.getItem());

                                                    if (res.data?.hasNegativeStock) {
                                                        const warnings = res.data.warningItems
                                                            .map((w: any) => `- ${w.itemName}: 현재고 ${w.currentStock} ➔ 차감 ${w.reqQty} (부족: -${w.shortage} EA)`)
                                                            .join('\n');
                                                        alert(`[출고 확정 완료 - 전산 재고 부족 주의]\n출고는 정상 처리되었으나, 다음 부품들의 재고가 부족하여 마이너스 재고로 반영되었습니다:\n\n${warnings}\n\n* 실물 생산 완료 후 전산 재고 정합성을 위해 즉시 추가 발주를 권장합니다.`);
                                                    } else {
                                                        alert(`[${currentMonth}월] 출고 확정이 성공적으로 완료되었습니다.\n(BOM 역전개 부품 총 ${res.data?.deductions?.length || 0}종 재고 자동 차감 완료)`);
                                                    }
                                                } catch (err: any) {
                                                    console.error('출고 확정 에러:', err);
                                                    alert('출고 확정 중 오류가 발생했습니다: ' + (err?.response?.data?.message || err.message));
                                                } finally {
                                                    setIsDispatching(false);
                                                }
                                            }}
                                        >
                                            {isDispatching ? '확정 처리 중...' : '출고 확정 (부품 차감)'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    padding: '7px 14px',
                                    background: '#f8fafc',
                                    borderRadius: '6px',
                                    border: '1px dashed #cbd5e1',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 500
                                }}>
                                    🔒 조회 전용 (출고 및 저장 권한 없음)
                                </span>
                            )}
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MSC 선박 스케줄 검색 모달 */}
            <ScheduleSearchModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSelect={handleSelectSchedule}
            />

        </div >
    );
};

export default ExportComponent;