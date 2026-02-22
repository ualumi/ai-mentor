import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"

export default function Recommendation() {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const handler = (data) => {
      console.log('📚 Recommendation received:', data);

      if (data.event === 'module_recommendation') {
        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: data.data
        });
      }
    };

    wsService.on('*', handler);

    return () => {
      wsService.off('*', handler);
    };
  }, []);

  if (!recommendation) return null;

  return (
    <div className="item menu-item menu-item-input  recomendation-item">
          <div className="">
          <div className="">
            📚 Рекомендован модуль
          </div>

          <div className="">
            {typeof recommendation.data === 'string'
              ? recommendation.data
              : JSON.stringify(recommendation.data, null, 2)}
          </div>

          <button onClick={() => navigate(`/modules/${recommendation.data}`)}>
                🚀 Начать модуль
            </button>

          <div className="">
            {recommendation.time}
          </div>
        </div>
    </div>

  );
}