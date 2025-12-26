import { useState, useRef, useEffect } from 'react';
import styles from './TicketSearch.module.css';

// Вспомогательные массивы для русификации
const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Доступные пресеты
const PRESETS = [5, 7, 10, 14];

export function TicketSearch() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    
    // Храним даты как объекты Date или null.
    // По дефолту null — текущая дата не выбрана
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    
    // Текущий месяц просмотра (для левого календаря)
    const [viewDate, setViewDate] = useState(new Date());

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Закрытие по клику вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Форматирование для инпута (DD.MM)
    const formatDateDisplay = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    // Переключение месяцев
    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    // Логика клика по пресету
    const handlePresetClick = (daysToAdd: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Определяем дату старта. Если она уже выбрана — берем её, если нет — берем сегодня
        const baseDate = startDate ? new Date(startDate) : today;
        
        // Сбрасываем часы для корректных расчетов
        baseDate.setHours(0, 0, 0, 0);

        // Если старт не был выбран, сохраняем его
        if (!startDate) {
            setStartDate(baseDate);
        }

        // --- ФИКС START ---
        // Всегда переключаем вид календаря на месяц даты старта.
        // Это нужно, если start выбран в будущем, а мы смотрим на этот месяц,
        // или если start был null (тогда берем today).
        setViewDate(new Date(baseDate));
        // --- ФИКС END ---

        // Вычисляем дату конца
        const newEnd = new Date(baseDate);
        newEnd.setDate(baseDate.getDate() + daysToAdd);
        setEndDate(newEnd);
    };

    // Логика выбора даты в календаре
    const handleDateClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Сбрасываем время у выбранной даты
        date.setHours(0, 0, 0, 0);

        // 2. Блокируем выбор дат из прошлого
        if (date < today) {
            return;
        }

        // Сценарий 1: Ничего не выбрано или уже выбран диапазон -> Начинаем новый выбор
        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
            return;
        }

        // Сценарий 2: Выбран старт, кликнули на дату ДО старта -> Новый старт
        if (date < startDate) {
            setStartDate(date);
            return;
        }

        // Сценарий 3: Выбран старт, кликнули ПОЗЖЕ -> Это конец диапазона
        if (date > startDate) {
            setEndDate(date);
        } else {
            // Кликнули на ту же дату -> Выбор одного дня
            setEndDate(date);
        }
    };

    // Вспомогательная функция для генерации дней месяца
    const getDaysArray = (year: number, month: number) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Корректируем день недели (0 - Вс, 1 - Пн ...). Нам нужно 0 - Пн, 6 - Вс
        let startDay = firstDayOfMonth.getDay() - 1;
        if (startDay === -1) startDay = 6;

        const days = [];
        // Пустые ячейки до начала месяца
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        // Дни месяца
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    // Проверка стилей для даты
    const getDayClass = (date: Date | null) => {
        if (!date) return styles.empty;
        
        const time = date.getTime();
        const startTime = startDate ? startDate.getTime() : 0;
        const endTime = endDate ? endDate.getTime() : 0;
        
        // Базовый класс
        let classes = [styles.dayCell];

        // Выходные (Сб, Вс)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) classes.push(styles.weekend);

        // Логика выделения
        if (startDate && time === startTime) {
            classes.push(styles.selected);
            classes.push(styles.rangeStart);
        }
        if (endDate && time === endTime) {
            classes.push(styles.selected);
            classes.push(styles.rangeEnd);
        }
        if (startDate && endDate && time > startTime && time < endTime) {
            classes.push(styles.inRange);
        }

        return classes.join(' ');
    };

    // Рендер одного месяца
    const renderMonth = (offset: number) => {
        const currentMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const days = getDaysArray(year, month);
        
        // Для проверки "прошлое" ли это
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className={styles.monthColumn}>
                <div className={styles.monthHeader}>
                    {/* Кнопка "назад" только для левого месяца */}
                    {offset === 0 ? (
                        <button className={styles.navBtn} onClick={() => changeMonth(-1)}>{'<'}</button>
                    ) : <div />}
                    
                    <span>{MONTH_NAMES[month]} {year}</span>

                    {/* Кнопка "вперед" только для правого месяца */}
                    {offset === 1 ? (
                        <button className={styles.navBtn} onClick={() => changeMonth(1)}>{'>'}</button>
                    ) : <div />}
                </div>

                <div className={styles.weekDaysGrid}>
                    {WEEK_DAYS.map(d => (
                        <div key={d} className={styles.weekDay}>{d}</div>
                    ))}
                </div>

                <div className={styles.daysGrid}>
                    {days.map((date, idx) => {
                        const isPast = date && date < today;
                        
                        return (
                            <div 
                                key={idx} 
                                className={getDayClass(date)}
                                // Используем inline styles для disabled состояния (т.к. CSS менять нельзя)
                                style={isPast ? { opacity: 0.3, cursor: 'default' } : undefined}
                                onClick={() => {
                                    if (date && !isPast) {
                                        handleDateClick(date);
                                    }
                                }}
                            >
                                {date ? date.getDate() : ''}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <div className={styles.mainWrapper} ref={containerRef}>
            <div className={styles.searchBar}>
                {/* Откуда */}
                <div className={styles.inputGroup}>
                    <span className={styles.label}>Откуда</span>
                    <input 
                        type="text" 
                        placeholder="Москва" 
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className={styles.textInput} 
                    />
                </div>

                {/* Куда */}
                <div className={styles.inputGroup}>
                    <span className={styles.label}>Куда</span>
                    <input 
                        type="text" 
                        placeholder="Стамбул" 
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className={styles.textInput} 
                    />
                </div>

                {/* Даты */}
                <div className={styles.inputGroup} style={{ minWidth: '200px' }} onClick={() => setIsPickerOpen(true)}>
                    <span className={styles.label}>Даты</span>
                    <div className={styles.dateDisplay}>
                        {startDate ? (
                            <>
                                {formatDateDisplay(startDate)}
                                {endDate ? ` — ${formatDateDisplay(endDate)}` : ''}
                            </>
                        ) : 'Туда — Обратно'}
                    </div>
                </div>

                <button className={styles.submitBtn}>Найти билеты</button>
            </div>

            {isPickerOpen && (
                <div className={styles.dropdown}>
                    
                    {/* --- ПРЕСЕТЫ --- */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {PRESETS.map(days => (
                            <button
                                key={days}
                                onClick={() => handlePresetClick(days)}
                                style={{
                                    border: 'none',
                                    background: '#f3f4f6', 
                                    color: '#5c5cff',      
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {days} дней
                            </button>
                        ))}
                    </div>

                    <div className={styles.calendarContainer}>
                        {renderMonth(0)}
                        {renderMonth(1)}
                    </div>

                    <div className={styles.dropdownFooter}>
                        <div className={styles.toggleContainer}>
                           <span className={styles.modeTitle}>
                               {endDate ? 'Туда-обратно' : 'Только туда'}
                           </span>
                        </div>
                        
                        <div className={styles.actions}>
                            <button className={styles.clearBtn} onClick={handleClear}>
                                Очистить
                            </button>
                            <button className={styles.actionBtn} onClick={() => setIsPickerOpen(false)}>
                                Выбрать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
