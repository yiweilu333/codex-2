import { render, screen } from '@testing-library/react-native';

import { AppText } from '../AppText';

describe('AppText', () => {
  it('renders readable body copy', async () => {
    await render(<AppText>开始训练</AppText>);

    expect(screen.getByText('开始训练')).toBeTruthy();
  });
});
