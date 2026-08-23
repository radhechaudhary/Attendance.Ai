import { Outlet } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./error";
import useUserStore from "../store/userStore";


function Protected({ allowedRole }) {
    const login = useUserStore((state) => state.login);
    const [verified, setVerified] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('http://localhost:3000/user/auth', {}, { withCredentials: true })
                if (res.status == 200) {
                    const role = res.data.role || 'teacher';
                    if (allowedRole && role !== allowedRole) {
                        navigate(role === 'student' ? '/student/dashboard' : '/dashboard', { replace: true });
                        return;
                    }
                    login({
                        name: res.data.name,
                        collegeName: res.data.collegeName,
                        email: res.data.email,
                        role,
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
                localStorage.setItem('loggedIn', 'no');
                navigate('/login')
            }
        })();
    }, [])
    return verified ? <Outlet /> : <Loading />
}

export default Protected


