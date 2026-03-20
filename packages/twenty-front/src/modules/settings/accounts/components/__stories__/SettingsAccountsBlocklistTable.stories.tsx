import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ComponentDecorator } from 'twenty-ui/testing';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const handleBlockedEmailRemoveJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleBlockedEmailRemoveJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistTable> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistTable',
  component: SettingsAccountsBlocklistTable,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  args: {
    blocklist: mockedBlocklist,
    handleBlockedEmailRemove: handleBlockedEmailRemoveJestFn,
  },
  argTypes: {
    blocklist: { control: false },
    handleBlockedEmailRemove: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsBlocklistTable>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const blocklistItem of mockedBlocklist) {
      expect(await canvas.findByText(blocklistItem.handle)).toBeInTheDocument();
      if (
        blocklistItem.description !== null &&
        blocklistItem.description !== undefined &&
        blocklistItem.description !== ''
      ) {
        expect(
          await canvas.findByText(blocklistItem.description),
        ).toBeInTheDocument();
      }
      expect(
        await canvas.findByText(
          formatToHumanReadableDate(blocklistItem.createdAt),
        ),
      ).toBeInTheDocument();
    }
  },
};

export const DeleteFirstElementFromBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledTimes(0);

    const removeFromBlocklistButton = canvas.getAllByRole('button', {
      name: 'Remove from blocklist',
    })[0];

    await userEvent.click(removeFromBlocklistButton);

    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledTimes(1);
    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledWith('1');
  },
};
