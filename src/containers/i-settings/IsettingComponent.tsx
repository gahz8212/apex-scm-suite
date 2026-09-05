import React, { useState } from 'react';
import { useDrag } from 'react-use-gesture';
import { useSelector } from 'react-redux';
import { itemData } from '../../store/slices/itemSlice';
import { SearchData } from '../../store/slices/searchSlice';
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



}

const IsettingComponent: React.FC<Props> = ({ input, edit, relate, openForm, changePosition, picker }) => {
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const { items } = useSelector(itemData);
    const { search } = useSelector(SearchData);

    const hasActiveFilters = Boolean(
        !search.all.typeALL ||
        !search.all.setALL ||
        !search.all.groupALL ||
        (search.sort && Object.values(search.sort).some((s: any) => s.active))
    );


    const inputPos = useDrag(params => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 340, params.offset[0] + 180));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('input', { x: nextX, y: nextY });
    });
    const editPos = useDrag(params => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 340, params.offset[0] + 180));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('edit', { x: nextX, y: nextY });
    });
    const pickerPos = useDrag(params => {
        const nextX = Math.max(10, Math.min(window.innerWidth - 450, params.offset[0] + 200));
        const nextY = Math.max(70, Math.min(window.innerHeight - 200, params.offset[1] + 120));
        changePosition('picker', { x: nextX, y: nextY });
    });



    return (
        <div className='isetting-wraper'>


            {input.visible && <div >
                <div {...inputPos()} style={{
                    color: 'white',
                    width: '300px',
                    position: 'fixed',
                    top: input.position.y,
                    left: input.position.x,
                    zIndex: 2,
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: input.position.y, left: input.position.x, zIndex: 1 }}>

                    <InputFormContainer />
                </div>
            </div>}

            {edit.visible && <div>
                <div {...editPos()} style={{ color: 'white', position: 'fixed', top: edit.position.y, left: edit.position.x, zIndex: 2, textAlign: 'center', width: '300px', boxSizing: 'border-box' }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: edit.position.y, left: edit.position.x, zIndex: 1 }}>
                    <EditFormContainer />
                </div>
            </div>}
            {picker.visible && <div>
                <div {...pickerPos()} style={{
                    color: 'white',
                    position: 'fixed',
                    top: picker.position.y,
                    left: picker.position.x,
                    zIndex: 2,
                    textAlign: 'center',
                    width: '300px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ width: '300px', padding: '1rem', userSelect: 'none' }}></div>
                </div>
                <div style={{ position: 'fixed', top: picker.position.y, left: picker.position.x, zIndex: 1 }}>
                    <ItemPickerContainer />
                </div>
            </div>}
            {relate.visible && <div style={{ position: 'fixed', top: relate.position.y + 40, left: relate.position.x - 130, zIndex: 1 }}>
                {/* <div {...relatePos()} style={{ color: 'black', position: 'fixed', top: relate.position.y, left: relate.position.x, zIndex: 2, textAlign: 'center', width: '300px' }}>
                    <span style={{ color: 'black', display: 'inline-block', width: '300px', padding: '.3rem', userSelect: 'none' }}>하위 아이템</span>
                </div>
                <div style={{ , top: relate.position.y, left: relate.position.x, zIndex: 1 }}>
                </div> */}
                <RelationContainer />
            </div>}
            {/* 우측 화면 가장자리 플로팅 검색 탭 */}
            <button
                type="button"
                className={`floating-search-tab ${isFilterDrawerOpen ? 'active' : ''}`}
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                title="품목 검색 및 정렬 필터 열기/닫기"
            >
                <span className="icon">🔍</span>
                <span className="text">검색 & 필터</span>
                {hasActiveFilters && <span className="active-dot" />}
            </button>

            {/* 상단 액션 툴바 */}
            <div className="isetting-header-bar">
                <div className="title-area">
                    <h2 className="title">품목 마스터 (Item Master)</h2>
                    <span className="count-badge">총 {items ? items.length : 0}개 품목</span>
                </div>
                <div className="actions-area">
                    <button
                        type="button"
                        className={`btn-search-toggle ${isFilterDrawerOpen ? 'active' : ''}`}
                        onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    >
                        <span className="icon">🔍</span>
                        <span>{isFilterDrawerOpen ? '검색창 닫기' : '품목 검색 & 필터'}</span>
                        {hasActiveFilters && <span className="active-badge">적용중</span>}
                    </button>
                    <button
                        type="button"
                        className="btn-create"
                        onClick={() => openForm('input')}
                    >
                        <span className="icon">+</span>
                        <span>신규 품목 등록</span>
                    </button>
                    <button
                        type="button"
                        className="btn-picker"
                        onClick={() => openForm('picker')}
                    >
                        <span className="icon">📦</span>
                        <span>BOM 자재 선택</span>
                    </button>
                </div>
            </div>

            {/* 오른쪽 끝에서 슥 하고 나타나는 슬라이드 필터 드로어 */}
            <ItemFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                placeholder="전체 품목 마스터 검색 (완성품/조립품/원자재)..."
                title="품목 마스터 검색 & 필터"
            />
            <CardContainer />
            <div style={{ height: '90px' }}></div>
            <span onClick={() => openForm('input')} className="material-symbols-outlined write">
                edit_document
            </span>
            <span onClick={() => openForm('picker')} className="material-symbols-outlined picker">
                edit_document
            </span>
        </div >
    );
};
export default IsettingComponent;