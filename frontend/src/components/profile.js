import { GoogleLogin } from "@react-oauth/google";
import React from "react";

const Profile = () => {
    const [profile, setProfile] = React.useState(null);

    return (
        <div>
            {/* <h1>Login to your Google Account</h1> */}
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    if (!credentialResponse?.credential) return;
                    const payload = JSON.parse(
                        atob(credentialResponse.credential.split(".")[1])
                    );
                    setProfile({
                        name: payload.name,
                        email: payload.email,
                        dateofBirth: payload.dob,  
                        picture: payload.picture,
                    });
                }}
                onError={() => {
                    console.log("Login Failed");
                }}
            />

            {profile && (
                <div style={{ marginTop: "20px" }}>
                    <img
                        src={profile.picture}
                        alt={profile.name}
                        style={{ width: "80px", borderRadius: "50%" }}
                    />
                    <p>{profile.name}</p>
                    <p>{profile.email}</p>
                </div>
            )}
        </div>
    );
};
export default Profile;
