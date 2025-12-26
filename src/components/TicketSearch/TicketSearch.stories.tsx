import type { Meta, StoryObj } from '@storybook/react-vite';
import { TicketSearch } from './TicketSearch';

const meta = {
    title: 'Компоненты/Поиск Билетов',
    component: TicketSearch,
    parameters: {
        // Установим светлый фон, так как компонент белый
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#f5f5f5' },
                { name: 'dark', value: '#333333' },
            ],
        },
    },
} satisfies Meta<typeof TicketSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

// Базовая история
export const Default: Story = {};

// История с предзаполненной датой (как пример)
export const Predefined: Story = {
    // Storybook позволяет симулировать начальное состояние,
    // но так как у нас состояние внутри компонента (useState),
    // мы просто рендерим его как есть.
    render: () => <TicketSearch />
};
