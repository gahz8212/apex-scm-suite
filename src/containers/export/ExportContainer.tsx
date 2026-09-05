import React, { useState, useRef, useEffect } from 'react';
import ExportComponent from './ExportComponent';
import { useSelector, useDispatch } from 'react-redux'
import { OrderAction, OrderData } from '../../store/slices/orderSlice';
import { itemData, itemActions } from '../../store/slices/itemSlice';
import { formActions, formSelector } from '../../store/slices/formSlice';
import ExcelJS from 'exceljs';
const ExportContainer = () => {
    const orderInput: React.LegacyRef<HTMLInputElement> | undefined = useRef(null)
    const partsInput: React.LegacyRef<HTMLInputElement> | undefined = useRef(null)
    const itemsInput: React.LegacyRef<HTMLInputElement> | undefined = useRef(null)
    const dispatch = useDispatch()
    const { orderData, months } = useSelector(OrderData)
    const { pickedData } = useSelector(itemData)
    const [model, setModel] = useState<string>('model')
    const { invoice, packing, addItem, pallet } = useSelector(formSelector)
    const [partPackaging, setPartPackaging] = useState<{}>()
    // const [select, setSelect] = useState<boolean>(false)
    const onChangeParts = async (e: any) => {
        const selectedFile = e.target.files[0];
        const fileType = [
            'application/vnd.ms-excel',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        if (selectedFile && fileType.includes(selectedFile.type)) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(selectedFile);
            const worksheet = workbook.worksheets[workbook.worksheets.length - 1];
            const worksheetData: any[] = [];
            worksheet?.eachRow({ includeEmpty: false }, (row) => {
                worksheetData.push(row.values)
            })
            const headers = worksheetData[0];
            const contents = worksheetData.slice(2);
            let parts = [];
            for (let content = 0; content < contents.length - 1; content++) {
                const obj: { [key: string]: any } = {};
                parts.push(obj)
                for (let header = 1; header < headers.length; header++) {
                    obj[headers[header]] = contents[content][header]
                }
            }
        }
    }
    const onChangeOrder = async (e: any) => {
        const selectedFile = e.target.files[0]
        const fileType = [
            'application/vnd.ms-excel',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (selectedFile && fileType.includes(selectedFile.type)) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(selectedFile)
            const worksheet = workbook.worksheets[0];
            const worksheetData: any[] = []
            worksheet?.eachRow({ includeEmpty: false }, (row) => {
                worksheetData.push(row.values)
            })
            let headers = worksheetData[1]
            const months = headers.slice(2).map((month: string) => month.length > 3 ? month.slice(0, 3) : month)
            const monthResult: string[] = []
            months.forEach((month: string) => {
                const string = []
                string.push(month[0].toUpperCase())
                string.push(month[1].toLowerCase())
                string.push(month[2].toLowerCase())
                monthResult.push(string.join(''))
            })
            headers = ['undefined', 'Item', ...monthResult]

            const contents = worksheetData.slice(2)
            let orderSheet = [];
            for (let content = 0; content < contents.length - 1; content++) {
                const obj: { [key: string]: any } = {};
                orderSheet.push(obj)
                for (let header = 1; header < headers.length; header++) {
                    if (contents[content][header] === 'TOTAL') break;
                    obj[headers[header]] = contents[content][header]
                }
            }
            const filteredOrder = orderSheet.filter(order => {
                let result = false;
                for (let header = 2; header < headers.length; header++) {
                    result = order[headers[header]];
                    if (result) {
                        break;
                    }
                }
                return result
            })
            dispatch(OrderAction.getData(filteredOrder));
            dispatch(OrderAction.inputOrder([filteredOrder, monthResult]))
            if (orderInput.current) orderInput.current.value = ''
        }
    }
    const onChangeItem = async (e: any) => {
        const selectedFile = e.target.files[0]
        const fileType = [
            'application/vnd.ms-excel',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (selectedFile && fileType.includes(selectedFile.type)) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(selectedFile)
            const worksheet = workbook.worksheets[0];
            const worksheetData: any[] = []
            worksheet?.eachRow({ includeEmpty: true }, (row) => {
                worksheetData.push(row.values)
            })
            const headers = worksheetData[0];

            const contents = worksheetData.slice(1);
            let ItemList: any[] = [];
            for (let content = 0; content < contents.length; content++) {
                const obj: { [key: string]: any } = {}
                ItemList.push(obj)
                for (let header = 1; header < headers.length; header++) {
                    obj[headers[header]] = contents[content][header]
                }
            }

            dispatch(OrderAction.inputGood(ItemList))
            if (itemsInput.current) itemsInput.current.value = ''
        }
    }
    const openInvoiceForm = () => {
        dispatch(formActions.toggle_form({ form: 'invoice', value: !invoice.visible }))
    }
    const openPackingForm = () => {
        dispatch(formActions.toggle_form({ form: 'packing', value: !packing.visible }))
        dispatch(formActions.toggle_form({ form: 'pallet', value: !pallet.visible }))
    }

    const openAddItemForm = () => {
        // alert('db 가져오는 중')
        dispatch(formActions.toggle_form({ form: 'addItem', value: !addItem.visible }))
        dispatch(OrderAction.getDummyItem())
    }
    const changePosition = (form: string, position: { x: number, y: number }) => {
        dispatch(formActions.changePosition({ form, position }))
    }
    const removePicked = (id: number) => {
        dispatch(itemActions.removePicked(id))
    }
    const onChangePicked = (e: any) => {

        const { name, checked, value, id } = e.target
        console.log(name, checked, value, id)
        dispatch(itemActions.onChangePicked({ name, checked, value, id }))

    }
    useEffect(() => {
        if (!orderData) {
            dispatch(OrderAction.getOrderData())
        }
    }, [dispatch, orderData])
    useEffect(() => {

        dispatch(itemActions.getPicked())

    }, [dispatch])
    useEffect(() => {

        if (pickedData) {

            let total: { [key: number]: {} } = {}
            let array: number[] = [];
            pickedData?.forEach((picked, index) => {
                if (picked.check) {
                    array.push(index)
                }
            })
            array = [...array, pickedData.length]
            // console.log(array)
            for (let i = 0; i < array.length; i++) {
                let arr = new Array(0);
                for (let j = array[i]; j < array[i + 1]; j++) {
                    arr.push(pickedData[j])

                }
                if (arr.length > 0)
                    total[arr[0].id] = arr
            }

            // total.pop()
            setPartPackaging(total)

        }
    }, [pickedData])
    const setSelect = (select: boolean) => {

        if (select) {
            dispatch(itemActions.allSelect())
        } else {
            dispatch(itemActions.allClear())
        }
    }
    const inputRepairToOrdersheet = (repair: {
        id: number;
        ItemId: number
        itemName: string;
        check: boolean;
        month: string;
        quantity: number;
        description: string;
        category: string;
        unit: string;
        im_price: number;
        ex_price: number;
        sets: string;
        weight: number;
        cbm: number;
        CT_qty: number;
        number1: number;
        use: boolean;
      
    }[]) => {

        dispatch(OrderAction.inputRepairToOrderSheet(repair))
        dispatch(itemActions.inputPicked(repair))
    }
    useEffect(() => {
        return () => {
            dispatch(formActions.initPosition('invoice'))
            dispatch(formActions.initPosition('packing'))
            dispatch(formActions.initPosition('addItem'))
        }
    }, [dispatch])
    return (
        <ExportComponent
            model={model}
            setModel={setModel}
            onChangeParts={onChangeParts}
            onChangeOrder={onChangeOrder}
            onChangeItem={onChangeItem}
            onChangePicked={onChangePicked}
            orderInput={orderInput}
            partsInput={partsInput}
            itemsInput={itemsInput}
            months={months}
            orderData={orderData}
            invoiceForm={invoice}
            packingForm={packing}
            addItemForm={addItem}
            palletForm={pallet}
            openInvoiceForm={openInvoiceForm}
            openPackingForm={openPackingForm}
            openAddItemForm={openAddItemForm}
            changePosition={changePosition}
            pickedData={pickedData}
            removePicked={removePicked}
            partPackaging={partPackaging}
            setSelect={setSelect}
            inputRepairToOrdersheet={inputRepairToOrdersheet}
        />
    );
};

export default ExportContainer;