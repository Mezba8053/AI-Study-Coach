import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
const Starting = ({setAuth}) => {
    const navigate = useNavigate();
return(
        <GoogleLogin onSuccess={({credential})=>
        {
        const decoded = jwtDecode(credential);
        console.log('Decoded user info:', decoded);
        console.log(`Login Success: currentUser: ${credential}`);
    alert(`Login Success: Welcome ${decoded.name}!`);
    navigate('/second');
            
     }}
        onError={()=>{
        console.log('Login Failed');
        alert('Login Failed');
     }}
        />
    );
        

};
export default Starting;
