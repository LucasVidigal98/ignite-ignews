import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

export function SingInButton() {
  const isUserLoggedIn = false;

  return isUserLoggedIn ? (
    <button 
      className={styles.singInButton}
      type="button"
    >
      <FaGithub color="#04d361"/>
      Lucas F Vidigal
      <FiX color="#737380" className={styles.closeIcon}/>
    </button>
  ) : (
    <button 
      className={styles.singInButton}
      type="button"
    >
      <FaGithub color="#eba417"/>
      Sing in with Github
    </button>
  )
}