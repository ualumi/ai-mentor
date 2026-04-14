{/*import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function AttemptsSummary() {
    
    const [data, setData] = useState({
        total_attempts: 0,
        total_learning_sessions: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `http://localhost:8009/attempts/total`,
                    {
                        params: { token }
                    }
                );

                setData(res.data);
            } catch (e) {
                console.error("Ошибка загрузки attempts total", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="home-block-education">


            <div className="home-summary-block home-summary-module-block">
                <p className="home-label module-label">
                    {data.total_attempts}
                </p>
                <div className="home-summary-block-label-div">
                    <p className="home-summary-block-label-link">всего</p>
                    <p className="home-summary-block-label-link">попыток</p>
                </div>
            </div>


            <div className="home-summary-block home-summary-module-block">
                <p className="home-label module-label">
                    {data.total_learning_sessions}
                </p>
                <div className="home-summary-block-label-div">
                    <p className="home-summary-block-label-link">пройдено</p>
                    <p className="home-summary-block-label-link">сессий</p>
                </div>
            </div>

        </div>
    );
}*/}


import { useEffect, useState } from "react";
import axios from "axios";

export default function AttemptsSummary() {
    const [data, setData] = useState({
        total_attempts: 0,
        total_learning_sessions: 0
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `http://localhost:8009/attempts/total`,
                {
                    params: { token },
                    timeout: 5000 // 👈 защита от зависаний
                }
            );

            setData({
                total_attempts: res.data?.total_attempts ?? 0,
                total_learning_sessions: res.data?.total_learning_sessions ?? 0
            });

        } catch (e) {
            console.error("Ошибка загрузки attempts total", e);

            // 🔥 fallback = 0
            setData({
                total_attempts: 0,
                total_learning_sessions: 0
            });
        }
    };

    useEffect(() => {
        fetchData(); // первый рендер

        // 🔄 авто-обновление каждые 10 секунд
        const interval = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(interval);
    }, []);
    console.log(data)
    return (
        <div className="home-block-education">

            {/* 🔹 попытки */}
            <div className="home-summary-block home-summary-module-block">
                <p className="home-label module-label">
                    {data.total_attempts}
                </p>
                <div className="home-summary-block-label-div">
                    <p className="home-summary-block-label-link">всего</p>
                    <p className="home-summary-block-label-link">попыток</p>
                </div>
            </div>

            {/* 🔹 сессии */}
            <div className="home-summary-block home-summary-module-block">
                <p className="home-label module-label">
                    {data.total_learning_sessions}
                </p>
                <div className="home-summary-block-label-div">
                    <p className="home-summary-block-label-link">пройдено</p>
                    <p className="home-summary-block-label-link">сессий</p>
                </div>
            </div>

        </div>
    );
}