import React, { useEffect, useState, useRef } from 'react';
import SearchComponent from './SearchComponent';
import searchSlice, { SearchActions, SearchData } from '../../store/slices/searchSlice';
import { itemActions, itemData } from '../../store/slices/itemSlice';
import { useDispatch, useSelector } from 'react-redux'
import { relateData, relateActions } from '../../store/slices/relationSlice'
import { editActions, editData } from '../../store/slices/editSlice';
type Props = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}
const SearchContainer: React.FC<Props> = ({ setVisible, visible }) => {
    const [focus, setFocus] = useState<boolean>(false)
    const dispatch = useDispatch();
    const { search } = useSelector(SearchData);
    const { items } = useSelector(itemData)
    const [newItems, setNewItems] = useState<{ type: string, category: string, itemName: string }[]>([])
    const dragItem: any = useRef();
    const dragOverItem: any = useRef()
    const [orders, setOrders] = useState<{ name: string, sorting: string }[]>([
        { name: '타입', sorting: 'type' },
        { name: '분류', sorting: 'category' },
        { name: '이름', sorting: 'itemName' },
        { name: '생성일', sorting: 'createdAt' }])
    const onChange = (e: any) => {
        const { name, checked } = e.target;
        // console.log(name, checked)
        if (name === 'typeALL') {
            dispatch(SearchActions.typeALL(checked))
        } else if (name === 'groupALL') {
            dispatch(SearchActions.groupALL(checked))
        } else if (name === 'setALL') {
            dispatch(SearchActions.setALL(checked))
        } else if (name === 'SET' || name === 'ASSY' || name === 'PARTS') {
            dispatch(SearchActions.checkType(name))
        } else if (name === 'EDT' || name === 'NOBARK' || name === 'RDT' || name === 'LAUNCHER' || name === '기타') {
            dispatch(SearchActions.checkSet(name))
        } else if (name === '포장' || name === '회로' || name === '전장' || name === '기구' || name === '기타') {
            dispatch(SearchActions.checkGroup(name))
        } else {
            dispatch(SearchActions.checkSort(name))
        }
        // dispatch(itemActions.backupItems())
    }
    const onCheck = (e: any) => {
        const { name, checked } = e.target;
        // console.log(name, checked)
        dispatch(SearchActions.checkAsc(name))
    }
    const onDragStart = (index: number) => {
        // console.log(index)
        dragItem.current = index;
    }
    const onDragEnter = (index: number) => {
        // console.log(index)
        dragOverItem.current = index
    }
    const onDrop = () => {
        const copyList: { [key: string]: string, name: string, sorting: string }[] = JSON.parse(JSON.stringify(orders));
        let temp = copyList[dragOverItem.current]
        copyList[dragOverItem.current] = copyList[dragItem.current]
        copyList[dragItem.current] = temp
        dispatch(SearchActions.sortChange({ dragItem: dragItem.current, dragOverItem: dragOverItem.current, orders: orders }))
        // copyList[dragItem.current]=null;
        dragItem.current = null;
        dragOverItem.current = null;
        // console.log('copyList', copyList)
        setOrders(copyList)
    }
    const searchString = (search: string) => {
        const exp = new RegExp(search, "i");
        console.log(exp);
        if (items) {
            const result = items.filter((item) =>
                exp.test(item.itemName)
            );
            dispatch(SearchActions.getFilteredItems(result))
        }
    }
    const onSearchTextChange = (value: string) => {
        searchString(value)

    }
    // const onSortChange = (e: any, orders: { name: string, sorting: string }[]) => {
    //     const { name, checked } = e.target;
    //     // console.log('orders', orders)
    //     dispatch(SearchActions.checkSort(name))
    // }
    useEffect(() => {
        if (search) {
            if (search.type.SET && search.type.ASSY && search.type.PARTS) {
                dispatch(SearchActions.typeCheckAll(true))
            } else {
                dispatch(SearchActions.typeCheckAll(false))
            }
            if (search.set.EDT && search.set.NOBARK && search.set.RDT && search.set.LAUNCHER && search.set.기타) {
                dispatch(SearchActions.setCheckAll(true))
            } else {
                dispatch(SearchActions.setCheckAll(false))
            }
            if (search.group.포장 && search.group.회로 && search.group.전장 && search.group.기구 && search.group.기타) {
                dispatch(SearchActions.groupCheckAll(true))
            } else {
                dispatch(SearchActions.groupCheckAll(false))
            }
        }
    }, [dispatch, search])
    useEffect(() => {
        if (search.type && search.set && search.group && items) {
            const { all, ...rest } = search;
            let result
            if (search.type.SET && !search.type.PARTS && !search.type.ASSY) {
                result = items?.filter(item => (rest.type[item.type] && rest.set[item.category]))
            } else if ((search.type.PARTS || search.type.ASSY) && !search.type.SET) {
                result = items?.filter(item => (rest.type[item.type] && rest.group[item.category]))
            }
            else {
                result = items?.filter(item => (rest.type[item.type]))
            }
            setNewItems(result)
            dispatch(SearchActions.getFilteredItems(result))


        }
    }, [dispatch, search.type, search.set, search.group, items])


    useEffect(() => {
        const array = search.sort;
        const keys = (Object.keys(array))
        const values = (Object.values(array))
        let resultSort: { key: string, active: boolean, number: number, asc: boolean }[] = []
        for (let i = 0; i < keys.length; i++) {
            resultSort.push({ key: keys[i], ...values[i] })
        }

        const orderedSort = (resultSort.sort((a, b) => a.number - b.number))
            .filter(sort => sort.active)
            .map(sort => ({ key: sort.key, asc: sort.asc }))
        const result = [...newItems];



        result.sort((prev: { [key: string]: string }, next: { [key: string]: string }) => {
            switch (orderedSort.length) {
                case 1:
                    if (orderedSort[0].asc) {
                        return prev[orderedSort[0].key].localeCompare(next[orderedSort[0].key])
                    } else {
                        return next[orderedSort[0].key].localeCompare(prev[orderedSort[0].key])

                    }
                case 2:
                    if (orderedSort[1].asc) {
                        return prev[orderedSort[0].key].localeCompare(next[orderedSort[0].key]) || prev[orderedSort[1].key].localeCompare(next[orderedSort[1].key])
                    } else {
                        return next[orderedSort[0].key].localeCompare(prev[orderedSort[0].key]) || next[orderedSort[1].key].localeCompare(prev[orderedSort[1].key])
                    }

                case 3:
                    if (orderedSort[2].asc) {
                        return prev[orderedSort[0].key].localeCompare(next[orderedSort[0].key]) || prev[orderedSort[1].key].localeCompare(next[orderedSort[1].key]) || prev[orderedSort[2].key].localeCompare(next[orderedSort[2].key])
                    } else {
                        return next[orderedSort[0].key].localeCompare(prev[orderedSort[0].key]) || next[orderedSort[1].key].localeCompare(prev[orderedSort[1].key]) || next[orderedSort[2].key].localeCompare(prev[orderedSort[2].key])

                    }
                case 4:
                    if (orderedSort[2].asc) {
                        return prev[orderedSort[0].key].localeCompare(next[orderedSort[0].key]) || prev[orderedSort[1].key].localeCompare(next[orderedSort[1].key]) || prev[orderedSort[2].key].localeCompare(next[orderedSort[2].key]) || prev[orderedSort[3].key].localeCompare(next[orderedSort[3].key])
                    } else {
                        return next[orderedSort[0].key].localeCompare(next[orderedSort[0].key]) || next[orderedSort[1].key].localeCompare(prev[orderedSort[1].key]) || next[orderedSort[2].key].localeCompare(prev[orderedSort[2].key]) || next[orderedSort[3].key].localeCompare(prev[orderedSort[3].key])

                    }
                default:
                    return 0;
            }
        })



        dispatch(SearchActions.getFilteredItems(result))
    }, [dispatch, search.sort])
    // useEffect(() => {
    //     if (orders) {
    //         console.log('orders', orders)
    //     }
    // })
    useEffect(() => {
        dispatch(itemActions.initForm())
        dispatch(editActions.initForm())
        dispatch(itemActions.getItem())
        dispatch(relateActions.initRelate())
    }, [dispatch])
    return (
        <div>
            <SearchComponent setVisible={setVisible}
                visible={visible}
                onChange={onChange}
                // onSortChange={onSortChange}
                onCheck={onCheck}
                search={search}
                focus={focus}
                setFocus={setFocus}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                orders={orders}
                onSearchTextChange={onSearchTextChange}
            />
        </div>
    );
};

export default SearchContainer;