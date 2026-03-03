import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"
import { Link, useNavigate } from "react-router-dom";
{/*<button onClick={() => navigate(`/module/${recommendation.data}`)}>*/}

export default function Recommendation({mode}) {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => { 
    const handler = (data) => {

      // ✅ Сообщение о прогрессе пользователя
      if (
        data.source?.startsWith("user_progress") &&
        data.data?.recommendations
      ) {
        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: data.data
        });
      }
    };

    wsService.on('user_progress', handler);

    return () => {
      wsService.off('user_progress', handler);
    };
  }, []);

  if (!recommendation) return null;

  return (
    <div className="item menu-item menu-item-input item-light recomendation-item">
          <div className="recomendation-content">
          <div className="">
            Рекомендован модуль
          </div>

          <div className="menu-caption mentor-caption">
            {typeof recommendation.data === 'string'
              ? recommendation.data
              : JSON.stringify(recommendation.data, null, 2)}
          </div>
          
          <button onClick={() => navigate(`/module/1`)} className='module-button'>
                Начать модуль
            </button>

        </div>
    </div>

  );
}