import React, { useRef } from 'react';

type Props = {

    onChange: (e: any) => void;
    onCheck: (e: any) => void;
    // onSortChange: (e: any, orders: { name: string, sorting: string }[]) => void;
    search: {
        all: {
            typeALL: boolean;
            setALL: boolean;
            groupALL: boolean;
        }
        type: {
            SET: boolean;
            ASSY: boolean;
            PARTS: boolean;
        }
        set: {
            EDT: boolean;
            NOBARK: boolean;
            RDT: boolean;
            LAUNCHER: boolean;
            기타: boolean;
        }
        group: {
            회로: boolean;
            전장: boolean;
            기구: boolean;
            포장: boolean;
            기타: boolean;
        }
        sort: {
            [key: string]: { [key: string]: boolean | number };
            type: { active: boolean; number: number, asc: boolean };
            category: { active: boolean; number: number, asc: boolean };
            itemName: { active: boolean; number: number, asc: boolean };
            createdAt: { active: boolean; number: number, asc: boolean };
        }

    };
    focus: boolean;
    setFocus: React.Dispatch<React.SetStateAction<boolean>>
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDrop: () => void;
    orders: {
        name: string;
        sorting: string;
    }[];
    onSearchTextChange: (e: any) => void
}
const SearchComponent: React.FC<Props> = ({ visible, onChange, search, focus, setFocus, onCheck,
    onDragStart, onDragEnter, onDrop, orders, onSearchTextChange
}) => {

    const inputRef: React.LegacyRef<HTMLInputElement> | undefined = useRef(null);

    return (
        <>
            <div className="nav_base"></div>
            <form className={`search-container ${visible ? 'visible' : ''}`}
                onSubmit={(e) => {
                    e.preventDefault();

                    onSearchTextChange(inputRef.current?.value)
                    if (inputRef.current) {
                        inputRef.current.value = ''
                    }
                }}
            >
                <div className="input-type">

                    <input type="checkbox" name="typeALL" id="all" onChange={onChange} checked={search.all.typeALL === true} />
                    <label htmlFor="all">전체</label>
                    <input type="checkbox" name="SET" id="type-SET" onChange={onChange} checked={search.type.SET === true} />
                    <label htmlFor="type-SET">SET</label>
                    <input type="checkbox" name="ASSY" id="type-ASSY" onChange={onChange} checked={search.type.ASSY === true} />
                    <label htmlFor="type-ASSY">ASSY</label>
                    <input type="checkbox" name="PARTS" id="type-PARTS" onChange={onChange} checked={search.type.PARTS === true} />
                    <label htmlFor="type-PARTS">PARTS</label>
                </div>
                {(search.type.PARTS || search.type.ASSY) || (search.type.SET && <div className="input-set">

                    <input type="checkbox" name="setALL" id="setAll" onChange={onChange} checked={search.all.setALL === true} />
                    <label htmlFor="setAll">전체</label>
                    <input type="checkbox" name="EDT" id="type-EDT" onChange={onChange} checked={search.set.EDT === true} />
                    <label htmlFor="type-EDT">EDT</label>
                    <input type="checkbox" name="NOBARK" id="type-NOBARK" onChange={onChange} checked={search.set.NOBARK === true} />
                    <label htmlFor="type-NOBARK">NOBARK</label>
                    <input type="checkbox" name="RDT" id="type-RDT" onChange={onChange} checked={search.set.RDT === true} />
                    <label htmlFor="type-RDT">RDT</label>
                    <input type="checkbox" name="LAUNCHER" id="type-LAUNCHER" onChange={onChange} checked={search.set.LAUNCHER === true} />
                    <label htmlFor="type-LAUNCHER">LAUNCHER</label>
                    <input type="checkbox" name="기타" id="type-LAUNCHER" onChange={onChange} checked={search.set.기타 === true} />
                    <label htmlFor="type-기타">기타</label>


                </div>)}
                {search.type.SET || (search.type.PARTS || search.type.ASSY) && (<div className="input-group">

                    <input type="checkbox" name="groupALL" id="groupALL" onChange={onChange} checked={search.all.groupALL === true} />
                    <label htmlFor="groupALL">전체</label>

                    <input type="checkbox" name="회로" id="group-회로물" onChange={onChange} checked={search.group.회로 === true} />
                    <label htmlFor="group-회로물">회로물</label>
                    <input type="checkbox" name="전장" id="group-전장물" onChange={onChange} checked={search.group.전장 === true} />
                    <label htmlFor="group-전장물">전장물</label>
                    <input type="checkbox" name="기구" id="group-기구물" onChange={onChange} checked={search.group.기구 === true} />
                    <label htmlFor="group-기구물">기구물</label>
                    <input type="checkbox" name="포장" id="group-포장물" onChange={onChange} checked={search.group.포장 === true} />
                    <label htmlFor="group-포장물">포장물</label>
                    <input type="checkbox" name="기타" id="group-기타물" onChange={onChange} checked={search.group.기타 === true} />
                    <label htmlFor="group-기타물">기타</label>
                </div>)}
                <div className="sort">
                    {orders.map((order, index) => <div key={order.name}
                        draggable
                        onDragStart={() => { onDragStart(index) }}
                        onDragEnter={() => { onDragEnter(index) }}
                        onDragEnd={onDrop}
                    >
                        <input type="checkbox" name={order.sorting} id={order.name}
                            onChange={onChange}
                            checked={search.sort[order.sorting].active === true} />
                        <label htmlFor={order.name}>{order.name}</label>
                        <input type="radio" name={order.sorting} id="" onChange={onCheck} checked={search.sort[order.sorting].asc === true} />
                        <input type="radio" name={order.sorting} id="" onChange={onCheck} checked={search.sort[order.sorting].asc === false} />
                        {/* <span>△</span>
                        <span>▽</span> */}
                    </div>)}

                </div>

                <div className={`search ${focus ? 'focus' : ''}`}>
                    <input type="text" className={`searchInput ${focus ? 'focus' : ''}`}
                        onFocus={() => setFocus(!focus)}
                        onBlur={() => {
                            setFocus(!focus);
                        }}
                        ref={inputRef}
                        autoFocus
                    />

                    <span className={`material-symbols-outlined `}
                        onClick={() => inputRef.current?.focus()}
                    >
                        search
                    </span>

                </div >
            </form >

        </>
    );
};

export default SearchComponent;