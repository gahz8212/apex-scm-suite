import React from 'react';
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'

import LoginForm from './pages/LoginForm';
import JoinForm from './pages/JoinForm';
import HomeForm from './pages/HomeForm'
import ExportForm from './pages/ExportForm'
import SettingForm from './pages/SettingForm';
import RViewForm from './pages/ItemSettingForm';
import TrackingForm from './pages/TrackingForm';
import { response } from './store/slices/authSlice';
import HeaderContainer from './containers/common/header/HeaderContainer'
import NavContainer from './containers/common/navigate/NavContainer';
// import SearchForm from './pages/SearchForm';
import './lib/styles/index.scss'
const App = () => {
  const { auth } = useSelector(response)


  return (
    <>
      {<HeaderContainer />}
      {auth && <NavContainer />}
      <Routes>
        <Route path='/' element={<LoginForm />} />
        <Route path='/join' element={<JoinForm />} />
        {auth && (
          <>
            <Route path='/home' element={<HomeForm />} />
            <Route path='/Home' element={<HomeForm />} />
            <Route path='/Export' element={<ExportForm />} />
            <Route path='/export' element={<ExportForm />} />
            <Route path='/ordersheet' element={<ExportForm />} />
            <Route path='/settings' element={<SettingForm />} />
            <Route path='/Settings' element={<SettingForm />} />
            <Route path='/view' element={<RViewForm />} />
            <Route path='/View' element={<RViewForm />} />
            <Route path='/item-management' element={<RViewForm />} />
            <Route path='/Tracking' element={<TrackingForm />} />
            <Route path='/tracking' element={<TrackingForm />} />
          </>
        )}
        {/* <Route path='/search' element={<SearchForm />} /> */}
      </Routes>
    </>

  );
};

export default App;