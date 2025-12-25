import styles from './App.module.css';

export function App() {
    return (
        <section className={styles.container}>
            <p>Привет, воспользуйся storybook для разработки.</p>
            <p>
                Её можно запустить командой <code className={styles.code}>npm run storybook</code>
            </p>
        </section>
    );
}
