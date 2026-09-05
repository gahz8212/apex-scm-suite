import React,{useState} from 'react';
import NavContainer from '../common/navigate/NavContainer';
import SearchContainer from '../search/SearchContainer';
const NavSearchContainer = () => {
  const[visible,setVisible]=useState(false)
    return (
        <div >
            <NavContainer setVisible={setVisible} visible={visible}/>
            <SearchContainer setVisible={setVisible} visible={visible}/>
            
          
        </div>
    );
};

export default NavSearchContainer;