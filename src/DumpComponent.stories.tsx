import type { Meta, StoryObj } from '@storybook/react-vite';
import { DumpComponent } from './DumpComponent';

const meta = {
    title: 'Пример истории',
    component: DumpComponent,
    parameters: {
        backgrounds: {
            default: 'dark'
        }
    }
} satisfies Meta<typeof DumpComponent>;

type TStory = StoryObj<typeof DumpComponent>;

export const Basic: TStory = {};

Basic.storyName = 'Dump';

export default meta;
