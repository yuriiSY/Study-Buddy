import styles from './Modules.module.css';
import ModuleCard from '../ModuleCard/ModuleCard'
import AddCard from '../AddCard/AddCard';


 const Modules = () => {
  return (
    <>
        <h3>Modules</h3>
        <div className={styles.modules}>
            <ModuleCard />
            <AddCard />
        </div>
    </>
  );
}

export default Modules;