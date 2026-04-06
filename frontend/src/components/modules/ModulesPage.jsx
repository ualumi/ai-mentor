import Modules from "./Modules";
function ModulesPage ({ }) {
  return (
    <div className="home">
        <h1 className="home-label">Все модули</h1>
        <Modules mode="modules"/>
    </div>
  );
};

export default ModulesPage;