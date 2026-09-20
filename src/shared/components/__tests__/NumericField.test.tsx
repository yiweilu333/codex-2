import { fireEvent, render, screen } from '@testing-library/react-native';

import { NumericField } from '../NumericField';

describe('NumericField', () => {
  it('uses a numeric keyboard and reports decimal input', async () => {
    const onChange = jest.fn();
    await render(
      <NumericField label="重量" value="" onChangeText={onChange} />,
    );

    const input = screen.getByLabelText('重量');
    expect(input).toHaveProp('keyboardType', 'decimal-pad');
    await fireEvent.changeText(input, '82.5');
    expect(onChange).toHaveBeenCalledWith('82.5');
  });

  it('shows its unit without including it in the editable value', async () => {
    await render(
      <NumericField label="重量" unit="kg" value="80" onChangeText={jest.fn()} />,
    );

    expect(screen.getByText('kg')).toBeTruthy();
    expect(screen.getByLabelText('重量')).toHaveProp('value', '80');
  });
});
