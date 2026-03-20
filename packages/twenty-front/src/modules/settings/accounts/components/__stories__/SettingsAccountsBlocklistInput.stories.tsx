import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const updateBlockedEmailListJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    updateBlockedEmailListJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistInput> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistInput',
  component: SettingsAccountsBlocklistInput,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  args: {
    updateBlockedEmailList: updateBlockedEmailListJestFn,
    blockedEmailOrDomainList: [],
  },
  argTypes: {
    updateBlockedEmailList: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsBlocklistInput>;

export const Default: Story = {};

export const AddToBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledTimes(0);

    const addToBlocklistInput = canvas.getByPlaceholderText(
      'eddy@gmail.com, @apple.com',
    );

    await userEvent.type(addToBlocklistInput, 'test@twenty.com');

    const addToBlocklistButton = canvas.getByRole('button', {
      name: /add to blocklist/i,
    });

    await userEvent.click(addToBlocklistButton);

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledTimes(1);
    expect(updateBlockedEmailListJestFn).toHaveBeenCalledWith({
      handle: 'test@twenty.com',
      description: '',
    });
  },
};

export const AddToBlocklistWithDescription: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledTimes(0);

    await userEvent.type(
      canvas.getByPlaceholderText('eddy@gmail.com, @apple.com'),
      'spam@example.com',
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Description' }),
      'Known spam source',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /add to blocklist/i }),
    );

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledWith({
      handle: 'spam@example.com',
      description: 'Known spam source',
    });
  },
};
