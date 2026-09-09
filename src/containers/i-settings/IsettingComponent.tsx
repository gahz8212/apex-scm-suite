import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { response } from '../../store/slices/authSlice';
import { useDrag } from 'react-use-gesture';
import InputFormContainer from '../forms/inputForm/InputFormContainer';
import EditFormContainer from "../forms/editForm/EditFormContainer";
import CardContainer from '../common/card/CardContainer';
import RelationContainer from '../forms/relationForm/RelationContainer';
import ItemPickerContainer from '../forms/itemPicker/ItemPickerContainer';
import ItemFilterDrawer from '../search/ItemFilterDrawer';

type Props = {
    input: { visible: boolean; position: { x: number; y: number } };
    edit: { visible: boolean; position: { x: number; y: number } };
    relate: { visible: boolean; position: { x: number; y: number } };
    picker: { visible: boolean; position: { x: number; y: number } };
    changePosition: (form: string, position: { x: number, y: number }) => void;
    openForm: (form: string) => void;
    onChangeItem?: (e: any) => void;
    itemsInput?: React.LegacyRef<HTMLInputElement>;
}

const IsettingComponent: React.FC<Props> = ({
    input,
    edit,
    relate,
    openForm,
    changePosition,
    picker,
    onChangeItem,
    itemsInput,
}) => {
    const { auth } = useSelector(response);
    const isManagerOrAdmin = auth?.role === 'ADMIN' || auth?.role === 'MANAGER';
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);


    const inputPos = useDrag(({ movement: [mx, my], memo = [input.position.x, input.position.y] }) => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 400, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('input', { x: nextX, y: nextY });
        return memo;
    });
    const editPos = useDrag(({ movement: [mx, my], memo = [edit.position.x, edit.position.y] }) => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 400, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('edit', { x: nextX, y: nextY });
        return memo;
    });
    const pickerPos = useDrag(({ movement: [mx, my], memo = [picker.position.x, picker.position.y] }) => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 500, memo[0] + mx));
        const nextY = Math.max(50, Math.min(window.innerHeight - 100, memo[1] + my));
        changePosition('picker', { x: nextX, y: nextY });
        return memo;
    });



    return (
        <div className='isetting-wraper'>


            {input.visible && (
                <div style={{ position: 'fixed', top: input.position.y, left: input.position.x, zIndex: 1000 }}>
                    <div {...inputPos()} style={{ color: 'white', position: 'absolute', top: 0, left: 0, zIndex: 1001, textAlign: 'center', width: '340px', cursor: 'grab' }}>
                        <div style={{ width: '340px', height: '44px', userSelect: 'none' }}></div>
                    </div>
                    <InputFormContainer />
                </div>
            )}

            {edit.visible && (
                <div style={{ position: 'fixed', top: edit.position.y, left: edit.position.x, zIndex: 1000 }}>
                    <div {...editPos()} style={{ color: 'white', position: 'absolute', top: 0, left: 0, zIndex: 1001, textAlign: 'center', width: '340px', cursor: 'grab' }}>
                        <div style={{ width: '340px', height: '44px', userSelect: 'none' }}></div>
                    </div>
                    <EditFormContainer />
                </div>
            )}
            {picker.visible && (
                <div style={{ position: 'fixed', top: picker.position.y, left: picker.position.x, zIndex: 1000 }}>
                    <div {...pickerPos()} style={{ color: 'white', position: 'absolute', top: 0, left: 0, zIndex: 1001, textAlign: 'center', width: '430px', cursor: 'grab' }}>
                        <div style={{ width: '430px', height: '44px', userSelect: 'none' }}></div>
                    </div>
                    <ItemPickerContainer />
                </div>
            )}
            {relate.visible && <div style={{ position: 'fixed', top: relate.position.y + 40, left: relate.position.x - 130, zIndex: 1 }}>
                {/* <div {...relatePos()} style={{ color: 'black', position: 'fixed', top: relate.position.y, left: relate.position.x, zIndex: 2, textAlign: 'center', width: '300px' }}>
                    <span style={{ color: 'black', display: 'inline-block', width: '300px', padding: '.3rem', userSelect: 'none' }}>하위 아이템</span>
                </div>
                <div style={{ , top: relate.position.y, left: relate.position.x, zIndex: 1 }}>
                </div> */}
                <RelationContainer />
            </div>}

            {/* 상단 품목 마스터 헤더 배너 & 액션 툴바 */}
            <div className="isetting-header-banner">
                <div className="banner-left">
                    <span className="banner-badge">ITEM MASTER MANAGEMENT</span>
                    <h2 className="banner-title">품목 마스터 관리</h2>
                    <p className="banner-subtitle">
                        전체 완성품, 조립품(Assy), 원부자재 제원 및 재고 통합 관리
                    </p>
                </div>
                {isManagerOrAdmin && (
                    <div className="banner-actions">
                        <label htmlFor="itemMasterFile" className="btn-item-excel" title="엑셀 품목 리스트 일괄 업로드">
                            <span className="material-symbols-outlined icon">upload_file</span>
                            <span>아이템 엑셀 입력</span>
                            <img src='/images/excel_btn.png' alt='excel' />
                        </label>
                        <input
                            type="file"
                            name="itemMasterFile"
                            id="itemMasterFile"
                            onChange={onChangeItem}
                            ref={itemsInput}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="btn-item-create"
                            onClick={() => openForm('input')}
                            title="새 품목 등록 양식 열기"
                        >
                            <span className="material-symbols-outlined icon">add_circle</span>
                            <span>신규 품목 등록</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 오른쪽 끝에서 슥 하고 나타나는 슬라이드 필터 드로어 */}
            <ItemFilterDrawer
                isOpen={isFilterDrawerOpen}
                onToggle={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                onClose={() => setIsFilterDrawerOpen(false)}
                placeholder="전체 품목 마스터 검색 (완성품/조립품/원자재)..."
                title="품목 마스터 검색 & 필터"
            />
            <CardContainer />
            <div style={{ height: '90px' }}></div>
            {isManagerOrAdmin && (
                <>
                    <span onClick={() => openForm('input')} className="material-symbols-outlined write" title="신규 품목 등록">
                        edit_document
                    </span>
                    <span onClick={() => openForm('picker')} className="material-symbols-outlined picker" title="품목 선택 등록">
                        edit_document
                    </span>
                </>
            )}
        </div >
    );
};
export default IsettingComponent;