import styles from "./AddCard.module.css";
import icons from "../../assets/symbol-defs.svg";

const AddCard = ({ onClick }) => {
  return (
    <div className={styles.addCard} onClick={onClick}>
      <span>
        <svg width="24" height="24" fill="#273da4">
          <use href={`${icons}#icon-plus`} />
        </svg>
      </span>
    </div>
  );
};

export default AddCard;
