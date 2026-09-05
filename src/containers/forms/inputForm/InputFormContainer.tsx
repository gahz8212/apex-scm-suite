import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { itemActions, itemData } from '../../../store/slices/itemSlice';
import { imageInsert } from '../../../lib/utils/createFormData'
import { formActions } from '../../../store/slices/formSlice';
import { ExcelAction, ExcelData } from '../../../store/slices/excelSlice';
import InputFormComponent from './InputFormComponent';
import * as XLSX from 'xlsx';
import { makeRelateData_Price } from '../../../lib/utils/createRelateData'
const InputFormContainer = () => {
    const dispatch = useDispatch()
    const excelFile = useRef<HTMLInputElement>(null)
    const [goodType, setGoodType] = useState<{
        category: string, type: string,
    }[]>([])
    const [supplyer, setSupplyer] = useState<string[]>([])
    const [isBasket, setIsBasket] = useState<boolean>(false)
    const [totalPrice, setTotalPrice] = useState(0)
    const { input, imageList, items, dragItems, T_dragItems, relations, status: inputStatue } = useSelector(itemData)
    const { file, data: datas, status } = useSelector(ExcelData)



    const onChange = (e: any) => {
        let { name, value } = e.target;
        if (name === 'use' || name === 'set') {
            value = value === '1' ? true : false
        }
        if (name === 'type') {
            dispatch(itemActions.initForm())
            dispatch(itemActions.changeInitial({ name, value }))
        }
        dispatch(itemActions.changeField({ name, value }))

    }


    const insertGroupType = () => {
        if (input.new_groupType.toString()) {
            setGoodType([{ category: input.category.toString(), type: input.new_groupType.toString() }, ...goodType])
            dispatch(itemActions.changeField({ name: 'groupType', value: input.new_groupType }))
        }
    }
    const insertSupplyer = () => {
        if (input.new_supplyer.toString()) {
            setSupplyer([input.new_supplyer.toString(), ...supplyer].sort())
            dispatch(itemActions.changeField({ name: 'supplyer', value: input.new_supplyer }))
        }
    }
    const insertImage = async (e: any) => {
        const formData = imageInsert(e, imageList)
        dispatch(itemActions.addImage(await formData))
    }

    const addItem = (
        item: {

            type: string,
            groupType: string,
            groupName: string,
            category: string,
            itemName: string,
            descript: string,
            unit: string,
            im_price: number;
            ex_price: number;
            use: boolean,
            supplyer: string,
            weight: number;
            cbm: number;
            moq: number;
            set: boolean;
            imageList: { url: string }[],
            dragItems: {}[],
            // visible: boolean;


        }
    ) => {
        if (items) {
            const conflict = items.filter(listItem => listItem.category === item.category && listItem.itemName === item.itemName)
            if (conflict.length > 0) {
                const findIndex = items.findIndex(listItem => listItem.category === item.category && listItem.itemName === item.itemName)
                alert(`이미 등록된 아이템 입니다.index: ${findIndex}`)
                return;
            }
            dispatch(itemActions.addItem(item))
        }
    }
    const formClose = () => {
        dispatch(formActions.toggle_form({ form: 'input', value: false }))
        dispatch(ExcelAction.initForm())
        dispatch(itemActions.initForm())
        // console.log(excelFile.current)
    }
    const excel_onChange = (e: any) => {
        const selectedFile = e.target.files[0];
        const fileTypes = [
            'application/vnd.ms-excel',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (selectedFile) {
            if (selectedFile && fileTypes.includes(selectedFile.type)) {
                const reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile)
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    dispatch(ExcelAction.onChange(e.target?.result))
                    convertExcelData(e.target?.result)
                }
            }
        }
    }
    const convertExcelData = (file: ArrayBuffer | undefined | string | null) => {

        if (file) {
            const workbook = XLSX.read(file, { type: 'buffer' });
            const worksheetname = workbook.SheetNames[0];
            const worksheets = workbook.Sheets[worksheetname];
            const excelData = XLSX.utils.sheet_to_json(worksheets)
            dispatch(ExcelAction.onSubmit(excelData))
        }
    }
    const excel_onSubmit = () => {

        if (datas) {
            dispatch(itemActions.excelAdd(datas))
            dispatch(ExcelAction.initForm())
            if (excelFile.current) excelFile.current.value = ''

        }
    }
    const drag_on = () => {

        dispatch(itemActions.Tdrag_on())
    }
    const addCount = ( id: number | string | boolean) => {
        let idx = T_dragItems.findIndex(item =>  item.id === id)

        if (typeof id === 'number' && items) {
            dispatch(itemActions.T_addCount(idx))
            const price = makeRelateData_Price(id, relations, items)[0].sum_im_price
            setTotalPrice(price)
        }
    }
    const removeCount = ( id: number | string | boolean, mode: string) => {
        let idx = T_dragItems.findIndex(item =>  item.id === id)
        if (typeof id === 'number') {
            dispatch(itemActions.T_removeCount({ idx, mode }))
        }
    }


    const results = items?.filter((item: any) => item.groupType !== null).map((item: any) => {
        return ({ category: item.category, type: item.groupType })
    })
    results?.forEach((result) => {
        const json_arr = goodType.map((ar: any) => JSON.stringify(ar))
        if (!json_arr.includes(JSON.stringify(result))) {
            setGoodType([result, ...goodType].sort())
        }
    })
    const supplyers = items?.filter((item: any) => item.supplyer !== '').map((item: any) =>
        item.supplyer)
    supplyers?.forEach(result => {
        if (result !== "" && !supplyer.includes(result)) {
            setSupplyer([result, ...supplyer].sort())
        }
    })











    useEffect(() => {
        dispatch(itemActions.initForm())
    }, [dispatch])

    return (
        <InputFormComponent
            onChange={onChange}
            input={input}
            insertImage={insertImage}
            imageList={imageList}
            addItem={addItem}
            formClose={formClose}
            excel_onChange={excel_onChange}
            excel_onSubmit={excel_onSubmit}
            file={file}
            excelFile={excelFile}
            insertGroupType={insertGroupType}
            insertSupplyer={insertSupplyer}
            goodType={goodType}
            supplyers={supplyer}
            drag_on={drag_on}
            dragItems={dragItems}
            T_dragItems={T_dragItems}
            addCount={addCount}
            removeCount={removeCount}
            setIsBasket={setIsBasket}
            isBasket={isBasket}
            totalPrice={totalPrice}


        />


    );
};

export default InputFormContainer;