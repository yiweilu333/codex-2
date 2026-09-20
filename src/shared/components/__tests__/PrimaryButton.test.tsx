import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('disables the primary action while saving', async () => {
    await render(
      <PrimaryButton label="完成训练" loading onPress={jest.fn()} />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('保存中…')).toBeTruthy();
  });

  it('invokes its action once when pressed', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="开始训练" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
