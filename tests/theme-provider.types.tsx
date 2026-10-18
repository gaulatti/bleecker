import { ThemeProvider, type ThemeProviderProps, type ControlledThemeProviderProps, type ThemeProviderOptions, type ThemeMode } from '../src/index';
import { ThemeProvider as DirectThemeProvider } from '../src/theme/theme-provider';

const change = (_theme: ThemeMode) => {};
const persisted: ThemeProviderProps = { children: null, defaultTheme: 'dark', storageKey: 'editor-theme' };
const controlled: ControlledThemeProviderProps = { children: null, theme: 'light', onThemeChange: change };
const options: ThemeProviderOptions = controlled;
interface ExistingWrapperProps extends ThemeProviderProps { label: string }
const existingWrapper: ExistingWrapperProps = { children: null, defaultTheme: 'light', storageKey: 'legacy-key', label: 'Existing wrapper' };
<ThemeProvider {...persisted} />;
<ThemeProvider {...controlled} />;
<ThemeProvider {...options} />;
<ThemeProvider {...existingWrapper} />;
<ThemeProvider>{null}</ThemeProvider>;
<DirectThemeProvider theme='system' onThemeChange={change}>{null}</DirectThemeProvider>;
// @ts-expect-error A controlled provider needs an explicit owner callback.
<ThemeProvider theme='dark'>{null}</ThemeProvider>;
// @ts-expect-error A change callback alone does not select controlled mode.
<ThemeProvider onThemeChange={change}>{null}</ThemeProvider>;
// @ts-expect-error Controlled and default ownership cannot be mixed.
<ThemeProvider theme='dark' onThemeChange={change} defaultTheme='light'>{null}</ThemeProvider>;
// @ts-expect-error A controlled provider has no persistence key.
<ThemeProvider theme='dark' onThemeChange={change} storageKey='theme'>{null}</ThemeProvider>;
// @ts-expect-error Only the existing three modes are valid.
<ThemeProvider theme='automatic' onThemeChange={change}>{null}</ThemeProvider>;
