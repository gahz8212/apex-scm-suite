import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { formSelector, formActions } from '../../store/slices/formSlice';
// import { itemData } from '../../store/slices/itemSlice';
import IsettingComponent from './IsettingComponent';
// import { makeRelateData_Price } from '../../lib/utils/createRelateData';
import { relateActions } from '../../store/slices/relationSlice';
const IsettingContainer = () => {
  const dispatch = useDispatch();
  const { input, edit, relate, picker } = useSelector(formSelector)
  // const { items, dragItems, relations } = useSelector(itemData)


  const openForm = (form: string) => {
    if (form === 'input') {

      dispatch(formActions.toggle_form({ form: 'input', value: !input.visible }))
    } else {

      dispatch(formActions.toggle_form({ form: 'picker', value: !picker.visible }))
    }

  }
  const changePosition = (form: string, position: { x: number, y: number }) => {
    dispatch(formActions.changePosition({ form, position }))
  }
  // useEffect(() => {
  //   dispatch(relateActions.initRelate())
  // }, [])
  return (
    <IsettingComponent
      input={input}
      edit={edit}
      relate={relate}
      picker={picker}
      openForm={openForm}
      changePosition={changePosition}

    />
  );
};

export default IsettingContainer;