export interface AppTheme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceRaised: string;
    primary: string;
    primaryText: string;
    text: string;
    muted: string;
    border: string;
    danger: string;
    success: string;
    pr: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
}

const sharedTokens = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radius: { sm: 12, md: 16, lg: 24 },
};

export const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: '#0D1117',
    surface: '#171E27',
    surfaceRaised: '#202A36',
    primary: '#65AFFF',
    primaryText: '#06101A',
    text: '#F6F8FA',
    muted: '#929EAD',
    border: '#2A3643',
    danger: '#E87878',
    success: '#77D98B',
    pr: '#F5C451',
  },
  ...sharedTokens,
};

export const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceRaised: '#EAF0F6',
    primary: '#1674D1',
    primaryText: '#FFFFFF',
    text: '#16202B',
    muted: '#627083',
    border: '#D9E1EA',
    danger: '#B94A4A',
    success: '#267A3E',
    pr: '#9A6812',
  },
  ...sharedTokens,
};
