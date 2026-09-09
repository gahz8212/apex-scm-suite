import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formSelector, formActions } from '../../store/slices/formSlice';
import { OrderAction } from '../../store/slices/orderSlice';
import ExcelJS from 'exceljs';
import IsettingComponent from './IsettingComponent';

const IsettingContainer = () => {
  const dispatch = useDispatch();
  const { input, edit, relate, picker } = useSelector(formSelector);
  const itemsInput = useRef<HTMLInputElement | null>(null);

  const onChangeItem = async (e: any) => {
    const selectedFile = e.target.files?.[0];
    const fileType = [
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (selectedFile && fileType.includes(selectedFile.type)) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(selectedFile);
        const worksheet = workbook.worksheets[0];
        const worksheetData: any[] = [];
        worksheet?.eachRow({ includeEmpty: true }, (row) => {
          worksheetData.push(row.values);
        });
        const headers = worksheetData[0];
        const contents = worksheetData.slice(1);
        let ItemList: any[] = [];
        for (let content = 0; content < contents.length; content++) {
          const obj: { [key: string]: any } = {};
          ItemList.push(obj);
          for (let header = 1; header < headers.length; header++) {
            obj[headers[header]] = contents[content][header];
          }
        }

        dispatch(OrderAction.inputGood(ItemList));
        alert(`품목 엑셀 파일(${selectedFile.name})에서 총 ${ItemList.length}건의 데이터를 읽어 등록 요청했습니다.`);
      } catch (err: any) {
        console.error('품목 엑셀 업로드 실패:', err);
        alert('품목 엑셀 파일 처리 중 오류가 발생했습니다.');
      } finally {
        if (itemsInput.current) itemsInput.current.value = '';
      }
    }
  };

  const openForm = (form: string) => {
    if (form === 'input') {
      dispatch(formActions.toggle_form({ form: 'input', value: !input.visible }));
    } else {
      dispatch(formActions.toggle_form({ form: 'picker', value: !picker.visible }));
    }
  };

  const changePosition = (form: string, position: { x: number; y: number }) => {
    dispatch(formActions.changePosition({ form, position }));
  };

  return (
    <IsettingComponent
      input={input}
      edit={edit}
      relate={relate}
      picker={picker}
      openForm={openForm}
      changePosition={changePosition}
      onChangeItem={onChangeItem}
      itemsInput={itemsInput}
    />
  );
};

export default IsettingContainer;