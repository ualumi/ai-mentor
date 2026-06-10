/*const ToolTip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div {...tooltipProps} className="joyride-tooltip">
      
      <div className="joyride-content">
        {step.content}
      </div>

      <div className="joyride-footer">
        
        {index > 0 && (
          <button {...backProps} className="joyride-btn joyride-back">
            Назад
          </button>
        )}

        {continuous && (
          <button {...primaryProps} className="joyride-btn joyride-next">
            Далее
          </button>
        )}

        <button {...skipProps} className="joyride-btn joyride-skip">
          Пропустить
        </button>

      </div>
    </div>
  );
};

export default ToolTip;*/

/*import { useEffect, useState } from "react";

const ToolTip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // если это НЕ нужный шаг — кнопка всегда активна
    if (index !== 3) {
      setIsReady(true);
      return;
    }

    // проверка сразу (если элемент уже есть)
    const check = () => {
      const el = document.querySelector(".recomendation-item-active");
      if (el) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    // 🔥 наблюдаем за DOM
    const observer = new MutationObserver(() => {
      if (check()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [index]);

  const isBlocked = index === 3 && !isReady;

  return (
    <div {...tooltipProps} className="joyride-tooltip">
      
      <div className="joyride-content">
        {step.content}
      </div>

      <div className="joyride-footer">
        
        {index > 0 && (
          <button {...backProps} className="joyride-btn joyride-back">
            Назад
          </button>
        )}

        {continuous && (
          <button
            {...primaryProps}
            className="joyride-btn joyride-next"
            disabled={isBlocked}
            style={{
              opacity: isBlocked ? 0.5 : 1,
              pointerEvents: isBlocked ? "none" : "auto",
            }}
          >
            Далее
          </button>
        )}

        <button {...skipProps} className="joyride-btn joyride-skip">
          Пропустить
        </button>

      </div>
    </div>
  );
};

export default ToolTip;*/

import { useEffect, useState } from "react";

const ToolTip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 🔥 какие шаги нужно блокировать
    const conditions = {
      4: ".recomendation-item-active",
      8: ".review-blocks",
      10: ".editor-wrapper",
    };

    const selector = conditions[index];

    // если шаг не из списка — всегда доступно
    if (!selector) {
      setIsReady(true);
      return;
    }

    // проверка сразу
    const check = () => {
      const el = document.querySelector(selector);
      if (el) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    // 🔥 наблюдение за DOM
    const observer = new MutationObserver(() => {
      if (check()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [index]);

  const isBlocked = !isReady;

  return (
    <div {...tooltipProps} className="joyride-tooltip">
      
      <div className="joyride-content">
        {step.content}
      </div>

      <div className="joyride-footer">
        
        {index > 0 && (
          <button {...backProps} className="module-next-button module-button disabled joyride-btn joyride-back">
            Назад
          </button>
        )}

        {continuous && (
            <div className="module-next-button-wrapper">
        <button
            {...primaryProps}
            className="module-next-button module-button joyride-btn joyride-next"
            disabled={isBlocked}
            style={{
            opacity: isBlocked ? 0.5 : 1,
            }}
        >
            {index === 11 ? "Завершить" : "Далее"}
        </button>
        {isBlocked && (
            <div className="module-next-button-hint">
            нажмите на выделенную кнопку
            </div>)}
        </div>
        )}

      </div>
    </div>
  );
};

export default ToolTip;