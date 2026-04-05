import "./defaultpage.css"

export default function DefaultPage({ openAuth }) {
  return (
    <div className="default-page">
      <div className="head"><h2 className="menu-caption">DevmindAI</h2>
      <button className="def-button" onClick={openAuth}>Авторизация</button>
      </div>
      <section className="def-content">
        <h1 className="home-label def-content-caption">AI-платформа для обучения программированию</h1>
        <p  className="def-content-info">
Персональные рекомендации и помощь в обучении в реальном времени. Интеллектуальная система подсказывает и помогает двигаться дальше.</p>
        <button className="def-button" onClick={openAuth}>Личный кабинет</button>
      </section>
    </div>
  );
}