import "./defaultpage.css"

export default function DefaultPage({ openAuth }) {
  return (
    <div className="default-page">
      <div className="head"><h2 className="menu-caption">DevmindAI</h2>
      <button className="def-button" onClick={openAuth}>Авторизация</button>
      </div>
      <section className="def-content">
        <h1 className="home-label def-content-caption">Open Sourse Code krutoe super nazvanie</h1>
        <p  className="def-content-info">Позволяет работать с кодом в свободном формате, без привязки к конкретным заданиям.
Позволяет работать с кодом в свободном  заданиям.</p>
        <button className="def-button" onClick={openAuth}>Личный кабинет</button>
      </section>
    </div>
  );
}