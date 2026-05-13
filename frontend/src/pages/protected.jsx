import { Outlet } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Error from "./error";
import useUserStore from "../store/userStore";


function Protected() {
    const login = useUserStore((state) => state.login);
    const [verified, setVerified] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('http://localhost:3000/user/auth', {}, { withCredentials: true })
                if (res.status == 200) {
                    login({
                        name: res.data.name,
                        collegeName: res.data.collegeName,
                        email: res.data.email,
                    })
                    setVerified(true);
                }
                else {
                    localStorage.setItem('loggedIn', 'no');
                    navigate('/login')
                }
            }
            catch (err) {
                console.log(err)
            }
        })();
    }, [])
    return verified ? <Outlet /> : <Error />
}

export default Protected


